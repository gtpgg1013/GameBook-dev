export type ReactPageFlipApi = {
  readonly flipNext: (corner?: "bottom" | "top") => void
  readonly turnToPage: (pageNum: number) => void
}

export type ReactPageFlipHandle = {
  readonly pageFlip: () => ReactPageFlipApi
}
