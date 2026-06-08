import { type EndingId, endingSpecs, STORY_PAGE_COUNT } from "./constants"
import { assetId } from "./ids"
import type { EndingPage } from "./types"

export function makeEndings(): readonly EndingPage[] {
  return endingSpecs.map(([id, kind, title, flavor], index) => ({
    kind,
    id,
    number: endingPageNumber(id),
    title,
    body: `${flavor}

방금 고른 행동이 문이었다.
(툭...) 바게트가 마지막으로 한 번 울리고, 책장은 멈춘다.

다시 펼치면 된다.
이번엔 다른 사람을 돕고, 다른 길을 고르면 전혀 다른 끝으로 간다.`,
    assetId: assetId(STORY_PAGE_COUNT + index + 1),
    accentAssetIds: [],
    choices: [
      {
        id: `c_${id}_restart`,
        label: "책을 처음부터 다시 펼친다",
        targetId: "p_0001",
        tone: "cautious",
        effects: [],
        consequence: {
          action: "책을 처음부터 다시 펼친다",
          result:
            "(사락...) 처음 펼친 자리로 돌아간다. 바게트 검에는 지나온 끝의 온기가 희미하게 남는다. 같은 세계라도 행동을 바꾸면 끝도 바뀐다.",
        },
      },
    ],
  }))
}

export function endingPageNumber(id: EndingId): number {
  const index = endingSpecs.findIndex(([endingId]) => endingId === id)
  if (index < 0) {
    throw new Error(`Unknown ending id: ${id}`)
  }
  return STORY_PAGE_COUNT + index + 1
}
