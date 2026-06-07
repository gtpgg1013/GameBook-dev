import { devices, expect, type Page, test } from "@playwright/test"

const goTo2 = "무기고로 간다"
const goTo3 = "술집으로 간다"
const goTo4 = "문지기를 설득한다"
const goTo5 = "식빵 방패병을 돕는다"
const coolOven = "왕실 오븐을 식힌다"
const goToBadEnding = "문지기를 밀치고 지나간다"
const restart = "처음부터 다시 선택한다"

test("reader can turn a page, zoom, and reach both ending families", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text())
    }
  })

  await page.goto("/")
  await expect(page.getByRole("heading", { name: /바게트 용사 게임북/u })).toBeVisible()
  await expect(page.getByTestId("book-stage")).toHaveAttribute(
    "data-pageflip-engine",
    "react-pageflip",
  )
  await expect(page.getByTestId("book-stage")).toHaveAttribute("data-panzoom-engine", "panzoom")
  await expect(page.getByTestId("book-stage")).toHaveAttribute("data-audio-engine", "howler")
  await expect(page.getByTestId("page-number").first()).toHaveText("1쪽")
  await expect(page.getByRole("button", { name: /간다|돕는다|도와준다|설득한다/u })).toHaveCount(3)

  await page.getByRole("button", { name: goTo2 }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("2쪽")
  await expect(page.getByTestId("last-decision")).toContainText(goTo2)
  await expect(page.getByTestId("last-consequence")).toContainText("바게트")

  const surface = page.locator(".book-pan-surface")
  const stageBox = await page.getByTestId("book-stage").boundingBox()
  if (stageBox === null) {
    throw new Error("Expected book stage to have a browser layout box")
  }
  const wheelTransformBefore = await surface.evaluate(
    (element) => getComputedStyle(element).transform,
  )
  await page.mouse.move(stageBox.x + stageBox.width / 2, stageBox.y + stageBox.height / 2)
  await page.mouse.wheel(0, 320)
  await page.waitForTimeout(120)
  await expect
    .poll(() => surface.evaluate((element) => getComputedStyle(element).transform))
    .toBe(wheelTransformBefore)
  await page.keyboard.down("Alt")
  await page.mouse.wheel(0, -320)
  await page.keyboard.up("Alt")
  await expect
    .poll(() => surface.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(wheelTransformBefore)

  await page.getByRole("button", { name: "확대" }).click()
  await expect(page.getByTestId("book-stage")).toHaveAttribute("data-zoom", "1.1")

  await page.getByRole("button", { name: goTo3 }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("3쪽")
  await page.getByRole("button", { name: goTo4 }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("4쪽")
  await page.getByRole("button", { name: goTo5 }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("5쪽")
  await page.getByRole("button", { name: coolOven }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("6쪽")
  await expect(page.getByTestId("last-consequence")).toContainText("아직 멀다")

  await page.goto("/?route=good")
  await expect(page.getByText("굿 엔딩", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: restart }).click()
  await expect(page.getByTestId("page-number").first()).toHaveText("1쪽")

  await page.getByRole("button", { name: goTo2 }).click()
  await page.getByRole("button", { name: goTo3 }).click()
  await page.getByRole("button", { name: goToBadEnding }).click()
  await expect(page.getByText("배드 엔딩", { exact: true })).toBeVisible()

  expect(errors, "critical console errors").toHaveLength(0)
})

test("mobile reader sees artwork, scene beat, and choices before advancing on touch", async ({
  browser,
}) => {
  const context = await browser.newContext({ ...devices["iPhone 14"] })
  const page = await context.newPage()

  try {
    await page.goto("/")
    await expect(page.getByTestId("page-number").first()).toHaveText("1쪽")
    await expect(page.getByTestId("mobile-scene-step")).toBeVisible()
    const firstSceneBeat = await page.getByTestId("mobile-scene-step").textContent()
    if (firstSceneBeat === null) {
      throw new Error("Expected mobile scene beat text")
    }

    await expect(page.getByTestId("mobile-scene-index")).toHaveText("1/3")
    await page.getByRole("button", { name: "다음 내용" }).tap()
    await expect(page.getByTestId("mobile-scene-step")).not.toHaveText(firstSceneBeat)
    await expect(page.getByTestId("mobile-scene-index")).toHaveText("2/3")
    await page.getByRole("button", { name: "다음 내용" }).tap()
    await expect(page.getByTestId("mobile-scene-index")).toHaveText("3/3")
    await expect(page.getByRole("button", { name: "처음 내용" })).toBeVisible()

    const choice = page.getByRole("button", { name: goTo2 })
    const lastChoice = page.getByRole("button", { name: "어려운 사람을 도와준다" })
    await expect(lastChoice).toBeVisible()
    await expectMobileOpeningToFit(page, lastChoice)

    const choiceBox = await choice.boundingBox()
    if (choiceBox === null) {
      throw new Error("Expected mobile choice to have a browser layout box")
    }

    await page.touchscreen.tap(
      choiceBox.x + choiceBox.width / 2,
      choiceBox.y + choiceBox.height / 2,
    )

    await expect(page.getByTestId("page-number").first()).toHaveText("2쪽")
  } finally {
    await context.close()
  }
})

async function expectMobileOpeningToFit(page: Page, lastChoice: ReturnType<Page["getByRole"]>) {
  const viewport = page.viewportSize()
  const heroBox = await page.locator(".page-hero").boundingBox()
  const sceneBox = await page.getByTestId("mobile-scene-step").boundingBox()
  const choiceBox = await lastChoice.boundingBox()
  if (viewport === null || heroBox === null || sceneBox === null || choiceBox === null) {
    throw new Error("Expected mobile opening elements to have layout boxes")
  }
  expect(heroBox.y).toBeGreaterThanOrEqual(0)
  expect(sceneBox.y).toBeGreaterThan(heroBox.y)
  expect(choiceBox.y + choiceBox.height).toBeLessThanOrEqual(viewport.height)
}
