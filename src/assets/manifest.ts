import { z } from "zod"
import rawAssets from "./generated-assets.json"

export const assetSchema = z.object({
  id: z.string().regex(/^asset_\d{3}$/u),
  path: z.string().regex(/^\/assets\/generated\/.+\.(png|webp|jpg|jpeg)$/u),
  category: z.string().min(1),
  usageTags: z.array(z.string().min(1)).readonly(),
  imagegenSourceId: z.string().min(1),
  sourcePrompt: z.string().min(1),
  sourceImage: z.string().min(1),
  atlasRect: z.object({
    x: z.number().int().nonnegative(),
    y: z.number().int().nonnegative(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  generator: z.literal("image_gen"),
  createdAt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sha256: z.string().length(64),
  derivedBy: z.literal("sharp-contact-sheet-slice"),
  usedBy: z.array(z.string().min(1)).readonly(),
})

export type GeneratedAsset = z.infer<typeof assetSchema>

export const generatedAssets: readonly GeneratedAsset[] = z.array(assetSchema).parse(rawAssets)

export function assetById(id: string): GeneratedAsset {
  const asset = generatedAssets.find((candidate) => candidate.id === id)
  if (asset === undefined) {
    throw new Error(`Unknown generated asset id: ${id}`)
  }
  return asset
}

export function assetPublicPath(asset: GeneratedAsset, base: string = "./"): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`
  const relativePath = asset.path.replace(/^\/+/u, "")
  return `${normalizedBase}${relativePath}`
}
