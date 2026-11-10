/* 조립부 · 부품 · 조합 · 캐릭터 복사본 검사 — node tests/build.cjs */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const B = require('../lib/build.js');
const R0 = path.join(__dirname, '..'), J = f => JSON.parse(fs.readFileSync(path.join(R0, f), 'utf8'));
const P = J('data/parts.json'), R = J('data/recipes.json'), SL = J('data/subjects/index.json');

/* 부품 꼴 — 축 다섯, 코드 두 글자 · 축 안에서 겹치지 않음, current 판이 있다, pairs · requires 가 가리키는 부품이 있다, 판마다 한글 이름 */
assert.deepEqual(P.axes.map(a => a.key), B.AXES, '축 차례');
for (const a of B.AXES) {
  const rows = P.parts[a], codes = new Set();
  assert(rows && Object.keys(rows).length, a + ' 부품이 없다');
  for (const [k, r] of Object.entries(rows)) {
    assert(/^[a-z][a-z0-9_]*$/.test(k), '부품 열쇠 꼴 ' + k);
    assert(/^[a-z0-9]{2}$/.test(r.code) && !codes.has(r.code), a + '/' + k + ' 코드 ' + r.code); codes.add(r.code);
    assert(r.ko, a + '/' + k + ' ko');
    assert(r.versions.some(v => v.v === r.current), a + '/' + k + ' current 판');
    r.versions.forEach(v => { assert(/^v\d+$/.test(v.v)); assert(typeof v.text === 'string'); assert(!/\n/.test(v.text), a + '/' + k + ' 글에 줄바꿈'); });
    if (a !== 'fx' || !['none', 'off'].includes(k)) assert(r.versions.find(v => v.v === r.current).text.length > 10, a + '/' + k + ' 글이 비었다');
    if (['direction', 'face', 'paint', 'fx'].includes(a) && !['none', 'off'].includes(k)) assert(/^[A-Z0-9]/.test(B.part(P, a, k).text) && /\.$/.test(B.part(P, a, k).text), a + '/' + k + ' 은 대문자로 시작해 마침표로 끝나는 문장');
    if (a === 'light') assert(/^[a-z]/.test(B.part(P, a, k).text), 'light/' + k + ' 는 Light: 뒤에 붙는 소문자 시작');
    assert(!r.only, a + '/' + k + ' only 는 pairs(추천) · requires(모순)로 나눴다');
    for (const f of ['pairs', 'requires']) for (const [oa, list] of Object.entries(r[f] || {})) list.forEach(x => assert(P.parts[oa][x], a + '/' + k + ' ' + f + ' 가 없는 부품 ' + oa + '/' + x));
    r.versions.forEach(v => assert(v.ko, a + '/' + k + '@' + v.v + ' 판의 한글 이름'));
    /* 담당 범위 — 축을 넘는 말 · 부정 말이 지금 판 문장에 없다(검토안 2 · 3절) */
    if (r.current !== 'v1' || ['kr_game_keyart', 'jp_light_novel', 'off', 'semi_ideal'].includes(k) || r.retired) {
      const t = B.part(P, a, k).text;
      if (!r.retired) assert(!/\b(never|no|not)\b/i.test(t.replace(/not stylised/, '')), a + '/' + k + ' 부정 말은 avoid 로: ' + t);
      if (a === 'direction' && !r.retired) assert(!/\b(oil|painterly|2D|3D|CGI|render|illustration|clean|finished|premium)\b/i.test(t), a + '/' + k + ' 방향에 표현 방식 · 재료 · 수식어: ' + t);
      if (a === 'face' && !r.retired) assert(!/\b(adult|mature|small|large|eyes|blush|East Asian|2\.3D)\b/i.test(t), a + '/' + k + ' 얼굴 표현에 나이 · 크기 · 생김새: ' + t);
      if (a === 'light' && !r.retired) assert(!/\b(paint|painted|matte)\b/i.test(t), a + '/' + k + ' 조명에 재료 · 표면: ' + t);
    }
  }
}

/* 조합 — 이름 붙인 것은 다 풀리고 짝이 맞는다, 조합 이름 ↔ 부품 왕복 */
for (const k of Object.keys(R.recipes)) {
  const rs = B.resolve(P, R, k);
  assert.deepEqual(B.clashes(rs), [], k + ' 짝');
  const back = B.resolve(P, R, rs.id);
  assert.equal(back.id, rs.id, k + ' 조합 이름 왕복');
  assert.equal(B.paragraph(back), B.paragraph(rs));
  assert(B.paragraph(rs).split(/\s+/).length <= 90, k + ' 화풍 문단이 90 낱말을 넘는다');
  assert(/^Light: [a-z]/.test(B.lightLine(rs)), k + ' 빛 줄');
}
assert.throws(() => B.parseRecipeId(P, 'km1-ss1'), /꼴/);
assert.throws(() => B.part(P, 'face', 'semi_soft@v9'), /없는 판/);
assert.equal(B.part(P, 'face', 'semi_soft@v1').v, 'v1');

