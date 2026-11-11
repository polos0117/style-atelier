# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를 가운뎃점으로 나눈다.
그 아래 `-` 줄에 `파일 — 왜/무엇` 을 하나씩. 날짜는 `2026-11-10` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.

## 2026-11-11 · claude · 칠 부품 넷 새 판 — 칠한 결 펼치기 · 17차 일감
- 사용자 「응 일감 만들어줘」 — oil_brush v3(굵은 방향 붓 자국 · 장식은 붓질로 암시 · 덜 그림), brush_layered v3(겹친 붓질 · 얼굴만 또렷 · 바깥은 풀어짐), glossy_digital v2(큰 반사광 · 면은 단순 · 디테일 중간), smooth v3(에어브러시 · 붓 자국 없음 · 의상은 큰 모양만). 각 avoid
- 17차 j0091-r17-paint — 확정 화풍에서 칠만 바꾼 넷(km2-il2-ob3/bl3/gd2/sm3-rg2-x01) + 대조군 확정 화풍 #5

## 2026-11-11 · claude · 취향 메모 — 셀 · 매트 아님
- 사용자 「셀이랑 매트는 취향이 아니야」 — 16차 cg3 · ms3 은 방법 확인용으로만, 후보에 안 올림. 확정 10개는 칠한 결 쪽에서 보이는 흔적 꼴로 벌린다

## 2026-11-11 · claude · 16차 결과 — 보이는 흔적 꼴이 먹었다
- 사용자 「3번은 평소처럼, 1,2번은 셀 애니처럼 나왔어」 — cel_gradient v3 · matte_soft v3 로 가챠 · 매트 애니가 셀 애니로 벌어졌다(12차 cg2 · ms2 는 한국 게임 일러 동네). 대조군 그대로. STRUCTURE.md 「잘 먹는 지시의 꼴」 에 결과

## 2026-11-11 · claude · 칠 부품 새 판 — 보이는 흔적 · 디테일 기준 · 16차 일감
- 사용자 「응 가줘」 — cel_gradient v3(고른 외곽선 · 두 단계 명암 · 칼같은 그림자 · 작은 하이라이트 · 갑옷 · 천 · 장식은 깔끔한 평면, 칠한 일러보다 훨씬 덜 그림; avoid painterly texture · soft airbrushed gradients), matte_soft v3(얇은 외곽선 · 넓은 평면 색 · 그림자 한 톤 · 무광, 디테일 덜; avoid glossy · dense surface detail). medium 칸도 새 판에
- 16차 j0088-r16-visible — ja2-ag2-cg3-hp2-xs1 · jn2-aa2-ms3-oc1-x01 한 장씩 + 대조군 확정 화풍 #4

## 2026-11-11 · claude · 14차 평가 — 화풍 세기는 못 벌림
- 가챠 붓 칠(ja2-ag2-ba3) 없음 · B 취향 4 좋다 「1,3번이 잘나온듯」, 매트 애니 A 「너무 흐릿해서 별로」 내리기. 여섯 장 다 확정 화풍과 같은 동네 — 같은 말을 세게 하는 건 효과 없음, 보이는 흔적으로 쓰는 쪽으로

## 2026-11-11 · claude · 문서 — 잘 먹는 지시의 꼴
- 사용자 「이런 지시는 생각보다 잘먹네」 → 「응 적어줘」 — STRUCTURE.md 새 절: 보이는 것 · 좁은 범위 · 비교 기준 · 이름 붙은 한 줄 · Avoid, 부품 새 판 쓰는 법 다섯 줄, 14차 화풍 세기와 견줄 것

## 2026-11-11 · claude · 확정 화풍 카드 — 배경 + 피부 변주
- 사용자 「오 올려줘」 — kr_drawn_brush_rim.variants 셋째: canvas_rough@v2 + dewy_body@v1(15차 ~cr2=dw1 api26 세 장), 「화풍 문장 + 배경 · 피부 줄 복사」

