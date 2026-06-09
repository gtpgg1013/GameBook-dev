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

// ─── Phase-aware opening line ─────────────────────────────────────────────

function openingLine(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const phase = phaseInChapter(number)
  const k = scene.keyword
  const loc = chapter.location
  const v = number % 6
  const openings: Record<Phase, readonly string[]> = {
    intro: [
      `${scene.action}. ${loc}의 공기가 처음 느껴진다.`,
      `${scene.action}. 낯선 ${k}가 시선을 끈다.`,
      `${scene.action}. 발을 딛자 ${loc}의 바람이 바뀐다.`,
      `${scene.action}. ${k}에서 처음 보는 빛이 난다.`,
      `${scene.action}. ${loc}에 첫 발을 내딛는다.`,
      `${scene.action}. ${k} 앞에서 한 발 멈춘다.`,
    ],
    develop: [
      `${scene.action}. ${k} 주변으로 빵 부스러기가 흩어진다.`,
      `${scene.action}. ${loc}에서 바람이 바뀐다.`,
      `${scene.action}. 발밑에서 ${k}의 흔적이 이어진다.`,
      `${scene.action}. 어딘가에서 갓 구운 냄새가 올라온다…`,
      `${scene.action}. ${k} 앞에서 잠시 숨을 고른다.`,
      `${scene.action}. ${withSubjectParticle(k)} 반긴다. 하지만 그 뒤에 그림자가 숨어 있다.`,
    ],
    crisis: [
      `${scene.action}. ${chapter.threat}가 바로 코앞이다.`,
      `${scene.action}. ${withSubjectParticle(chapter.threat)} 길을 막는다.`,
      `${scene.action}. 바게트가 뜨거워진다… ${withSubjectParticle(chapter.threat)} 가깝다.`,
      `${scene.action}. ${loc} 전체가 긴장으로 얼어붙는다.`,
      `${scene.action}. ${k}가 위험하게 흔들린다.`,
      `${scene.action}. ${chapter.threat}의 그림자가 ${k}를 삼킨다.`,
    ],
    climax: [
      `${scene.action}. ${chapter.goal}이 보이기 시작한다.`,
      `${scene.action}. ${withDirectionParticle(chapter.bridge)} 마지막 걸음이 남았다.`,
      `${scene.action}. ${withSubjectParticle(chapter.ally)} 마지막 손짓을 한다.`,
      `${scene.action}. ${k} 끝에서 빛이 번진다.`,
      `${scene.action}. ${loc}이 한 번 더 숨을 쉰다.`,
      `${scene.action}. ${chapter.goal}은 지금 이 순간에 달려 있다.`,
    ],
  }
  return pick(openings[phase], v)
}

// ─── Phase-aware closing line ─────────────────────────────────────────────

function closingLine(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const phase = phaseInChapter(number)
  const t = chapter.threat
  const b = chapter.bridge
  const k = scene.keyword
  const a = chapter.ally
  const v = number % 6
  const closings: Record<Phase, readonly string[]> = {
    intro: [
      `…이곳 ${chapter.location}의 바람이 아직 낯설다.`,
      `…${withSubjectParticle(k)} 처음 보는 무늬를 새기고 있다.`,
      `${a}의 목소리가 멀리서 들린다… 따라갈까?`,
      `…${chapter.location}은 조용하지만, 어딘가 ${t}의 기척이 있다.`,
      `…${k}에서 이상한 냄새가 올라온다. 처음 맡는 향이다.`,
      `…아직 ${chapter.arc}의 시작일 뿐이다. 발걸음을 내딛는다.`,
    ],
    develop: [
      `…${k} 뒤에서 ${t}의 그림자가 일렁인다.`,
      `${withSubjectParticle(a)} 손짓이 급해졌다… 어서 움직여야 한다.`,
      `…${b} 너머로 두 가닥 길이 빛난다.`,
      `발소리가 사라졌다… 아니, 멈춘 거다. ${withSubjectParticle(t)} 가까이 와 있다.`,
      `…${withSubjectParticle(k)} 지나면 돌아올 수 없다. 마음을 정해야 한다.`,
      `바람이 ${t}의 냄새를 실어온다… 어느 쪽으로 몸을 돌릴까?`,
    ],
    crisis: [
      `${t}가 포위한다… 뚫고 나갈 틈이 하나 있다.`,
      `${a}의 비명이 짧게 울린다…!`,
      `…바게트가 검게 변한다. ${t}의 영향이다.`,
      `${chapter.location} 전체가 ${t} 쪽으로 기운다… 한 발만 버티면.`,
      `…시간이 없다. ${withSubjectParticle(t)} 문을 닫기 전에 움직여야 한다.`,
      `내 숨이 가빠진다… ${t}가 공포를 먹고 있다.`,
    ],
    climax: [
      `${a}가 미소 짓는다. "${chapter.goal}… 이제 한 발 남았어."`,
      `…${b}가 열린다. 다음 장이 기다리고 있다.`,
      `…${withSubjectParticle(k)} 빛나며 마지막 길을 가리킨다.`,
      `…해냈다. ${withDirectionParticle(b)} 이어진다.`,
      `…${a}의 눈빛이 묻는다—${b}로 갈까?`,
      `…바게트가 따뜻해진다. ${chapter.arc}를 지나왔다.`,
    ],
  }
  return pick(closings[phase], v)
}

