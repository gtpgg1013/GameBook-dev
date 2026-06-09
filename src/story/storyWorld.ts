import {
  withAndParticle,
  withCopulaParticle,
  withDirectionParticle,
  withObjectParticle,
  withSubjectParticle,
} from "./korean"
import { pick } from "./shared"
import { chapters } from "./storyChapters"
import { type ArrivalScene, type Chapter, type StoryRoute, storyRoutes } from "./storySchema"

const CHAPTER_SIZE = 16
const FIRST_GENERATED_PAGE = 6

export function storyTitle(number: number): string {
  const prequel = prequelTitle(number)
  if (prequel !== undefined) return prequel
  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  return titleForScene(chapter, scene, number)
}

export function storyBody(number: number): string {
  const prequel = prequelBody(number)
  if (prequel !== undefined) return prequel
  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  return buildScene(chapter, scene, number)
}

export function narrativeFunction(number: number): string {
  if (number <= 5) return "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다."
  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  return `${scene.action} 뒤, ${scene.keyword}의 흔적이 ${withDirectionParticle(chapter.bridge)} 이어진다.`
}

export function chapterFor(number: number): Chapter {
  const index = Math.min(chapters.length - 1, Math.floor((number - 1) / CHAPTER_SIZE))
  return pick(chapters, index)
}

export function routeForStoryPage(number: number): StoryRoute {
  if (number < FIRST_GENERATED_PAGE) return "front"
  return pick(storyRoutes, number - FIRST_GENERATED_PAGE)
}

export function arrivalForPage(number: number): ArrivalScene {
  if (number < FIRST_GENERATED_PAGE) throw new Error(`Prequel page has no generated arrival: ${number}`)
  const chapter = chapterFor(number)
  const route = routeForStoryPage(number)
  const copy = chapter.routes[route]
  const index = Math.floor((number - FIRST_GENERATED_PAGE) / storyRoutes.length)
  const keyword = pick(copy.keywords, index)
  return {
    route,
    action: pick(copy.labels, index),
    keyword,
    lead: pick(copy.leads, index),
    pressure: pick(copy.pressures, index),
    reward: pick(copy.rewards, index),
    item: copy.item,
  }
}

// ─── Prequel (pages 1-5) ──────────────────────────────────────────────────

function prequelTitle(number: number): string | undefined {
  if (number < 1 || number > 5) return undefined
  return pick(["바게트가 숨을 쉰 밤","녹슨 칼들이 침묵한 무기고","잼 냄새 속 문지기의 질문","포자 덫에 걸린 식빵 방패병","버터 시장의 뜨거운 숨"], number - 1)
}

function prequelBody(number: number): string | undefined {
  switch (number) {
    case 1: return `편의점 계산대 옆 바게트가 이상하게 따뜻했다.
"잠깐... 이 빵, 방금 숨 쉰 거 아니야?"
(바사삭...) 게임북의 잉크가 침대 밑으로 흘러내리고 방바닥이 빵가루처럼 무너진다.

눈을 뜨자 종소리와 갓 구운 냄새가 한꺼번에 밀려온다.
왼쪽 골목의 무기고는 덜그럭거리고, 오른쪽 술집은 내 이름을 속삭인다.
넘어진 노점상이 밀가루 묻은 손을 뻗는다.`
    case 2: return `무기고 안 쇠칼들은 녹처럼 조용히 죽어 있다.
벽에는 방패빵, 바게트 손잡이, 삐걱대는 망치만 남았다.
(철컥…) 대장장이가 내 손의 빵을 보고 숨을 삼킨다.

잠긴 상자 밑으로 하얀 밀가루 자국이 번진다.
"그 바게트, 아무 빵 아니야. 사람을 베기 전에 사람을 지켜."`
    case 3: return `술집 문을 밀자 잼 냄새와 겁먹은 속삭임이 한꺼번에 쏟아진다.
(웅성웅성...) 노파 마들렌이 젖은 책갈피를 손바닥에 밀어 넣는다.
"효모 숲 문지기, 힘으로는 못 지나가."

문밖의 문지기는 창을 겨누지 않는다.
대신 내 바게트보다 내 얼굴을 오래 본다.
"너, 왜 이 세계를 구하려고 하지?"`
    case 4: return `효모 숲 가장자리에서 나무들이 숨을 죽인다.
말하는 식빵 방패병이 포자 덫에 걸려 바삭한 모서리를 떤다.
(질척, 질척...) 곰팡이 정찰병 발소리가 젖은 흙을 밟고 가까워진다.

"저 방패병이 단서겠는걸..?"
도망치면 안전하다. 도우면 길이 열린다. 싸우면 숲이 네 얼굴을 외운다.`
    case 5: return `버터 시장은 용사라는 말을 너무 쉽게 외친다.
나는 아직 빵 냄새와 피 냄새도 제대로 구별하지 못한다… (지글…) 작은 오븐들이 과열되고, 왕실 오븐의 소문은 지붕 위까지 뜨겁게 번진다.

물을 든 아이가 울고 있다!
상인들은 대가를 부른다.
버려진 빵수레는 불길 쪽으로 천천히 굴러간다.`
    default: return undefined
  }
}

