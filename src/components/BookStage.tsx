import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { type CSSProperties, useEffect, useRef, useState } from "react"
import { assetById, assetPublicPath } from "../assets/manifest"
import {
  type PageFlipEngine,
  useInteractionAudio,
  useNativePageFlipFallback,
  usePanzoomSurface,
} from "../game/interactionEngines"
import { useReaderStore } from "../game/store"
import { GAMEBOOK_TITLE } from "../story/bookMeta"
import type { Choice, GamePage } from "../story/types"
import { BookPageArticle } from "./BookPageArticle"
import type { ReactPageFlipHandle } from "./pageFlipTypes"
import { ReaderToolbar } from "./ReaderToolbar"
import { TactileFlipLayer } from "./TactileFlipLayer"

type BookStageProps = {
  readonly page: GamePage
}

type BookStageStyle = CSSProperties & {
  readonly "--fallback-zoom": number
}

export function BookStage({ page }: BookStageProps) {
  const prefersReducedMotion = useReducedMotion()
  const [reactPageFlipActive, setReactPageFlipActive] = useState(false)
  const flipBookRef = useRef<ReactPageFlipHandle | null>(null)
  const panSurfaceRef = useRef<HTMLDivElement | null>(null)
  const nativeFlipHostRef = useRef<HTMLDivElement | null>(null)
  const reader = useReaderStore()
  const asset = assetById(page.assetId)
  const assetPath = assetPublicPath(asset)
  const accentAssetPaths = page.accentAssetIds.map((id) => assetPublicPath(assetById(id)))
  const panzoomEngine = usePanzoomSurface(panSurfaceRef, reader.zoom)
  const nativePageFlipEngine = useNativePageFlipFallback(
    nativeFlipHostRef,
    !reactPageFlipActive,
    page.id,
  )
  const pageFlipEngine: PageFlipEngine = reactPageFlipActive
    ? "react-pageflip"
    : nativePageFlipEngine
  const { audioEngine, playCue } = useInteractionAudio()

  useEffect(() => {
    setReactPageFlipActive(prefersReducedMotion !== true && supportsReactPageFlip())
  }, [prefersReducedMotion])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        playCue("turn")
        reader.goBack()
        return
      }
      if (event.key === "ArrowRight") {
        const firstChoice = page.choices.at(0)
        if (firstChoice !== undefined) {
          playCue("choice")
          reader.goToPage(firstChoice)
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [page.choices, playCue, reader])

  useEffect(() => {
    if (!reactPageFlipActive || reader.turnCount === 0) {
      return undefined
    }
    const pageFlip = flipBookRef.current?.pageFlip()
    if (pageFlip === undefined) {
      return undefined
    }
    pageFlip.turnToPage(0)
    window.requestAnimationFrame(() => pageFlip.flipNext("top"))
    const timer = window.setTimeout(() => pageFlip.turnToPage(0), 760)
    return () => window.clearTimeout(timer)
  }, [reactPageFlipActive, reader.turnCount])

  const choose = (choice: Choice) => {
    playCue("choice")
    reader.goToPage(choice)
  }
  const bookStageStyle: BookStageStyle = {
    "--fallback-zoom": reader.zoom,
  }

  return (
    <main className="reader-shell" aria-label={GAMEBOOK_TITLE}>
      <ReaderToolbar
        canGoBack={reader.history.length > 0}
        stats={reader.stats}
        onBack={() => withCue(playCue, "turn", reader.goBack)}
        onRestart={() => withCue(playCue, "restart", reader.restart)}
        onSave={() => withCue(playCue, "save", reader.saveGame)}
        onLoad={() => withCue(playCue, "load", reader.loadGame)}
        onZoomIn={() => withCue(playCue, "zoom", reader.zoomIn)}
        onZoomOut={() => withCue(playCue, "zoom", reader.zoomOut)}
        onResetZoom={() => withCue(playCue, "zoom", reader.resetZoom)}
      />
      <section
        className="book-wrap"
        data-testid="book-stage"
        data-audio-engine={audioEngine}
        data-pageflip-engine={pageFlipEngine}
        data-panzoom-engine={panzoomEngine}
        data-zoom={reader.zoom}
        style={bookStageStyle}
      >
        <div className="book-pan-surface" ref={panSurfaceRef}>
          <div className="book-shadow" />
          <div className="native-flip-stage" ref={nativeFlipHostRef} aria-hidden="true" />
          {reactPageFlipActive ? (
            <TactileFlipLayer
              refHandle={flipBookRef}
              page={page}
              assetPath={assetPath}
              onFlip={() => playCue("turn")}
            />
          ) : null}
          <AnimatePresence mode="wait">
            <motion.div
              key={page.id}
              className="page-motion-frame"
              initial={prefersReducedMotion ? false : { rotateY: -16, opacity: 0, x: 28 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { rotateY: 0, opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { rotateY: 12, opacity: 0, x: -18 }}
              transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <BookPageArticle
                page={page}
                assetPath={assetPath}
                accentAssetPaths={accentAssetPaths}
                lastDecision={reader.lastDecision}
                onChoose={choose}
                turnCount={reader.turnCount}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

function withCue(
  playCue: (cue: "choice" | "load" | "restart" | "save" | "turn" | "zoom") => void,
  cue: Parameters<typeof playCue>[0],
  action: () => void,
) {
  playCue(cue)
  action()
}

function supportsReactPageFlip(): boolean {
  return (
    typeof window !== "undefined" && "ResizeObserver" in window && "requestAnimationFrame" in window
  )
}
