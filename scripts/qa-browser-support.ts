import type { Page } from "@playwright/test"
import { deterministicRoutes } from "../src/story/pages"

export const lateGoodRoute = deterministicRoutes.good
export const badRoute = deterministicRoutes.bad

export async function followRoute(
  page: Page,
  route: readonly string[],
  endingLabel: string,
): Promise<void> {
  for (let index = 0; index < route.length - 1; index += 1) {
    const nextId = route[index + 1]
    if (nextId === undefined) {
      throw new Error(`Unexpected empty route step at ${index}`)
    }

    await page.locator(`[data-choice-target="${nextId}"]`).click()
    if (nextId.startsWith("p_")) {
      continue
    }
    await page.getByText(endingLabel, { exact: true }).waitFor()
  }
}

export async function waitForMotion(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 550))
}

export async function waitForStageZoom(page: Page, zoom: string): Promise<void> {
  await page.waitForFunction((expectedZoom) => {
    const stage = document.querySelector("[data-testid='book-stage']")
    return stage?.getAttribute("data-zoom") === expectedZoom
  }, zoom)
}

export async function waitForSceneBeatChange(page: Page, previousText: string): Promise<void> {
  await page.waitForFunction((oldText) => {
    const step = document.querySelector("[data-testid='mobile-scene-step']")
    return step?.textContent !== oldText
  }, previousText)
}

export async function assertMobileSceneFits(page: Page): Promise<void> {
  const viewport = page.viewportSize()
  const heroBox = await page.locator(".page-hero").boundingBox()
  const sceneBox = await page.getByTestId("mobile-scene-step").boundingBox()
  const choiceBox = await page.getByRole("button", { name: "어려운 사람을 도와준다" }).boundingBox()
  if (viewport === null || heroBox === null || sceneBox === null || choiceBox === null) {
    throw new Error("Expected mobile scene to have measurable browser boxes")
  }
  const choiceBottom = choiceBox.y + choiceBox.height
  if (heroBox.y < 0 || sceneBox.y < 0 || choiceBottom > viewport.height) {
    throw new Error("Mobile first screen does not fit artwork, scene text, and first choice")
  }
}

export async function waitForEngineActivation(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const stage = document.querySelector("[data-testid='book-stage']")
    return (
      stage?.getAttribute("data-pageflip-engine") === "react-pageflip" &&
      stage.getAttribute("data-panzoom-engine") === "panzoom" &&
      stage.getAttribute("data-audio-engine") === "howler"
    )
  })
}
