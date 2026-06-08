/**
 * pageContent.ts — 페이지별 네러티브 콘텐츠 데이터
 *
 * storyWorld.ts의 템플릿 생성을 대체하여,
 * 각 페이지가 이전 선택의 결과를 반영하는 연속적 스토리를 제공한다.
 *
 * 구조:
 * - prequelPages: p.1~5 (스크립트된 도입부)
 * - chapterPages: p.6~160 (10개 챕터 × 16페이지)
 * - 각 페이지는 이전 페이지에서 어떤 선택을 했는지에 따라
 *   자연스럽게 이어지는 서사를 가진다.
 */

export type PageNarrative = {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly closingHook: string  // 마지막 문장 — 다음 선택지와 자연스럽게 연결
  readonly narrativeFunction: string
}

// ─── 프롤로그 (p.1~5) ────────────────────────────────────

const prequels: readonly PageNarrative[] = [
  {
    id: "p_0001",
    title: "이상한 책이 펼쳐졌다",
    body: `어느 날 아침, 평범한 빵집에서 일어난 일이다.
당신은 반죽을 치대다 손에 낯선 책이 들려 있는 걸 발견했다.
표지에는 바게트가 칼처럼 빛나는 그림이 있었고, 첫 장을 넘기자 빵 냄새가 아닌 화약 냄새가 올라왔다.

"읽어야 해. 끝까지."
책 속 글자가 스스로 움직였다.

당신은 빵집 주인이 아니다. 이 책의 독자이자, 이 세계의 다음 행동자다.
바게트 하나가 손에 쥐어졌다. 따뜻했다. 살아 있는 것처럼.`,
    closingHook: "책장이 스스로 넘어간다. 세 갈래 길이 보인다.",
    narrativeFunction: "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다.",
  },
  {
    id: "p_0002",
    title: "무기고 앞",
    body: `무기고 문은 빵반죽으로 봉인되어 있었다.
안에서는 칼을 가는 소리가 났다. 아니, 빵을 써는 소리인가?
문을 밀자 녹슨 빵칼들이 벽에 걸려 있었고, 가운데 낡은 갑옷 하나가 당신을 기다리듯 서 있었다.

갑옷 안에서 바스락거리는 소리가 났다.
"누구... 거기 누구 없소?"
떨리는 목소리. 갑옷 안에 누군가 숨어 있었다.`,
    closingHook: "갑옷 속 목소리가 당신의 선택을 기다리고 있다.",
    narrativeFunction: "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다.",
  },
  {
    id: "p_0003",
    title: "술집 '마지막 한 모금'",
    body: `술집 간판에는 '마지막 한 모금'이라고 적혀 있었다.
문을 열자 맥주 냄새와 빵 냄새가 섞여 올라왔다.
바텐더는 빵효모로 만든 맥주를 따르고 있었고, 구석에서 문지기 복장을 한 사내가 혼자 중얼거렸다.

"이름을 대시오. 아니면 돌아가시오."
그가 고개를 들었다. 눈이 책갈피처럼 얇고 날카로웠다.

당신의 대답에 따라 이 세계의 첫 번째 문이 열린다.`,
    closingHook: "문지기의 손이 창자루를 쥐었다. 당신의 다음 말을 듣고 싶다는 눈빛이다.",
    narrativeFunction: "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다.",
  },
  {
    id: "p_0004",
    title: "마들렌의 노점",
    body: `항구 앞 노점에서 마들렌이라는 여인이 빵을 팔고 있었다.
그녀의 수레에는 평범하지 않은 빵이 있었다 — 글자가 새겨진 빵, 지도가 그려진 빵, 그리고 아직 부풀지 않은 빵.

"새로운 독자구나."
마들렌이 당신 손의 바게트를 보고 말했다.
"그 검은 용도가 정해져 있지 않아. 네가 어떻게 쓰느냐에 따라 칼이 되기도, 식탁 위 빵이 되기도 하지."

그녀가 항구 쪽을 가리켰다. 식빵 방패병 하나가 포자 덫에 걸려 신음하고 있었다.`,
    closingHook: "방패병의 신음 소리가 점점 커진다. 결정해야 할 때다.",
    narrativeFunction: "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다.",
  },
  {
    id: "p_0005",
    title: "항구의 첫 선택",
    body: `크루아상 항구는 전쟁 직전의 마을이었다.
곰팡이 배가 부두에 정박해 있고, 책갈피 문지기가 숲 입구를 막고 있었다.
마들렌이 속삭였다. "이 세계는 네가 만든 것이 아니야. 하지만 네가 바꿀 수는 있어."

왕실 오븐이 멀리서 붉게 빛났다. 과열되고 있다는 소문이 돌고 있었다.
시장에서는 기사단 암호가 적힌 가격표가 거래되고 있었다.
그리고 당신 손의 바게트가 따뜻하게 진동했다.`,
    closingHook: "바게트가 가리키는 방향, 마들렌이 알려준 세 갈래 길. 어디로 가겠는가?",
    narrativeFunction: "낯선 빵마을에서 내가 한 행동이 다음 사람의 길을 바꾼다.",
  },
]

// ─── 챕터별 페이지 생성기 ──────────────────────────────────
// 각 챕터(16페이지)는 4파트로 구성:
// Part 1 (4p): 진입 — 이전 챕터에서 넘어온 상황 적응
// Part 2 (4p): 전개 — 챕터의 핵심 갈등 표면화
// Part 3 (4p): 절정 — 동맹/위협/단서의 본질과 마주함
// Part 4 (4p): 전환 — 해결 또는 다음 챕터로의 연결

export type ChapterNarrativeData = {
  readonly chapterIndex: number  // 0~9
  readonly arc: string
  readonly location: string
  readonly pages: readonly PageNarrative[]  // 정확히 16개
}

/**
 * 전체 페이지 네러티브를 조립한다.
 * 프롤로그(5) + 챕터×16(160) = 165개 스토리 페이지
 */
export function getAllPageNarratives(
  chapterData: readonly ChapterNarrativeData[],
): ReadonlyMap<number, PageNarrative> {
  const map = new Map<number, PageNarrative>()

  // 프롤로그
  for (const p of prequels) {
    const num = parseInt(p.id.replace("p_", ""), 10)
    map.set(num, p)
  }

  // 챕터
  for (const chapter of chapterData) {
    const startPage = 6 + chapter.chapterIndex * 16
    for (let i = 0; i < chapter.pages.length; i++) {
      const pageNum = startPage + i
      const page = chapter.pages[i]
      if (page) map.set(pageNum, page)
    }
  }

  return map
}

/**
 * 페이지 번호로 네러티브를 가져온다.
 * 없으면 undefined 반환 (템플릿 폴백은 storyWorld.ts에서 처리)
 */
export function getPageNarrative(
  map: ReadonlyMap<number, PageNarrative>,
  pageNumber: number,
): PageNarrative | undefined {
  return map.get(pageNumber)
}
