import { Howl } from "howler"
import { PageFlip } from "page-flip"
import createPanZoom, { type PanZoom } from "panzoom"
import { type RefObject, useCallback, useEffect, useRef, useState } from "react"

export type AudioCue = "choice" | "load" | "restart" | "save" | "turn" | "zoom"
export type PanzoomEngine = "css-fallback" | "panzoom"
export type PageFlipEngine = "motion-fallback" | "page-flip-fallback" | "react-pageflip"
export type PlayCue = (cue: AudioCue) => void

const pageTickWav =
  "data:audio/wav;base64," +
  "UklGRrQAAABXQVZFZm10IBAAAAABAAEAoA8AAEAfAAACABAAZGF0YZAAAAAAAMs3nRRl0cPagR/GLxLz58yv+SwvghcE26LbWhZeK2P6F9RC9V0mcxgS5Drebg64JQAA2tu/8rgdjBdA7FPi9QcjH88D2eMg8pMV9RRI86fnHAP0F8UFvOtO8z0O4xDv+O3tAACAEOQFK/Ml9v4HlQsE/dP0sv4hCT0E1vl0+hUDUwVm/wL8NP8sAvEAdP8="

const cueRates: Readonly<Record<AudioCue, number>> = {
  choice: 1.18,
  load: 0.86,
  restart: 0.78,
  save: 1.34,
  turn: 1,
  zoom: 1.48,
}

export function useInteractionAudio(): {
  readonly audioEngine: "howler"
  readonly playCue: PlayCue
} {
  const soundsRef = useRef<Readonly<Record<AudioCue, Howl>> | null>(null)

  useEffect(() => {
    if (!canUseBrowserAudio()) {
      soundsRef.current = null
      return undefined
    }

    try {
      soundsRef.current = {
        choice: makeSound(0.16),
        load: makeSound(0.1),
        restart: makeSound(0.13),
        save: makeSound(0.12),
        turn: makeSound(0.18),
        zoom: makeSound(0.09),
      }
      return () => {
        for (const sound of Object.values(soundsRef.current ?? {})) {
          sound.unload()
        }
        soundsRef.current = null
      }
    } catch (error) {
      if (error instanceof Error) {
        soundsRef.current = null
        return undefined
      }
      throw error
    }
  }, [])

  const playCue = useCallback((cue: AudioCue) => {
    const sound = soundsRef.current?.[cue]
    if (sound === undefined) {
      return
    }
    sound.rate(cueRates[cue])
    sound.play()
  }, [])

  return { audioEngine: "howler", playCue }
}

export function usePanzoomSurface(
  surfaceRef: RefObject<HTMLElement | null>,
  zoom: number,
): PanzoomEngine {
  const instanceRef = useRef<PanZoom | null>(null)
  const [engine, setEngine] = useState<PanzoomEngine>("css-fallback")

  useEffect(() => {
    const element = surfaceRef.current
    if (element === null || !canUseDomEnhancement()) {
      setEngine("css-fallback")
      return undefined
    }

    if (usesTouchFirstNavigation()) {
      setEngine("css-fallback")
      return undefined
    }

    try {
      const instance = createPanZoom(element, {
        autocenter: false,
        bounds: true,
        boundsPadding: 0.16,
        maxZoom: 1.3,
        minZoom: 0.9,
        smoothScroll: false,
        transformOrigin: { x: 0.5, y: 0.5 },
        zoomDoubleClickSpeed: 1,
        zoomSpeed: 0.052,
        beforeWheel: (event) => !event.altKey && !event.metaKey,
      })
      instanceRef.current = instance
      setEngine("panzoom")
      return () => {
        instance.dispose()
        instanceRef.current = null
        setEngine("css-fallback")
      }
    } catch (error) {
      if (error instanceof Error) {
        instanceRef.current = null
        setEngine("css-fallback")
        return undefined
      }
      throw error
    }
  }, [surfaceRef])

  useEffect(() => {
    const element = surfaceRef.current
    const instance = instanceRef.current
    if (element === null || instance === null) {
      return
    }
    const rect = element.getBoundingClientRect()
    instance.zoomAbs(rect.left + rect.width / 2, rect.top + rect.height / 2, zoom)
  }, [surfaceRef, zoom])

  return engine
}

export function useNativePageFlipFallback(
  hostRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  pageKey: string,
): PageFlipEngine {
  const [engine, setEngine] = useState<PageFlipEngine>("motion-fallback")

  useEffect(() => {
    const host = hostRef.current
    if (!enabled || host === null || !canUseDomEnhancement()) {
      setEngine("motion-fallback")
      return undefined
    }

    try {
      const block = document.createElement("div")
      block.className = "native-flip-block"
      const pages = [
        makeFallbackPage("현재 쪽", pageKey),
        makeFallbackPage("다음 장의 그림자", pageKey),
      ]
      block.replaceChildren(...pages)
      host.replaceChildren(block)

      const pageFlip = new PageFlip(block, {
        autoSize: true,
        clickEventForward: true,
        disableFlipByClick: true,
        drawShadow: true,
        flippingTime: 620,
        height: 620,
        maxHeight: 760,
        maxShadowOpacity: 0.48,
        maxWidth: 720,
        minHeight: 420,
        minWidth: 300,
        mobileScrollSupport: true,
        showCover: true,
        showPageCorners: true,
        size: "stretch",
        startPage: 0,
        startZIndex: 4,
        swipeDistance: 26,
        useMouseEvents: true,
        usePortrait: true,
        width: 420,
      })
      pageFlip.loadFromHTML(pages)
      setEngine("page-flip-fallback")

      window.setTimeout(() => pageFlip.flipNext("top"), 60)
      return () => {
        pageFlip.destroy()
        host.replaceChildren()
        setEngine("motion-fallback")
      }
    } catch (error) {
      if (error instanceof Error) {
        host.replaceChildren()
        setEngine("motion-fallback")
        return undefined
      }
      throw error
    }
  }, [enabled, hostRef, pageKey])

  return engine
}

function makeSound(volume: number): Howl {
  return new Howl({
    html5: false,
    preload: true,
    src: [pageTickWav],
    volume,
  })
}

function makeFallbackPage(label: string, pageKey: string): HTMLElement {
  const page = document.createElement("div")
  page.className = "native-flip-page"
  page.setAttribute("data-page-key", pageKey)
  page.textContent = label
  return page
}

function canUseDomEnhancement(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined"
}

function canUseBrowserAudio(): boolean {
  return canUseDomEnhancement() && !navigator.userAgent.toLowerCase().includes("jsdom")
}

function usesTouchFirstNavigation(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return (
    navigator.maxTouchPoints > 0 ||
    /android|iphone|ipad|ipod|mobile/u.test(userAgent) ||
    (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches)
  )
}