// ─── Title builder ────────────────────────────────────────────────────────

function titleForScene(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const selfRef = chapter.ally.includes(scene.keyword) || scene.keyword.includes(chapter.ally.split(" ").pop() ?? "")
  switch (scene.route) {
    case "front": return pick([`${scene.keyword} 앞에서 갈라진 ${chapter.arc}`,`${withDirectionParticle(chapter.bridge)} 튄 ${scene.keyword}`], number)
    case "clue": return `${withSubjectParticle(scene.keyword)} 가리킨 ${chapter.bridge}`
    case "heart": {
      if (selfRef) return pick([`${chapter.bridge}에서 만난 손`, `${chapter.arc}의 작은 위로`], number)
      return pick([`${scene.keyword} 곁에 멈춘 손`,`${withSubjectParticle(chapter.ally)} 기억한 ${scene.keyword}`], number)
    }
    default: return assertNever(scene.route)
  }
}

// ─── Scene builder — narrative-first approach ─────────────────────────────
// Every variant opens with scene.action so the choice→arrival bridge is clear.
// Closing lines use chapter-specific sensory detail instead of generic cliffhangers.

function buildScene(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const lead = firstPerson(scene.lead)
  const pressure = firstPerson(scene.pressure)
  const reward = firstPerson(scene.reward)

  switch (scene.route) {
    case "front": return buildFront(chapter, scene, lead, pressure, reward, number)
    case "clue": return buildClue(chapter, scene, lead, pressure, reward, number)
    case "heart": return buildHeart(chapter, scene, lead, pressure, reward, number)
    default: return assertNever(scene.route)
  }
}

// ─── Opening line — expands the choice action with sensory/setting detail ──

function openingLine(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const v = number % 6
  const k = scene.keyword
  const loc = chapter.location
  const openings = [
    `${scene.action}. ${k} 주변으로 빵 부스러기가 흩어진다.`,
    `${scene.action}. ${loc}에서 바람이 바뀐다.`,
    `${scene.action}. 발밑에서 ${k}의 흔적이 이어진다.`,
    `${scene.action}. 어딘가에서 갓 구운 냄새가 올라온다…`,
    `${scene.action}. ${k} 앞에서 잠시 숨을 고른다.`,
    `${scene.action}. ${withSubjectParticle(k)} 반긴다. 하지만 그 뒤에 그림자가 숨어 있다.`,
  ]
  return pick(openings, v)
}

// ─── Dynamic closing lines — diverse sensory & character-based endings ───

