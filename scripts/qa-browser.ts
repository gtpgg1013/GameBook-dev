import { spawn } from "node:child_process"
import { once } from "node:events"
import { mkdir, writeFile } from "node:fs/promises"
import net from "node:net"
import { type Browser, chromium } from "@playwright/test"
import {
  assertMobileSceneFits,
  badRoute,
  followRoute,
  lateGoodRoute,
  waitForEngineActivation,
  waitForMotion,
  waitForSceneBeatChange,
  waitForStageZoom,
} from "./qa-browser-support"

const evidenceDir = ".omo/evidence"
const port = 4173
const baseUrl = `http://127.0.0.1:${port}`
const goTo2 = "무기고로 간다"
const goTo3 = "술집으로 간다"
const goTo4 = "문지기를 설득한다"
const goTo5 = "식빵 방패병을 돕는다"
const coolOven = "왕실 오븐을 식힌다"
const restart = "책을 처음부터 다시 펼친다"

type QaResult = {
  readonly driver: "playwright-chrome"
  readonly serverPid: number
  readonly checks: readonly string[]
  readonly screenshots: readonly string[]
  readonly cleanup: {
    readonly serverKilled: boolean
    readonly portReleased: boolean
    readonly browserContextClosed: boolean
  }
}

await mkdir(evidenceDir, { recursive: true })

if (await isPortOpen()) {
  throw new Error(`QA preview port is already in use: ${baseUrl}`)
}

