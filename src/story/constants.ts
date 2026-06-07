import type { EndingTone } from "./types"

export const STORY_PAGE_COUNT = 160

export const endingSpecs = [
  [
    "e_good_crust_crown",
    "good",
    "굿 엔딩: 바삭한 왕관",
    "왕관은 빵껍질처럼 얇지만, 무너진 왕국을 다시 묶는 약속이다",
  ],
  [
    "e_good_bakery_dawn",
    "good",
    "굿 엔딩: 새벽의 빵집",
    "첫 새벽빵이 구워지는 동안 항구의 전쟁은 조용히 식어 간다",
  ],
  [
    "e_bad_toasted",
    "bad",
    "배드 엔딩: 너무 구워짐",
    "너무 오래 망설인 선택은 검은 연기와 함께 닫힌다",
  ],
  [
    "e_bad_mold_curse",
    "bad",
    "배드 엔딩: 곰팡이 저주",
    "거짓 예언을 삼킨 빵은 안쪽부터 푸르게 무너진다",
  ],
  ["e_bad_sliced", "bad", "배드 엔딩: 얇게 썰림", "빵칼 협곡은 용기와 무모함을 같은 두께로 자른다"],
  [
    "e_neutral_market_truce",
    "neutral",
    "중립 엔딩: 시장의 휴전",
    "누구도 이기지 않았지만, 오늘 팔 빵은 남았다",
  ],
  [
    "e_neutral_wheat_exile",
    "neutral",
    "중립 엔딩: 밀밭 유배",
    "돌아갈 길은 멀어지고 밀 이삭만이 대답한다",
  ],
  [
    "e_joke_butter_idol",
    "joke",
    "농담 엔딩: 버터 우상",
    "찬란한 버터 앞에서 모두가 잠시 너무 진지해진다",
  ],
  [
    "e_joke_infinite_toaster",
    "joke",
    "농담 엔딩: 무한 토스터",
    "레버는 내려가고, 운명은 또 튀어 오른다",
  ],
  [
    "e_secret_sourdough_oracle",
    "secret",
    "비밀 엔딩: 사워도우 예언자",
    "오래 발효된 목소리가 책 바깥의 독자까지 부른다",
  ],
  [
    "e_secret_crumb_void",
    "secret",
    "비밀 엔딩: 빵가루 공허",
    "모든 길이 사라진 자리에는 작은 부스러기 별자리만 남는다",
  ],
  [
    "e_true_baguette_hero",
    "true",
    "트루 엔딩: 바게트 용사",
    "용사는 빵을 휘둘러 적을 베는 대신 굶주림을 베어 낸다",
  ],
] as const satisfies readonly (readonly [string, EndingTone, string, string])[]

export type EndingId = (typeof endingSpecs)[number][0]

export const endingMilestones: Readonly<Record<number, EndingId>> = {
  3: "e_bad_toasted",
  12: "e_bad_toasted",
  31: "e_secret_crumb_void",
  60: "e_bad_sliced",
  76: "e_bad_mold_curse",
  96: "e_bad_toasted",
  122: "e_neutral_market_truce",
  128: "e_joke_butter_idol",
  134: "e_secret_sourdough_oracle",
  140: "e_neutral_wheat_exile",
  146: "e_joke_infinite_toaster",
  150: "e_good_bakery_dawn",
  154: "e_good_crust_crown",
  158: "e_true_baguette_hero",
}
