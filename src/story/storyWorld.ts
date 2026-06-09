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

// ─── Scene builder — every scene reads like a real story paragraph ────────
// Each generated page contains: action, sensory detail, ally voice, pressure, reward, hook.
// Builders weave chapter/scene data into varied prose — no single phrase repeats per page.

function buildScene(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const lead = firstPerson(scene.lead)
  const pressure = firstPerson(scene.pressure)
  const reward = firstPerson(scene.reward)

  // 10 distinct scene structures — enough that adjacent pages feel different
  const variant = number % 10

  const intros = [
    // 0: action → sensory detail → ally speaks
    `${arrivalOpen(chapter, scene, number)}
${lead}. ${sensory(chapter, number)}.
${allyLine(chapter, scene, 0)}

${pressure}. ${reward}.
${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 1: quiet → sudden movement → discovery
    `${arrivalOpen(chapter, scene, number)}

${chapter.location}, 한숨 돌린 틈에 ${lead.toLowerCase()}.
…${withSubjectParticle(chapter.threat)} 움직인다.
${pressure}.

${allyLine(chapter, scene, 1)}
${reward}. ${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 2: ally dialogue opens → scene fills in
    `${allyLine(chapter, scene, 2)}
${arrivalOpen(chapter, scene, number)} ${lead}.

${reward}.
${pressure}. ${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 3: memory → present moment → urgency
    `${memoryLine(chapter, number)}
${arrivalOpen(chapter, scene, number)} ${lead}.

${allyLine(chapter, scene, 3)}
${pressure}.
${reward}. ${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 4: visceral action → consequence → ally insight
    `${arrivalOpen(chapter, scene, number)}

${lead}. ${sensory(chapter, number)}.
${allyLine(chapter, scene, 4)}
${reward}.

${pressure}. ${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 5: tension build → threat reveal → ally encouragement
    `${arrivalOpen(chapter, scene, number)}

${pressure}. ${lead}.
…${withSubjectParticle(chapter.threat)} 가까워졌다. ${allyLine(chapter, scene, 5)}
${reward}.
${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 6: discovery → wonder → danger
    `${arrivalOpen(chapter, scene, number)}

${reward}. ${lead}.
${allyLine(chapter, scene, 6)}
${pressure}.

${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 7: ally teaches → world expands → choice
    `${allyLine(chapter, scene, 7)}
${arrivalOpen(chapter, scene, number)}

${lead}. ${reward}.
${pressure}. ${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 8: danger first → escape → ally hint
    `${arrivalOpen(chapter, scene, number)}

…${withSubjectParticle(chapter.threat)} 노려본다. ${pressure}.
${lead}.

${allyLine(chapter, scene, 8)} ${reward}.
${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,

    // 9: reflective → forward motion
    `${memoryLine(chapter, number)}
${arrivalOpen(chapter, scene, number)}

${allyLine(chapter, scene, 9)}
${reward}. ${pressure}.
${goalThreat(chapter, number)}.
${hookLine(chapter, scene, number)}`,
  ]

  return intros[variant]!
}

// ─── Component builders ───────────────────────────────────────────────────

function arrivalOpen(chapter: Chapter, scene: ArrivalScene, number: number): string {
  switch (scene.route) {
    case "front": {
      const fronts = [
        `${scene.action}. ${withSubjectParticle(chapter.threat)} 반응하고, ${chapter.location}의 길이 둘로 갈라진다.`,
        `${scene.action}. 이름을 밝히자 ${chapter.threat}의 갑옷이 반쯤 열렸다.`,
        `${scene.action}. ${chapter.location} 앞에서 발걸음이 멈췄다.`,
      ]
      return pick(fronts, number)
    }
    case "clue": {
      const clues = [
        `${scene.action}. ${scene.keyword}의 흔적이 바닥에 겹쳤다.`,
        `${scene.action}. ${withObjectParticle(scene.keyword)} 따라가니 숨겨진 길이 나타났다.`,
        `${scene.action}. ${scene.keyword}에서 실마리가 하나 풀렸다.`,
      ]
      return pick(clues, number)
    }
    case "heart": {
      const hearts = [
        `${scene.action}. ${withSubjectParticle(chapter.ally)} 고개를 끄덕이고, ${chapter.goal}에 한 발 다가섰다.`,
        `${scene.action}. 나눠 준 빵이 부족해 뒤쪽 줄이 술렁였다. ${withSubjectParticle(chapter.ally)} 나직이 말한다.`,
        `${scene.action}. ${withSubjectParticle(chapter.ally)} 미소 지으며 길을 열어 줬다. ${chapter.goal}이 시작된다.`,
      ]
      return pick(hearts, number)
    }
    default: return assertNever(scene.route)
  }
}

function allyLine(chapter: Chapter, scene: ArrivalScene, seed: number): string {
  // When keyword overlaps with ally name, avoid self-reference
  const selfRef = chapter.ally.includes(scene.keyword) || scene.keyword.includes(chapter.ally.split(" ").pop() ?? "")
  if (selfRef) {
    const safe = [
      `"이쪽이겠는걸." ${withSubjectParticle(chapter.ally)} 속삭인다.`,
      `${withSubjectParticle(chapter.ally)} 앞을 가리킨다. "이게 답이겠는걸."`,
      `"서두르겠는걸." ${withSubjectParticle(chapter.ally)} 발걸음을 빠르게 한다.`,
    ]
    return pick(safe, seed)
  }
  const lines = [
    `"${withCopulaParticle(scene.keyword)}겠는걸." ${withSubjectParticle(chapter.ally)} 입을 연다.`,
    `${withSubjectParticle(chapter.ally)} ${withObjectParticle(scene.keyword)} 가리킨다. "${withCopulaParticle(scene.keyword)}겠는걸."`,
    `"${withCopulaParticle(scene.keyword)}겠는걸. 서두르자." ${withSubjectParticle(chapter.ally)} 속삭인다.`,
    `${withSubjectParticle(chapter.ally)} 끄덕인다. "${withCopulaParticle(scene.keyword)}겠는걸."`,
    `"이게 열쇠야. ${withCopulaParticle(scene.keyword)}겠는걸." ${withSubjectParticle(chapter.ally)} 말한다.`,
    `${withSubjectParticle(chapter.ally)} 낮게 말한다. "${withCopulaParticle(scene.keyword)}겠는걸."`,
  ]
  return pick(lines, seed)
}

function sensory(chapter: Chapter, number: number): string {
  const s = [
    `어디선가 ${chapter.threat}의 기운이 스며든다`,
    `${chapter.location}에서 바람이 바게트를 흔든다`,
    `공기가 묵직하게 내려앉았다…`,
    `낯선 냄새가 발밑에서 올라온다`,
    `바닥에 표식이 보인다`,
    `어깨 너머로 누군가의 시선이 닿는다`,
    `귀를 울리는 낮은 진동이 있다`,
    `${chapter.ally}의 숨소리가 가까워졌다`,
    `발밑의 땅이 미세하게 떨린다`,
    `혀 끝에 쓴맛이 남는다`,
    `먼 곳에서 종소리가 희미하게 울린다`,
    `그림자가 내 발보다 빠르게 움직인다`,
  ]
  return pick(s, number)
}

function goalThreat(chapter: Chapter, number: number): string {
  const lines = [
    `${chapter.goal}. ${withSubjectParticle(chapter.threat)} 온다`,
    `${chapter.goal}, ${withSubjectParticle(chapter.threat)} 가깝다`,
    `${withSubjectParticle(chapter.threat)} 먼저다. ${chapter.goal}은 다음`,
    `${chapter.goal}. ${withSubjectParticle(chapter.threat)} 보인다`,
    `${chapter.threat} 앞의 ${chapter.goal}`,
    `${chapter.goal}, ${withSubjectParticle(chapter.threat)} 쉬지 않는다`,
    `${withSubjectParticle(chapter.threat)} 지나 ${withDirectionParticle(chapter.goal)} 향한다`,
    `${chapter.goal}. 그 전에 ${chapter.threat}`,
    `${chapter.goal}. 다음 조각이 보인다. ${withSubjectParticle(chapter.threat)} 서두른다`,
    `${chapter.goal}. ${withSubjectParticle(chapter.threat)} 기다린다`,
  ]
  return pick(lines, number)
}

function hookLine(chapter: Chapter, scene: ArrivalScene, number: number): string {
  const h = [
    `…지금 결정해야 한다. 갈림길이 열린다.`,
    `숨이 막힌다… 어느 쪽으로 발을 디뎌야 할까?`,
    `바게트가 손에서 따뜻해진다… 어딘가로 이끌고 있다.`,
    `…${chapter.bridge} 쪽으로 두 갈래 길이 보인다.`,
    `빛이 두 갈래로 갈라진다… 한쪽은 ${chapter.threat} 쪽이다.`,
    `${withSubjectParticle(chapter.ally)} 멈춰 선다. "…어디로?"`,
    `! 서둘러야 한다. 이 길을 놓치면 돌아올 수 없다.`,
    `…${withSubjectParticle(chapter.bridge)} 보인다. 발을 내딛는 순간이 온다.`,
  ]
  return pick(h, number)
}

function memoryLine(chapter: Chapter, number: number): string {
  const ci = chapters.indexOf(chapter)
  if (ci <= 0) {
    const memos = [
      "편의점에서 바게트가 따뜻했던 그 순간이 스친다.",
      "계산대 위에서 빵이 숨을 쉬던 느낌이 아직 손에 남아 있다.",
      "어두운 방바닥이 무너지던 그 밤이 겹쳐 보인다.",
    ]
    return pick(memos, number)
  }
  const prev = chapters[ci - 1]?.arc ?? chapter.arc
  const memos = [
    `지나온 ${prev}의 기억이 발밑에서 아직 가라앉지 않았다.`,
    `${prev}에서 들었던 소리가 귀에 맴돈다.`,
  ]
  return pick(memos, number)
}

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
