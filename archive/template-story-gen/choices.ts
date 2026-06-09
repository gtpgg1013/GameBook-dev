import { consequenceFor, consequenceForArrival, consequenceForEnding } from "./consequences"
import { type EndingId, STORY_PAGE_COUNT } from "./constants"
import { pageId } from "./ids"
import { pick } from "./shared"
import { endingRouteLabels, endingRouteSlots, fallbackEnding } from "./storyEndingRoutes"
import { type StoryRoute, storyRoutes } from "./storySchema"
import { arrivalForPage, chapterFor, routeForStoryPage } from "./storyWorld"
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
  return storyRoutes.map((route) => planForRoute(number, route))
}

function planForRoute(number: number, route: StoryRoute): ChoicePlan {
  const endingId = endingRouteSlots[number]?.[route]
  if (endingId !== undefined) {
    return endingPlan(endingId, route, number)
  }

  const targetNumber = nextStoryPageForRoute(number, route)
  if (targetNumber === undefined) {
    return endingPlan(fallbackEnding(route), route, number)
  }

  const scene = arrivalForPage(targetNumber)
  return action(
    scene.action,
    pageId(targetNumber),
    toneForRoute(route),
    effectsForRoute(route, targetNumber),
    consequenceForArrival(scene),
  )
}

function endingPlan(id: EndingId, route: StoryRoute, number: number): ChoicePlan {
  return action(
    endingLabelForSource(id, route, number),
    id,
    toneForEnding(id, route),
    effectsForRoute(route, number),
    consequenceForEnding(id),
  )
}

function endingLabelForSource(id: EndingId, route: StoryRoute, number: number): string {
  const curatedLabel = endingRouteLabels[number]?.[route]
  if (curatedLabel !== undefined) {
    return curatedLabel
  }

  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  switch (id) {
    case "e_good_crust_crown":
      return "새벽 빵집 불을 끝까지 지킨다"
    case "e_good_bakery_dawn":
      return "첫 새벽빵을 사람들과 나눈다"
    case "e_bad_toasted":
      return `${scene.keyword} 쪽으로 무리하게 밀고 간다`
    case "e_bad_mold_curse":
      return `${chapter.clue} 기록을 끝까지 읽는다`
    case "e_bad_sliced":
      return `${chapter.location}의 빠른 길로 뛰어든다`
    case "e_neutral_market_truce":
      return `${chapter.location} 사람들의 거래를 받아들인다`
    case "e_neutral_wheat_exile":
      return `${chapter.location}의 조용한 길로 들어간다`
    case "e_joke_butter_idol":
      return `황금빛 ${scene.keyword} 냄새를 따라간다`
    case "e_joke_infinite_toaster":
      return `${chapter.threat}를 한 번 더 당긴다`
    case "e_secret_sourdough_oracle":
      return `${scene.keyword} 뒤의 오래된 문을 연다`
    case "e_secret_crumb_void":
      return `${chapter.bridge} 아래 별빛을 따라간다`
    case "e_true_baguette_hero":
      return "새벽 빵집의 마지막 빵을 함께 나눈다"
    default:
      return assertNever(id)
  }
}

function action(
  label: string,
  targetId: string,
  tone: Choice["tone"],
  effects: readonly ChoiceEffect[],
  result = consequenceFor(label, tone),
): ChoicePlan {
  return { label, targetId, tone, effects, result }
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

function nextStoryPageForRoute(number: number, route: StoryRoute): number | undefined {
  for (let targetNumber = number + 1; targetNumber <= STORY_PAGE_COUNT; targetNumber += 1) {
    if (routeForStoryPage(targetNumber) === route) {
      return targetNumber
    }
  }
  return undefined
}

function effectsForRoute(route: StoryRoute, index = 0): readonly ChoiceEffect[] {
  const chapter = chapterFor(Math.max(6, index))
  switch (route) {
    case "front":
      return [{ kind: "stat", stat: "courage", delta: 1 }]
    case "clue":
      return [
        { kind: "stat", stat: "crumbs", delta: 1 },
        { kind: "flag", flag: `clue_${index}`, value: true },
      ]
    case "heart":
      return [
        { kind: "item", item: chapter.routes.heart.item },
        { kind: "stat", stat: "crumbs", delta: 1 },
      ]
    default:
      return assertNever(route)
  }
}

function toneForRoute(route: StoryRoute): Choice["tone"] {
  switch (route) {
    case "front":
      return "brave"
    case "clue":
      return "secret"
    case "heart":
      return "cautious"
    default:
      return assertNever(route)
  }
}

function toneForEnding(id: EndingId, route: StoryRoute): Choice["tone"] {
  if (id.startsWith("e_bad")) {
    return "foolish"
  }
  return toneForRoute(route)
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

function assertNever(value: never): never {
  throw new Error(`Unexpected choice variant: ${String(value)}`)
}