const server = spawn(
  "node_modules/.bin/vite",
  ["preview", "--host", "127.0.0.1", "--port", String(port)],
  {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
)

const serverPid = server.pid ?? 0
const serverLogChunks: string[] = []
server.stdout.on("data", (chunk: Buffer) => serverLogChunks.push(chunk.toString("utf8")))
server.stderr.on("data", (chunk: Buffer) => serverLogChunks.push(chunk.toString("utf8")))

let browser: Browser | undefined
let browserContextClosed = false
const screenshots: string[] = []
const checks: string[] = []

try {
  await waitForServer()
  browser = await chromium.launch({ channel: "chrome" })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()

  await page.goto(baseUrl)
  await waitForEngineActivation(page)
  checks.push("react-pageflip, panzoom, and howler engines were active in Chrome")
  await page.getByRole("button", { name: goTo2 }).click()
  await page.getByTestId("page-number").first().filter({ hasText: "2쪽" }).waitFor()
  await page.getByTestId("last-decision").filter({ hasText: goTo2 }).waitFor()
  await waitForMotion()
  const coverChoice = `${evidenceDir}/browser-cover-choice.png`
  await page.screenshot({ path: coverChoice, fullPage: true })
  screenshots.push(coverChoice)
  checks.push("cover choice changed from page 1 to page 2")

  await page.getByRole("button", { name: "확대" }).click()
  await waitForStageZoom(page, "1.1")
  await page.getByRole("button", { name: "축소" }).click()
  await waitForStageZoom(page, "1")
  await waitForMotion()
  const zoomShot = `${evidenceDir}/browser-zoom.png`
  await page.screenshot({ path: zoomShot, fullPage: true })
  screenshots.push(zoomShot)
  checks.push("zoom controls remained visible and responsive")

  await page.getByRole("button", { name: goTo3 }).click()
  await page.getByRole("button", { name: goTo4 }).click()
  await page.getByRole("button", { name: goTo5 }).click()
  await page.getByRole("button", { name: coolOven }).click()
  await page.getByTestId("page-number").first().filter({ hasText: "6쪽" }).waitFor()
  await page.getByTestId("last-consequence").filter({ hasText: "아직 멀다" }).waitFor()
  checks.push("page 5 no longer jumps into an early good ending")
  await page.getByRole("button", { name: "처음", exact: true }).click()
  await page.getByTestId("page-number").first().filter({ hasText: "1쪽" }).waitFor()
  await followRoute(page, lateGoodRoute, "굿 엔딩")
  await page.getByRole("button", { name: restart }).click()
  await page.getByTestId("page-number").first().filter({ hasText: "1쪽" }).waitFor()
  await followRoute(page, badRoute, "배드 엔딩")
  await page.getByText("배드 엔딩", { exact: true }).waitFor()
  await waitForMotion()
  const endingsShot = `${evidenceDir}/browser-endings.png`
  await page.screenshot({ path: endingsShot, fullPage: true })
  screenshots.push(endingsShot)
  checks.push("actual late good route clicked through and bad ending route rendered")

  await context.close()
  browserContextClosed = true

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(baseUrl)
  await mobilePage.getByTestId("mobile-scene-step").waitFor()
  const firstSceneBeat = await mobilePage.getByTestId("mobile-scene-step").textContent()
  if (firstSceneBeat === null) {
    throw new Error("Expected mobile scene beat text")
  }
  await mobilePage.getByTestId("mobile-scene-index").filter({ hasText: "1/3" }).waitFor()
  await mobilePage.getByRole("button", { name: "다음 내용" }).tap()
  await waitForSceneBeatChange(mobilePage, firstSceneBeat)
  await mobilePage.getByTestId("mobile-scene-index").filter({ hasText: "2/3" }).waitFor()
  await mobilePage.getByRole("button", { name: "다음 내용" }).tap()
  await mobilePage.getByTestId("mobile-scene-index").filter({ hasText: "3/3" }).waitFor()
  await mobilePage.getByRole("button", { name: "처음 내용" }).waitFor()
  await assertMobileSceneFits(mobilePage)
  checks.push("mobile page copy completes in three richer scene beats")
  await waitForMotion()
  const mobileShot = `${evidenceDir}/browser-mobile.png`
  await mobilePage.screenshot({ path: mobileShot, fullPage: true })
  screenshots.push(mobileShot)
  checks.push("mobile viewport keeps artwork, scene beat, and all opening choices in one screen")
  await mobileContext.close()
} finally {
  if (browser !== undefined) {
    await browser.close()
    browserContextClosed = true
  }
  const serverKilled = killServer()
  const portReleased = await waitForPortRelease()
  await writeFile(`${evidenceDir}/browser-preview-server.log`, serverLogChunks.join(""))
  const result: QaResult = {
    driver: "playwright-chrome",
    serverPid,
    checks,
    screenshots,
    cleanup: {
      serverKilled,
      portReleased,
      browserContextClosed,
    },
  }
  await writeEvidence(result)
}

async function writeEvidence(result: QaResult): Promise<void> {
  const json = `${JSON.stringify(result, null, 2)}\n`
  await writeFile(`${evidenceDir}/browser-cover-choice.json`, json)
  await writeFile(`${evidenceDir}/browser-zoom.json`, json)
  await writeFile(`${evidenceDir}/browser-endings.json`, json)
  await writeFile(`${evidenceDir}/browser-mobile.json`, json)
}

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) {
        return
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`Preview server did not answer at ${baseUrl}`)
}

function killServer(): boolean {
  if (serverPid === 0) {
    return false
  }
  return signalServerGroup("SIGTERM")
}

async function waitForPortRelease(): Promise<boolean> {
  await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 2000))])
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const open = await isPortOpen()
    if (!open) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  signalServerGroup("SIGKILL")
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const open = await isPortOpen()
    if (!open) {
      return true
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false
}

function signalServerGroup(signal: NodeJS.Signals): boolean {
  if (serverPid === 0) {
    return false
  }
  try {
    process.kill(-serverPid, signal)
    return true
  } catch (error) {
    if (isMissingProcessError(error)) {
      return false
    }
    throw error
  }
}

function isMissingProcessError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ESRCH"
}

async function isPortOpen(): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port })
    socket.once("connect", () => {
      socket.destroy()
      resolve(true)
    })
    socket.once("error", () => {
      socket.destroy()
      resolve(false)
    })
  })
}
