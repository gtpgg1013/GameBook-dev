import { withSubjectParticle } from "./korean"
import type { Chapter } from "./storyWorld"
import type { Choice } from "./types"

type ChapterBranch = "brave" | "risky" | "kind"

export function consequenceFor(label: string, tone: Choice["tone"]): string {
  const scripted = scriptedConsequence(label)
  if (scripted !== undefined) {
    return scripted
  }

  switch (tone) {
    case "brave":
      return `바게트 껍질이 금빛으로 단단해진다. 길은 열렸지만, 앞쪽에서는 더 큰 책임이 기다린다.`
    case "cautious":
      return `당신은 냄새와 발소리를 먼저 읽는다. 싸움은 늦어졌지만, 다음 장면의 함정 하나가 보인다.`
    case "foolish":
      return `공기가 뜨겁게 뒤틀린다. 바게트는 버티지만, 성급한 행동의 반동이 바로 따라온다.`
    case "secret":
      return `빵가루가 한 줄로 빛난다. 아무도 못 본 통로가 열리고, 이야기는 살짝 이상한 방향으로 접힌다.`
    default:
      return assertNever(tone)
  }
}

export function chapterConsequence(chapter: Chapter, branch: ChapterBranch): string {
  switch (branch) {
    case "brave":
      return `${chapter.location}의 길이 열린다. ${withSubjectParticle(
        chapter.objective,
      )} 말이 아니라 행동이 되고, 바게트가 짧게 울린다.`
    case "risky":
      return `${withSubjectParticle(
        chapter.pressure,
      )} 눈앞까지 다가온다. 빨리 움직인 만큼 다음 페이지는 더 날카롭게 굽는다.`
    case "kind":
      return `${withSubjectParticle(
        chapter.ally,
      )} 당신의 이름을 기억한다. 도움은 작은 단서로 돌아오고, 바게트 끝이 따뜻해진다.`
    default:
      return assertNever(branch)
  }
}

function scriptedConsequence(label: string): string | undefined {
  switch (label) {
    case "무기고로 간다":
      return "무기고로 들어서자 낡은 쇠칼은 힘을 잃고, 오직 바게트 손잡이만 따뜻하게 반응한다. 당신은 빵으로 싸우는 법을 배우고 다음 선택의 책임을 손에 쥔다."
    case "술집으로 간다":
      return "술집 문을 밀자 빵 기사단과 잼 밀수꾼의 소문이 한꺼번에 쏟아진다. 바게트는 검보다 질문에 가까워지고, 문지기를 만날 단서가 테이블 위에 놓인다."
    case "어려운 사람을 도와준다":
      return "넘어진 노점상을 일으켜 세우자 그는 따뜻한 빵조각과 효모 숲의 짧은 길을 알려 준다. 바게트의 끝에는 싸움이 아닌 구원의 냄새가 먼저 밴다."
    case "문지기를 설득한다":
      return "문지기에게 싸우러 온 것이 아니라 길을 구하러 왔다고 말하자, 그의 책갈피 갑옷이 조용히 열린다. 바게트는 위협 대신 약속의 증표가 된다."
    case "문지기를 밀치고 지나간다":
      return "문지기를 밀치는 순간 책장이 뜨거워지고, 바게트 껍질이 검게 그을린다. 행동은 빠르지만 이유가 비어 있어 위험한 결말의 문이 열린다."
    case "식빵 방패병을 돕는다":
      return "식빵 방패병을 포자 덫에서 끌어내자 그는 당신 앞에 방패를 세운다. 바게트와 방패가 맞물리며 왕실 오븐까지 갈 실제 길이 생긴다."
    case "왕실 오븐을 식힌다":
      return "작은 오븐의 열이 식고 시장 사람들이 숨을 돌린다. 하지만 왕실 오븐은 아직 멀다. 지금 얻은 것은 결말이 아니라 준비 시간이다."
    default:
      return undefined
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected choice variant: ${String(value)}`)
}
