import { describe, expect, it } from "vitest"
import { GAMEBOOK_TITLE } from "../src/story/bookMeta"
import {
  withAndParticle,
  withCopulaParticle,
  withDirectionParticle,
  withObjectParticle,
  withSubjectParticle,
} from "../src/story/korean"
import { storyPages } from "../src/story/pages"

describe("story language contract", () => {
  it("frames every visible choice as concrete action instead of page-number instruction", () => {
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
      "고른다",
      "들어간다",
      "펼친다",
      "든다",
      "밝힌다",
      "본다",
      "낸다",
      "맞선다",
      "읽는다",
      "연다",
      "막는다",
      "자른다",
      "민다",
      "받는다",
      "듣는다",
      "준다",
      "찢는다",
      "닫는다",
      "붙잡는다",
      "세운다",
      "가른다",
      "받아들인다",
      "내려놓는다",
      "밀어붙인다",
      "무시한다",
    ]
    const instructionChoices = storyPages.flatMap((page) =>
      page.choices.filter((choice) => /\d+쪽|가시오/u.test(choice.label)),
    )
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

  it("keeps visible Korean direct and free of AI-slop tells", () => {
    const visibleCopy = storyPages
      .flatMap((page) => [
        page.title,
        page.body,
        page.kind === "story" ? page.narrativeFunction : "",
        ...page.choices.flatMap((choice) => [
          choice.label,
          choice.consequence.action,
          choice.consequence.result,
        ]),
      ])
      .join("\n")

    const forbiddenPatterns = [
      /오늘 할 일/u,
      /한 행동만 고르면/u,
      /다음 페이지/u,
      /이야기는/u,
      /살짝/u,
      /무언가/u,
      /바게트가 짧게/u,
      /작은 단서로/u,
      /눈앞까지/u,
      /할 수 있다/u,
      /것이다/u,
      /이를 통해/u,
      /결론적으로/u,
      /본질적으로/u,
      /핵심적으로/u,
      /가지고 있다/u,
      /에 대해/u,
      /통하여/u,
      /되어진/u,
      /에 의해/u,
      /낡은 선택형 모험서/u,
      /바게트 용사 게임북/u,
      /진행 중/u,
      /쪽으로 밀고 나갔다/u,
      /물러서지 않은 대가/u,
      /혼자서는 못 열 문/u,
      /이제 헛걸음/u,
      /결말에 도착했다/u,
      /프리퀄/u,
      /첫 장/u,
      /선택/u,
      /빵 냄새가 짙어진다/u,
      /바게트가 손안에서 뜨거워지고/u,
      /위치\s*:/u,
      /편의점 바게트의 밤/u,
      /광장에 길이 셋/u,
      /결말 말고 준비/u,
    ] as const

    for (const pattern of forbiddenPatterns) {
      expect(visibleCopy, `forbidden language pattern ${pattern}`).not.toMatch(pattern)
    }
  })

  it("uses the sharper isekai title everywhere visible", () => {
    expect(GAMEBOOK_TITLE).toBe("눈떠보니 바게트로\n싸우는 이세계라고?!")
  })

  it("uses declarative narration while keeping dialogue conversational", () => {
    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const crampedPages = storyOnly.filter((page) => !page.body.includes("\n\n"))
    const pagesWithoutTexture = storyOnly.filter(
      (page) => !/[?!]|\.{2,}|…|\([^)]+\.{2,}\)/u.test(page.body),
    )
    const pagesWithoutDeclarativeNarration = storyOnly.filter(
      (page) => !hasDeclarativeNarration(stripDialogue(page.body)),
    )
    const casualNarrationBlocks = storyPages.flatMap((page) =>
      [page.body, ...page.choices.map((choice) => choice.consequence.result)].filter((copy) =>
        hasCasualNarration(stripDialogue(copy)),
      ),
    )

    expect(crampedPages, "story pages without paragraph breaks").toHaveLength(0)
    expect(pagesWithoutTexture, "story pages without dialogue or sound texture").toHaveLength(0)
    expect(
      pagesWithoutDeclarativeNarration,
      "story pages without declarative narration",
    ).toHaveLength(0)
    expect(casualNarrationBlocks, "casual endings outside dialogue").toHaveLength(0)
  })

  it("keeps story paragraphs short enough for mobile scene beats", () => {
    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const overloadedPages = storyOnly.filter((page) => page.body.length > 330)
    const emptyBeatPages = storyOnly.filter((page) =>
      page.body
        .split(/(?<=[.!?。？！.])\s+/u)
        .map((beat) => beat.trim())
        .some((beat) => beat.length === 0),
    )

    expect(overloadedPages, "story pages over 300 Korean chars").toHaveLength(0)
    expect(emptyBeatPages, "story pages with empty mobile beats").toHaveLength(0)
  })

  it("uses natural Korean subject particles in generated copy", () => {
    expect(withSubjectParticle("소금 상인 로미")).toBe("소금 상인 로미가")
    expect(withSubjectParticle("반죽 지도 제작자 피노")).toBe("반죽 지도 제작자 피노가")
    expect(withSubjectParticle("곰팡이 정찰병")).toBe("곰팡이 정찰병이")
    expect(withSubjectParticle("작은 목소리")).toBe("작은 목소리가")
    expect(withCopulaParticle("빵칼")).toBe("빵칼이")
    expect(withCopulaParticle("냄새")).toBe("냄새")
    expect(withObjectParticle("새벽빵")).toBe("새벽빵을")
    expect(withObjectParticle("냄새")).toBe("냄새를")
    expect(withAndParticle("이삭")).toBe("이삭과")
    expect(withAndParticle("냄새")).toBe("냄새와")
    expect(withDirectionParticle("옆문")).toBe("옆문으로")
    expect(withDirectionParticle("통로")).toBe("통로로")
    expect(withDirectionParticle("마지막 장")).toBe("마지막 장으로")

    const storyOnly = storyPages.filter((page) => page.kind === "story")
    const allVisibleCopy = storyPages
      .flatMap((page) => [page.body, ...page.choices.map((choice) => choice.consequence.result)])
      .join("\n")

    expect(storyPageById("p_0035").body).toContain("소금 상인 로미가")
    expect(storyPageById("p_0006").body).toContain("빵칼이겠는걸")
    expect(storyPageById("p_0149").body).toContain("작은 목소리들이")
    expect(allVisibleCopy).not.toContain("새벽빵를")
    expect(allVisibleCopy).not.toMatch(/(기도문|문장)는/u)
    expect(allVisibleCopy).not.toContain("쪽수들가")
    expect(allVisibleCopy).not.toMatch(/(문|장)로 가/u)
    expect(allVisibleCopy).not.toMatch(/(?:나 옆|나 편|나 몸짓|나 목소리|나 뒤|나 몫)/u)
    expect(allVisibleCopy).not.toMatch(/(로미|피노|목소리|냄새)이/u)
    expect(storyOnly.map((page) => page.body).join("\n")).not.toContain("가이")
    expect(storyPageById("p_0021").title).toContain("버터 시장 뒷문으로")
    expect(storyPageById("p_0147").title).toContain("마지막 장으로")
    expect(storyPageById("p_0147").narrativeFunction).toContain("마지막 장으로")
  })
})

function storyPageById(id: string) {
  const page = storyPages.find((candidate) => candidate.id === id)
  if (page?.kind !== "story") {
    throw new Error(`Expected ${id} to be a story page`)
  }
  return page
}

function stripDialogue(copy: string): string {
  return copy.replaceAll(/"[^"]*"/gu, "")
}

function hasDeclarativeNarration(copy: string): boolean {
  return /[가-힣]+다\./u.test(copy)
}

function hasCasualNarration(copy: string): boolean {
  return /(?:했어|있어|보여|열려|닫혀|꺼져|멀어|멀어져|먹혀|불러|올라|베어|식어|묶어|엄숙해져|숙연해져|알려 줘|열어 줘|따라와)(?:[.\n]|$)/u.test(
    copy,
  )
}
