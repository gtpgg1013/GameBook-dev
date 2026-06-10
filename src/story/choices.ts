import { consequenceFor, consequenceForArrival, consequenceForEnding } from "./consequences"
import { type EndingId, STORY_PAGE_COUNT } from "./constants"
import { pageId } from "./ids"
import { pick } from "./shared"
import { endingRouteLabels, endingRouteSlots, fallbackEnding } from "./storyEndingRoutes"
import { type StoryRoute, storyRoutes } from "./storySchema"
import { arrivalForPage, chapterFor, routeForStoryPage, pageDataFor } from "./storyWorld"
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
    action("책의 다음 장을 넘긴다", pageId(2), "brave", [{ kind: "stat", stat: "courage", delta: 1 }]),
    action("바게트를 더 자세히 살핀다", pageId(3), "secret", [{ kind: "stat", stat: "crumbs", delta: 1 }]),
    action("빵집 문을 열고 밖으로 나간다", pageId(4), "cautious", [
      { kind: "item", item: "따뜻한 빵조각" },
      { kind: "stat", stat: "crumbs", delta: 1 },
    ]),
  ],
  2: [
    action("뒷문에서 들린 소리 쪽으로 간다", pageId(3), "cautious", [{ kind: "stat", stat: "crumbs", delta: 1 }]),
    action("빵칼을 하나 집어 들고 밖으로 나간다", pageId(4), "brave", [{ kind: "item", item: "빵칼 손잡이" }]),
    action("바닥의 반죽 덩어리를 뜯어 본다", pageId(5), "secret", [
      { kind: "stat", stat: "crumbs", delta: 1 },
    ]),
  ],
  3: [
    action("문지기에게 이름을 밝힌다", pageId(4), "brave", [{ kind: "stat", stat: "courage", delta: 1 }]),
    action("이름 대신 이곳에 대해 묻는다", pageId(5), "secret", [
      { kind: "item", item: "젖은 책갈피" },
    ]),
    action("문지기를 지나쳐 안으로 들어간다", pageId(6), "foolish", [
      { kind: "stat", stat: "doubt", delta: 2 },
    ]),
  ],
  4: [
    action("마들렌의 지도 빵을 자세히 본다", pageId(5), "secret", [{ kind: "stat", stat: "crumbs", delta: 1 }]),
    action("항구 쪽 방패병에게 달려간다", pageId(6), "brave", [{ kind: "item", item: "식빵 방패" }]),
    action("마들렌에게 바게트를 보여준다", pageId(6), "cautious", [
      { kind: "stat", stat: "crumbs", delta: 2 },
    ]),
  ],
  5: [
    action("곰팡이 배 쪽으로 나아간다", pageId(6), "brave", [
      { kind: "flag", flag: "cooled_oven_early", value: true },
    ]),
    action("시장의 암호 가격표를 조사한다", pageId(7), "secret", [
      { kind: "stat", stat: "crumbs", delta: 2 },
    ]),
    action("마들렌의 곁을 지킨다", pageId(8), "cautious", [{ kind: "item", item: "수레 바퀴" }]),
  ],
  // 마지막 장: 엔딩 분기 제어
  159: [
    action("검의 선택을 따라간다", pageId(160), "brave", [
      { kind: "stat", stat: "courage", delta: 1 },
    ]),
    action("빵집 오븐 뒤의 오래된 문을 연다", "e_secret_sourdough_oracle", "secret", [
      { kind: "stat", stat: "crumbs", delta: 1 },
    ]),
    action("새벽 빵집의 마지막 빵을 함께 나눈다", "e_true_baguette_hero", "cautious", [
      { kind: "stat", stat: "crumbs", delta: 2 },
    ]),
  ],
  160: [
    action("새벽 빵집 불을 끝까지 지킨다", "e_good_crust_crown", "brave", [
      { kind: "stat", stat: "courage", delta: 2 },
    ]),
    action("첫 새벽빵을 사람들과 나눈다", "e_good_bakery_dawn", "cautious", [
      { kind: "stat", stat: "crumbs", delta: 2 },
    ]),
    action("왕관의 빵가루 속으로 들어간다", "e_secret_crumb_void", "secret", [
      { kind: "stat", stat: "crumbs", delta: 1 },
    ]),
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

  // 줄글 소설: JSON에 저장된 선택지가 있으면 사용, 없으면 동적 생성
  const targetData = pageDataFor(targetNumber)
  const currentPage = pageDataFor(number)
  if (currentPage?.choices && currentPage.choices.length > 0) {
    const routeIndex = route === "front" ? 0 : route === "clue" ? 1 : 2
    const label = (currentPage.choices as readonly string[])[routeIndex] ?? currentPage.choices[0] ?? `${targetNumber}페이지로 간다`
    return action(
      label,
      pageId(targetNumber),
      toneForRoute(route),
      effectsForRoute(route, targetNumber),
    )
  }
  const title = targetData?.title ?? ""
  const label = title.length > 2
    ? `${title} 쪽으로 나아간다`
    : `${targetNumber}페이지로 간다`
  return action(
    label,
    pageId(targetNumber),
    toneForRoute(route),
    effectsForRoute(route, targetNumber),
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
  // 줄글 소설: 순차적 페이지로 연결 (p+1, p+2, p+3)
  const offset = route === "front" ? 1 : route === "clue" ? 2 : 3
  const target = number + offset
  if (target > STORY_PAGE_COUNT) return undefined
  return target
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
