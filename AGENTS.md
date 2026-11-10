# 화풍공방 — 지켜야 할 것

화풍 부품 구조(방향 · 얼굴 · 채색 · 빛 · 이펙트)를 시험하는 곳이다(사용자 2026-11-10 「만드는 의의는 지금 부품구조를 테스트 해보려고 만드는거야. 다른 공방의 구조는 안건들여」).

1. **다른 공방은 읽기만 한다.** 시험 캐릭터는 `tools/import-subject.cjs` 로 옆 공방(sam-atelier · element-atelier)을 읽어 `data/subjects/` 에 복사본을 둔다. 그 공방 파일 · 그림 저장소에는 쓰지 않는다. 가져오는 것은 부품에 없는 데이터(설계 외형 · 실루엣 · 세계 · 무기 · 노출)뿐, 모든 캐릭터가 아니라 시험용 몇만.
2. **부품을 고치면 판을 올린다.** `data/parts.json` 의 그 부품 `versions` 에 새 판을 더하고 `current` 를 바꾼다. 옛 판은 지우지 않는다 — 옛 그림 기록이 그 판을 가리킨다. 부품 글은 영어 한 문장(들), 줄바꿈 없이.
3. **그림은 대부분 GPT 세션이 그린다**(사용자 「토큰때문에 거의 그쪽에 할거같아」). 여기서는 일감만 만든다: `node tools/make-job.cjs …` → 그림 저장소 `jobs/` 에 칸 4개씩. 세션은 `jobs/NEXT.md` → 「예약」 칸이 빈 일감 하나 → `jobs/<일감>/CLAIM.md` 를 새로 만들어 예약 → 그 `REQUEST.md` 만 읽고 `inbox/` 에 올린다. 지시문은 여기서 다 지어 넣는다 — 세션은 고치지 않는다.
4. **그림 저장소의 `index/` · `jobs/NEXT.md` · `rec/` 는 손으로 고치지 않는다.** 수거 워크플로(`tools/ingest.py`)가 파일만 보고 다시 짓는다. 평을 매기는 것만 예외 — `rec/<그림>.json` 의 `rating`.
5. **덮어쓰지 않는다.** 같은 칸을 다시 그리려면 `make-job --repeat`(번호가 올라간다).
6. **막히면**: 세션은 같은 지시문으로 한 번 더 → 그래도 막히면 `.blocked.txt`. 여기서 `make-job … --exposure moderate`(그다음 `low`)로 새 일감 — 노출 말고 다른 말은 바꾸지 않는다. 그래도 막히면 멈추고 사용자에게 말한다.
7. **API 로 그릴 때**(사용자가 정할 때만) 장 수 · 출력 토큰(2.6 한 장 약 1,132 · 2.5 약 343)을 먼저 말한다. `make-job --model api26` → `node tools/draw-api.cjs <일감>` → `python3 tools/ingest.py` → 그림 저장소 push. 키는 환경 변수 `OPENAI_API_KEY`(사용자가 Claude Code 세션 환경에 넣어 둔 GPT API 키 — 여러 세션이 같이 쓴다)로만 — 값을 찍지 않는다. 누적 장 수는 세지 않는다.
8. **검사** — 밀기 전에 `node tests/build.cjs` · `python3 tests/ingest.py`(Pillow 필요). 고쳤으면 `docs/PATCH.md` 맨 위에 한 칸.
9. **git** — main 에 바로 민다(PR 없음). 강제 push · 이력 고쳐 쓰기 없음. 밀기 전에 `git pull --rebase origin main`. 그림 저장소와 함께 바꿀 때는 코드 저장소 먼저(워크플로가 코드 저장소 도구를 받아 쓴다).
