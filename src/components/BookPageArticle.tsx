import { BookOpen } from "lucide-react"
import { useMemo, useState } from "react"
import { GAMEBOOK_TITLE } from "../story/bookMeta"
import type { Choice, ChoiceConsequence, GamePage } from "../story/types"

type BookPageArticleProps = {
  readonly page: GamePage
  readonly assetPath: string
  readonly accentAssetPaths: readonly string[]
  readonly lastDecision: ChoiceConsequence | undefined
  readonly onChoose: (choice: Choice) => void
  readonly turnCount: number
}

type SceneBeats = readonly [string, ...string[]]
const MAX_MOBILE_SCENE_BEATS = 3

export function BookPageArticle({
  page,
  assetPath,
  accentAssetPaths,
  lastDecision,
  onChoose,
  turnCount,
}: BookPageArticleProps) {
  return (
    <article className={`book-page tone-${page.kind}`}>
      <div className="page-gutter" aria-hidden="true" />
      <div className="page-hero">
        <img src={assetPath} alt="" className="page-asset" />
        {accentAssetPaths.length > 0 ? <AccentStrip assetPaths={accentAssetPaths} /> : null}
        <div className="page-marker">
          <BookOpen aria-hidden="true" />
          <span data-testid="page-number">{page.number}쪽</span>
        </div>
      </div>
      <div className="page-copy">
        <h1>{GAMEBOOK_TITLE}</h1>
        {page.kind === "story" ? null : <p className="page-tone">{endingToneLabel(page.kind)}</p>}
        {page.kind === "story" ? null : <h2>{page.title}</h2>}
        <FocusLine page={page} />
        {lastDecision !== undefined ? <DecisionRecap decision={lastDecision} /> : null}
        <StoryBody body={page.body} />
        <MobileSceneFlow page={page} lastDecision={lastDecision} />
      </div>
      <ChoicePanel choices={page.choices} onChoose={onChoose} turnCount={turnCount} />
    </article>
  )
}

function AccentStrip({ assetPaths }: { readonly assetPaths: readonly string[] }) {
  return (
    <div className="accent-strip" aria-hidden="true">
      {assetPaths.map((path) => (
        <img src={path} alt="" key={path} />
      ))}
    </div>
  )
}

function FocusLine({ page }: { readonly page: GamePage }) {
  if (page.kind === "story") {
    return null
  }
  return <p className="focus-line">책장은 닫혔지만, 아직 다른 길의 온기가 남아 있다.</p>
}

function StoryBody({ body }: { readonly body: string }) {
  return (
    <div className="story-body">
      {splitParagraphs(body).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function MobileSceneFlow({
  page,
  lastDecision,
}: {
  readonly page: GamePage
  readonly lastDecision: ChoiceConsequence | undefined
}) {
  const sceneBeats = useMemo(() => buildSceneBeats(page, lastDecision), [page, lastDecision])
  const [sceneIndex, setSceneIndex] = useState(0)
  const activeBeat = sceneBeats[sceneIndex] ?? sceneBeats[0]
  const hasMoreBeats = sceneIndex < sceneBeats.length - 1

  return (
    <section className="mobile-scene-flow" aria-label="짧은 장면 넘기기">
      <div className="mobile-scene-card">
        <p className="mobile-scene-index" data-testid="mobile-scene-index">
          {sceneIndex + 1}/{sceneBeats.length}
        </p>
        <p className="mobile-scene-step" data-testid="mobile-scene-step">
          {activeBeat}
        </p>
      </div>
      <button
        type="button"
        className="mobile-scene-next"
        onClick={() => setSceneIndex((current) => nextSceneIndex(current, sceneBeats.length))}
      >
        {hasMoreBeats ? "다음 내용" : "처음 내용"}
      </button>
    </section>
  )
}

function buildSceneBeats(page: GamePage, lastDecision: ChoiceConsequence | undefined): SceneBeats {
  const lines: string[] = []
  if (page.kind !== "story") {
    lines.push("책장은 닫혔지만, 아직 다른 길의 온기가 남아 있다.")
  }
  if (lastDecision !== undefined) {
    lines.push(`몸은 이미 움직였다. ${lastDecision.action}.`)
    lines.push(lastDecision.result)
  }
  lines.push(...splitReadableBeats(page.body))

  return groupSceneLines(lines, page.title)
}

function groupSceneLines(lines: readonly string[], fallback: string): SceneBeats {
  const readableLines = lines.map((line) => line.trim()).filter((line) => line.length > 0)
  const groupCount = Math.min(
    MAX_MOBILE_SCENE_BEATS,
    Math.max(1, readableLines.length >= MAX_MOBILE_SCENE_BEATS ? MAX_MOBILE_SCENE_BEATS : 1),
  )
  const baseSize = Math.floor(readableLines.length / groupCount)
  const biggerGroupCount = readableLines.length % groupCount
  const groups: string[] = []
  let cursor = 0

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const groupSize = baseSize + (groupIndex < biggerGroupCount ? 1 : 0)
    const nextCursor = cursor + groupSize
    groups.push(readableLines.slice(cursor, nextCursor).join("\n"))
    cursor = nextCursor
  }

  const firstBeat = groups.at(0)
  if (firstBeat === undefined) {
    return [fallback]
  }
  return [firstBeat, ...groups.slice(1)]
}

function splitReadableBeats(body: string): readonly string[] {
  return body
    .split(/\n{2,}|(?<=[.!?。？！.])\s+/u)
    .map((beat) => beat.trim())
    .filter((beat) => beat.length > 0)
}

function splitParagraphs(body: string): readonly string[] {
  return body
    .split(/\n{2,}/u)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

function nextSceneIndex(current: number, length: number): number {
  if (current + 1 >= length) {
    return 0
  }
  return current + 1
}

type ChoicePanelProps = {
  readonly choices: readonly Choice[]
  readonly onChoose: (choice: Choice) => void
  readonly turnCount: number
}

function ChoicePanel({ choices, onChoose, turnCount }: ChoicePanelProps) {
  return (
    <nav className="choice-panel" aria-label="갈림길" data-turn-count={turnCount}>
      {choices.map((choice) => (
        <button
          type="button"
          className={`choice-button tone-${choice.tone}`}
          data-choice-target={choice.targetId}
          key={choice.id}
          onClick={() => onChoose(choice)}
        >
          <span>{choice.label}</span>
        </button>
      ))}
    </nav>
  )
}

function DecisionRecap({ decision }: { readonly decision: ChoiceConsequence }) {
  return (
    <section className="decision-recap" aria-label="방금 몸이 향한 곳">
      <p>
        몸은 이미 움직였다. <strong data-testid="last-decision">{decision.action}</strong>.
      </p>
      <p data-testid="last-consequence">{decision.result}</p>
    </section>
  )
}

type EndingKind = Exclude<GamePage["kind"], "story">

function endingToneLabel(kind: EndingKind): string {
  switch (kind) {
    case "good":
      return "굿 엔딩"
    case "bad":
      return "배드 엔딩"
    case "neutral":
      return "중립 엔딩"
    case "joke":
      return "농담 엔딩"
    case "secret":
      return "비밀 엔딩"
    case "true":
      return "트루 엔딩"
    default:
      return assertNever(kind)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected ending tone: ${String(value)}`)
}