/* 말 되는 조합 — 짝 규칙이 줄인다(전부 곱한 수보다 작다), 3D 는 3D 끼리만 */
const all = B.AXES.reduce((n, a) => n * Object.keys(P.parts[a]).length, 1), cs = B.combos(P);
assert(cs.length > 0 && cs.length < all, '말 되는 조합 ' + cs.length + ' / ' + all);
assert(cs.every(r => r.parts[0].key !== 'photo_still' || ['photo', 'photoreal_cgi'].includes(r.parts[2].key)), '실사 영화는 사진 · 포토리얼 CGI 렌더링만(requires)');
assert(cs.some(r => r.parts[1].key === 'anime_adult' && r.parts[2].key === 'oil_glaze'), '추천 짝 밖(애니 얼굴 + 유화)도 시험할 수 있다(검토안 6.1)');
assert(B.untested(B.resolve(P, R, { direction: 'kr_mmorpg', face: 'anime_adult', paint: 'oil_glaze', light: 'muted', fx: 'none' })).length > 0, '추천 짝 밖은 알린다');
assert(B.live(P, 'direction').indexOf('classical') < 0 && B.live(P, 'direction').indexOf('fantasy_paint') < 0 && B.live(P, 'direction').indexOf('jp_light_novel') >= 0 && B.live(P, 'direction').indexOf('kr_game_keyart') >= 0, '방향 고전 초상 · 판타지 페인팅 내림, 한국 게임 키아트 · 일본 라이트노벨 표지');
{ const off = B.build(P, R, J('data/subjects/sam.wenyang.json'), 'samguk', Object.assign({}, R.recipes.semi_smooth.parts, { fx: 'off' }));
  assert(/^Avoid: .*bloom.*halos\.$/m.test(off.text) && /^Light: [^\n]*highlights\.$/m.test(off.text), '이펙트 없음 = avoid 로 억제, 미지정은 빈 문장'); }
/* 내린 것 — 말 되는 조합 · 살아 있는 조합에서 빠지고, 옛 그림을 위해 풀리기는 한다 */
assert(!cs.some(r => r.parts.some(p => p.retired)), '내린 부품이 말 되는 조합에 있다');
assert(B.live(P, 'direction').indexOf('anime') < 0 && P.parts.direction.anime.retired, '나라 말 없는 애니는 내렸다(2026-11-10)');
assert(B.live(P, 'direction').indexOf('film3d') < 0 && B.live(P, 'direction').indexOf('jp_film3d') >= 0 && B.live(P, 'direction').indexOf('kr_film3d') >= 0, '3D 애니메이션도 일본 · 한국으로(2026-11-10)');
assert(B.liveRecipes(R).indexOf('anime_brush') < 0 && B.recipeNameOf(R, B.resolve(P, R, 'an1-aa1-ba1-dl1-x01')) === 'anime_brush', '내린 조합 · 옛 판 그림도 조합 이름을 찾는다');
for (const k of B.liveRecipes(R)) assert.deepEqual(B.retiredIn(B.resolve(P, R, k)), [], k + ' 에 내린 부품');

/* 이름 — 칸 · 그림 */
const s0 = B.slotName('km1-ss1-sm1-mu1-xf1', 'sam.wenyang', 'samguk', 'world', 'bold', { defaultExposure: 'bold' });
assert.equal(s0, 'km1-ss1-sm1-mu1-xf1__sam.wenyang__samguk-world');
assert.equal(B.slotName('km1-ss1-sm1-mu1-xf1', 'sam.wenyang', 'samguk', 'world', 'low', { defaultExposure: 'bold' }), s0 + '-low');
assert.deepEqual(B.parseSlot(s0 + '-low'), { recipe: 'km1-ss1-sm1-mu1-xf1', subject: 'sam.wenyang', world: 'samguk', kind: 'world', exposure: 'low' });
const im = B.parseImage(B.imageName(s0, 'chatgpt', 3));
assert.equal(im.slot, s0); assert.equal(im.model, 'chatgpt'); assert.equal(im.n, 3);
assert.equal(B.parseImage('nope'), null);

