import type { EndingId } from "./constants"
import type { StoryRoute } from "./storySchema"

export const endingRouteSlots: Readonly<Record<number, Partial<Record<StoryRoute, EndingId>>>> = {
  12: { clue: "e_bad_toasted" },
  31: { clue: "e_secret_crumb_void" },
  60: { front: "e_bad_sliced" },
  76: { clue: "e_bad_mold_curse" },
  96: { clue: "e_bad_toasted" },
  122: { heart: "e_neutral_market_truce" },
  127: { front: "e_neutral_wheat_exile" },
  128: { clue: "e_joke_butter_idol" },
  134: { heart: "e_secret_sourdough_oracle" },
  143: { clue: "e_joke_infinite_toaster" },
  150: { heart: "e_good_bakery_dawn" },
  154: { front: "e_good_crust_crown" },
  158: { heart: "e_true_baguette_hero" },
}

export const endingRouteLabels: Readonly<Record<number, Partial<Record<StoryRoute, string>>>> = {
  12: { clue: "문지기의 질문을 무시하고 지나간다" },
  31: { clue: "포자 묻은 끈 아래 별빛을 따라간다" },
  60: { front: "도개교 너머 칼바람으로 뛰어든다" },
  76: { clue: "곰팡이 찬송가를 끝까지 읽는다" },
  96: { clue: "타오르는 화구 앞 숫자를 무시하고 지나간다" },
  122: { heart: "밀밭 피난민들의 임시 거래를 받아들인다" },
  127: { front: "끝없는 밀밭의 조용한 길로 들어간다" },
  128: { clue: "황금빛 밀 이삭 냄새를 따라간다" },
  134: { heart: "잼 정령이 가리킨 오래된 문을 연다" },
  143: { clue: "딸깍거리는 시간 레버를 한 번 더 당긴다" },
  150: { heart: "첫 새벽빵을 사람들과 나눈다" },
  154: { front: "새벽 빵집 불을 끝까지 지킨다" },
  158: { heart: "새벽 빵집의 마지막 빵을 함께 나눈다" },
}

export function fallbackEnding(route: StoryRoute): EndingId {
  switch (route) {
    case "front":
      return "e_good_crust_crown"
    case "clue":
      return "e_secret_sourdough_oracle"
    case "heart":
      return "e_true_baguette_hero"
    default:
      return assertNever(route)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected ending route: ${String(value)}`)
}
