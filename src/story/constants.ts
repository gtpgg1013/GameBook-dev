import type { EndingTone } from "./types"

export const STORY_PAGE_COUNT = 160

export const endingSpecs = [
  [
    "e_good_crust_crown",
    "good",
    "굿 엔딩: 바삭한 왕관",
    "(타닥...) 왕관은 빵껍질처럼 얇다. 그래도 무너진 왕국을 다시 묶는다.",
  ],
  [
    "e_good_bakery_dawn",
    "good",
    "굿 엔딩: 새벽의 빵집",
    "(바삭.) 첫 새벽빵이 부푼다. 항구의 전쟁 냄새는 조용히 식는다.",
  ],
  [
    "e_bad_toasted",
    "bad",
    "배드 엔딩: 너무 구워짐",
    "(치이익...) 너무 오래 망설였다. 길은 검은 연기 속으로 닫힌다.",
  ],
  [
    "e_bad_mold_curse",
    "bad",
    "배드 엔딩: 곰팡이 저주",
    "(푸슉...) 거짓 예언을 삼킨 빵이 안쪽부터 푸르게 무너진다.",
  ],
  [
    "e_bad_sliced",
    "bad",
    "배드 엔딩: 얇게 썰림",
    "(슈각!) 협곡 바람이 용기와 무모함을 같이 자른다.",
  ],
  [
    "e_neutral_market_truce",
    "neutral",
    "중립 엔딩: 시장의 휴전",
    "(웅성...) 이긴 사람은 없다. 그래도 오늘 팔 빵은 남는다.",
  ],
  [
    "e_neutral_wheat_exile",
    "neutral",
    "중립 엔딩: 밀밭 유배",
    "(사아아...) 돌아갈 길은 멀어진다. 대답은 밀 이삭뿐이다.",
  ],
  [
    "e_joke_butter_idol",
    "joke",
    "농담 엔딩: 버터 우상",
    "(번쩍!) 찬란한 버터 앞에서 다들 갑자기 엄숙해진다.",
  ],
  [
    "e_joke_infinite_toaster",
    "joke",
    "농담 엔딩: 무한 토스터",
    "(딸깍!) 레버가 내려간다. 운명은 또 튀어 오른다.",
  ],
  [
    "e_secret_sourdough_oracle",
    "secret",
    "비밀 엔딩: 사워도우 예언자",
    "(숨...) 오래 발효된 목소리가 책 바깥 독자까지 부른다.",
  ],
  [
    "e_secret_crumb_void",
    "secret",
    "비밀 엔딩: 빵가루 공허",
    "(반짝...) 길이 사라진 자리엔 부스러기 별자리만 남는다.",
  ],
  [
    "e_true_baguette_hero",
    "true",
    "트루 엔딩: 마지막 빵집 사람",
    "(바삭...) 용사는 적이 아니라 굶주림을 벤다.",
  ],
] as const satisfies readonly (readonly [string, EndingTone, string, string])[]

export type EndingId = (typeof endingSpecs)[number][0]
