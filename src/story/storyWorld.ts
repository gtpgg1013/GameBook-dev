import { withSubjectParticle } from "./korean"
import { pick } from "./shared"

export type Chapter = {
  readonly arc: string
  readonly location: string
  readonly objective: string
  readonly ally: string
  readonly pressure: string
  readonly truth: string
  readonly actions: {
    readonly brave: string
    readonly risky: string
    readonly kind: string
  }
}

const chapters: readonly Chapter[] = [
  {
    arc: "프리퀄과 소환",
    location: "낡은 방과 크루아상 항구",
    objective: "이 세계의 규칙을 받아들이는 것",
    ally: "노점상 노파 마들렌",
    pressure: "책갈피 문지기의 질문",
    truth: "선택지는 결과를 말하지 않는다",
    actions: {
      brave: "크루아상 항구로 간다",
      risky: "책갈피 문지기와 싸운다",
      kind: "노점상 노파 마들렌을 돕는다",
    },
  },
  {
    arc: "효모 숲",
    location: "숨 쉬는 나무와 발효 안개 사이",
    objective: "사라진 독자의 책갈피를 찾는 것",
    ally: "말하는 식빵 방패병",
    pressure: "곰팡이 정찰병의 발소리",
    truth: "겁먹은 길도 때로는 살아 있는 길이다",
    actions: {
      brave: "효모 숲 순찰대를 돕는다",
      risky: "곰팡이 정찰병과 싸운다",
      kind: "말하는 식빵 방패병을 구한다",
    },
  },
  {
    arc: "버터 시장",
    location: "황금 기름등이 흔들리는 노점 거리",
    objective: "기사단 암호를 해독하는 것",
    ally: "소금 상인 로미",
    pressure: "버터 조각상의 달콤한 약속",
    truth: "공짜 향기는 늘 값을 늦게 청구한다",
    actions: {
      brave: "버터 시장 암호를 조사한다",
      risky: "버터 조각상과 거래한다",
      kind: "소금 상인 로미를 돕는다",
    },
  },
  {
    arc: "빵칼 협곡",
    location: "거대한 식칼들이 바람에 울리는 벼랑",
    objective: "왕실 오븐으로 가는 우회로를 여는 것",
    ally: "반죽 지도 제작자 피노",
    pressure: "얇게 썰린 갑옷 조각들",
    truth: "빠른 길은 대개 무언가를 자르고 지나간다",
    actions: {
      brave: "빵칼 협곡 우회로로 간다",
      risky: "얇게 썰린 갑옷을 조사한다",
      kind: "반죽 지도 제작자를 구한다",
    },
  },
  {
    arc: "곰팡이 성당",
    location: "푸른 포자가 스테인드글라스처럼 빛나는 회랑",
    objective: "거짓 예언의 문장을 지우는 것",
    ally: "사워도우 수녀 아멜",
    pressure: "푸른 기도문과 젖은 종이 냄새",
    truth: "믿음과 감염은 아주 비슷한 목소리를 낸다",
    actions: {
      brave: "곰팡이 성당 문장을 조사한다",
      risky: "푸른 기도문과 싸운다",
      kind: "사워도우 수녀 아멜을 돕는다",
    },
  },
  {
    arc: "왕실 오븐",
    location: "해처럼 뜨거운 궁정의 화구 앞",
    objective: "과열된 왕국의 온도를 낮추는 것",
    ally: "재투성이 오븐 시종",
    pressure: "너무 오래 구워진 기사들의 침묵",
    truth: "열기는 용기를 단련하지만 망설임도 태운다",
    actions: {
      brave: "왕실 오븐을 식힌다",
      risky: "과열된 오븐과 싸운다",
      kind: "오븐 시종을 돕는다",
    },
  },
  {
    arc: "빵가루 공허",
    location: "부스러기 별들이 떠다니는 검은 여백",
    objective: "책 바깥으로 새는 쪽수를 붙잡는 것",
    ally: "페이지를 접는 사워도우 예언자",
    pressure: "발밑에서 사라지는 문장",
    truth: "돌아가는 길도 앞으로 가는 선택일 수 있다",
    actions: {
      brave: "부스러기 별빛으로 간다",
      risky: "사라지는 문장을 조사한다",
      kind: "페이지 접는 예언자를 돕는다",
    },
  },
  {
    arc: "밀밭 유배지",
    location: "끝없이 누운 이삭과 낮은 바람",
    objective: "버려진 선택들의 목소리를 듣는 것",
    ally: "밀짚 망토의 전령",
    pressure: "아무도 책임지지 않은 쪽수들",
    truth: "정답이 없는 장면에도 다음 문장은 있다",
    actions: {
      brave: "끝없는 밀밭으로 간다",
      risky: "버려진 선택들을 조사한다",
      kind: "밀짚 망토 전령을 기다린다",
    },
  },
  {
    arc: "토스터 관문",
    location: "은색 레버와 무한히 튀어 오르는 문",
    objective: "반복되는 선택의 고리를 끊는 것",
    ally: "겁 많은 잼 정령",
    pressure: "딸깍거리는 시간의 레버",
    truth: "웃긴 길이라고 전부 가벼운 길은 아니다",
    actions: {
      brave: "토스터 관문 레버를 당긴다",
      risky: "튀어 오르는 문 뒤에 숨는다",
      kind: "겁 많은 잼 정령을 구한다",
    },
  },
  {
    arc: "새벽 빵집",
    location: "전쟁이 끝나기 전의 첫 불빛",
    objective: "바게트 검의 진짜 용도를 결정하는 것",
    ally: "지금까지 만난 모든 작은 목소리",
    pressure: "왕관과 귀환 사이의 마지막 냄새",
    truth: "용사는 적을 이기는 사람이 아니라 굶주림을 끝내는 사람이다",
    actions: {
      brave: "새벽 빵집 불을 지킨다",
      risky: "왕관의 냄새를 조사한다",
      kind: "작은 목소리와 빵을 나눈다",
    },
  },
]

