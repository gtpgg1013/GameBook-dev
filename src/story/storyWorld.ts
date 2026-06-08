import {
  withAndParticle,
  withCopulaParticle,
  withDirectionParticle,
  withSubjectParticle,
} from "./korean"
import { pick } from "./shared"
import { chapters } from "./storyChapters"
import { type ArrivalScene, type Chapter, type StoryRoute, storyRoutes } from "./storySchema"

const CHAPTER_SIZE = 16
const FIRST_GENERATED_PAGE = 6

const sceneBeats = [
  "(타닥...) 뒤쪽 발자국들이 발목을 잡는다. 앞길은 딱 한 칸 열린다.",
  "(킁킁...) 달큰한 탄내가 낮게 번진다. 누가 먼저 흔들리는지 보인다.",
  "(철컥...) 바게트가 칼처럼 빛난다. 손잡이는 이상하게 따뜻하다.",
  "(스윽...) 도망칠 틈은 보인다. 대신 누군가 그 자리에 선다.",
  "(콕.) 작은 표시 하나가 큰 문 앞에서 버틴다.",
  "(후우...) 숨을 고르는 사이에도 책장은 혼자 넘어가지 않는다.",
]

export function storyTitle(number: number): string {
  const prequel = prequelTitle(number)
  if (prequel !== undefined) {
    return prequel
  }

  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  return titleForScene(chapter, scene, number)
}

export function storyBody(number: number): string {
  const prequel = prequelBody(number)
  if (prequel !== undefined) {
    return prequel
  }

  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  const beat = pick(sceneBeats, number)
  const lead = firstPerson(scene.lead)
  const pressure = firstPerson(scene.pressure)
  const reward = firstPerson(scene.reward)
  return `${arrivalOpening(chapter, scene)}

${pick(["(슈슉...)", "(바삭.)", "(타닥타닥...)", "(스윽...)"], number)} ${lead}.
${plotPressure(chapter, scene)}
"잠깐. 단서는 ${withCopulaParticle(scene.keyword)}겠는걸..?" ${withSubjectParticle(chapter.ally)} 말한다.

${reward}.
${pressure}.
${beat}`
}

export function narrativeFunction(number: number): string {
  if (number <= 5) {
    return "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다."
  }
  const chapter = chapterFor(number)
  const scene = arrivalForPage(number)
  return `${scene.action} 뒤, ${scene.keyword}의 흔적이 ${withDirectionParticle(chapter.bridge)} 이어진다.`
}

export function chapterFor(number: number): Chapter {
  const index = Math.min(chapters.length - 1, Math.floor((number - 1) / CHAPTER_SIZE))
  return pick(chapters, index)
}

export function routeForStoryPage(number: number): StoryRoute {
  if (number < FIRST_GENERATED_PAGE) {
    return "front"
  }
  return pick(storyRoutes, number - FIRST_GENERATED_PAGE)
}