function closingLine(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const v = number % 12
  const t = chapter.threat
  const b = chapter.bridge
  const k = scene.keyword
  const a = chapter.ally
  const closings = [
    `…${k} 뒤에서 ${t}의 그림자가 일렁인다.`,
    `${withSubjectParticle(a)} 손짓이 급해졌다… 어서 움직여야 한다.`,
    `…${b} 너머로 두 가닥 길이 빛난다.`,
    `발소리가 사라졌다… 아니, 멈춘 거다. ${withSubjectParticle(t)} 가까이 와 있다.`,
    `…${withSubjectParticle(k)} 지나면 돌아올 수 없다. 마음을 정해야 한다.`,
    `바람이 ${t}의 냄새를 실어온다… 어느 쪽으로 몸을 돌릴까?`,
    `…빵 부스러기가 ${b} 쪽으로 흩어진다. 하나를 골라야 한다.`,
    `내 바게트가 뜨거워졌다… ${withSubjectParticle(t)} 반응이다! 지금 결정해야 한다.`,
    `${a}의 눈빛이 묻는다—\"이 길, 맞는 거지?\"`,
    `…${withSubjectParticle(k)} 둘러싼 공기가 달라졌다. 마음을 정해야 한다.`,
    `${t}의 그림자가 두 갈래로 갈라진다… 한쪽은 ${b} 쪽이다.`,
    `…누군가 내 이름을 불렀다. ${a}일까, ${t}일까? 발을 내딛어야 한다.`,
  ]
  return pick(closings, v)
}

// ─── FRONT: action-driven, heroic entry ───────────────────────────────────

function buildFront(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const v = number % 5
  switch (v) {
    case 0: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

…${withSubjectParticle(chapter.ally)} 빈틈을 봤다. "${frontHint(chapter, scene)}겠는걸."
${reward}. ${chapter.goal}. ${withSubjectParticle(chapter.threat)} 온다.
${closingLine(chapter, scene, number)}`

    case 1: return `${openingLine(chapter, scene, number)}
…${withSubjectParticle(chapter.threat)} 움직인다. ${pressure}.

${lead}. ${reward}.
"${frontHint(chapter, scene)}겠는걸. 서두르자." ${withSubjectParticle(chapter.ally)} 속삭인다.
${chapter.goal}. 그 전에 ${chapter.threat}.
${closingLine(chapter, scene, number)}`

    case 2: return `${openingLine(chapter, scene, number)}
"${frontHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 입을 연다.

${pressure}. ${lead}.
${reward}. ${chapter.goal}, ${withSubjectParticle(chapter.threat)} 가깝다.
${closingLine(chapter, scene, number)}`

    case 3: return `${openingLine(chapter, scene, number)}
${withSubjectParticle(chapter.threat)} 막아 섰다. ${pressure}.
${memLine(chapter, number)}.

${lead}. ${withSubjectParticle(chapter.ally)} 끄덕인다. "${frontHint(chapter, scene)}겠는걸."
${reward}.
${chapter.goal}. ${closingLine(chapter, scene, number)}`

    default: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

${withSubjectParticle(chapter.ally)} 낮게 말한다. "${frontHint(chapter, scene)}겠는걸."
${reward}. ${withSubjectParticle(chapter.threat)} 먼저다. ${chapter.goal}은 다음.
${closingLine(chapter, scene, number)}`
  }
}

// ─── CLUE: mystery, quiet discovery ───────────────────────────────────────

function buildClue(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const v = number % 5
  switch (v) {
    case 0: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

…${withSubjectParticle(chapter.ally)} 조용히 다가온다. "${clueHint(chapter, scene)}겠는걸."
${reward}. ${chapter.goal}. ${withSubjectParticle(chapter.threat)} 쉬지 않는다.
${closingLine(chapter, scene, number)}`

    case 1: return `${openingLine(chapter, scene, number)}
${pressure}. ${lead}.

"${clueHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 속삭인다.
${reward}. ${chapter.goal}, ${withSubjectParticle(chapter.threat)} 가깝다.
${closingLine(chapter, scene, number)}`

    case 2: return `${openingLine(chapter, scene, number)}
"${clueHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 입을 연다.

${lead}. ${pressure}.
${reward}. ${chapter.goal}. 그 전에 ${chapter.threat}.
${closingLine(chapter, scene, number)}`

    case 3: return `${openingLine(chapter, scene, number)}
${memLine(chapter, number)}.
${pressure}. ${lead}.

"${clueHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 끄덕인다.
${reward}. ${chapter.goal}.
${closingLine(chapter, scene, number)}`

    default: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

${withSubjectParticle(chapter.ally)} 앞을 가리킨다. "${clueHint(chapter, scene)}겠는걸."
${reward}. ${withSubjectParticle(chapter.threat)} 먼저다. ${chapter.goal}은 다음.
${closingLine(chapter, scene, number)}`
  }
}

