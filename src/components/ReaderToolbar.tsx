import { ArrowLeft, FolderOpen, Home, RotateCcw, Save, ZoomIn, ZoomOut } from "lucide-react"

type ReaderToolbarProps = {
  readonly canGoBack: boolean
  readonly stats: {
    readonly courage: number
    readonly crumbs: number
    readonly doubt: number
  }
  readonly onBack: () => void
  readonly onRestart: () => void
  readonly onSave: () => void
  readonly onLoad: () => void
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onResetZoom: () => void
}

export function ReaderToolbar({
  canGoBack,
  stats,
  onBack,
  onRestart,
  onSave,
  onLoad,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ReaderToolbarProps) {
  return (
    <section className="reader-toolbar" aria-label="독서 도구">
      <button
        type="button"
        className="icon-button"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="뒤로"
      >
        <ArrowLeft aria-hidden="true" />
        <span>뒤로</span>
      </button>
      <button type="button" className="icon-button" onClick={onRestart} aria-label="처음">
        <Home aria-hidden="true" />
        <span>처음</span>
      </button>
      <button type="button" className="icon-button" onClick={onSave} aria-label="저장">
        <Save aria-hidden="true" />
        <span>저장</span>
      </button>
      <button type="button" className="icon-button" onClick={onLoad} aria-label="불러오기">
        <FolderOpen aria-hidden="true" />
        <span>불러오기</span>
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="icon-button" onClick={onZoomOut} aria-label="축소">
        <ZoomOut aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={onResetZoom} aria-label="원본">
        <RotateCcw aria-hidden="true" />
        <span>원본</span>
      </button>
      <button type="button" className="icon-button" onClick={onZoomIn} aria-label="확대">
        <ZoomIn aria-hidden="true" />
      </button>
      <p className="reader-stats" data-testid="reader-stats">
        용기 {stats.courage} · 빵가루 {stats.crumbs} · 의심 {stats.doubt}
      </p>
    </section>
  )
}
