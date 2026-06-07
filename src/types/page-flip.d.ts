declare module "page-flip" {
  export type PageFlipCorner = "top" | "bottom"
  export type PageFlipSize = "fixed" | "stretch"

  export type PageFlipSettings = {
    readonly startPage: number
    readonly size: PageFlipSize
    readonly width: number
    readonly height: number
    readonly minWidth: number
    readonly maxWidth: number
    readonly minHeight: number
    readonly maxHeight: number
    readonly drawShadow: boolean
    readonly flippingTime: number
    readonly usePortrait: boolean
    readonly startZIndex: number
    readonly autoSize: boolean
    readonly maxShadowOpacity: number
    readonly showCover: boolean
    readonly mobileScrollSupport: boolean
    readonly clickEventForward: boolean
    readonly useMouseEvents: boolean
    readonly swipeDistance: number
    readonly showPageCorners: boolean
    readonly disableFlipByClick: boolean
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<PageFlipSettings>)
    destroy(): void
    loadFromHTML(items: NodeListOf<HTMLElement> | readonly HTMLElement[]): void
    updateFromHtml(items: NodeListOf<HTMLElement> | readonly HTMLElement[]): void
    flipNext(corner?: PageFlipCorner): void
    turnToPage(pageNum: number): void
  }
}
