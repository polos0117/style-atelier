# style-atelier — 화풍공방

화풍을 부품(방향 · 얼굴 · 채색 · 빛 · 이펙트)으로 나눠 조합하고, 축 하나씩 바꿔 시험하는 곳. 그림은 [style-atelier-img](https://github.com/polos0117/style-atelier-img).

- 화면: `index.html` — 그림 찾기 · 축 비교 · 섞어보기(조합 → 지시문) · 일감
- 부품 `data/parts.json` · 조합 `data/recipes.json` · 시험 캐릭터 `data/subjects/`
- 조립부 `lib/build.js` · 도구 `tools/`(import-subject · make-job · draw-api · ingest · find)
- 구조 [docs/STRUCTURE.md](docs/STRUCTURE.md) · 규칙 [AGENTS.md](AGENTS.md) · 바뀐 것 [docs/PATCH.md](docs/PATCH.md)

```bash
node tools/make-job.cjs --base semi_smooth --vary face --subject sam.wenyang --world samguk   # 얼굴 축 일감
node tools/find.cjs --gaps --base semi_smooth --vary face --subject sam.wenyang --world samguk
node tools/find.cjs --face semi_soft --world samguk
```
