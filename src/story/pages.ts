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
    "p_0004",
    "p_0005",
    "p_0028",
    "p_0030",
    "p_0033",
    "p_0036",
    "p_0039",
    "p_0042",
    "p_0045",
    "p_0048",
    "p_0051",
    "p_0054",
    "p_0057",
    "p_0060",
    "p_0062",
    "p_0065",
    "p_0068",
    "p_0071",
    "p_0074",
    "p_0077",
    "p_0079",
    "p_0082",
    "p_0085",
    "p_0088",
    "p_0091",
    "p_0094",
    "p_0097",
    "p_0100",
    "p_0103",
    "p_0106",
    "p_0109",
    "p_0112",
    "p_0115",
    "p_0118",
    "p_0121",
    "p_0124",
    "p_0127",
    "p_0130",
    "p_0133",
    "p_0136",
    "p_0139",
    "p_0142",
    "p_0145",
    "p_0148",
    "p_0151",
    "p_0154",
    "e_good_crust_crown",
  ],
  bad: ["p_0001", "p_0002", "p_0003", "e_bad_toasted"],
} as const
