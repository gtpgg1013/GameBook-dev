const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3
const FINAL_CONSONANT_COUNT = 28

export function withSubjectParticle(text: string): string {
  const lastLetter = Array.from(text).at(-1)
  if (lastLetter === undefined) {
    return text
  }

  const charCode = lastLetter.charCodeAt(0)
  if (charCode < HANGUL_START || charCode > HANGUL_END) {
    return `${text}가`
  }

  const hangulOffset = charCode - HANGUL_START
  const hasFinalConsonant = hangulOffset % FINAL_CONSONANT_COUNT !== 0
  return `${text}${hasFinalConsonant ? "이" : "가"}`
}
