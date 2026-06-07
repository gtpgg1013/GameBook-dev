import { describe, expect, it } from "vitest"
import { getReachabilityReport } from "../src/story/graph"
import { withSubjectParticle } from "../src/story/korean"
import { ENDING_MINIMUM, PAGE_MINIMUM, storyPages } from "../src/story/pages"
import { chapterFor } from "../src/story/storyWorld"

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

  it("gives every story page a concise scene, focus line, and state effects", () => {
    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const shortPages = storyOnly.filter((page) => page.body.length < 110)
    const bloatedPages = storyOnly.filter((page) => page.body.length > 240)
    const missingFunction = storyOnly.filter((page) => page.narrativeFunction.length < 8)
    const pagesWithoutEffects = storyOnly.filter((page) =>
      page.choices.every((choice) => choice.effects.length === 0),
    )
    const uniqueBodies = new Set(storyOnly.map((page) => page.body))

    expect(shortPages, "story pages under 110 Korean chars").toHaveLength(0)
    expect(bloatedPages, "story pages over 240 Korean chars").toHaveLength(0)
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

  it("frames every visible choice as concrete action instead of page-number instruction", () => {
    const instructionChoices = storyPages.flatMap((page) =>
      page.choices.filter((choice) => /\d+쪽|가시오/u.test(choice.label)),
    )
    const actionWords = [
      "간다",
      "돕는다",
      "조사한다",
      "설득한다",
      "싸운다",
      "숨는다",
      "나눈다",
      "구한다",
      "수리한다",
      "거래한다",
      "기다린다",
      "지킨다",
      "도와준다",
      "식힌다",
      "당긴다",
      "따라간다",
      "선택한다",
    ]
    const nonActionChoices = storyPages.flatMap((page) =>
      page.choices.filter((choice) => !actionWords.some((word) => choice.label.includes(word))),
    )
    const choicesWithoutOutcome = storyPages.flatMap((page) =>
      page.choices.filter(
        (choice) => choice.consequence.action.length < 4 || choice.consequence.result.length < 40,
      ),
    )

    expect(instructionChoices, "choices that expose page-number instructions").toHaveLength(0)
    expect(nonActionChoices, "choices without concrete action verbs").toHaveLength(0)
    expect(choicesWithoutOutcome, "choices without meaningful consequences").toHaveLength(0)
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

  it("derives generated-page actions from the current scene context", () => {
    for (const pageNumber of [6, 18, 82, 142]) {
      const page = storyPageById(`p_${String(pageNumber).padStart(4, "0")}`)
      const chapter = chapterFor(pageNumber)
      const expectedActions = [
        chapter.actions.brave,
        chapter.actions.risky,
        chapter.actions.kind,
      ] as const

      expect(page.body).toContain(chapter.location)
      expect(page.body).toContain(chapter.ally)
      expect(page.body).toContain(chapter.pressure)
      expect(page.choices.map((choice) => choice.label)).toEqual(expectedActions)
      expect(choiceByLabel(page, chapter.actions.brave).consequence.result).toContain(
        chapter.location,
      )
      expect(choiceByLabel(page, chapter.actions.risky).consequence.result).toContain(
        chapter.pressure,
      )
      expect(choiceByLabel(page, chapter.actions.kind).consequence.result).toContain(chapter.ally)
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
        const staysInChapter = chapterLabel(page) === chapterLabel(target)
        const entersNextPage = target.number === page.number + 1
        return target.number <= 5 || (!staysInChapter && !entersNextPage)
      })
    })

    expect(dislocatedRoutes, "generated choices jumping to unrelated story pages").toHaveLength(0)
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

  it("opens with readable prequel pages before the main danger branches", () => {
    const prequelPages = storyPages.filter(
      (page) => page.kind === "story" && page.narrativeFunction.startsWith("프리퀄"),
    )

    expect(prequelPages.length, "prequel page count").toBeGreaterThanOrEqual(3)
    expect(prequelPages.at(0)?.title).toContain("프리퀄")
    expect(prequelPages.at(0)?.body).toContain("바게트")
  })

  it("uses natural Korean subject particles in generated copy", () => {
    expect(withSubjectParticle("소금 상인 로미")).toBe("소금 상인 로미가")
    expect(withSubjectParticle("반죽 지도 제작자 피노")).toBe("반죽 지도 제작자 피노가")
    expect(withSubjectParticle("곰팡이 정찰병")).toBe("곰팡이 정찰병이")
    expect(withSubjectParticle("작은 목소리")).toBe("작은 목소리가")

    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const allVisibleCopy = storyPages
      .flatMap((page) => [page.body, ...page.choices.map((choice) => choice.consequence.result)])
      .join("\n")

    expect(storyPageById("p_0035").body).toContain("소금 상인 로미가")
    expect(storyPageById("p_0149").body).toContain("작은 목소리가")
    expect(allVisibleCopy).not.toMatch(/(로미|피노|목소리|냄새)이/u)
    expect(storyOnly.map((page) => page.body).join("\n")).not.toContain("가이")
  })
})

function storyPageById(id: string) {
  const page = storyPages.find((candidate) => candidate.id === id)
  if (page?.kind !== "story") {
    throw new Error(`Expected ${id} to be a story page`)
  }
  return page
}

function choiceByLabel(page: ReturnType<typeof storyPageById>, label: string) {
  const choice = page.choices.find((candidate) => candidate.label === label)
  if (choice === undefined) {
    throw new Error(`Expected ${page.id} to include choice ${label}`)
  }
  return choice
}

function chapterLabel(page: ReturnType<typeof storyPageById>): string {
  return page.narrativeFunction.split(":")[0] ?? page.narrativeFunction
}
