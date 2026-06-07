import type { RefObject } from "react"
import HTMLFlipBook from "react-pageflip"
import type { GamePage } from "../story/types"
import type { ReactPageFlipHandle } from "./pageFlipTypes"

type TactileFlipLayerProps = {
  readonly refHandle: RefObject<ReactPageFlipHandle | null>
  readonly page: GamePage
  readonly assetPath: string
  readonly onFlip: () => void
}

export function TactileFlipLayer({ refHandle, page, assetPath, onFlip }: TactileFlipLayerProps) {
  return (
    <div className="book-flipper-shell tactile-flip-shell" aria-hidden="true">
      <HTMLFlipBook
        ref={refHandle}
        className="book-flipper"
        style={{}}
        startPage={0}
        size="stretch"
        width={420}
        height={620}
        minWidth={260}
        maxWidth={620}
        minHeight={360}
        maxHeight={720}
        drawShadow={true}
        flippingTime={720}
        usePortrait={true}
        startZIndex={2}
        autoSize={true}
        maxShadowOpacity={0.62}
        showCover={true}
        mobileScrollSupport={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={24}
        showPageCorners={true}
        disableFlipByClick={true}
        renderOnlyPageLengthChange={false}
        onFlip={onFlip}
      >
        <div className="tactile-flip-page" data-density="hard">
          <img src={assetPath} alt="" />
          <span>{page.number}</span>
        </div>
        <div className="tactile-flip-page tactile-flip-page-back" data-density="soft">
          <span>?</span>
        </div>
      </HTMLFlipBook>
    </div>
  )
}
