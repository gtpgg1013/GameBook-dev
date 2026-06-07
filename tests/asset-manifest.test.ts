import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { assetById, assetPublicPath, generatedAssets } from "../src/assets/manifest"
import { storyPages } from "../src/story/pages"

describe("imagegen asset manifest", () => {
  it("tracks more than 200 raster assets derived from imagegen atlas sources", () => {
    expect(generatedAssets.length, "generated raster asset count").toBeGreaterThan(200)
    const sourceIds = new Set(generatedAssets.map((asset) => asset.imagegenSourceId))
    expect(sourceIds.size, "imagegen source count").toBeGreaterThanOrEqual(20)
  })

  it("does not use SVG production placeholders", () => {
    const nonRaster = generatedAssets.filter(
      (asset) => !asset.path.match(/\.(png|webp|jpg|jpeg)$/u),
    )
    expect(nonRaster, "non-raster assets").toHaveLength(0)
    const svgAssets = generatedAssets.filter((asset) => asset.path.endsWith(".svg"))
    expect(svgAssets, "svg assets").toHaveLength(0)
  })

  it("points every manifest row at an existing workspace file and source image", () => {
    const missingAssets = generatedAssets.filter(
      (asset) => !existsSync(path.join(process.cwd(), "public", asset.path)),
    )
    const missingSources = generatedAssets.filter(
      (asset) => !existsSync(path.join(process.cwd(), asset.sourceImage)),
    )
    expect(missingAssets, "missing generated raster files").toHaveLength(0)
    expect(missingSources, "missing imagegen source files").toHaveLength(0)
  })

  it("resolves render URLs under a configured deployment base path", () => {
    const firstAsset = generatedAssets.at(0)
    if (firstAsset === undefined) {
      throw new Error("Expected at least one generated asset")
    }

    expect(assetPublicPath(firstAsset, "/gamebook/")).toBe(
      "/gamebook/assets/generated/asset_001.png",
    )
    expect(assetPublicPath(firstAsset, "./")).toBe("./assets/generated/asset_001.png")
  })

  it("fails loudly when render code asks for an unknown generated asset", () => {
    expect(() => assetById("asset_999")).toThrow(/Unknown generated asset id: asset_999/u)
  })

  it("keeps every generated asset hash unique", () => {
    const seenHashes = new Set<string>()
    const duplicateHashes = generatedAssets.filter((asset) => {
      if (seenHashes.has(asset.sha256)) {
        return true
      }
      seenHashes.add(asset.sha256)
      return false
    })

    expect(duplicateHashes, "duplicate generated PNG hashes").toHaveLength(0)
  })

  it("keeps page backgrounds high resolution and all smaller slices inspectable", () => {
    const undersizedBackgrounds = generatedAssets.filter(
      (asset) => asset.category === "background" && (asset.width < 1024 || asset.height < 1024),
    )
    const undersizedSlices = generatedAssets.filter(
      (asset) => asset.category !== "background" && (asset.width < 640 || asset.height < 640),
    )
    expect(undersizedBackgrounds, "undersized background assets").toHaveLength(0)
    expect(undersizedSlices, "generated slices under 640px").toHaveLength(0)
  })

  it("keeps usedBy metadata aligned with the actual story graph", () => {
    const actualUsage = new Map<string, readonly string[]>()
    for (const page of storyPages) {
      for (const assetId of [page.assetId, ...page.accentAssetIds]) {
        const ids = actualUsage.get(assetId) ?? []
        actualUsage.set(assetId, [...ids, page.id])
      }
    }
    const mismatchedUsage = generatedAssets.filter((asset) => {
      const actual = actualUsage.get(asset.id) ?? []
      return asset.usedBy.join("|") !== actual.join("|")
    })

    expect(mismatchedUsage, "assets with stale usedBy metadata").toHaveLength(0)
  })

  it("uses every generated asset at most once across page art slots", () => {
    const usageCounts = new Map<string, number>()
    for (const page of storyPages) {
      for (const assetId of [page.assetId, ...page.accentAssetIds]) {
        usageCounts.set(assetId, (usageCounts.get(assetId) ?? 0) + 1)
      }
    }

    const repeatedAssets = [...usageCounts.entries()].filter(([, count]) => count > 1)

    expect(usageCounts.size, "used generated asset count").toBe(generatedAssets.length)
    expect(repeatedAssets, "assets reused by more than one page").toHaveLength(0)
  })
})
