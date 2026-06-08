const HANGUL_START = 0xac00
const HANGUL_END = 0xd7a3
const FINAL_CONSONANT_COUNT = 28

export function withSubjectParticle(text: string): string {
  return `${text}${hasFinalConsonant(text) ? "이" : "가"}`
}

export function withObjectParticle(text: string): string {
  return `${text}${hasFinalConsonant(text) ? "을" : "를"}`
}

export function withAndParticle(text: string): string {
  return `${text}${hasFinalConsonant(text) ? "과" : "와"}`
}

export function withCopulaParticle(text: string): string {
  return `${text}${hasFinalConsonant(text) ? "이" : ""}`
}

export function withDirectionParticle(text: string): string {
  return `${text}${takesEuroDirectionParticle(text) ? "으로" : "로"}`
}

function hasFinalConsonant(text: string): boolean {
  return finalConsonantIndex(text) > 0
}

function takesEuroDirectionParticle(text: string): boolean {
  const finalIndex = finalConsonantIndex(text)
  return finalIndex > 0 && finalIndex !== 8
}

function finalConsonantIndex(text: string): number {
  const lastLetter = Array.from(text).at(-1)
  if (lastLetter === undefined) {
    return 0
  }

  const charCode = lastLetter.charCodeAt(0)
  if (charCode < HANGUL_START || charCode > HANGUL_END) {
    return 0
  }

  const hangulOffset = charCode - HANGUL_START
  return hangulOffset % FINAL_CONSONANT_COUNT
}
