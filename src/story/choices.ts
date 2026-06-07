import { chapterConsequence, consequenceFor } from "./consequences"
import { endingMilestones, endingSpecs, STORY_PAGE_COUNT } from "./constants"
import { pageId } from "./ids"
import { pick } from "./shared"
import { chapterFor } from "./storyWorld"
import type { Choice, ChoiceEffect } from "./types"

type ChoiceSlot = "a" | "b" | "c"

type ChoicePlan = {
  readonly label: string
  readonly targetId: string
  readonly tone: Choice["tone"]
  readonly effects: readonly ChoiceEffect[]
  readonly result: string
}

const choiceSlots = ["a", "b", "c"] as const
const CHAPTER_SIZE = 16
const FIRST_GENERATED_PAGE = 6
const ENDING_GATE_PAGE = 118

const scriptedChoices: Readonly<Record<number, readonly ChoicePlan[]>> = {
  1: [
    action("무기고로 간다", pageId(2), "brave", [{ kind: "stat", stat: "courage", delta: 1 }]),
    action("술집으로 간다", pageId(3), "cautious", [{ kind: "stat", stat: "crumbs", delta: 1 }]),
    action("어려운 사람을 도와준다", pageId(4), "secret", [
      { kind: "item", item: "따뜻한 빵조각" },
      { kind: "stat", stat: "crumbs", delta: 1 },
    ]),
  ],
  2: [
    action("술집으로 간다", pageId(3), "cautious", [{ kind: "stat", stat: "crumbs", delta: 1 }]),
    action("마을 대장장이를 돕는다", pageId(11), "brave", [{ kind: "item", item: "빵칼 손잡이" }]),
    action("잠긴 무기 상자를 조사한다", pageId(15), "secret", [
      { kind: "stat", stat: "doubt", delta: 1 },
    ]),
  ],
  3: [
    action("문지기를 설득한다", pageId(4), "brave", [{ kind: "stat", stat: "courage", delta: 1 }]),
    action("문지기를 밀치고 지나간다", "e_bad_toasted", "foolish", [
      { kind: "stat", stat: "doubt", delta: 2 },
    ]),
    action("문지기의 질문을 조사한다", pageId(18), "secret", [
      { kind: "item", item: "젖은 책갈피" },
    ]),
  ],
  4: [
    action("식빵 방패병을 돕는다", pageId(5), "brave", [{ kind: "item", item: "식빵 방패" }]),
    action("효모 안개 속에 숨는다", pageId(21), "cautious", [
      { kind: "stat", stat: "doubt", delta: 1 },
    ]),
    action("곰팡이 정찰병과 싸운다", pageId(25), "foolish", [
      { kind: "stat", stat: "courage", delta: 2 },
    ]),
  ],
  5: [
    action("왕실 오븐을 식힌다", pageId(6), "brave", [
      { kind: "flag", flag: "cooled_oven_early", value: true },
    ]),
    action("시장 사람들과 거래한다", pageId(24), "cautious", [
      { kind: "stat", stat: "crumbs", delta: 2 },
    ]),
    action("버려진 빵수레를 수리한다", pageId(28), "secret", [{ kind: "item", item: "수레 바퀴" }]),
  ],
}

export function choicesFor(number: number): readonly Choice[] {
  const plans = scriptedChoices[number] ?? generatedPlans(number)
  return uniqueChoices(
    plans.map((plan, index) => {
      const slot = pick(choiceSlots, index)
      return makeChoice(number, slot, plan)
    }),
  )
}

function generatedPlans(number: number): readonly ChoicePlan[] {
  const chapter = chapterFor(number)
  return [
    action(
      chapter.actions.brave,
      steadyTarget(number),
      "brave",
      [{ kind: "stat", stat: "courage", delta: 1 }],
      chapterConsequence(chapter, "brave"),
    ),
    action(
      chapter.actions.risky,
      riskyTarget(number),
      number % 3 === 0 ? "foolish" : "secret",
      [
        { kind: "stat", stat: number % 3 === 0 ? "doubt" : "crumbs", delta: 2 },
        { kind: "flag", flag: `risk_${number}`, value: true },
      ],
      chapterConsequence(chapter, "risky"),
    ),
    action(
      chapter.actions.kind,
      reflectiveTarget(number),
      "cautious",
      [
        {
          kind: "item",
          item: pick(["접힌 책갈피", "소금 결정", "버터 봉인", "밀짚 매듭"], number),
        },
        { kind: "stat", stat: "crumbs", delta: 1 },
      ],
      chapterConsequence(chapter, "kind"),
    ),
  ]
}

function action(
  label: string,
  targetId: string,
  tone: Choice["tone"],
  effects: readonly ChoiceEffect[],
  result = consequenceFor(label, tone),
): ChoicePlan {
  return {
    label,
    targetId,
    tone,
    effects,
    result,
  }
}

function makeChoice(number: number, slot: ChoiceSlot, plan: ChoicePlan): Choice {
  return {
    id: `c_${pageId(number)}_${slot}`,
    label: plan.label,
    targetId: plan.targetId,
    tone: plan.tone,
    effects: plan.effects,
    consequence: {
      action: plan.label,
      result: plan.result,
    },
  }
}

function steadyTarget(number: number): string {
  return number < STORY_PAGE_COUNT ? pageId(number + 1) : "e_true_baguette_hero"
}

function riskyTarget(number: number): string {
  const milestone = endingMilestones[number]
  if (milestone !== undefined) {
    return milestone
  }
  return contextualForwardTarget(number, pick([6, 9, 13, 17, 21], number))
}

function reflectiveTarget(number: number): string {
  if (number >= ENDING_GATE_PAGE && number % 11 === 0) {
    return pick(endingSpecs, number)[0]
  }
  return contextualBackwardTarget(number, pick([2, 4, 7, 10], number))
}

function contextualForwardTarget(number: number, offset: number): string {
  if (number >= STORY_PAGE_COUNT) {
    return pick(endingSpecs, number)[0]
  }
  const chapterEnd = generatedChapterEnd(number)
  const targetNumber = number + offset
  if (targetNumber <= chapterEnd) {
    return pageId(targetNumber)
  }
  const fallbackNumber = number + 2 <= chapterEnd ? number + 2 : number + 1
  return pageId(fallbackNumber)
}

function contextualBackwardTarget(number: number, offset: number): string {
  const chapterStart = generatedChapterStart(number)
  const targetNumber = number - offset
  if (targetNumber >= chapterStart) {
    return pageId(targetNumber)
  }
  if (number > chapterStart) {
    return pageId(chapterStart)
  }
  return pageId(Math.min(generatedChapterEnd(number), number + 3))
}

function generatedChapterStart(number: number): number {
  const chapterStart = Math.floor((number - 1) / CHAPTER_SIZE) * CHAPTER_SIZE + 1
  return Math.max(FIRST_GENERATED_PAGE, chapterStart)
}

function generatedChapterEnd(number: number): number {
  const chapterStart = Math.floor((number - 1) / CHAPTER_SIZE) * CHAPTER_SIZE + 1
  return Math.min(STORY_PAGE_COUNT, chapterStart + CHAPTER_SIZE - 1)
}

function uniqueChoices(choices: readonly Choice[]): readonly Choice[] {
  const seenTargets = new Set<string>()
  const unique: Choice[] = []
  for (const choice of choices) {
    if (!seenTargets.has(choice.targetId)) {
      seenTargets.add(choice.targetId)
      unique.push(choice)
    }
  }
  return unique
}
