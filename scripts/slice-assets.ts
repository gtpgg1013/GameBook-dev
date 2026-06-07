import { createHash } from "node:crypto"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { endingSpecs } from "../src/story/constants"
import { assetOwnerIds } from "../src/story/ids"

const contactSheet = "public/assets/imagegen-sources/baguette-contact-branching-rewrite.png"
const sourceDir = "public/assets/imagegen-sources"
const outputDir = "public/assets/generated"
const manifestPath = "src/assets/generated-assets.json"
const sourceColumns = 5
const sourceRows = 4
const sourceCount = sourceColumns * sourceRows
const smallAssetsPerSource = 11
const sourcePixelSize = 1024
const cropSizes = [544, 448, 512, 384, 608, 416, 480, 352, 560, 400, 624] as const

type GeneratedAsset = {
  readonly id: string
  readonly path: string
  readonly category: string
  readonly usageTags: readonly string[]
  readonly imagegenSourceId: string
  readonly sourcePrompt: string
  readonly sourceImage: string
  readonly atlasRect: {
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
  }
  readonly generator: "image_gen"
  readonly createdAt: string
  readonly width: number
  readonly height: number
  readonly sha256: string
  readonly derivedBy: "sharp-contact-sheet-slice"
  readonly usedBy: readonly string[]
}

const categories = ["background", "character", "item", "hazard", "ending", "ui-texture"] as const
type AssetCategory = (typeof categories)[number]