## 2026-11-11 · claude · 배경 + 피부 함께 얹기 · 2.6 API 3장
- 사용자 「응 둘 다 얹은 것도 3장 그려줘」 — j0085-r15-canvas-dewy: 확정 화풍 × canvas_rough@v2 + dewy_body@v1(칸 꼬리 ~cr2=dw1), 문앙 무협 · 판타지 · 메카, 출력 3,396

## 2026-11-11 · claude · 확정 화풍 카드 — 피부 변주
- 사용자 「응 변주 붙여줘. 피부에 입체감이 더 생겼네」 — kr_drawn_brush_rim.variants 에 dewy_body@v1(15차 =dw1 api26 세 장)
- 변주가 bg · skin 둘 다 받는다(둘을 함께 얹어도 된다). 복사는 화풍 문단 → 피부 줄 → Light → 배경 줄 → Avoid. 검사도 피부 꼬리(=dw1)까지

## 2026-11-11 · claude · 피부 마감 층 · 몸 피부 물광(2.6 API 3장)
- 사용자 「인물의 피부쪽에만 물광같은 효과」 · 「얼굴은 빼고」 → 「응 3장 그려줘」 — data/skins.json dewy_body(dw) v1: 1칸 끝 Skin finish 줄(어깨 · 팔 · 쇄골 · 다리, 얼굴은 자연스럽게), avoid 얼굴 광 · 땀 · 기름 · 플라스틱 피부
- build skin() · 칸 이름 =dw1 · make-job --skin · 기록 skin · 색인 skin 열 · 화면 표시 · 검사
- 15차 j0084-r15-dewy — 확정 화풍 × 문앙 무협 · 판타지 · 메카, api26 3장 · 출력 3,396

