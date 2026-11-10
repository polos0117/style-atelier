# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를 가운뎃점으로 나눈다.
그 아래 `-` 줄에 `파일 — 왜/무엇` 을 하나씩. 날짜는 `2026-11-10` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.

## 2026-11-10 · claude · 나라 말 없는 애니 · 3D 애니메이션을 내리고 3D 도 일본 · 한국으로
- 사용자 「애니 나라없음은 빼자」 → 「아 3d 애니메이션도 지정을 일본,한국 나눠서 해줘. 지금 없음값 내려주고」
- `data/parts.json` — 방향 anime · film3d 에 retired(이미 받은 그림이 가리켜 지우지 않는다), 새 방향 jp_film3d(일본 3D 애니메이션) · kr_film3d(한국 3D 애니메이션)
- `data/recipes.json` — anime_brush · anime_matte · styl3d 에 retired, 새 조합 styl3d_jp · styl3d_kr. 말 되는 조합 9,264 → 8,832
- `lib/build.js` live · liveRecipes · retiredIn — 내린 부품 · 조합은 말 되는 조합 · make-job(거절) · find --gaps · 섞어보기 · 축 비교 · 기준 조합에서 빠지고, 그림 찾기 · 상세(「내림」 표시)에는 남는다. 검사 둘

## 2026-11-10 · claude · 초점 — 지금은 문앙 무협만 그린다
- 사용자 「네가 내 의도를 잘못파악하고 있는거 같으니까 다시 얘기할게. 지금 의도가 화풍비교가 우선이지? 그러려면 케릭터 통일성이 중요하겠지? 그러니까 문앙 무협으로만 그리도록 지시해줘」
- `data/focus.json`(sam.wenyang · samguk) — `tools/make-job.cjs` 기본값, 그 밖은 `--off-focus` 없이 안 만든다. `--hold <일감> --why`(손대지 않은 일감 내리기 — 지우지 않고 retired · hold)
- `tools/ingest.py` NEXT.md 첫 줄에 「지금은 문앙 · 무협만」, `index.html` 축 비교 · 섞어보기 기본값. `AGENTS.md` 0 · `docs/STRUCTURE.md` 0절 · `tests/ingest.py`

## 2026-11-10 · claude · 일감을 크게 — 칸 10개까지, 손대지 않은 일감 다시 묶기
- 사용자 「우선 지금 2번까지는 맡겨놨는데 4장보다 한 번에 맡기는 양 더 늘려도 돼」
- `tools/make-job.cjs` — 기본 칸 수 4 → 10, `--merge all`(예약 · 그림이 없는 일감을 차수 · 모델 · 캐릭터별로 고르게 다시 묶고 옛 일감엔 retired · merged_into), 합쳐진 일감의 REQUEST.md 는 안내 한 줄
- `tools/ingest.py` — retired 일감은 NEXT.md · 수거에서 뺀다. `tests/ingest.py` · `docs/STRUCTURE.md` 3절