async function main(): Promise<void> {
  await mkdir(sourceDir, { recursive: true })
  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })
  const contact = sharp(contactSheet)
  const metadata = await contact.metadata()
  const sheetWidth = metadata.width ?? 0
  const sheetHeight = metadata.height ?? 0
  const sourceWidth = Math.floor(sheetWidth / sourceColumns)
  const sourceHeight = Math.floor(sheetHeight / sourceRows)
  const sourceImages = await makeSourceImages(sourceWidth, sourceHeight)
  const assets: GeneratedAsset[] = []

  for (let index = 0; index < sourceImages.length; index += 1) {
    const source = sourceImages[index]
    if (source === undefined) {
      continue
    }
    assets.push(await makeAsset(index + 1, "background", source.path, 1024, 1024, index, -1))
    for (let variant = 0; variant < smallAssetsPerSource; variant += 1) {
      const assetNumber = sourceCount + index * smallAssetsPerSource + variant + 1
      const category = categories[(variant % (categories.length - 1)) + 1] ?? "ui-texture"
      assets.push(await makeAsset(assetNumber, category, source.path, 640, 640, index, variant))
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(assets, null, 2)}\n`)
}

type SourceImage = {
  readonly path: string
  readonly rect: GeneratedAsset["atlasRect"]
}

async function makeSourceImages(
  sourceWidth: number,
  sourceHeight: number,
): Promise<readonly SourceImage[]> {
  const sources: SourceImage[] = []
  for (let index = 0; index < sourceCount; index += 1) {
    const column = index % sourceColumns
    const row = Math.floor(index / sourceColumns)
    const rect = {
      x: column * sourceWidth,
      y: row * sourceHeight,
      width: sourceWidth,
      height: sourceHeight,
    }
    const sourcePath = `${sourceDir}/baguette-source-${String(index + 1).padStart(2, "0")}.png`
    await sharp(contactSheet)
      .extract({ left: rect.x, top: rect.y, width: rect.width, height: rect.height })
      .resize(sourcePixelSize, sourcePixelSize, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(sourcePath)
    sources.push({ path: sourcePath, rect })
  }
  return sources
}

async function makeAsset(
  number: number,
  category: AssetCategory,
  sourceImage: string,
  width: number,
  height: number,
  sourceIndex: number,
  variantIndex: number,
): Promise<GeneratedAsset> {
  const id = `asset_${String(number).padStart(3, "0")}`
  const filename = `${id}.png`
  const outPath = path.join(outputDir, filename)

  const crop = makeCrop(sourceIndex, variantIndex)
  const image = sharp(sourceImage)
  const cropped =
    variantIndex < 0
      ? image
      : image.extract({ left: crop.x, top: crop.y, width: crop.width, height: crop.height })

  await cropped
    .rotate(crop.rotation, { background: "#f1dba8" })
    .resize(width, height, { fit: "cover" })
    .modulate({
      brightness: categoryBrightness(category, sourceIndex, variantIndex),
      saturation: 0.92 + ((sourceIndex + Math.max(variantIndex, 0)) % 5) * 0.035,
      hue: ((sourceIndex * 17 + Math.max(variantIndex, 0) * 23) % 24) - 12,
    })
    .sharpen({ sigma: 0.55 + (number % 3) * 0.12 })
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  const bytes = await readFile(outPath)
  return {
    id,
    path: `/assets/generated/${filename}`,
    category,
    usageTags: usageTagsFor(number, category),
    imagegenSourceId: path.basename(sourceImage, ".png"),
    sourcePrompt:
      "5x4 imagegen contact sheet for a branching Korean baguette-hero gamebook with readable route scenes, rebuilt as larger non-reused page and clue assets",
    sourceImage,
    atlasRect: {
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
    },
    generator: "image_gen",
    createdAt: "2026-06-07T00:50:00+09:00",
    width,
    height,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    derivedBy: "sharp-contact-sheet-slice",
    usedBy: usedByFor(number),
  }
}

function usageTagsFor(number: number, category: AssetCategory): readonly string[] {
  const usedBy = usedByFor(number)
  const owner = usedBy.at(0)
  if (owner === undefined) {
    return [category, "baguette-hero", "spare-asset"]
  }
  return [owner, category, "baguette-hero"]
}

function usedByFor(number: number): readonly string[] {
  return assetOwnerIds(number).flatMap((owner) => {
    const endingIndex = endingOwnerIndex(owner)
    if (endingIndex === undefined) {
      return [owner]
    }
    return endingSpecs[endingIndex]?.[0] ?? []
  })
}

function endingOwnerIndex(owner: string): number | undefined {
  if (!owner.startsWith("ending:")) {
    return undefined
  }
  const value = Number(owner.slice("ending:".length))
  return Number.isInteger(value) ? value : undefined
}

function makeCrop(
  sourceIndex: number,
  variantIndex: number,
): GeneratedAsset["atlasRect"] & {
  readonly rotation: number
} {
  if (variantIndex < 0) {
    return {
      x: 0,
      y: 0,
      width: sourcePixelSize,
      height: sourcePixelSize,
      rotation: ((sourceIndex % 5) - 2) * 0.22,
    }
  }

  const cropSize = cropSizes[variantIndex] ?? 448
  const maxOffset = sourcePixelSize - cropSize
  const x = (sourceIndex * 137 + variantIndex * 181 + variantIndex * variantIndex * 19) % maxOffset
  const y = (sourceIndex * 211 + variantIndex * 149 + sourceIndex * variantIndex * 23) % maxOffset
  return {
    x,
    y,
    width: cropSize,
    height: cropSize,
    rotation: ((sourceIndex * 3 + variantIndex * 5) % 9) - 4,
  }
}

function categoryBrightness(
  category: AssetCategory,
  sourceIndex: number,
  variantIndex: number,
): number {
  const variation = ((sourceIndex + Math.max(variantIndex, 0)) % 4) * 0.025
  switch (category) {
    case "background":
      return 0.98 + variation
    case "character":
      return 1.02 + variation
    case "item":
      return 1.04 + variation
    case "hazard":
      return 0.82 + variation
    case "ending":
      return 0.95 + variation
    case "ui-texture":
      return 0.9 + variation
    default:
      return assertNever(category)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected asset category: ${String(value)}`)
}

await main()
