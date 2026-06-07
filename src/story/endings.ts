import { type EndingId, endingSpecs, STORY_PAGE_COUNT } from "./constants"
import { assetId } from "./ids"
import type { EndingPage } from "./types"

export function makeEndings(): readonly EndingPage[] {
  return endingSpecs.map(([id, kind, title, flavor], index) => ({
    kind,
    id,
    number: endingPageNumber(id),
    title,
    body: `${flavor}.

방금 전 선택이 문이었다는 걸 이제야 안다. 바게트는 마지막으로 한 번 울리고, 책장은 조용히 멈춘다.

다시 시작하면 다른 사람을 돕고, 다른 길을 고르고, 전혀 다른 결말에 닿을 수 있다.`,
    assetId: assetId(STORY_PAGE_COUNT + index + 1),
    accentAssetIds: [],
    choices: [
      {
        id: `c_${id}_restart`,
        label: "처음부터 다시 선택한다",
        targetId: "p_0001",
        tone: "cautious",
        effects: [],
        consequence: {
          action: "처음부터 다시 선택한다",
          result:
            "책을 덮지 않고 첫 장으로 돌아가자, 바게트 검에는 지나온 결말의 온기가 희미하게 남는다. 같은 세계라도 다른 행동을 고르면 완전히 다른 결과가 열린다.",
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
