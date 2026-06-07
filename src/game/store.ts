import { z } from "zod"
import { create } from "zustand"
import type { Choice, ChoiceConsequence, ChoiceEffect } from "../story/types"
import { getInitialPageId, getPageById, PageNotFoundError } from "./navigation"

type ReaderStats = {
  readonly courage: number
  readonly crumbs: number
  readonly doubt: number
}

type ReaderState = {
  readonly currentPageId: string
  readonly history: readonly string[]
  readonly zoom: number
  readonly turnCount: number
  readonly stats: ReaderStats
  readonly flags: Readonly<Record<string, boolean>>
  readonly inventory: readonly string[]
  readonly lastDecision: ChoiceConsequence | undefined
  readonly goToPage: (choice: Choice) => void
  readonly goBack: () => void
  readonly restart: () => void
  readonly saveGame: () => void
  readonly loadGame: () => void
  readonly zoomIn: () => void
  readonly zoomOut: () => void
  readonly resetZoom: () => void
}

const initialStats = { courage: 1, crumbs: 0, doubt: 0 } as const
const saveKey = "baguette-hero-save"

const savedReaderSchema = z.object({
  currentPageId: z.string().min(1),
  history: z.array(z.string()).readonly(),
  lastDecision: z
    .object({
      action: z.string().min(1),
      result: z.string().min(1),
    })
    .optional(),
  stats: z.object({
    courage: z.number().int().nonnegative(),
    crumbs: z.number().int().nonnegative(),
    doubt: z.number().int().nonnegative(),
  }),
  flags: z.record(z.string(), z.boolean()),
  inventory: z.array(z.string()).readonly(),
})

type SavedReader = z.infer<typeof savedReaderSchema>

function clampZoom(value: number): number {
  return Math.min(1.3, Math.max(0.9, Number(value.toFixed(1))))
}

export const useReaderStore = create<ReaderState>((set) => ({
  currentPageId: getInitialPageId(globalThis.location?.search ?? ""),
  history: [],
  zoom: 1,
  turnCount: 0,
  stats: initialStats,
  flags: {},
  inventory: [],
  lastDecision: undefined,
  goToPage: (choice) =>
    set((state) => {
      getPageById(choice.targetId)
      return {
        currentPageId: choice.targetId,
        history: [...state.history, state.currentPageId],
        lastDecision: choice.consequence,
        stats: applyStatEffects(state.stats, choice.effects),
        flags: applyFlagEffects(state.flags, choice.effects),
        inventory: applyItemEffects(state.inventory, choice.effects),
        turnCount: state.turnCount + 1,
      }
    }),
  goBack: () =>
    set((state) => {
      const previous = state.history.at(-1)
      if (previous === undefined) {
        return state
      }
      return {
        currentPageId: previous,
        history: state.history.slice(0, -1),
        lastDecision: undefined,
        turnCount: state.turnCount + 1,
      }
    }),
  restart: () =>
    set({
      currentPageId: "p_0001",
      history: [],
      turnCount: 0,
      zoom: 1,
      stats: initialStats,
      flags: {},
      inventory: [],
      lastDecision: undefined,
    }),
  saveGame: () =>
    set((state) => {
      storage()?.setItem(
        saveKey,
        JSON.stringify({
          currentPageId: state.currentPageId,
          history: state.history,
          lastDecision: state.lastDecision,
          stats: state.stats,
          flags: state.flags,
          inventory: state.inventory,
        }),
      )
      return state
    }),
  loadGame: () =>
    set((state) => {
      const saved = storage()?.getItem(saveKey)
      if (saved === undefined || saved === null) {
        return state
      }
      const parsed = parseSavedReader(saved)
      if (parsed === undefined) {
        return state
      }
      return {
        currentPageId: parsed.currentPageId,
        history: parsed.history,
        lastDecision: parsed.lastDecision,
        stats: parsed.stats,
        flags: parsed.flags,
        inventory: parsed.inventory,
        turnCount: state.turnCount + 1,
      }
    }),
  zoomIn: () => set((state) => ({ zoom: clampZoom(state.zoom + 0.1) })),
  zoomOut: () => set((state) => ({ zoom: clampZoom(state.zoom - 0.1) })),
  resetZoom: () => set({ zoom: 1 }),
}))

function applyStatEffects(stats: ReaderStats, effects: readonly ChoiceEffect[]): ReaderStats {
  const nextStats = { ...stats }
  for (const effect of effects) {
    if (effect.kind === "stat") {
      nextStats[effect.stat] = Math.max(0, nextStats[effect.stat] + effect.delta)
    }
  }
  return nextStats
}

function applyFlagEffects(
  flags: Readonly<Record<string, boolean>>,
  effects: readonly ChoiceEffect[],
): Readonly<Record<string, boolean>> {
  const nextFlags = { ...flags }
  for (const effect of effects) {
    if (effect.kind === "flag") {
      nextFlags[effect.flag] = effect.value
    }
  }
  return nextFlags
}

function applyItemEffects(
  inventory: readonly string[],
  effects: readonly ChoiceEffect[],
): readonly string[] {
  const nextInventory = [...inventory]
  for (const effect of effects) {
    if (effect.kind === "item" && !nextInventory.includes(effect.item)) {
      nextInventory.push(effect.item)
    }
  }
  return nextInventory
}

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch (error) {
    if (error instanceof Error) {
      return undefined
    }
    throw error
  }
}

function parseSavedReader(saved: string): SavedReader | undefined {
  let json: unknown
  try {
    json = JSON.parse(saved)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return undefined
    }
    throw error
  }

  const parsed = savedReaderSchema.safeParse(json)
  if (!parsed.success || !knownPageId(parsed.data.currentPageId)) {
    return undefined
  }

  return {
    ...parsed.data,
    history: parsed.data.history.filter(knownPageId),
  }
}

function knownPageId(pageId: string): boolean {
  try {
    getPageById(pageId)
    return true
  } catch (error) {
    if (error instanceof PageNotFoundError) {
      return false
    }
    throw error
  }
}
