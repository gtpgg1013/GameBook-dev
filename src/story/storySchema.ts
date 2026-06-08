export type StoryRoute = "front" | "clue" | "heart"

export const storyRoutes = ["front", "clue", "heart"] as const

export type RouteCopy = {
  readonly labels: readonly string[]
  readonly leads: readonly string[]
  readonly pressures: readonly string[]
  readonly rewards: readonly string[]
  readonly keywords: readonly string[]
  readonly item: string
}

export type Chapter = {
  readonly arc: string
  readonly location: string
  readonly goal: string
  readonly ally: string
  readonly threat: string
  readonly clue: string
  readonly bridge: string
  readonly routes: Record<StoryRoute, RouteCopy>
}

export type ArrivalScene = {
  readonly route: StoryRoute
  readonly action: string
  readonly keyword: string
  readonly lead: string
  readonly pressure: string
  readonly reward: string
  readonly item: string
}
