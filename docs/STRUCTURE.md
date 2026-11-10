# 화풍공방 구조

사용자 2026-11-10: 「구조화 방안 좀 생각해줘. 확장성을 고려해서」 → 「만드는 의의는 지금 부품구조를 테스트 해보려고 … 이미지 생성은 gpt 세션쪽에 … 세션마다 텍스트 제한이 있어서 이미지 생성은 끊어가며 할거야. 그래서 저장구조와 검색구조에 신경을 써야되는데」 → 「응 그렇게 만들어줘」.

세 가지를 지킨다.
- 세션은 **일감 하나만** 읽고 끝낼 수 있다(칸 4개, 지시문이 다 들어 있다).
- 상태는 **파일이 있는지**로 안다 — 세션끼리 같은 파일을 고치지 않는다(그림 한 장에 기록 하나).
- 색인은 **워크플로가 다시 짓는다** — 사람도 세션도 고치지 않는다.

## 1. 이름

| 대상 | 꼴 | 예 |
|---|---|---|
| 부품 | `축/열쇠@판` | `face/semi_soft@v1` |
| 조합 | 축 차례(방향 · 얼굴 · 채색 · 빛 · 이펙트)로 `코드 + 판 번호`, `-` 로 | `km1-ss1-sm1-mu1-xf1` |
| 캐릭터 | `공방.이름` | `sam.wenyang` · `el.fe` |
| 칸 | `<조합>__<캐릭터>__<세계>-<갈래>[-<노출>]` | `km1-ss1-sm1-mu1-xf1__sam.wenyang__samguk-world` |
| 그림 | `<칸>__<모델>__<번호>` | `…__samguk-world__chatgpt__1` |

- 부품 판이 조합 이름에 들어간다 — 부품을 고쳐도 옛 그림과 이름이 겹치지 않는다.
- 노출은 캐릭터 기본값(bold)이 아닐 때만 붙는다(`-moderate` · `-low`).
- 모델: `chatgpt`(GPT 세션) · `api26` · `api25` — 세션 그림과 API 그림을 섞지 않는다(사용자: 세션이 하관을 길게, 눈을 째지게 그리는 경향).
- 번호는 같은 칸을 여러 장 그릴 때(`make-job --repeat`) — 한 장의 운인지 경향인지 보려고.

## 2. 부품 · 조합 · 캐릭터

- `data/parts.json` — 축 다섯, 축마다 부품. 부품 = `code` · `ko` · `current` · `versions[{v, text, avoid?, models?, worlds?}]` · `only?`.
  - 화풍 문단 = 방향 + 얼굴 + 채색(이 차례 — 나라 말이 앞에 올 때 얼굴에 가장 먹혔다). 빛 줄 = `Light: ` + 빛 + 이펙트.
  - `only` — 같이 쓸 수 있는 다른 축 부품. 어긴 조합은 「짝 안 맞음」(지시문을 짓지 않는다).
  - `models.<모델>` · `worlds.<세계>` — 그 모델 · 세계에서만 다른 글(예: 메카 빛).
  - 처음 판은 삼국지 공방 새 화풍 열(2026-11-10)을 축별로 끊은 것 — 원본 문장과 글자가 같지는 않다.
- `data/recipes.json` — 이름 붙인 조합만. 이름 없이도 조합 이름(`km1-…`)으로 어디서나 쓸 수 있다.
- `data/subjects/<id>.json` — 시험 캐릭터 복사본. 세계마다 `head` · `faceFrame` · `character[]` · `costume[]` · `exposure{bold,moderate,low}` · `scene[]` · `constraints[]`, 출처(공방 · 커밋 · 날짜). 화풍 말(Style · Light · Mood)은 빼고 담는다. 목록 `data/subjects/index.json`.
- 지시문(`lib/build.js` build) — 머리말 / `1. STYLE`(화풍 문단 + 얼굴 비율) / `2. CHARACTER` / `3. COSTUME AND EQUIPMENT — 장르`(+ 노출) / `4. SCENE`(구도 앞에 빛 줄) / `5. CONSTRAINTS`(+ 부품의 피할 것).

