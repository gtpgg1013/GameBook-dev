import {
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

type Phase = "intro" | "develop" | "crisis" | "climax"

function phaseInChapter(number: number): Phase {
  const pos = (number - 1) % CHAPTER_SIZE
  if (pos < 4) return "intro"
  if (pos < 8) return "develop"
  if (pos < 12) return "crisis"
  return "climax"
}

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
  const phase = phaseInChapter(number)
  switch (phase) {
    case "intro": return `${scene.action}. ${chapter.location}에서 ${withDirectionParticle(chapter.bridge)} 향한다.`
    case "develop": return `${scene.action} 뒤, ${scene.keyword}의 흔적이 ${withDirectionParticle(chapter.bridge)} 이어진다.`
    case "crisis": return `${chapter.threat}가 가까워진다. ${scene.keyword} 앞에서 숨을 고른다.`
    case "climax": return `${chapter.goal}. ${withSubjectParticle(scene.keyword)} 빛나고 ${withDirectionParticle(chapter.bridge)} 마지막 걸음이 남았다.`
  }
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function allyTag(ally: string): string {
  return withSubjectParticle(ally.split(" ").pop() ?? "")
}

function allyFull(ally: string): string {
  return ally
}

// ─── Scene builder — prose novel format ────────────────────────────────────

function buildScene(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const lead = firstPerson(scene.lead)
  const pressure = firstPerson(scene.pressure)
  const reward = firstPerson(scene.reward)
  const phase = phaseInChapter(number)
  const ally = chapter.ally
  const threat = chapter.threat
  const goal = chapter.goal
  const keyword = scene.keyword
  const loc = chapter.location
  const bridge = chapter.bridge
  const action = scene.action
  const v = number % 3

  const selfRef = ally.includes(keyword) || keyword.includes(ally.split(" ").pop() ?? "")
  const hintWord = selfRef ? "이쪽" : withCopulaParticle(keyword)

  switch (scene.route) {
    case "front": return buildFront(ally, threat, goal, keyword, loc, bridge, lead, pressure, reward, hintWord, phase, v, action)
    case "clue": return buildClue(ally, threat, goal, keyword, loc, bridge, lead, pressure, reward, hintWord, phase, v, action)
    case "heart": return buildHeart(ally, threat, goal, keyword, loc, bridge, lead, pressure, reward, hintWord, phase, v, action)
    default: return assertNever(scene.route)
  }
}

// ─── FRONT: action prose ──────────────────────────────────────────────────

function buildFront(
  ally: string, threat: string, goal: string,
  keyword: string, loc: string, bridge: string,
  lead: string, pressure: string, reward: string, hintWord: string,
  phase: Phase, v: number, action: string,
): string {
  const a = allyTag(ally)
  const af = allyFull(ally)
  const t = withSubjectParticle(threat)
  switch (phase) {
    case "intro":
      return `${action}. ${loc}의 공기가 처음 느껴졌다… ${lead}.
${af}가 조용히 다가와 내 바게트를 흘끗 봤다. ${t} 어딘가 숨어 있다.
"${hintWord}겠는걸." ${a} 나직이 말했다.

${pressure}. ${goal}이 아직 멀다.`
    case "develop":
      return `${action}. 나는 바게트를 움켜쥐고 앞으로 나아갔다…
"${hintWord}겠는걸. 여기야." ${a} 속삭였다.

${reward}. ${goal}. ${t} 아직 멀지 않다.
${af}은 내 바게트를 믿는 눈빛이었다.`
    case "crisis":
      return `${action}. ${threat}가 나타났다! 나는 바게트를 들어 막아 섰다.
"${hintWord}겠는걸. 서두르자!" ${a} 급하게 속삭였다.
(${threat}가 가까이… 숨을 죽여야 한다.)

${af}가 내 등을 밀었다. ${lead}. ${reward}. ${goal}이 멀어지기 전에 움직여야 한다.`
    case "climax":
      return `${action}. 마침내 ${keyword} 끝에 닿았다… ${reward}.
"${hintWord}겠는걸." ${a} 나직이 말했다. (드디어… 한 발 남았다.)

${goal}. ${t} 물러났다. ${af}와 함께 ${withDirectionParticle(bridge)} 이어진다.`
  }
}

// ─── CLUE: mystery prose ──────────────────────────────────────────────────

function buildClue(
  ally: string, threat: string, goal: string,
  keyword: string, loc: string, bridge: string,
  lead: string, pressure: string, reward: string, hintWord: string,
  phase: Phase, v: number, action: string,
): string {
  const a = allyTag(ally)
  const af = allyFull(ally)
  const t = withSubjectParticle(threat)
  switch (phase) {
    case "intro":
      return `${action}. ${withObjectParticle(keyword)} 자세히 들여다봤다… ${threat}의 기척이 희미하다.
"${hintWord}겠는걸." ${a} 내 어깨 너머로 속삭였다.

${af}도 이 단서를 찾고 있었다. ${pressure}. ${goal}의 실마리가 여기에 있다.
(이것이 단서인가…?)`
    case "develop":
      return `${action}. 단서가 하나 풀렸다. ${keyword}의 흔적이 이어진다…
"${hintWord}겠는걸. 이쪽이야." ${a} 앞을 가리켰다.

${reward}. ${goal}. ${t} 아직 여기 있다.
…어디선가 갓 구운 냄새가 올라온다. ${af}도 조심스럽게 걸어온다.`
    case "crisis":
      return `${action}. 단서가 ${threat} 쪽으로 흘러간다…!
"${hintWord}겠는걸…!" ${a} 조급해졌다.

(${threat}가 더 가까워진다… 서둘러야 한다.)
${af}가 단서를 놓지 않았다. ${lead}. ${reward}. ${goal}이 멀어지기 전에.`
    case "climax":
      return `${action}. 마침내 마지막 단서가 맞춰졌다… ${reward}.
"${hintWord}겠는걸." ${a} 안도했다.

${goal}. ${t} 물러났다. ${af}와 함께 ${withDirectionParticle(bridge)} 이어진다.`
  }
}

// ─── HEART: compassion prose ──────────────────────────────────────────────

function buildHeart(
  ally: string, threat: string, goal: string,
  keyword: string, loc: string, bridge: string,
  lead: string, pressure: string, reward: string, hintWord: string,
  phase: Phase, v: number, action: string,
): string {
  const a = allyTag(ally)
  const af = allyFull(ally)
  const t = withSubjectParticle(threat)
  switch (phase) {
    case "intro":
      return `${action}. 도움이 필요한 손이 보였다… ${threat}도 가까이 있다.
"${hintWord}겠는걸." ${a} 나직이 말했다.

${af}가 걱정스러운 눈으로 본다. ${pressure}. ${goal}도 중요하지만, 지금은 이 사람이 먼저다.
(내가 아니면… 누가?)`
    case "develop":
      return `${action}. 내 손에서 바게트가 따뜻해졌다… ${keyword}가 안도한다.
"${hintWord}겠는걸." ${a} 속삭였다.

${reward}. ${goal}. ${withObjectParticle(threat)} 잊으면 안 된다.
…${t} 숨을 죽이고 기다린다. ${af}도 긴장했다.`
    case "crisis":
      return `${action}. 돕다가 ${t} 더 가까워졌다…!
"${hintWord}겠는걸… 괜찮아?" ${a} 걱정스럽다.

(바게트가 뜨겁다… ${threat}의 반응이다.)
${af}가 내 손을 잡았다. ${lead}. ${reward}. ${goal}을 놓칠 수 없다.`
    case "climax":
      return `${action}. 마침내 ${keyword}가 미소 지었다… ${reward}.
"${hintWord}겠는걸." ${a} 미소 지었다.

${goal}. ${t} 지나갔다. ${af}와 함께 ${withDirectionParticle(bridge)} 이어진다.`
  }
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
