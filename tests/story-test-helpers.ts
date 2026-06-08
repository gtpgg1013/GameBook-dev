import { storyPages } from "../src/story/pages"
import { arrivalForPage, chapterFor } from "../src/story/storyWorld"
import type { Choice, GamePage } from "../src/story/types"

type StoryPage = Extract<GamePage, { readonly kind: "story" }>

export function storyPageById(id: string): StoryPage {
  const page = storyPages.find((candidate) => candidate.id === id)
  if (page?.kind !== "story") {
    throw new Error(`Expected ${id} to be a story page`)
  }
  return page
}

export function choiceByLabel(page: StoryPage, label: string): Choice {
  const choice = page.choices.find((candidate) => candidate.label === label)
  if (choice === undefined) {
    throw new Error(`Expected ${page.id} to include choice ${label}`)
  }
  return choice
}

export function choiceForRouteStep(currentId: string, nextId: string): Choice {
  const page = storyPageById(currentId)
  const choice = page.choices.find((candidate) => candidate.targetId === nextId)
  if (choice === undefined) {
    throw new Error(`Expected route step ${currentId} -> ${nextId}`)
  }
  return choice
}

export function sourceSceneFragments(pageNumber: number): readonly string[] {
  const chapter = chapterFor(pageNumber)
  const arrival = arrivalForPage(pageNumber)
  return [
    ...meaningfulWords(chapter.arc),
    ...meaningfulWords(chapter.location),
    ...meaningfulWords(chapter.ally),
    ...meaningfulWords(chapter.threat),
    ...meaningfulWords(chapter.clue),
    ...meaningfulWords(chapter.bridge),
    ...meaningfulWords(arrival.keyword),
  ]
}

function meaningfulWords(text: string): readonly string[] {
  return text
    .split(/[\s,]+/u)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2)
}