## 2026-11-11 · claude · 화풍 세기 층 · 14차 시험 일감
- 12차 평가 — 9 kg 가챠 글로시 4 · 10 확정 + 로우키 4 · 5 2.3D 일러 3 좋다, 1 가챠 셀 「선명보다 살짝 거칠게」, 8 3D 칠 · 6 유화 프로모 2. 열 장이 한 동네로 모였다 — 화풍 문단이 지시문의 10% 남짓
- data/boosts.json — restate(+ra1, 5칸 끝 다시 말하기) · head_medium(+hm1, 머리말 「character image」 → 채색 medium). parts 채색 brush_anime v3 · matte_soft v2 · cel_gradient v2 에 medium 칸. build/make-job --boost · 기록 boost · 색인 boost 열 · 화면 표시 · 검사
- 14차 j0083-r14-boost(5장) — ja2-ag2-ba3-hp2-xs1(가챠 붓 칠) 없음 · A · B, jn2-aa2-ms2-oc1-x01(매트 애니) A · B(없음은 12차 #1)

## 2026-11-11 · claude · 확정 화풍 카드 — 배경 변주
- 사용자 「확정 화풍 카드에 배경 변주로 붙여줘」 — confirmed.json kr_drawn_brush_rim.variants: canvas_rough@v2, 대표 그림 무협 · 판타지 · 메카(13차 ~cr2 api26)
- 카드에 「변주 — 배경 · 거친 유화 붓질 캔버스」: 그림 셋(누르면 상세) · 배경 줄 · 화풍 문장 + 배경 줄 복사. 검사에 변주(판 고정 · 그림 칸 끝 ~cr2) 더함

## 2026-11-11 · claude · 배경 처리 canvas_rough v2 · 2.6 API 3장
- v1 은 판타지 · 메카에서 배경이 꼼꼼하게 그려져 효과가 약했다 → v2 「loosely blocked in with thick, rough oil brushstrokes and palette-knife marks, canvas weave showing through thin passages; the background stays less detailed than the figure」(사용자 「응 그려줘」)
- 13차 j0079-r13-canvas2 — 같은 세 장(~cr2), 출력 3,396. 하늘 · 행성 · 성벽에 두꺼운 붓 · 나이프 자국이 또렷, 인물 화풍은 그대로

## 2026-11-11 · claude · 배경 처리 층 · 확정 화풍 + 거친 유화 캔버스 배경(2.6 API 3장)
- 사용자 「우리 확정한 화풍에 뒷 배경을 유화캔버스위에 붓질을 거칠게한 느낌으로 세계이미지 만들어줘. 2.6api로」 — data/backgrounds.json 첫 항목 canvas_rough(cr) v1, 장면 Light 줄 뒤 「Background treatment: …」. 이펙트 축은 발광 · 블룸만이라 따로 층으로
- build.js background() · slotName/parseSlot 끝 ~cr1, make-job --bg, 기록 background · 색인 bg 열, 화면 상세 「배경 처리」 · 카드 표시, 검사 더함
- 13차 j0078-r13-canvas — kr_drawn_brush_rim × 문앙 무협 · 판타지 · 메카, api26 3장 · 출력 3,396

## 2026-11-11 · claude · 12차 펼치기 일감
- 사용자 「10개정도는 만들까했지」 → 「응 일감 만들어줘」 — 확정 화풍 10개를 목표로, 서로 먼 대표 10개를 한 장씩(j0077-r12-spread): anime_gloss_jp · anime_matte_jp · semi_paint_jp · semi_smooth · illus_23d · oil_hikey · anime_brush_kr · kk1-si1-p31-cl1(새) · kg2-ag2-gd1-rg2-xs1(새) · km2-il2-ba3-cl1(확정 화풍 + 로우키, 5차 한 장 뒤 #2)

## 2026-11-11 · claude · 확정 화풍 탭 — 범위 · 후보
- 사용자 「범위표시랑 후보칸 만들어줘」 — 카드마다 범위 표(캐릭터 × 세계, 그 조합 · 판 그림 수, 그림 색인에서 셈)
- 후보 칸 — confirmed.json candidates: kr_semi_oil_rim(km2-sp3-og4-rg2) · ln_drawn_oil(jl1-il2-og4-gs1) · kr_anime_brush(km2-aa2-ba3-gs1), 마지막 넷 중 확정 아닌 셋. 조합표 · 문장은 접어 둠. 검사도 후보까지

## 2026-11-11 · claude · 확정 화풍 — kr_drawn_brush_rim · 탭
- 사용자 「kr_drawn_brush_rim 으로 하고. 메뉴하나 더 만들어서 '확정화풍' 이라고 해서 키값,화풍명, 이미지 보이게」 — data/confirmed.json 첫 항목: kr_drawn_brush_rim = km2-il2-ba3-rg2-x01(판 고정), 대표 그림 무협 5차 #1 · 판타지 · 메카 11차 #1
- 화면 「확정 화풍」 탭 — 열쇠 · 화풍 이름 · 조합 이름 · 대표 그림 셋(누르면 상세) · 조합표 · 화풍 문장 복사 · 평가 평균. 검사에 확정 화풍 칸(판 고정 · 내린 부품 · 모순 · 대표 그림 이름) 더함

## 2026-11-11 · claude · 11차 — 등록한 화풍 넷을 문앙 판타지 · 메카로
- 사용자 「1번은 패스하고 2번부터 보자」 → 「응」 — 1단계 j0076-r11-worlds: ln_drawn_oil · kr_anime_brush · kr_drawn_brush_rim · kr_semi_oil_rim × 문앙 판타지 · 메카(노출 slit) 한 장씩 8장
- 문앙 복사본 판타지 의상 「a plumed helm or circlet」 → 「a circlet with a single white plume」(머리 장식 고정, 무협과 같은 까닭)
- 초점 밖 일감 표시 — REQUEST.md 첫머리 · NEXT.md 표 이름 칸에 「초점 밖 · 사용자가 정함」, NEXT.md 첫 줄에 예외 문장. 없으면 GPT 세션이 「문앙 무협만」 규칙에 걸려 멈춘다

## 2026-11-11 · claude · 10차 평가 — 반실사 v3 확정
- km2-sp3-og4-rg2 #3 · #4 반복 4 · 4, #4 취향 5 · 유지 5, #3 「얼굴이 달라진거 외에는 그림체는 통일된듯」 → 반실사 sp v3 확정. 대조군 애니 붓 반복 5 「그림체는 일정한듯. 나머지는 인물 외모 설계차이일듯」
- 남은 흔들림은 화풍이 아니라 캐릭터 얼굴(외모 설계) 쪽 — 화풍 비교 범위 밖으로 따로 다룬다

## 2026-11-11 · claude · 9차 평가 · 10차 일감 — 반실사 v3 만
- 9차 — 유화 v4 반복 4 · 4 「화풍 유지는 잘 된듯」 → 유화 v4 확정. 대조군 애니 붓 4 · 4(하늘 말 빼니 기준 돌아옴). 「구도가 앞으로 땅겨지고 하관이 길게」 는 라노벨 표지 방향(jl1) 쪽 짐작 — 지켜본다
- 사용자 「응 만들어줘」 — j0075-r10-semi: kr_semi_oil_rim(km2-sp3-og4-rg2) #3 · #4(하늘 말 없이), 대조군 kr_anime_brush #6

## 2026-11-11 · claude · 9차 일감 — 유화 v4 만
- 사용자 「응 9차 만들어줘」 — j0072-r9-oil: ln_drawn_oil(jl1-il2-og4-gs1 — 그린 얼굴 v2 + 유화 v4) × 2, 대조군 kr_anime_brush × 1. 시간 말 없음 · 머리 장식 고정

## 2026-11-11 · claude · 시간 말 빼기 · 그린 얼굴 v2 로 되돌림
- 8차 평가 — il3 「얼굴 느낌이 너무 이상해졌어」(취향 1) → il current v2, v3 은 dropped 로 기록만. 대조군 애니 붓이 하늘만 바뀌었는데 「얼굴 마다 느낌이 달라져서 애매함」 — 하늘 · 시간대가 그림 전체 톤을 바꿔 화풍 차이처럼 보였다
- 사용자 「시간 말은 빼긴 해야하는데」 — 문앙 무협 장면의 시간대 덮어쓰기를 지웠다(1~6차와 같은 조건). 머리 장식 고정은 그대로
- 앞으로 한 차수에 한 가지만 바꾸고 대조군(애니 붓) 한 장을 같이 그린다

## 2026-11-10 · claude · 얼굴 · 유화 부품 새 판 · 8차 일감
- 7차 둘째 평가 — 하늘은 맞았는데 얼굴이 「2d로 간 얼굴」 · 「2d-3d 왔다갔다」. 캐릭터 잡음을 걷어 낸 뒤라 원인은 부품 문장 — 유화가 얼굴 말(fine detail kept for the face)로 얼굴 축과 줄다리기, 얼굴 문장은 추상적. 사용자 「응 그렇게 해줘」
- 유화 og v4 — 얼굴 말 빼고 장신구만. 반실사 sp v3 — realistic proportions · softly modelled volume · refined slightly beyond life, avoid photographic skin texture · flat anime-style features. 그린 얼굴 il v3 — features reduced to clean, readable shapes · soft painted shading(눈 · 코 · 입 말은 얼굴 축 범위 검사에 걸려 뺐다 — 생김새는 캐릭터 몫)
- 문앙 무협 하늘 「clear daytime under a pale blue sky」 → 「soft hazy daylight under a pale, lightly clouded sky」(사용자 「오일쪽은 쨍한 오전보다는 5번 그림같은 분위기가 나은듯」)
- 8차 j0069-r8-face(6장) — 유화 두 조합 새 판 × 2, kr_drawn_brush_rim 새 il v3 × 1, kr_anime_brush × 1(장면만 바뀐 대조)

## 2026-11-10 · claude · 문앙 무협 시간대 고정 · 7차 둘째 일감
- 7차 평가 — 머리 장식은 잡혔고 남은 차이는 색감(낮 하늘 · 노을빛 배경). 장면에 시간 · 하늘 말이 없었다
- 사용자 A2 「응」 — 문앙 복사본 무협 World 줄 끝에 「seen in clear daytime under a pale blue sky」. 삼국지 공방은 그대로
- j0065-r7-daytime — 유화 두 조합 × 2장(#6 · #7)

## 2026-11-10 · claude · 문앙 머리 장식 고정 · 7차 반복 일감
- 6차 반복 평가(사용자 「평가 올렸어. 애매한건 놔뒀어」) — 붓 채색 조합은 반복 4~5, 유화(og3) 두 조합은 3 · 메모 「머리스타일 · 체형 · 얼굴」. 머리 차이는 캐릭터 문장의 「투구 또는 머리띠」 · 「details are free」 탓이라 화풍 비교를 흐렸다
- 사용자 「응 A 먼저 해줘」 — 문앙 복사본(무협만) 의상 줄 「a plumed helmet or a war headband」 → 「a war headband with a single white plume」. 삼국지 공방은 그대로. overrides 의 replace 에 worlds(그 세계만) 를 더했다
- make-job --times N(칸마다 N 장을 한 일감에), --merge 는 --dry 를 받으면 멈춘다(묶기가 바로 일어나던 것)
- 7차 j0064-r7-headband — 유화 두 조합(ln_drawn_oil · kr_semi_oil_rim) × 2장, 머리 장식 고정 뒤 반복 유지 보기

## 2026-11-10 · claude · 5차로 고른 화풍 넷 등록 · 6차는 반복(같은 문장 두 번 더)
- 사용자 「지금 한것도 5차지? 평가올렸어 그리고 이거 좋다. km2-il2-ba3-rg2-x01」 — 조명 새 판(muted v2 · rim_gloss v2)에서 파란 자국이 사라졌다(rim_gloss v2 는 두 조합에서 후보), 전역광은 네 조합 다 후보
- `data/recipes.json` — ln_drawn_oil(라이트노벨 · 그린 얼굴 · 유화 글레이즈 · 전역광) · kr_anime_brush(MMORPG · 애니 · 2D 붓질 · 전역광) · kr_drawn_brush_rim(MMORPG · 그린 얼굴 · 2D 붓질 · 림 라이트 — 사용자가 짚은 그림) · kr_semi_oil_rim(MMORPG · 반실사 · 유화 글레이즈 · 림 라이트)
- 6차 — 넷을 같은 문장으로 두 번 더(2 · 3번째 장, 노출 slit) — 반복 유지 평가용

## 2026-11-10 · claude · 조명 muted · rim_gloss 새 판 — 눈가 파란 자국
- 사용자 5차 평가 「고칠 것 — 눈 옆에 생긴 멍 같은 파란자국」 · 「이쁜데 얼굴 눈가에 생긴 파란색 색조」
- `data/parts.json` light/muted v2 · rim_gloss v2 — 얼굴 그림자는 따뜻하고 중성적으로(muted), 피부는 깨끗한 따뜻한 윤기 · 반사는 금속 · 장신구에(rim_gloss), avoid 「a blue or bruise-like tint on the skin around the eyes」
- j0058 보류 — 넷째 조합 일곱 + 셋째 조합 따뜻한 빛을 새 판으로, 앞 세 조합의 muted · rim_gloss 도 새 판으로 다시(고침 확인)

## 2026-11-10 · claude · 노출 slit(다리 라인) · 5차 — 4차 후보 넷 × 조명 일곱
- 사용자 「체크했어. 1차때처럼 다리라인 좀 더 보여야겠어」
- `data/subjects/sam.wenyang.overrides.json` — 문앙 세 세계에 노출 단계 slit(쇄골 · 팔 + 높은 트임으로 한쪽 다리 허벅지까지, 1차 bold 의 깊은 목선 · 맨어깨는 빼고). `data/focus.json` moderate → slit, `index.html` 섞어보기에 slit
- `tools/make-job.cjs` — 초점 노출은 그 캐릭터 · 세계에 그 단계가 있을 때만(철에는 slit 이 없다). 5차: 4차 후보(라이트노벨 · 그린 얼굴 · 유화 글레이즈 / MMORPG · 애니 · 2D 붓질 / MMORPG · 그린 얼굴 · 2D 붓질 / MMORPG · 반실사 · 유화 글레이즈) × 조명 muted + 2차 후보 여섯 — 28칸

## 2026-11-10 · claude · 화풍 비교 노출 moderate · 4차 작은 교차(방향 2 × 얼굴 3 × 렌더링 3)
- 사용자 「노출은 너무 low로 했나봐. 피부결 다리나 흉부쪽에 조금 보였으면 해」 · 「2d 쪽은 거의 편차가 없어서 좋은거 위주로만 했어」
- `data/focus.json` exposure low → moderate. 검사 · 문서
- 4차 — 2 · 3차 평가에서 두 기준 다 후보였던 것: 방향 kr_mmorpg · jp_light_novel × 얼굴 semi_paint · illustrated · anime_adult × 렌더링 oil_glaze · oil_brush · brush_anime, 조명 muted · 이펙트 미지정 고정 — 18칸. glossy_digital 은 반실사 내리기 · 애니 후보라 내리지 않았다(축 사이 영향)

## 2026-11-10 · claude · 2차 평가로 부품 다섯 내림 · 3차는 애니 기준에서 축 훑기
- 사용자 「우선 내릴것만 몇 개 체크해서 저장했어. 다음 일감 만들어줘」 — 2차 「내리기」 다섯: 방향 cinematic_cgi, 렌더링·채색 impasto · photoreal_cgi · photo · render3d
- `data/parts.json` — 다섯 내림 + photo_still(붙을 렌더링이 안 남아). `data/recipes.json` — cgi_hikey · photo_real · styl3d_jp · styl3d_kr 내림. 말 되는 조합 64,350. `tests/ingest.py` 내린 조합을 쓰던 시험을 살아 있는 조합으로
- 3차 — 기준 anime_gloss_jp(일본 가챠 · 가챠 애니 얼굴 · 2D 셀~그라데이션 · 하이키 파스텔 · 이펙트 부드럽게)에서 축 하나씩, 노출 low — 같은 부품이 반실사(2차)일 때와 애니일 때 어떻게 다르게 먹는지

## 2026-11-10 · claude · 재검토안(c432626) 반영 — 섞어보기 노출 · 평가 대기 보존 · 보류 일감 빈 칸 · 문장 넷 · 검사 범위
- 사용자 재검토안 「style-atelier 구조 개편 재검토안」(검토 기준 c432626) → 「이 내용 봐줄래? 다 안되어 있나?」 — 지적 셋(R1~R3) · 문장 넷 · 검사 범위가 다 맞았다
- R1 `index.html` 섞어보기 — 선택창과 조립에 같은 노출(고른 값 → focus → 캐릭터 기본값, 전엔 선택창 low · 지시문 bold). R2 — 평가 업로드를 차례로, 끝나면 보낸 값과 같은 대기만 지운다(전엔 대기 전체를 비워 올리는 중 저장 · 실패한 평가가 사라졌다). R3 `tools/find.cjs` --gaps 가 보류 · 합쳐진 일감을 세지 않는다
- `data/parts.json` — oil_glaze v3(Oil painting with smooth glazes), brush_anime v3(2D painting …), real_natural v3(not stylised → avoid), hikey_natural v2(never wash out → avoid). `tests/build.cjs` 담당 범위 검사를 살아 있는 부품의 지금 판 전부에(v1 도, 예외 없이), `tests/ingest.py` R3

## 2026-11-10 · claude · 평가 칸 — 그림 상세에서 다섯 항목 · 판정 · 메모, 코드 저장소 data/evals.json 에
- 사용자 「응 평가 칸 붙여줘」 — 검토안 7.5 의 다섯 항목(취향 · 의도 반영 · 캐릭터 유지 · 다른 특징 변화 · 반복 유지) + 판정(후보 · 고칠 것 · 축 사이 · 내리기) · 메모
- `lib/evals.js`(항목 · 검사 · 짧은 표시) · `data/evals.json` · `index.html` 상세 「평가」(GitHub 토큰이면 바로 커밋, 없으면 이 기기 대기 → 대기분 올리기), 카드 · 축 비교 칸 밑 표시
- `tools/find.cjs` --rated · --unrated · --verdict, 줄 끝에 평가. `tests/build.cjs` · `docs/STRUCTURE.md` 4.1절

## 2026-11-10 · claude · 노출 줄은 원래 Exposure 꼴로 되돌리고, 화풍 비교 노출은 low
- 사용자 「화풍쪽에는 바로 바꿔달라는게 아니라 이런 형식으로 쓰면 어떨까 물어본거였어 … 화풍공방쪽은 skin shown low 로 낮춰줘」 → 「아 잠깐만 미안. 그냥 exposure 로 쓰자」
- `data/subjects/sam.wenyang.overrides.json` — Skin shown 노출 덮어쓰기를 뺐다(문앙 노출 줄은 원래 Exposure (bold|moderate|low) 그대로). 조립부의 exposureConstraint 칸은 남겨 둔다(쓰는 복사본 없음)
- `data/focus.json` exposure none → low. 2차 일감(none)을 보류하고 low 로 다시. 삼국지 · 원소의 노출 줄은 바꾸지 않았다(고치던 것을 되돌림)

## 2026-11-10 · claude · 노출 줄을 「Skin shown:」 꼴로 — 드러나는 부위만, 지킴 말은 제약으로
- 사용자 「Skin shown: 이 지금 용도에 잘 맞습니다 … Skin shown: shoulders, arms, upper chest, and one thigh through a side slit. 이런식으로 쓰자」 — 「Exposure (bold)」 이름표는 사진 노출(밝기)로도 읽힌다
- `data/subjects/sam.wenyang.overrides.json` exposure · exposureConstraint — 문앙 세 세계 bold · moderate · low 를 부위 나열로, 「중요 부위 가림 · 갑옷 그대로 · 재질 · 색 그대로」 는 노출을 넣을 때만 5칸에(원본은 original.exposure)
- `tools/import-subject.cjs` 노출 덮어쓰기 · `lib/build.js` exposureConstraint · `tests/build.cjs`. 2차 일감(노출 none) 49칸 지시문은 그대로(해시 확인)

## 2026-11-10 · claude · 화풍 비교는 노출 줄 없이 — 노출 none
- 사용자 「bold 를 화풍비교에선 빼자. 이거는 의상이나 나중에 옵션으로 넣어도 화풍에는 영향이 없는 말이잖아」
- `lib/build.js` — 노출 none 이면 노출 줄을 넣지 않는다(칸 이름 끝 -none). `data/focus.json` exposure none — make-job · find --gaps · 화면 축 비교 · 섞어보기 기본값
- 2차 일감 아홉(bold)을 보류하고 노출 없이 다시 만든다. `tests` · `AGENTS.md` 0 · `docs/STRUCTURE.md` 0절

## 2026-11-10 · claude · 광택 부품 셋 — 유광 디지털 페인팅 · 핸드페인팅 텍스처 3D · 림 라이트 강한 하이라이트
- 사용자 「기존에 있던 gloosy 는 어떻게 대체 된거지?」 → 「응 셋 다 넣을거고」 — 삼국지 글로시 · MMORPG CG · 한국 MMORPG 프로모의 광택이 화풍공방에 거의 없었다
- `data/parts.json` — 렌더링·채색 glossy_digital · painted_3d, 조명·색조 rim_gloss. 2차 축 훑기에 세 칸 더(일감 하나)

## 2026-11-10 · claude · 일감 칸을 고르게 나눈다 · 2차 축 훑기 일감
- `tools/make-job.cjs` — 칸이 --size 를 넘으면 고르게(12칸 → 6 · 6, 10 · 2 가 아니라). `tests/ingest.py`
- 2차(새 문앙 공통 문구 · 부품 v2) 기준 semi_smooth 에서 축 하나씩 — 방향 12 · 얼굴 8 · 렌더링·채색 11 · 조명·색조 11 · 이펙트 4(기준 칸 1 포함 46칸, 일감 여덟). 실사 영화 방향은 기준 렌더링(디지털 페인팅)과 모순이라 빠졌다

## 2026-11-10 · claude · 부품 v2 — 축 담당 범위대로 문장 정리, 방향 둘 내리고 둘 더함, 짝은 추천 · 모순으로
- 사용자 v2 표 → 「classical, fantasy_paint는 내리자. 그리고 kr_game_keyart 추가해주고. jp_light_novel 을 키로 Japanese light novel cover artwork. 일본 라이트노벨 표지 추가해줘」
- `data/parts.json` — 방향 10 · 얼굴 8 · 렌더링 12 · 조명 6 부품에 v2(표현 방식은 렌더링·채색으로, 나이 · 크기 · 생김새는 캐릭터로, 부정 말은 avoid 로), 판마다 ko. 방향 classical · fantasy_paint 내림(조합 semi_oil_classic · semi_impasto 도), 새 방향 kr_game_keyart · jp_light_novel, 이펙트 off(없음 — avoid 억제), only → pairs(추천) · requires(모순)
- `lib/build.js` — clashes 는 requires 만, untested(추천 짝 밖 알림), recipeNameOf(판 무관 조합 이름). `index.html` 섞어보기에 검증 전 짝 · 조합 이름 찾기. `tools/make-job.cjs` 일감 기록에 pairs · requires · untested
- `tests/build.cjs` — 담당 범위 검사(방향에 재료 · 표현 방식 · 수식어, 얼굴에 나이 · 크기 · 생김새, 조명에 재료 · 표면, 부정 말 없음), 이펙트 없음, 모순 · 추천 짝. 말 되는 조합 78,840

## 2026-11-10 · claude · 검토안 1 · 2 · 5단계 — 문앙 공통 문구 · 축 담당 범위 · 기록 보완
- 사용자 검토안(docs/AXIS_REVIEW.md) → 「1. 크고 둥근 눈으로. 2. 삼국지 설계표도 다 수정해줘. 3. 그 순서로 진행해줘」
- `data/subjects/sam.wenyang.json` — sam-atelier 89ab31a(눈 모순 고친 설계표)에서 다시 가져옴. `sam.wenyang.overrides.json` — 머리말 character image · 얼굴 비율 줄 in this style 빼기(원본은 original 에). `tools/import-subject.cjs` 덮어쓰기 칸
- `data/parts.json` axes — 방향 · 얼굴 표현 · 렌더링·채색 · 조명·색조 · 이펙트와 담당 범위(rule). `tools/make-job.cjs` — 일감 기록에 부품의 그 판 한글 이름 · 짝 규칙 · 캐릭터 덮어쓰기
- `docs/AXIS_REVIEW.md`(검토안 원문) · `docs/STRUCTURE.md` 0.1절 · `tests/build.cjs`

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
