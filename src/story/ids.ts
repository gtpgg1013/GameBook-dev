import { STORY_PAGE_COUNT } from "./constants"

const SOURCE_COUNT = 20
const VARIANTS_PER_SOURCE = 11
const STORY_PAGES_PER_SOURCE = 8
const FIRST_VARIANT_ASSET_NUMBER = SOURCE_COUNT + 1
const STORY_VARIANT_ORDER = [0, 1, 2, 4, 5, 6, 7] as const
const ENDING_VARIANT_INDEX = 3
const ACCENT_VARIANT_ORDER = [8, 9, 10] as const
const ACCENT_PAGE_COUNT = 68

export function pageId(number: number): string {
  return `p_${String(number).padStart(4, "0")}`
}

export function assetId(number: number): string {
  return `asset_${String(assetNumber(number)).padStart(3, "0")}`
}

export function accentAssetIds(pageNumber: number): readonly string[] {
  if (pageNumber < 1 || pageNumber > ACCENT_PAGE_COUNT) {
    return []
  }
  return [`asset_${String(accentAssetNumber(pageNumber)).padStart(3, "0")}`]
}

export function pageNumberLabel(pageIdValue: string): string {
  return `${Number(pageIdValue.slice(2))}쪽`
}

export function assetOwnerIds(assetNumberValue: number): readonly string[] {
  const storyPage = ownerStoryPageNumber(assetNumberValue)
  if (storyPage !== undefined) {
    return [pageId(storyPage)]
  }

  const accentPage = ownerAccentPageNumber(assetNumberValue)
  if (accentPage !== undefined) {
    return [pageId(accentPage)]
  }

  const endingIndex = ownerEndingIndex(assetNumberValue)
  if (endingIndex !== undefined) {
    return [`ending:${endingIndex}`]
  }

  return []
}

function assetNumber(number: number): number {
  if (number <= STORY_PAGE_COUNT) {
    return storyAssetNumber(number)
  }
  return endingAssetNumber(number - STORY_PAGE_COUNT - 1)
}

function storyAssetNumber(pageNumberValue: number): number {
  const sourceIndex = Math.floor((pageNumberValue - 1) / STORY_PAGES_PER_SOURCE)
  const slot = (pageNumberValue - 1) % STORY_PAGES_PER_SOURCE
  if (slot === 0) {
    return sourceIndex + 1
  }
  const variantIndex = STORY_VARIANT_ORDER[slot - 1]
  if (variantIndex === undefined) {
    throw new Error(`Unknown story asset slot: ${slot}`)
  }
  return variantAssetNumber(sourceIndex, variantIndex)
}

function endingAssetNumber(endingIndex: number): number {
  return variantAssetNumber(endingIndex % SOURCE_COUNT, ENDING_VARIANT_INDEX)
}

function accentAssetNumber(pageNumberValue: number): number {
  const accentIndex = pageNumberValue - 1
  const sourceIndex = accentIndex % SOURCE_COUNT
  const variantIndex = ACCENT_VARIANT_ORDER[Math.floor(accentIndex / SOURCE_COUNT)]
  if (variantIndex === undefined) {
    return endingAssetNumber(12 + accentIndex - SOURCE_COUNT * ACCENT_VARIANT_ORDER.length)
  }
  return variantAssetNumber(sourceIndex, variantIndex)
}

function variantAssetNumber(sourceIndex: number, variantIndex: number): number {
  return FIRST_VARIANT_ASSET_NUMBER + sourceIndex * VARIANTS_PER_SOURCE + variantIndex
}

function ownerStoryPageNumber(assetNumberValue: number): number | undefined {
  for (let pageNumberValue = 1; pageNumberValue <= STORY_PAGE_COUNT; pageNumberValue += 1) {
    if (storyAssetNumber(pageNumberValue) === assetNumberValue) {
      return pageNumberValue
    }
  }
  return undefined
}

function ownerAccentPageNumber(assetNumberValue: number): number | undefined {
  for (let pageNumberValue = 1; pageNumberValue <= ACCENT_PAGE_COUNT; pageNumberValue += 1) {
    if (accentAssetNumber(pageNumberValue) === assetNumberValue) {
      return pageNumberValue
    }
  }
  return undefined
}

function ownerEndingIndex(assetNumberValue: number): number | undefined {
  for (let endingIndex = 0; endingIndex < 12; endingIndex += 1) {
    if (endingAssetNumber(endingIndex) === assetNumberValue) {
      return endingIndex
    }
  }
  return undefined
}
