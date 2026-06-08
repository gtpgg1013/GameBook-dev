import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { App } from "../src/App"
import { useReaderStore } from "../src/game/store"

const titlePattern = /눈떠보니 바게트로\s+싸우는 이세계라고\?!/u

describe("gamebook UI", () => {
  beforeEach(() => {
    window.localStorage.clear()
    useReaderStore.getState().restart()
  })

  it("turns from the first page through a visible choice", async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole("heading", { name: titlePattern })).toBeInTheDocument()
    expect(screen.queryByText("낡은 선택형 모험서")).not.toBeInTheDocument()
    expect(screen.queryByText(/첫 장|선택/u)).not.toBeInTheDocument()
    expect(screen.queryByText(/빵 냄새가 짙어진다|바게트가 손안에서/u)).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument()
    expect(screen.getByTestId("page-number")).toHaveTextContent("1쪽")

    await user.click(screen.getByRole("button", { name: "무기고로 간다" }))

    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("2쪽"))
    expect(screen.getByTestId("last-decision")).toHaveTextContent("무기고로 간다")
    expect(screen.getByTestId("last-consequence")).toHaveTextContent("바게트")
    expect(screen.queryByText(/첫 장|선택/u)).not.toBeInTheDocument()
    expect(screen.queryByText(/빵 냄새가 짙어진다|바게트가 손안에서/u)).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument()
  })

  it("zooms the book without losing controls", async () => {
    const user = userEvent.setup()
    render(<App />)

    const stage = screen.getByTestId("book-stage")
    expect(stage).toHaveAttribute("data-zoom", "1")

    await user.click(screen.getByRole("button", { name: "확대" }))

    expect(stage).toHaveAttribute("data-zoom", "1.1")
    expect(screen.getByRole("button", { name: "축소" })).toBeEnabled()
  })

  it("exposes tactile page, pan, and audio engines", () => {
    render(<App />)

    const stage = screen.getByTestId("book-stage")

    expect(stage.getAttribute("data-pageflip-engine")).toMatch(
      /^(motion-fallback|page-flip-fallback|react-pageflip)$/u,
    )
    expect(stage.getAttribute("data-panzoom-engine")).toMatch(/^(css-fallback|panzoom)$/u)
    expect(stage).toHaveAttribute("data-audio-engine", "howler")
  })

  it("renders book images through deployable relative asset paths", () => {
    render(<App />)

    const imageSources = Array.from(document.querySelectorAll("img")).map((image) =>
      image.getAttribute("src"),
    )

    expect(imageSources.length).toBeGreaterThan(0)
    expect(imageSources.filter((source) => source?.startsWith("/assets/"))).toHaveLength(0)
  })

  it("applies visible reader state effects while navigating", async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId("reader-stats")).toHaveTextContent("용기 1")

    await user.click(screen.getByRole("button", { name: "무기고로 간다" }))

    await waitFor(() => expect(screen.getByTestId("reader-stats")).toHaveTextContent("용기 2"))
  })

  it("lets mobile readers finish page copy in three richer scene beats", async () => {
    const user = userEvent.setup()
    render(<App />)

    const sceneStep = screen.getByTestId("mobile-scene-step")
    const firstBeat = sceneStep.textContent ?? ""

    expect(sceneStep).toHaveTextContent("바게트")
    expect(firstBeat.split("\n").length).toBeGreaterThanOrEqual(2)
    expect(screen.getByTestId("mobile-scene-index")).toHaveTextContent("1/3")
    expect(screen.getByRole("button", { name: "무기고로 간다" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "다음 내용" }))

    expect(sceneStep.textContent).not.toBe(firstBeat)
    expect(screen.getByTestId("mobile-scene-index")).toHaveTextContent("2/3")
    await user.click(screen.getByRole("button", { name: "다음 내용" }))
    expect(screen.getByTestId("mobile-scene-index")).toHaveTextContent("3/3")
    expect(screen.getByRole("button", { name: "처음 내용" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "무기고로 간다" })).toBeInTheDocument()
  })

  it("supports back, restart, save, load, and keyboard page turns", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("2쪽"))

    await user.click(screen.getByRole("button", { name: /저장/u }))
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("3쪽"))

    await user.click(screen.getByRole("button", { name: /불러오기/u }))
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("2쪽"))

    await user.click(screen.getByRole("button", { name: /뒤로/u }))
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("1쪽"))

    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("2쪽"))
    await user.click(screen.getByRole("button", { name: /처음/u }))
    await waitFor(() => expect(screen.getByTestId("page-number")).toHaveTextContent("1쪽"))
  })

  it("ignores malformed saved games instead of crashing load", () => {
    window.localStorage.setItem("baguette-hero-save", "{")

    expect(() => useReaderStore.getState().loadGame()).not.toThrow()
    expect(useReaderStore.getState().currentPageId).toBe("p_0001")
  })

  it("ignores saved games that point at unknown pages", () => {
    window.localStorage.setItem(
      "baguette-hero-save",
      JSON.stringify({
        currentPageId: "p_9999",
        history: [],
        stats: { courage: 4, crumbs: 2, doubt: 1 },
        flags: {},
        inventory: [],
      }),
    )

    expect(() => useReaderStore.getState().loadGame()).not.toThrow()
    expect(useReaderStore.getState().currentPageId).toBe("p_0001")
  })

  it("drops unknown saved history entries before back navigation", () => {
    window.localStorage.setItem(
      "baguette-hero-save",
      JSON.stringify({
        currentPageId: "p_0002",
        history: ["p_9999", "p_0001"],
        stats: { courage: 4, crumbs: 2, doubt: 1 },
        flags: {},
        inventory: [],
      }),
    )

    expect(() => useReaderStore.getState().loadGame()).not.toThrow()
    expect(useReaderStore.getState().history).toEqual(["p_0001"])
    expect(() => useReaderStore.getState().goBack()).not.toThrow()
    expect(useReaderStore.getState().currentPageId).toBe("p_0001")
  })
})
