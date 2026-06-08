import { describe, expect, it } from "vitest"
import { getReachabilityReport } from "../src/story/graph"
import { deterministicRoutes, ENDING_MINIMUM, PAGE_MINIMUM, storyPages } from "../src/story/pages"
import { chapters } from "../src/story/storyChapters"
import { endingRouteLabels, endingRouteSlots } from "../src/story/storyEndingRoutes"
import { storyRoutes } from "../src/story/storySchema"
import { arrivalForPage, chapterFor } from "../src/story/storyWorld"
import { choiceByLabel, sourceSceneFragments, storyPageById } from "./story-test-helpers"

describe("story graph contract", () => {
  it("keeps the nostalgic gamebook large enough when generated", () => {
    expect(storyPages.length, "page count").toBeGreaterThanOrEqual(PAGE_MINIMUM)
    const endings = storyPages.filter((page) => page.kind !== "story")
    expect(endings.length, "ending count").toBeGreaterThanOrEqual(ENDING_MINIMUM)
  })

  it("only points choices at existing pages and keeps all endings reachable", () => {
    const report = getReachabilityReport(storyPages)
    expect(report.invalidChoiceTargets, "invalid choice targets").toHaveLength(0)
    expect(report.unreachableEndingIds, "unreachable endings").toHaveLength(0)
    expect(report.reachablePageCount, "reachable page count").toBe(storyPages.length)
  })

  it("keeps deterministic route fixtures aligned with real choices", () => {
    for (const [routeName, route] of Object.entries(deterministicRoutes)) {
      for (let index = 0; index < route.length - 1; index += 1) {
        const currentId = route[index]
        const nextId = route[index + 1]
        const page = storyPages.find((candidate) => candidate.id === currentId)
        const hasEdge = page?.choices.some((choice) => choice.targetId === nextId) ?? false

        expect(hasEdge, `${routeName} route edge ${currentId} -> ${nextId}`).toBe(true)
      }
    }
  })

  it("keeps chapter route copy sets aligned", () => {
    for (const chapter of chapters) {
      for (const route of storyRoutes) {
        const copy = chapter.routes[route]
        const lengths = [
          copy.labels.length,
          copy.leads.length,
          copy.pressures.length,
          copy.rewards.length,
          copy.keywords.length,
        ]
        expect(new Set(lengths).size, `${chapter.arc} ${route} copy lengths`).toBe(1)
        expect(copy.labels.length, `${chapter.arc} ${route} copy count`).toBeGreaterThan(0)
      }
    }
  })

  it("gives every story page a concise scene, focus line, and state effects", () => {
    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const shortPages = storyOnly.filter((page) => page.body.length < 110)
    const bloatedPages = storyOnly.filter((page) => page.body.length > 320)
    const missingFunction = storyOnly.filter((page) => page.narrativeFunction.length < 8)
    const pagesWithoutEffects = storyOnly.filter((page) =>
      page.choices.every((choice) => choice.effects.length === 0),
    )
    const uniqueBodies = new Set(storyOnly.map((page) => page.body))

    expect(shortPages, "story pages under 110 Korean chars").toHaveLength(0)
    expect(bloatedPages, "story pages over 320 Korean chars").toHaveLength(0)
    expect(missingFunction, "pages missing narrative function").toHaveLength(0)
    expect(pagesWithoutEffects, "pages without state-changing choices").toHaveLength(0)
    expect(uniqueBodies.size, "unique story body count").toBeGreaterThanOrEqual(150)
  })

  it("makes every story page a real branching choice point", () => {
    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const pagesWithTooFewChoices = storyOnly.filter((page) => page.choices.length < 2)
    const pagesWithDuplicateTargets = storyOnly.filter(
      (page) => new Set(page.choices.map((choice) => choice.targetId)).size < page.choices.length,
    )
    const nonLinearChoices = storyOnly.flatMap((page) =>
      page.choices.filter((choice) => {
        const nextPageId = `p_${String(page.number + 1).padStart(4, "0")}`
        return choice.targetId !== nextPageId
      }),
    )

    expect(pagesWithTooFewChoices, "story pages with fewer than 2 choices").toHaveLength(0)
    expect(pagesWithDuplicateTargets, "story pages with duplicate choice targets").toHaveLength(0)
    expect(nonLinearChoices.length, "non-linear branch choices").toBeGreaterThanOrEqual(140)
  })

  it("connects the opening village actions to matching result scenes", () => {
    const firstPage = storyPageById("p_0001")
    const armoryChoice = choiceByLabel(firstPage, "무기고로 간다")
    const tavernChoice = choiceByLabel(firstPage, "술집으로 간다")
    const helpChoice = choiceByLabel(firstPage, "어려운 사람을 도와준다")
    const ovenChoice = choiceByLabel(storyPageById("p_0005"), "왕실 오븐을 식힌다")

    expect(armoryChoice.targetId).toBe("p_0002")
    expect(storyPageById(armoryChoice.targetId).body).toContain("무기고")
    expect(tavernChoice.targetId).toBe("p_0003")
    expect(storyPageById(tavernChoice.targetId).body).toContain("술집")
    expect(tavernChoice.consequence.result).toContain("문지기")
    expect(helpChoice.targetId).toBe("p_0004")
    expect(helpChoice.consequence.result).toContain("노점상")
    expect(ovenChoice.targetId).toBe("p_0006")
    expect(ovenChoice.consequence.result).toContain("아직 멀다")
  })

  it("derives generated-page bodies from the current scene context", () => {
    for (const pageNumber of [6, 18, 82, 142]) {
      const page = storyPageById(`p_${String(pageNumber).padStart(4, "0")}`)
      const chapter = chapterFor(pageNumber)
      const arrival = arrivalForPage(pageNumber)
      const openingParagraph = page.body.split("\n\n").at(0)

      expect(openingParagraph).not.toBe(`${chapter.location}.`)
      expect(openingParagraph).toContain(arrival.action)
      expect(page.body).toContain(chapter.threat)
      expect(page.body).toContain(chapter.ally)
      expect(page.body).toContain(chapter.goal)
      expect(page.body).toContain(arrival.keyword)
      expect(page.body).toContain("겠는걸")
      expect(page.narrativeFunction).toContain(chapter.bridge)
      expect(page.narrativeFunction).toContain(arrival.keyword)
    }
  })

  it("carries each generated choice action into the destination page", () => {
    const generatedChoices = storyPages.flatMap((page) => {
      if (page.kind !== "story" || page.number <= 5) {
        return []
      }
      return page.choices
    })

    for (const choice of generatedChoices) {
      const target = storyPages.find((candidate) => candidate.id === choice.targetId)
      if (target?.kind !== "story" || target.number <= 5) {
        continue
      }
      const arrival = arrivalForPage(target.number)
      expect(choice.label).toBe(arrival.action)
      expect(choice.consequence.result).toContain(arrival.keyword)
      expect(target.body).toContain(arrival.action)
      expect(target.body).toContain(arrival.keyword)
      expect(target.body).toContain("겠는걸")
    }
  })

  it("keeps generated story routes on contextual pages", () => {
    const dislocatedRoutes = storyPages.flatMap((page) => {
      if (page.kind !== "story" || page.number <= 5) {
        return []
      }
      return page.choices.filter((choice) => {
        const target = storyPages.find((candidate) => candidate.id === choice.targetId)
        if (target?.kind !== "story") {
          return false
        }
        const nearForwardPage = target.number > page.number && target.number <= page.number + 3
        return target.number <= 5 || !nearForwardPage
      })
    })

    expect(dislocatedRoutes, "generated choices jumping to unrelated story pages").toHaveLength(0)
  })

  it("grounds generated ending choices in the current scene", () => {
    const ungroundedEndingChoices = storyPages.flatMap((page) => {
      if (page.kind !== "story" || page.number <= 5) {
        return []
      }
      const localFragments = sourceSceneFragments(page.number)
      return page.choices.filter((choice) => {
        const target = storyPages.find((candidate) => candidate.id === choice.targetId)
        return (
          target?.kind !== "story" && !localFragments.some((word) => choice.label.includes(word))
        )
      })
    })

    expect(ungroundedEndingChoices, "ending choices detached from source scene").toHaveLength(0)
  })

  it("uses curated source-scene labels for ending route choices", () => {
    for (const [pageNumberText, routeTargets] of Object.entries(endingRouteSlots)) {
      const pageNumber = Number(pageNumberText)
      const page = storyPageById(`p_${String(pageNumber).padStart(4, "0")}`)
      const routeLabels = endingRouteLabels[pageNumber]
      for (const route of storyRoutes) {
        const targetId = routeTargets[route]
        if (targetId === undefined) {
          continue
        }
        const expectedLabel = routeLabels?.[route]
        const choice = page.choices.find((candidate) => candidate.targetId === targetId)
        expect(choice?.label, `${page.id} ${route} ending label`).toBe(expectedLabel)
      }
    }
  })

  it("keeps ending route outcomes hidden until the target page is reached", () => {
    const endings = storyPages.filter((page) => page.kind !== "story")
    const endingTitleFragments = endings.flatMap((ending) =>
      ending.title.split(/[:：]/u).map((fragment) => fragment.trim()),
    )
    const forbiddenWords = [
      "굿 엔딩",
      "배드 엔딩",
      "중립 엔딩",
      "농담 엔딩",
      "비밀 엔딩",
      "트루 엔딩",
    ]
    const revealingChoices = storyPages.flatMap((page) =>
      page.choices.filter((choice) => {
        const revealsTone = forbiddenWords.some((word) => choice.label.includes(word))
        const revealsTitle = endingTitleFragments.some(
          (fragment) => fragment.length > 1 && choice.label.includes(fragment),
        )
        return revealsTone || revealsTitle
      }),
    )

    expect(revealingChoices, "choices revealing ending route before travel").toHaveLength(0)
  })

  it("keeps real endings in the late book except death or strange detours", () => {
    const earlyRealEndings = storyPages.flatMap((page) => {
      if (page.kind !== "story" || page.number >= 118) {
        return []
      }
      return page.choices.filter((choice) => {
        const target = storyPages.find((candidate) => candidate.id === choice.targetId)
        return (
          target !== undefined &&
          target.kind !== "story" &&
          target.kind !== "bad" &&
          target.id !== "e_secret_crumb_void"
        )
      })
    })

    expect(earlyRealEndings, "real endings before page 118").toHaveLength(0)
  })

  it("opens with readable setup pages before the main danger branches", () => {
    const openingPages = storyPages.filter((page) => page.kind === "story" && page.number <= 5)

    expect(openingPages.length, "opening page count").toBe(5)
    expect(openingPages.at(0)?.title).toContain("바게트")
    expect(openingPages.at(0)?.body).toContain("바게트")
  })
})
