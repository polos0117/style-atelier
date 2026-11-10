# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를 가운뎃점으로 나눈다.
그 아래 `-` 줄에 `파일 — 왜/무엇` 을 하나씩. 날짜는 `2026-11-10` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.

## 2026-11-10 · claude · 화면 머리에 공방 지도로 돌아가는 길
- `index.html` — 「← 공방 지도」(허브 이미지 공방 방의 둘째 문 · 모든 공방 아래 줄에서 들어온다, 사용자 「style 공방도 허브에서 들어갈 수 있게 메뉴 만들어줘」)

## 2026-11-10 · claude · API 로 일감 그리기 — draw-api 와 생성 정보 기록
- 사용자 「키는 클로드코드의 여러 세션에서 gpt api 도구를 위한 키야. 여기서도 쓰니까 넣어둔거고」 — `tools/draw-api.cjs`(api26 · api25 일감의 빈 칸을 OPENAI_API_KEY 로, 막히면 한 번 더 → .blocked.txt)
- `tools/ingest.py` — inbox 의 `<그림>.gen.json` 을 기록 `generation` 으로, NEXT.md 는 GPT 세션에게 chatgpt 일감만
- `tests/ingest.py` · `AGENTS.md` 7절 · `docs/STRUCTURE.md` 3절 · README

## 2026-11-10 · claude · 화풍공방을 세웠다 — 부품 · 조합 · 시험 캐릭터 · 일감 · 수거 · 색인 · 화면
- 사용자 「구조화 방안 좀 생각해줘. 확장성을 고려해서」 → 「만드는 의의는 지금 부품구조를 테스트 해보려고 … 저장구조와 검색구조에 신경을 써야되는데」 → 「응 그렇게 만들어줘」
- `data/parts.json` — 축 다섯(방향 8 · 얼굴 7 · 채색 10 · 빛 10 · 이펙트 4), 삼국지 공방 새 화풍 열(2026-11-10)을 축별로 끊었다. 짝 규칙(only)으로 말 되는 조합 6,240
- `data/recipes.json` — 그 열 화풍을 조합으로. `data/subjects/` — 문앙(sam-atelier@4bc7624) · 철(element-atelier@74eb6d8) 복사본(읽기만)
- `lib/build.js` 조립부 · `tools/import-subject.cjs` · `tools/make-job.cjs` · `tools/ingest.py` · `tools/find.cjs` · `index.html` · `tests/` · `docs/STRUCTURE.md`
