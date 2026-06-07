import type { GamePage } from "./types"

export type ReachabilityReport = {
  readonly invalidChoiceTargets: readonly string[]
  readonly unreachableEndingIds: readonly string[]
  readonly reachablePageCount: number
}

export function getReachabilityReport(pages: readonly GamePage[]): ReachabilityReport {
  const pageById = new Map(pages.map((page) => [page.id, page]))
  const invalidChoiceTargets = pages.flatMap((page) =>
    page.choices
      .filter((choice) => !pageById.has(choice.targetId))
      .map((choice) => `${page.id}:${choice.targetId}`),
  )
  const reachableIds = collectReachableIds(pageById, "p_0001")
  const unreachableEndingIds = pages
    .filter((page) => page.kind !== "story" && !reachableIds.has(page.id))
    .map((page) => page.id)
  return {
    invalidChoiceTargets,
    unreachableEndingIds,
    reachablePageCount: reachableIds.size,
  }
}

function collectReachableIds(
  pageById: ReadonlyMap<string, GamePage>,
  startId: string,
): ReadonlySet<string> {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const id = stack.pop()
    if (id === undefined || visited.has(id)) {
      continue
    }
    const page = pageById.get(id)
    if (page === undefined) {
      continue
    }
    visited.add(id)
    for (const choice of page.choices) {
      stack.push(choice.targetId)
    }
  }
  return visited
}
