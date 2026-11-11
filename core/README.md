# core — 공방 공통 지시문 문구

사용자 2026-11-11 「프롬포트 생성 관련 테스트나 문구관리를 하나의 공방에서 관리는 못하나. 각 공방 생성기에서도 그 문구 그대로 쓰고?」 → 「응 원소 글로 하고 core v1 만들어줘」.

- `v1/vocab.json` — **원본.** 얼굴 설계 낱말(`FACE_DESIGN` — head 빼고), 표정 표(`EXPRESSION_DETAIL`), 외형 낱말(`VOCAB_EN`)의 영어 글. 한 번 낸 판은 고치지 않는다 — 바꿀 땐 `v2/` 를 새로 만든다.
- `sync.cjs` — 원본을 공방의 `lib/prompt-spec.js`(FACE_DESIGN · EXPRESSION_DETAIL) · `lib/look-spec.js`(VOCAB_EN) 끝 「core:v1」 블록으로 옮긴다. `look-spec.js` 가 없는 공방(포켓몬 · 게임 · 책 — VOCAB_EN 이 prompt-spec.js 안)은 `prompt-spec.js` 에 셋을 한 블록으로. **공방에 이미 있는 열쇠만 덮는다** — 공통 열쇠는 core 글, 공방에만 있는 열쇠는 그 공방 글.
  - `node core/sync.cjs ../sam-atelier ../element-atelier` — 옮기기
  - `node core/sync.cjs ../sam-atelier --check` — 같은지 보기(공방 `tests/core-sync.cjs` 가 이걸 부른다)
- 공방 생성기 · 도구 · 검사는 제 파일만 읽어도 core 글을 쓴다(브라우저도 node 도). 블록 안은 손으로 고치지 않는다.

v1 기준: 공방마다 다른 열쇠는 고친 쪽 글(삼국지 — 표정 표 11-03 「표정 문구가 과하게」, 나이 줄), `golden_tan` 은 원소 글(`light warm-beige skin with a golden undertone`). 지금 쓰는 공방: 삼국지 · 원소 · 포켓몬 · 게임 · 책(2026-11-11 — 셋은 표정 표 32개가 core 글로 바뀌고, 게임 · 책의 VOCAB_EN 공통 열쇠는 이미 같았다). 신화는 낱말표 · 표정 표가 없어 옮길 것이 없다. 다음: 칸 꼴 틀(`frame`) · 공통 규칙 줄(`rules`) — `docs/STRUCTURE.md` 「core」 절 · 감사 보고서 설계안.