// ─── HEART: compassion, connection, reward through kindness ───────────────

function buildHeart(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const v = number % 5
  switch (v) {
    case 0: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

"${heartHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 속삭인다.
${reward}. ${chapter.goal}. ${withSubjectParticle(chapter.threat)} 온다.
${closingLine(chapter, scene, number)}`

    case 1: return `${openingLine(chapter, scene, number)}
${pressure}. ${lead}.

"${heartHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 나직이 말한다.
${reward}. ${chapter.goal}, ${withSubjectParticle(chapter.threat)} 가깝다.
${closingLine(chapter, scene, number)}`

    case 2: return `${openingLine(chapter, scene, number)}
"${heartHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 입을 연다.

${lead}. ${pressure}.
${reward}. ${chapter.goal}. 그 전에 ${chapter.threat}.
${closingLine(chapter, scene, number)}`

    case 3: return `${openingLine(chapter, scene, number)}
${memLine(chapter, number)}.
${pressure}. ${lead}.

"${heartHint(chapter, scene)}겠는걸." ${withSubjectParticle(chapter.ally)} 끄덕인다.
${reward}. ${chapter.goal}.
${closingLine(chapter, scene, number)}`

    default: return `${openingLine(chapter, scene, number)}
${lead}. ${pressure}.

${withSubjectParticle(chapter.ally)} 앞을 가리킨다. "${heartHint(chapter, scene)}겠는걸."
${reward}. ${withSubjectParticle(chapter.threat)} 먼저다. ${chapter.goal}은 다음.
${closingLine(chapter, scene, number)}`
  }
}

// ─── Hint lines — different personality per route type ────────────────────

function frontHint(chapter: Chapter, scene: ArrivalScene): string {
  const selfRef = chapter.ally.includes(scene.keyword) || scene.keyword.includes(chapter.ally.split(" ").pop() ?? "")
  if (selfRef) return "이쪽이"
  return withCopulaParticle(scene.keyword)
}

function clueHint(chapter: Chapter, scene: ArrivalScene): string {
  const selfRef = chapter.ally.includes(scene.keyword) || scene.keyword.includes(chapter.ally.split(" ").pop() ?? "")
  if (selfRef) return "서두르"
  return withCopulaParticle(scene.keyword)
}

function heartHint(chapter: Chapter, scene: ArrivalScene): string {
  const selfRef = chapter.ally.includes(scene.keyword) || scene.keyword.includes(chapter.ally.split(" ").pop() ?? "")
  if (selfRef) return "이게 답이"
  return withCopulaParticle(scene.keyword)
}

// ─── Memory line ──────────────────────────────────────────────────────────

function memLine(chapter: Chapter, number: number): string {
  const ci = chapters.indexOf(chapter)
  if (ci <= 0) {
    const memos = [
      "편의점에서 바게트가 따뜻했던 그 순간이 스친다.",
      "계산대 위에서 빵이 숨을 쉬던 느낌이 아직 손에 남아 있다.",
    ]
    return pick(memos, number)
  }
  const prev = chapters[ci - 1]?.arc ?? chapter.arc
  return `지나온 ${prev}의 기억이 발밑에서 아직 가라앉지 않았다.`
}

// ─── First-person conversion ──────────────────────────────────────────────

function firstPerson(copy: string): string {
  return copy
    .replaceAll("당신 이름","내 이름").replaceAll("당신 앞","내 앞")
    .replaceAll("당신 옆","내 옆").replaceAll("당신 편","내 편")
    .replaceAll("당신 몸짓","내 몸짓").replaceAll("당신 목소리","내 목소리")
    .replaceAll("당신 뒤","내 뒤").replaceAll("당신 몫","내 몫")
    .replaceAll("당신 대신","나 대신").replaceAll("당신 값을","내 값을")
    .replaceAll("당신을","나를").replaceAll("당신이","내가")
    .replaceAll("당신","나")
}

function assertNever(value: never): never {
  throw new Error(`Unexpected: ${String(value)}`)
}
