# core — 공방 공통 지시문 문구

사용자 2026-11-11 「프롬포트 생성 관련 테스트나 문구관리를 하나의 공방에서 관리는 못하나. 각 공방 생성기에서도 그 문구 그대로 쓰고?」 → 「응 원소 글로 하고 core v1 만들어줘」.

- `v<N>/vocab.json` — **원본**(가장 새 판이 지금 쓰는 글, 옛 판은 얼려 둔다). 얼굴 설계 낱말(`FACE_DESIGN` — head 빼고), 표정 표(`EXPRESSION_DETAIL`), 외형 낱말(`VOCAB_EN`)의 영어 글. 한 번 낸 판은 고치지 않는다 — 바꿀 땐 `v2/` 를 새로 만든다.
- `sync.cjs` — 원본을 공방의 `lib/prompt-spec.js`(FACE_DESIGN · EXPRESSION_DETAIL) · `lib/look-spec.js`(VOCAB_EN) 끝 「core:v<N>」 블록으로 옮긴다(판을 안 주면 가장 새 판). `look-spec.js` 가 없는 공방(포켓몬 · 게임 · 책 — VOCAB_EN 이 prompt-spec.js 안)은 `prompt-spec.js` 에 셋을 한 블록으로. **공방에 이미 있는 열쇠만 덮는다** — 공통 열쇠는 core 글, 공방에만 있는 열쇠는 그 공방 글.
  - `node core/sync.cjs ../sam-atelier ../element-atelier` — 옮기기
  - `node core/sync.cjs ../sam-atelier --check` — 같은지 보기(공방 `tests/core-sync.cjs` 가 이걸 부른다)
- 칸 꼴 틀(`FRAME`, v4~)은 블록이 `AtelierSpec.CORE_FRAME` 에 통째로 둔다 — 칸 꼴로 짓는 공방(삼국지 · 원소)의 조립부가 칸 머리 · 해부 줄 · Avoid 줄을 여기서 읽는다.
- 공방 생성기 · 도구 · 검사는 제 파일만 읽어도 core 글을 쓴다(브라우저도 node 도). 블록 안은 손으로 고치지 않는다.

v1 기준: 공방마다 다른 열쇠는 고친 쪽 글(삼국지 — 표정 표 11-03 「표정 문구가 과하게」, 나이 줄), `golden_tan` 은 원소 글(`light warm-beige skin with a golden undertone`). 지금 쓰는 공방: 삼국지 · 원소 · 포켓몬 · 게임 · 책(2026-11-11 — 셋은 표정 표 32개가 core 글로 바뀌고, 게임 · 책의 VOCAB_EN 공통 열쇠는 이미 같았다). 신화는 낱말표 · 표정 표가 없어 옮길 것이 없다. 다음: 칸 꼴 틀(`frame`) · 공통 규칙 줄(`rules`) — `docs/STRUCTURE.md` 「core」 절 · 감사 보고서 설계안.

## 판

| 판 | 날짜 | 바꾼 것 |
|---|---|---|
| v1 | 2026-11-11 | 처음 — 공방마다 다른 열쇠를 하나로(삼국지 글 기준, golden_tan 은 원소 글) |
| v2 | 2026-11-11 | `VOCAB_EN.face_shape.long` 「long face」 → 「gently long oval face」(감사 E2 · X9, 원소 금 판타지 두 쌍 시험 — 사용자 「넣어주고」). 눈 small · 인상 fierce 는 그대로(「그대로 두고」), 눈 크기 ↔ 모양 모순은 공방 설계값에서 고친다(「설계값 모순만 바꿔줘」 — 원소 23자리, 삼국지는 11-10 에 이미) |
| v3 | 2026-11-11 | `face_shape.square_soft` → 「softly squared face with a rounded jaw」, `face_shape.angular` → 「refined face with a clean, softly tapered outline」, `lips.wide_smile` → 「a wide mouth with softly upturned corners」(감사 E2 · S8 · G3 · B4, 한 쌍씩 시험에서 그림 차이는 거의 없음 — 부딪히는 말 정리, 사용자 「정리하는 김에 깔끔하게」). 원소 눈꼬리 모순은 설계값에서(삼국지와 같은 짝) |
| v4 | 2026-11-11 | `FRAME` 더함 — 칸 꼴 틀(머리말 → 1 STYLE → 2 CHARACTER → 3 {costume} — {genre} → 4 SCENE → 5 CONSTRAINTS + `Avoid: {list}.`, 해부 줄). 공방은 `AtelierSpec.CORE_FRAME` 으로 읽는다(덮지 않고 통째). 삼국지 기본 화풍 칸 꼴이 이 틀을 읽고(지시문 837개 그대로), 원소 기본 화풍이 짧은 판 → 칸 꼴(같은 열쇠, 사용자 「응 네 안대로 하고 기존 화풍 열쇠로 해줘」). 낱말은 v3 그대로 |
