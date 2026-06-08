import type { EndingId } from "./constants"
import { withObjectParticle } from "./korean"
import type { ArrivalScene } from "./storySchema"
import type { Choice } from "./types"

export function consequenceFor(label: string, tone: Choice["tone"]): string {
  const scripted = scriptedConsequence(label)
  if (scripted !== undefined) {
    return scripted
  }

  switch (tone) {
    case "brave":
      return "(딱!) 바게트가 버틴다. 길은 열렸다. 그래도 누가 다쳤는지 먼저 본다."
    case "cautious":
      return "(킁킁...) 발소리와 냄새부터 읽는다. 싸움은 늦었지만, 숨은 덫 하나가 보인다."
    case "foolish":
      return "(쾅!) 힘이 먼저 튀어나간다. 길은 짧아졌고, 반동은 바로 따라붙는다. 책장이 움찔한다."
    case "secret":
      return "(스윽...) 남들이 넘긴 단서를 잡는다. 멀어 보이던 옆문이 손끝에 걸린다."
    default:
      return assertNever(tone)
  }
}

export function consequenceForArrival(scene: ArrivalScene): string {
  switch (scene.route) {
    case "front":
      return `(탁!) ${scene.keyword}부터 밀어붙인다. "좋아, 길이 열리네." ${scene.reward}.`
    case "clue":
      return `(사각...) ${withObjectParticle(scene.keyword)} 다시 본다. "이거 그냥 장식 아니잖아?" ${scene.reward}.`
    case "heart":
      return `(후우...) ${scene.keyword}부터 챙긴다. "사람부터 봐야지." ${scene.reward}.`
    default:
      return assertNever(scene.route)
  }
}

export function consequenceForEnding(id: EndingId): string {
  switch (id) {
    case "e_good_crust_crown":
      return "(타닥...) 왕관보다 빵집 불을 먼저 지킨다. 굶주린 사람들이 하나둘 모이고, 왕관은 힘을 잃는다."
    case "e_good_bakery_dawn":
      return "(바삭.) 첫 새벽빵을 나눈다. 칼 들 시간은 지나가고, 빵집 안엔 전쟁보다 오래갈 냄새가 남는다."
    case "e_bad_toasted":
      return "(치이익...) 달아오른 문을 억지로 민다. 바게트가 검게 타고, 책장이 연기 속에서 닫힌다."
    case "e_bad_mold_curse":
      return "(푸슉...) 푸른 기도문을 삼킨다. 몸보다 이름이 먼저 곰팡이에 먹힌다. 방패병도 네 이름을 부르지 못한다."
    case "e_bad_sliced":
      return "(슈각!) 협곡의 빠른 길을 믿어 버린다. 바람이 바게트와 발걸음을 한꺼번에 썬다."
    case "e_neutral_market_truce":
      return "(웅성...) 시장 거래를 받아들인다. 싸움은 멈췄지만, 왕실 오븐 불씨는 아직 살아 있다."
    case "e_neutral_wheat_exile":
      return "(사아아...) 밀밭의 침묵을 고른다. 더 다치는 사람은 없다. 집은 한참 멀어진다."
    case "e_joke_butter_idol":
      return "(번쩍!) 버터 조각상 제안을 믿는다. 모두가 반짝이는 버터 앞에서 괜히 숙연해진다."
    case "e_joke_infinite_toaster":
      return "(딸깍!) 레버를 또 당긴다. 문이 튀어 오르고, 방금 본 장면이 다시 구워진다."
    case "e_secret_sourdough_oracle":
      return "(숨...) 예언자 말을 끝까지 듣는다. 책 바깥 독자까지 닿는 작은 목소리가 열린다."
    case "e_secret_crumb_void":
      return "(반짝...) 부스러기 별빛을 너무 깊이 따라간다. 길은 사라지고 손바닥 위 별자리만 남는다."
    case "e_true_baguette_hero":
      return "(바삭...) 바게트를 검처럼 휘두르지 않는다. 마지막 빵을 나누자, 세계가 배고픔을 먼저 본다."
    default:
      return assertNever(id)
  }
}

function scriptedConsequence(label: string): string | undefined {
  switch (label) {
    case "무기고로 간다":
      return "(철컥...) 빵칼 손잡이를 얻는다. 이제 바게트는 장난감이 아니다. 누군가를 지킬 물건이다."
    case "술집으로 간다":
      return "(웅성...) 술집 소문을 모은다. 문지기는 힘보다 대답을 먼저 본다고 한다. 그 말이 숲 문턱까지 따라온다."
    case "어려운 사람을 도와준다":
      return "(툭툭.) 넘어진 노점상을 일으킨다. 그는 따뜻한 빵조각과 효모 숲 샛길을 알려 준다."
    case "문지기를 설득한다":
      return '"싸우러 온 거 아니야. 길을 찾으러 왔어." 문지기의 창끝이 내려가고 숲 입구가 열린다.'
    case "문지기를 밀치고 지나간다":
      return "(쾅!) 문지기를 밀치는 순간 책장이 뜨거워진다. 이유 없는 힘은 제일 짧은 배드 엔딩으로 굴러간다."
    case "식빵 방패병을 돕는다":
      return "(뽁!) 식빵 방패병을 포자 덫에서 빼낸다. 그는 방패를 세우고 숲 안쪽 길을 열어 준다."
    case "왕실 오븐을 식힌다":
      return "(치익...) 작은 오븐 열을 낮춘다. 왕실 오븐은 아직 멀다. 시장 사람들은 겨우 숨을 돌린다."
    default:
      return undefined
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected story variant: ${String(value)}`)
}