// ─── Scene builder ────────────────────────────────────────────────────────

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

// ─── FRONT: action-driven, heroic entry ───────────────────────────────────

function buildFront(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const phase = phaseInChapter(number)
  const hint = frontHint(chapter, scene)
  const ally = withSubjectParticle(chapter.ally)
  const goal = chapter.goal
  const op = openingLine(chapter, scene, number)
  const cl = closingLine(chapter, scene, number)

  switch (phase) {
    case "intro":
      return `${op}
${lead}. ${chapter.location}의 첫인상이 남다. ${withSubjectParticle(chapter.threat)} 어딘가 숨어 있다.

…${ally} 조용히 다가온다. "${hint}겠는걸."
${pressure}. ${goal}이 아직 멀다.
${cl}`

    case "develop":
      return `${op}
${lead}. ${pressure}.

…${ally} 빈틈을 봤다. "${hint}겠는걸."
${reward}. ${goal}. ${withSubjectParticle(chapter.threat)} 아직 멀지 않다.
${cl}`

    case "crisis":
      return `${op}
${pressure}. ${withSubjectParticle(chapter.threat)} 온다.

"${hint}겠는걸." ${ally} 급하게 속삭인다.
${lead}. ${reward}.
${cl}`

    case "climax":
      return `${op}
${reward}. ${lead}.

"${hint}겠는걸." ${ally} 나직이 말한다.
${goal}. ${withSubjectParticle(chapter.threat)} 물러났다. ${withDirectionParticle(chapter.bridge)} 이어진다.
${cl}`
  }
}

// ─── CLUE: mystery, quiet discovery ───────────────────────────────────────

function buildClue(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const phase = phaseInChapter(number)
  const hint = clueHint(chapter, scene)
  const ally = withSubjectParticle(chapter.ally)
  const goal = chapter.goal
  const op = openingLine(chapter, scene, number)
  const cl = closingLine(chapter, scene, number)

  switch (phase) {
    case "intro":
      return `${op}
${withObjectParticle(scene.keyword)} 자세히 보니 빛이 다르다. ${chapter.threat}의 기척이 희미하다.

${lead}. "${hint}겠는걸." ${ally} 속삭인다.
${pressure}. ${goal}의 실마리가 여기에 있다.
${cl}`

    case "develop":
      return `${op}
${lead}. ${pressure}.

"${hint}겠는걸." ${ally} 앞을 가리킨다.
${reward}. ${goal}. ${chapter.threat}은 아직 여기 있다.
${cl}`

    case "crisis":
      return `${op}
${pressure}. 단서가 ${chapter.threat} 쪽으로 흘러간다.

"${hint}겠는걸." ${ally} 조급해진다.
${lead}. ${reward}. ${goal}이 멀어지기 전에.
${cl}`

    case "climax":
      return `${op}
${reward}. ${lead}.

"${hint}겠는걸." ${ally} 끄덕인다.
${goal}. ${withSubjectParticle(chapter.threat)} 물러났다. ${withDirectionParticle(chapter.bridge)} 이어진다.
${cl}`
  }
}

// ─── HEART: compassion, connection ────────────────────────────────────────

function buildHeart(
  chapter: Chapter, scene: ArrivalScene,
  lead: string, pressure: string, reward: string, number: number,
): string {
  const phase = phaseInChapter(number)
  const hint = heartHint(chapter, scene)
  const ally = withSubjectParticle(chapter.ally)
  const goal = chapter.goal
  const op = openingLine(chapter, scene, number)
  const cl = closingLine(chapter, scene, number)

  switch (phase) {
    case "intro":
      return `${op}
${lead}. 도움이 필요한 손이 보인다. ${chapter.threat}도 가까이 있다.

"${hint}겠는걸." ${ally} 나직이 말한다.
${pressure}. ${goal}도 중요하지만 지금은 이 사람이 먼저다.
${cl}`

    case "develop":
      return `${op}
${lead}. ${pressure}.

"${hint}겠는걸." ${ally} 속삭인다.
${reward}. ${goal}. ${chapter.threat}을 잊으면 안 된다.
${cl}`

    case "crisis":
      return `${op}
${pressure}. 돕다가 ${withSubjectParticle(chapter.threat)} 더 가까워졌다.

"${hint}겠는걸." ${ally} 걱정스럽다.
${lead}. ${reward}.
${cl}`

    case "climax":
      return `${op}
${reward}. ${lead}.

"${hint}겠는걸." ${ally} 미소 짓는다.
${goal}. ${withSubjectParticle(chapter.threat)} 지나갔다. ${withDirectionParticle(chapter.bridge)} 이어진다.
${cl}`
  }
}

// ─── Hint lines ───────────────────────────────────────────────────────────

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
