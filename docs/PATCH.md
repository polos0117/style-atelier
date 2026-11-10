# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를 가운뎃점으로 나눈다.
그 아래 `-` 줄에 `파일 — 왜/무엇` 을 하나씩. 날짜는 `2026-11-10` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.

## 2026-11-10 · claude · 화풍공방을 세웠다 — 부품 · 조합 · 시험 캐릭터 · 일감 · 수거 · 색인 · 화면
- 사용자 「구조화 방안 좀 생각해줘. 확장성을 고려해서」 → 「만드는 의의는 지금 부품구조를 테스트 해보려고 … 저장구조와 검색구조에 신경을 써야되는데」 → 「응 그렇게 만들어줘」
- `data/parts.json` — 축 다섯(방향 8 · 얼굴 7 · 채색 10 · 빛 10 · 이펙트 4), 삼국지 공방 새 화풍 열(2026-11-10)을 축별로 끊었다. 짝 규칙(only)으로 말 되는 조합 6,240
- `data/recipes.json` — 그 열 화풍을 조합으로. `data/subjects/` — 문앙(sam-atelier@4bc7624) · 철(element-atelier@74eb6d8) 복사본(읽기만)
- `lib/build.js` 조립부 · `tools/import-subject.cjs` · `tools/make-job.cjs` · `tools/ingest.py` · `tools/find.cjs` · `index.html` · `tests/` · `docs/STRUCTURE.md`