## 2026-11-10 · claude · 수거 워크플로를 inbox 그림에만 — 예약 직후 main 을 밀어 세션이 멈췄다
- 사용자 「두개다 멈춰있어. 그리고 여기 작업은 codex 세션이 아니라 일반 gpt chat 세션이야」 — 세션이 CLAIM.md 를 올리자 수거 워크플로(jobs/** 에도 돌았다)가 곧바로 NEXT.md 를 고쳐 main 을 밀었고, 세션의 다음 커밋(GitHub 앱)이 거절 → 재시도 → Too many requests 로 보인다(커밋 차례로 본 짐작). 원소 쪽 워크플로는 img/*.webp 에만 돈다
- 그림 저장소 `.github/workflows/ingest.yml` — paths 를 inbox/** 만. `docs/STRUCTURE.md` 3절 — NEXT.md 예약 칸은 다음 수거 때 바뀐다, 진짜 잠금은 CLAIM.md

## 2026-11-10 · claude · 일감 문서 — 다른 공방처럼 WebP 로 바꿔 한 커밋에
- 사용자 「이미 다른 공방들은 chatGPT 세션에서 이미지 잘만 올리고 있는데 … 한번에 10장씩 올려도 안막히는데」 — 세션이 PNG 원본(장당 2~3MB)을 올리다 Too many requests 로 멈췄다. 삼국지 · 원소 GPT 세션은 WebP(수백 KB)를 한 커밋에 올린다
- `tools/make-job.cjs` REQUEST.md — WebP(품질 90, 1024×1536)로 바꿔 `inbox/<이름>.webp`, 칸을 다 그린 뒤 한 커밋(예약만 따로). 바로 앞에 넣은 「한 칸마다 push · 30초 쉬기 · 429 기다리기」 는 뺐다(속도 제한이 원인이라던 내 짐작이 틀렸다)
- `docs/STRUCTURE.md` 3절. 열린 일감 열둘 `--rewrite all`

## 2026-11-10 · claude · 일감 문서 — 묻지 않고 끝까지 · 크기 지정 · 한 칸씩 바로 올리기
- 사용자 「gpt쪽 작업이 둘 다 채팅창에 멈춰서 진행이 안되고있어」 — 삼국지 GPT 세션 안내(docs/IMAGE_AUTOMATION.md 0 · 4절)에 있던 말이 화풍공방 일감 문서엔 없었다
- `tools/make-job.cjs` REQUEST.md — 진행 방식(묻지 않고 끝까지 · 확인 기다리지 않기 · 올릴 수 없는 환경이면 예약 없이 바로 말하고 끝), 그리기(image_gen 크기 1024×1536 지정 · 칸 하나에 호출 한 번 · 한 칸마다 바로 push). 열린 일감 열둘을 `--rewrite all`
- `tools/ingest.py` NEXT.md 첫 줄에 「묻지 않고 끝까지」

## 2026-11-10 · claude · 애니 방향을 일본 · 한국으로 나눴다
- 사용자 「애니도 jp애니, kr애니 따로 구분해줘」
- `data/parts.json` — 방향 jp_anime(일본 애니) · kr_anime(한국 애니) · kr_gacha(한국 가챠 애니 — jp_gacha 의 짝). 옛 anime(나라 말 없음)은 비교 기준으로 남김(열린 일감이 쓴다). 방향 차례를 애니끼리 붙였다
- `data/recipes.json` — anime_brush_jp · _kr, anime_matte_jp · _kr, anime_gloss_kr(방향만 바꾼 것). 말 되는 조합 9,264

## 2026-11-10 · claude · 실사 축 — 시네마틱 CGI · 실사 사진 부품과 조합 둘
- 사용자 「방향이나 갈래에 실사축은 아예 없네」
- `data/parts.json` — 방향 cinematic_cgi · photo_still, 얼굴 cgi_ideal · real_natural, 채색 photoreal_cgi · photo, 빛 cine_hikey · cine_lowkey(삼국지 kv_cgi_hikey 문장을 축별로 끊은 것 + 사진). 짝 규칙으로 실사끼리만, 반실사 부드러운 얼굴은 포토리얼 CGI 표면과도(사이 칸)
- `data/recipes.json` — cgi_hikey · photo_real. 말 되는 조합 6,240 → 8,016

## 2026-11-10 · claude · 그림 보기 — 「N차 › 캐릭터」 검색 조건 · 상세(그림 아래 조합표)
- 사용자 「검색조건에 1차 > 문앙 , 2차 > 문앙, 1차 > 철 이런식으로해서 이미지 있는거 보여주고, 이미지 누르면 상세 내역을 보여줘 … 이미지랑 하단에 조합표」
- `index.html` — 검색 조건 칩(그림이 있는 차수 × 캐릭터만, 캐릭터 → 차수 차례) · 더 거르기 접음 · 상세 화면(그림 크게, 아래 조합표 · 그림 정보 · 지시문 전문, ‹ › · ← → · Esc, 주소 #img=)
- `tools/make-job.cjs` `--round` · `tools/ingest.py` 색인 `round` 열 · NEXT.md 차수 칸 · `tests/ingest.py` · `docs/STRUCTURE.md`

## 2026-11-10 · claude · 일감 예약 — CLAIM.md 로 같은 일감을 두 세션이 잡지 않게
- 사용자 「job 예약기능도 필요하겠다. 한 세션 끝날쯔음에 다른데서 시켰더니 같은 잡을 가져가네」
- `tools/make-job.cjs` — REQUEST.md 맨 앞에 예약 단계(`jobs/<일감>/CLAIM.md` 를 새 파일로, 있으면 다른 일감 · 이어받기는 끝에 두 줄), `--rewrite all` 로 옛 일감 REQUEST 를 새 꼴로
- `tools/ingest.py` — NEXT.md 에 「예약」 칸(— · 예약 중 · 예약 만료 120분, 시각은 그 파일 커밋 시각), 예약 중인 일감은 아래로
- `tests/ingest.py` · `docs/STRUCTURE.md` 3절 · `AGENTS.md` 3절

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
