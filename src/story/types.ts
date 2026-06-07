export const PAGE_MINIMUM = 150
export const ENDING_MINIMUM = 10

export type EndingTone = "good" | "bad" | "neutral" | "joke" | "secret" | "true"

export type ChoiceEffect =
  | { readonly kind: "stat"; readonly stat: "courage" | "crumbs" | "doubt"; readonly delta: number }
  | { readonly kind: "flag"; readonly flag: string; readonly value: boolean }
  | { readonly kind: "item"; readonly item: string }

export type ChoiceConsequence = {
  readonly action: string
  readonly result: string
}

export type Choice = {
  readonly id: string
  readonly label: string
  readonly targetId: string
  readonly tone: "brave" | "cautious" | "foolish" | "secret"
  readonly effects: readonly ChoiceEffect[]
  readonly consequence: ChoiceConsequence
}

export type StoryPage = {
  readonly kind: "story"
  readonly id: string
  readonly number: number
  readonly title: string
  readonly body: string
  readonly narrativeFunction: string
  readonly assetId: string
  readonly accentAssetIds: readonly string[]
  readonly choices: readonly Choice[]
}

export type EndingPage = {
  readonly kind: EndingTone
  readonly id: string
  readonly number: number
  readonly title: string
  readonly body: string
  readonly assetId: string
  readonly accentAssetIds: readonly string[]
  readonly choices: readonly Choice[]
}

export type GamePage = StoryPage | EndingPage