## 3. 일감 · 수거

```
여기(코드)                       그림 저장소                                 GPT 세션
make-job ──────────────────────▶ jobs/<일감>/REQUEST.md · slots.json · prompts/
                                 jobs/NEXT.md ◀── 수거가 다시 씀
                                                       ◀────────────────── NEXT.md → 일감 하나 → 그림
                                 inbox/<그림 이름>.png ◀──────────────────── 올림(main push)
                                 수거 워크플로(tools/ingest.py)
                                   → img/<캐릭터>/<세계>/<그림>.webp · thumb/… · rec/<그림>.json
                                   → index/images.json · blocked.json · pending.json · problems.json · jobs/NEXT.md
```

- `make-job` — 칸을 정하는 길 둘: `--recipes a,b` · `--base <조합> --vary <축>[=k1,k2]`. 캐릭터 · 세계 여럿 가능. 이미 그린 칸 · 열린 일감에 있는 칸은 빠진다(`--repeat` 면 번호를 올려 다시). 칸 4개씩 끊는다(`--size`).
- 일감 이름 `j0001[-label]` — 차례대로. 일감 폴더는 지우지 않는다(기록이 가리킨다).
- 세션이 올리는 것: 그림(png · webp · jpg) · `<그림>.blocked.txt`(거절 문구) · `<그림>.note.txt`(메모, 선택).
- 수거 — 2:3 이면 1024×1536 으로 맞추고(아니면 그대로 · 기록에 남김) webp 90 · 썸네일(긴 변 512) · 기록. 모르는 이름 · 이미 있는 그림은 inbox 에 두고 `index/problems.json` · NEXT.md 에 적는다(덮지 않는다). 그때 워크플로가 빨갛게 끝난다.
- 끊겨도 된다: 올라간 그림만 끝난 칸. 다음 세션이 같은 일감을 열면 `rec/` 에 없는 칸만 그린다.

## 4. 검색

- `index/images.json` — `{cols, rows}`, 그림 한 장에 한 줄: id · subject · world · kind · exposure · model · n · recipe · direction · face · paint · light · fx(부품은 `열쇠@판`) · job · added · rating. 5천 장을 넘으면 캐릭터별로 쪼갠다.
- `tools/find.cjs` — 조건으로 거르기(`--face semi_soft --world samguk`, 판까지면 `semi_soft@v1`) · 빈 칸(`--gaps --base … --vary …` → 있음 · 막힘 · 일감에 있음 · 비었음 · 짝 안 맞음).
- 화면 `index.html` — 그림 찾기(칩) · 축 비교(기준 조합 + 축 → 한 줄, 빈 칸 채우는 명령) · 섞어보기(부품 고르면 지시문 · 조합 이름 · 짝 검사) · 일감(NEXT.md). 그림 저장소는 raw.githubusercontent 에서 읽는다(`?img=` 로 바꿀 수 있다).

## 5. 시험하는 차례(사용자 2026-11-10 — 다 그리지 않고 줄여서)

1. 축 훑기 — 기준 조합 하나에서 한 축씩(`--vary`). 축마다 부품 수만큼.
2. 살아남은 것끼리 — 축마다 마음에 든 2~3개만 곱한다.
3. 세계 넓히기 — 고른 5~6개만 다른 세계로.

말 되는 조합 수는 `node tests/build.cjs` 가 찍는다(부품 · 짝 규칙이 늘면 바뀐다).

## 6. 아직 없는 것

- 일상컷(근거리 · 원거리) — 세계 그림을 첨부해 고치는 꼴이라 일감에 「첨부 그림」 칸이 있어야 한다. 갈래 이름은 `casual` · `far` 로 자리만 잡아 뒀다(`lib/build.js` KINDS).
- 평 매기기 화면 — 지금은 `rec/<그림>.json` 의 `rating` 을 손으로(Claude 에게 말하면 적는다).