export function storyTitle(number: number): string {
  if (number <= 5) {
    return pick(
      [
        "프리퀄: 마지막 평범한 밤",
        "프리퀄: 빵으로 싸우는 법",
        "프리퀄: 첫 번째 문지기",
        "프리퀄: 지도에 없는 쪽수",
        "프리퀄: 바삭함의 맹세",
      ],
      number - 1,
    )
  }
  const chapter = chapterFor(number)
  return `${chapter.arc}: ${pick(["작은 문", "첫 추격", "숨은 단서", "흔들리는 약속"], number)}`
}

export function storyBody(number: number): string {
  const prequel = prequelBody(number)
  if (prequel !== undefined) {
    return prequel
  }

  const chapter = chapterFor(number)
  const actionCue = pick(["달려온다", "문을 막는다", "속삭인다", "빛난다", "흔들린다"], number)
  const resolveCue = pick(
    ["지금은 달린다", "먼저 숨을 고른다", "소리를 따라간다", "작은 손을 잡는다", "문틈을 본다"],
    number * 3,
  )
  const prop = pick(["바게트 검을", "버터 지도를", "책갈피를", "식빵 방패를"], number * 2)
  return `${chapter.location}. ${withSubjectParticle(chapter.ally)} ${prop} 건넨다. 책장 귀퉁이의 ${number}번째 빵가루가 반짝인다. 오늘 할 일은 ${chapter.objective}.

그때 ${withSubjectParticle(chapter.pressure)} ${actionCue}. ${resolveCue}. 한 행동만 고르면 된다. ${chapter.truth}.`
}

export function narrativeFunction(number: number): string {
  if (number <= 5) {
    return `프리퀄: 빵으로 싸우는 세계를 배운다`
  }
  const chapter = chapterFor(number)
  return `${chapter.arc}: 목표 ${chapter.objective} · 위험 ${chapter.pressure}`
}

export function chapterFor(number: number): Chapter {
  const index = Math.min(chapters.length - 1, Math.floor((number - 1) / 16))
  return pick(chapters, index)
}

function prequelBody(number: number): string | undefined {
  switch (number) {
    case 1:
      return `어젯밤, 당신은 마지막 바게트를 들고 낡은 게임북을 펼쳤다. 첫 문장은 이상하게도 당신의 이름을 불렀다.

눈을 뜨자 방은 사라졌다. 눈앞에는 빵마을, 무기고, 술집, 넘어진 노점상. 손에는 딱딱한 바게트 하나.

이 세계에서는 칼보다 빵이 강하다. 이제 설명보다 행동이 먼저다.`
    case 2:
      return `무기고의 쇠칼은 모두 녹슬었다. 대신 방패빵과 바게트 손잡이가 벽에 걸려 있다.

대장장이가 손을 흔든다. "용사라면 먼저 고쳐! 싸움은 그다음이야."

먼지 낀 상자에는 하얀 밀가루 자국이 이어져 있다. 따라가면 뭔가를 알 수 있다.`
    case 3:
      return `술집은 소문으로 꽉 찼다. 잼 밀수꾼은 숨고, 빵 기사단은 겁먹은 척한다.

노파 마들렌이 책갈피를 내민다. "효모 숲 문지기를 지나야 해. 말로도, 힘으로도 갈 수 있지."

문밖에서 갑옷 입은 문지기가 묻는다. "왜 이 세계를 구하려 하지?"`
    case 4:
      return `효모 숲 입구. 말하는 식빵 방패병이 포자 덫에 걸렸다.

멀리서 곰팡이 정찰병의 발소리가 들린다. 도망치면 안전하다. 도우면 길을 얻는다. 싸우면 빨라질 수도 있다.

바게트 끝이 떨린다. 이번 선택은 누구를 먼저 볼지 정하는 일이다.`
    case 5:
      return `버터 시장에 도착하자 모두가 당신을 용사라고 부른다. 하지만 왕실 오븐은 아직 너무 멀다.

지금 할 수 있는 일은 셋이다. 작은 오븐을 식혀 시간을 벌기. 시장에서 물과 밀가루를 얻기. 빵수레를 고쳐 사람들을 옮기기.

진짜 결말은 아직 멀다. 여기서는 준비가 갈린다.`
    default:
      return undefined
  }
}
