import { BookOpen } from "lucide-react"
import { useMemo, useState } from "react"
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
        <p className="series-kicker">낡은 선택형 모험서</p>
        <h1>바게트 용사 게임북</h1>
        <p className="page-tone">{endingToneLabel(page.kind)}</p>
        <h2>{page.title}</h2>
        <FocusLine page={page} />
        {lastDecision !== undefined ? <DecisionRecap decision={lastDecision} /> : null}
        <p className="story-body">{page.body}</p>
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
  if (page.kind !== "story") {
    return <p className="focus-line">결말에 도착했다. 다시 시작하면 다른 선택이 열린다.</p>
  }
  return <p className="focus-line">{page.narrativeFunction}</p>
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
  if (page.kind === "story") {
    lines.push(page.narrativeFunction)
  } else {
    lines.push("결말에 도착했다. 다시 시작하면 다른 선택이 열린다.")
  }
  if (lastDecision !== undefined) {
    lines.push(`방금 선택: ${lastDecision.action}`)
    lines.push(lastDecision.result)
  }
  lines.push(...splitReadableBeats(page.body))

  return groupSceneLines(lines, page.title)
}

function groupSceneLines(lines: readonly string[], fallback: string): SceneBeats {
  const readableLines = lines.map((line) => line.trim()).filter((line) => line.length > 0)
  const groupCount = Math.min(
    MAX_MOBILE_SCENE_BEATS,
    Math.max(1, Math.floor(readableLines.length / 2)),
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
    .split(/(?<=[.!?。？！.])\s+/u)
    .map((beat) => beat.trim())
    .filter((beat) => beat.length > 0)
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
    <nav className="choice-panel" aria-label="선택지" data-turn-count={turnCount}>
      {choices.map((choice) => (
        <button
          type="button"
          className={`choice-button tone-${choice.tone}`}
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
    <section className="decision-recap" aria-label="방금 선택한 행동">
      <p>
        선택: <strong data-testid="last-decision">{decision.action}</strong>
      </p>
      <p data-testid="last-consequence">{decision.result}</p>
    </section>
  )
}

function endingToneLabel(kind: GamePage["kind"]): string {
  switch (kind) {
    case "story":
      return "진행 중"
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
