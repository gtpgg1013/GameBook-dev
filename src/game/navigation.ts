import { storyPages } from "../story/pages"
import type { GamePage } from "../story/types"

const pageById = new Map(storyPages.map((page) => [page.id, page]))

export class PageNotFoundError extends Error {
  constructor(readonly pageId: string) {
    super(`Unknown gamebook page: ${pageId}`)
    this.name = "PageNotFoundError"
  }
}

export function getPageById(pageId: string): GamePage {
  const page = pageById.get(pageId)
  if (page === undefined) {
    throw new PageNotFoundError(pageId)
  }
  return page
}

export function getInitialPageId(search: string): string {
  const route = new URLSearchParams(search).get("route")
  switch (route) {
    case "good":
      return "e_good_crust_crown"
    case "bad":
      return "e_bad_toasted"
    case null:
      return "p_0001"
    default:
      return "p_0001"
  }
}
