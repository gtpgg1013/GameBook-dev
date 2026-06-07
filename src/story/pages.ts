import { choicesFor } from "./choices"
import { STORY_PAGE_COUNT } from "./constants"
import { makeEndings } from "./endings"
import { accentAssetIds, assetId, pageId } from "./ids"
import { narrativeFunction, storyBody, storyTitle } from "./storyWorld"
import { ENDING_MINIMUM, type GamePage, PAGE_MINIMUM } from "./types"

export { ENDING_MINIMUM, PAGE_MINIMUM, STORY_PAGE_COUNT }

const storyOnlyPages: readonly GamePage[] = Array.from({ length: STORY_PAGE_COUNT }, (_, index) => {
  const number = index + 1
  return {
    kind: "story",
    id: pageId(number),
    number,
    title: storyTitle(number),
    body: storyBody(number),
    narrativeFunction: narrativeFunction(number),
    assetId: assetId(number),
    accentAssetIds: accentAssetIds(number),
    choices: choicesFor(number),
  } satisfies GamePage
})

export const storyPages: readonly GamePage[] = [...storyOnlyPages, ...makeEndings()]

export const deterministicRoutes = {
  good: [
    "p_0001",
    "p_0002",
    "p_0003",
    "p_0004",
    "p_0005",
    "p_0006",
    "p_0154",
    "e_good_crust_crown",
  ],
  bad: ["p_0001", "p_0002", "p_0003", "e_bad_toasted"],
} as const