/* 캐릭터 복사본 — 세계마다 칸이 다 있고, 화풍 말(Style · Light · Mood)이 남지 않았다 */
let n = 0;
for (const s of SL.subjects) {
  const subj = J('data/subjects/' + s.id + '.json');
  assert.equal(subj.id, s.id); assert(subj.source && subj.source.commit, s.id + ' 출처');
  assert.deepEqual(Object.keys(subj.worlds), s.worlds, s.id + ' 목록의 세계');
  for (const [w, W] of Object.entries(subj.worlds)) {
    for (const k of ['genre', 'head', 'faceFrame']) assert(W[k], s.id + ' ' + w + ' ' + k);
    for (const k of ['character', 'costume', 'scene', 'constraints']) assert(Array.isArray(W[k]) && W[k].length, s.id + ' ' + w + ' ' + k);
    for (const e of ['bold', 'moderate', 'low']) assert(/^(Exposure \(|Skin shown: )/.test(W.exposure[e]), s.id + ' ' + w + ' 노출 ' + e);
    if (s.id === 'sam.wenyang') assert(/^Exposure \(bold\)/.test(W.exposure.bold) && !W.exposureConstraint, '문앙 노출 줄은 원래 꼴(사용자 「그냥 exposure 로 쓰자」)');
    const flat = [W.head, W.faceFrame].concat(W.character, W.costume, W.scene, W.constraints).join('\n');
    assert(!/^(Style|Light|Mood):/m.test(flat) && !/\bLIGHT:/.test(flat), s.id + ' ' + w + ' 에 화풍 말이 남았다');
    assert(W.scene.some(l => /^Composition:/.test(l)), s.id + ' ' + w + ' 구도 줄');
    /* 지시문 — 다섯 칸, 빛 줄 하나(구도 앞), 노출 줄 하나 */
    for (const k of Object.keys(R.recipes)) {
      const b = B.build(P, R, subj, w, k);
      const t = b.text, idx = ['1. STYLE', '2. CHARACTER', '3. COSTUME AND EQUIPMENT — ', '4. SCENE', '5. CONSTRAINTS'].map(h => t.indexOf('\n' + h));
      assert(idx.every((x, i) => x > 0 && (i === 0 || x > idx[i - 1])), s.id + ' ' + w + ' ' + k + ' 다섯 칸 차례');
      assert.equal((t.match(/^Light: /mg) || []).length, 1, '빛 줄 하나');
      assert(t.indexOf('\nLight: ') < t.indexOf('\nComposition:'), '빛 줄은 구도 앞');
      assert.equal((t.match(/^(Exposure \(|Skin shown: )/mg) || []).length, 1, '노출 줄 하나');
      assert(t.includes(B.paragraph(b.recipe)), '화풍 문단');
      n++;
    }
    const no = B.build(P, R, subj, w, 'semi_smooth', { exposure: 'none' });
    assert(!/^(Exposure \(|Skin shown: )/m.test(no.text) && /-none$/.test(no.slot), '노출 none — 노출 줄 없이(화풍 비교 기본)');
    if (W.exposureConstraint) assert(!no.text.includes(W.exposureConstraint), '노출을 빼면 지킴 말도 빠진다');
    const lo = B.build(P, R, subj, w, 'semi_smooth', { exposure: 'low' });
    assert(/^(Exposure \(low\)|Skin shown: face, neck and hands only)/m.test(lo.text) && /-low$/.test(lo.slot), '노출 낮추기');
    if (W.exposureConstraint) assert(lo.text.includes(W.exposureConstraint), '노출을 넣으면 지킴 말이 5칸에');
  }
}
{ const wy = J('data/subjects/sam.wenyang.json'), W = wy.worlds.samguk;
  assert(!/illustration/.test(W.head) && /character image/.test(W.head), '문앙 머리말은 매체를 박지 않는다(덮어쓰기)');
  assert(!/in this style/.test(W.faceFrame) && W.original && /in this style/.test(W.original.faceFrame), '얼굴 비율 줄 덮어쓰기 · 원본 보존');
  assert(!/smaller, narrower eyes/.test(W.character.join(' ')) && /large round eyes/.test(W.character.join(' ')), '문앙 무협은 크고 둥근 눈 하나로(삼국지 설계표 고침)');
  assert(P.axes.every(a => a.ko && a.rule), '축마다 한글 이름 · 담당 범위');
  assert.equal(J('data/focus.json').exposure, 'low', '화풍 비교는 노출 low(사용자 「bold 를 화풍비교에선 빼자」 → 「skin shown low 로 낮춰줘」 → 「그냥 exposure 로 쓰자」)'); }
/* 평가 — data/evals.json 칸이 lib/evals.js 항목대로 */
{ const V = require('../lib/evals.js'), E = J('data/evals.json');
  for (const [id, e] of Object.entries(E.evals || {})) { assert(B.parseImage(id), '평가 열쇠는 그림 이름: ' + id); assert.deepEqual(V.check(e), [], id + ' 평가 칸'); }
  assert.deepEqual(V.check({ taste: 6 }), ['taste 는 1~5']); assert.deepEqual(V.check({ verdict: 'meh' }).length, 1); assert.deepEqual(V.check({ foo: 1 }), ['모르는 칸 foo']);
  assert.equal(V.badge({ taste: 4, verdict: 'fix', side: '조금' }), '★4 · 고칠 것 · 변화 조금'); assert.equal(V.badge({}), ''); }
assert.throws(() => B.build(P, R, J('data/subjects/sam.wenyang.json'), 'samguk', { direction: 'photo_still', face: 'real_natural', paint: 'smooth', light: 'muted', fx: 'none' }), /같이 못 쓰는 짝/);
assert.throws(() => B.build(P, R, J('data/subjects/sam.wenyang.json'), 'samguk', 'semi_smooth', { kind: 'casual' }), /아직 없는 갈래/);
console.log('PASS 조립부: 부품 ' + B.AXES.map(a => Object.keys(P.parts[a]).length).join('·') + ' · 조합 ' + Object.keys(R.recipes).length + ' · 말 되는 조합 ' + cs.length + ' · 캐릭터 ' + SL.subjects.length + ' · 지시문 ' + n);