export function arrivalForPage(number: number): ArrivalScene {
  if (number < FIRST_GENERATED_PAGE) {
    throw new Error(`Prequel page has no generated arrival: ${number}`)
  }

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

function prequelTitle(number: number): string | undefined {
  if (number < 1 || number > 5) {
    return undefined
  }

  return pick(
    [
      "바게트가 숨을 쉰 밤",
      "녹슨 칼들이 침묵한 무기고",
      "잼 냄새 속 문지기의 질문",
      "포자 덫에 걸린 식빵 방패병",
      "버터 시장의 뜨거운 숨",
    ],
    number - 1,
  )
}

function prequelBody(number: number): string | undefined {
  switch (number) {
    case 1:
      return `편의점 계산대 옆 바게트가 이상하게 따뜻했다.
"잠깐... 이 빵, 방금 숨 쉰 거 아니야?"
(바사삭...) 게임북의 잉크가 침대 밑으로 흘러내리고 방바닥이 빵가루처럼 무너진다.

눈을 뜨자 종소리와 갓 구운 냄새가 한꺼번에 밀려온다.
왼쪽 골목의 무기고는 덜그럭거리고, 오른쪽 술집은 내 이름을 속삭인다.
넘어진 노점상이 밀가루 묻은 손을 뻗는다.`
    case 2:
      return `무기고 안 쇠칼들은 녹처럼 조용히 죽어 있다.
벽에는 방패빵, 바게트 손잡이, 삐걱대는 망치만 남았다.
(철컥...) 대장장이가 내 손의 빵을 보고 숨을 삼킨다.

잠긴 상자 밑으로 하얀 밀가루 자국이 번진다.
"그 바게트, 아무 빵 아니야. 사람을 베기 전에 사람을 지켜."`
    case 3:
      return `술집 문을 밀자 잼 냄새와 겁먹은 속삭임이 한꺼번에 쏟아진다.
(웅성웅성...) 노파 마들렌이 젖은 책갈피를 손바닥에 밀어 넣는다.
"효모 숲 문지기, 힘으로는 못 지나가."

문밖의 문지기는 창을 겨누지 않는다.
대신 내 바게트보다 내 얼굴을 오래 본다.
"너, 왜 이 세계를 구하려고 하지?"`
    case 4:
      return `효모 숲 가장자리에서 나무들이 숨을 죽인다.
말하는 식빵 방패병이 포자 덫에 걸려 바삭한 모서리를 떤다.
(질척, 질척...) 곰팡이 정찰병 발소리가 젖은 흙을 밟고 가까워진다.

"저 방패병이 단서겠는걸..?"
도망치면 안전하다. 도우면 길이 열린다. 싸우면 숲이 네 얼굴을 외운다.`
    case 5:
      return `버터 시장은 용사라는 말을 너무 쉽게 외친다.
나는 아직 빵 냄새와 피 냄새도 제대로 구별하지 못한다.
(지글...) 작은 오븐들이 과열되고, 왕실 오븐의 소문은 지붕 위까지 뜨겁게 번진다.

물을 든 아이가 울고 있다.
상인들은 대가를 부른다.
버려진 빵수레는 불길 쪽으로 천천히 굴러간다.`
    default:
      return undefined
  }
}

function titleForScene(chapter: Chapter, scene: ArrivalScene, number: number): string {
  switch (scene.route) {
    case "front":
      return pick(
        [
          `${scene.keyword} 앞에서 갈라진 ${chapter.arc}`,
          `${withDirectionParticle(chapter.bridge)} 튄 ${scene.keyword}`,
        ],
        number,
      )
    case "clue":
      return `${withSubjectParticle(scene.keyword)} 가리킨 ${chapter.bridge}`
    case "heart":
      return pick(
        [
          `${scene.keyword} 곁에 멈춘 손`,
          `${withSubjectParticle(chapter.ally)} 기억한 ${scene.keyword}`,
        ],
        number,
      )
    default:
      return assertNever(scene.route)
  }
}

function arrivalOpening(chapter: Chapter, scene: ArrivalScene): string {
  switch (scene.route) {
    case "front":
      return `${scene.action}. ${withSubjectParticle(chapter.threat)} 반응하고, ${chapter.location}의 길이 둘로 갈라진다.`
    case "clue":
      return `${scene.action}. ${scene.keyword} 흔적이 ${withAndParticle(chapter.clue)} 이어지며, ${chapter.goal}의 이유가 보인다.`
    case "heart":
      return `${scene.action}. ${withSubjectParticle(chapter.ally)} 고개를 끄덕이고, ${chapter.goal}이 사람들의 일이 된다.`
    default:
      return assertNever(scene.route)
  }
}

function plotPressure(chapter: Chapter, scene: ArrivalScene): string {
  switch (scene.route) {
    case "front":
      return `${chapter.goal}은 아직 멀다. ${withDirectionParticle(chapter.bridge)} 가야 하지만, 힘만 쓰면 길이 더 막힌다.`
    case "clue":
      return `${withDirectionParticle(chapter.bridge)} 가는 실마리는 보인다. 틀리면 ${withSubjectParticle(chapter.threat)} 먼저 따라온다.`
    case "heart":
      return `${withDirectionParticle(chapter.bridge)} 가려면, 이 사람들을 두고 갈 수 없다는 사실이 먼저 선다.`
    default:
      return assertNever(scene.route)
  }
}

function firstPerson(copy: string): string {
  return copy
    .replaceAll("당신 이름", "내 이름")
    .replaceAll("당신 앞", "내 앞")
    .replaceAll("당신 옆", "내 옆")
    .replaceAll("당신 편", "내 편")
    .replaceAll("당신 몸짓", "내 몸짓")
    .replaceAll("당신 목소리", "내 목소리")
    .replaceAll("당신 뒤", "내 뒤")
    .replaceAll("당신 몫", "내 몫")
    .replaceAll("당신 대신", "나 대신")
    .replaceAll("당신 값을", "내 값을")
    .replaceAll("당신을", "나를")
    .replaceAll("당신이", "내가")
    .replaceAll("당신", "나")
}

function assertNever(value: never): never {
  throw new Error(`Unexpected story route: ${String(value)}`)
}
