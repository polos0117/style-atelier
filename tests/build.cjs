/* 조립부 · 부품 · 조합 · 캐릭터 복사본 검사 — node tests/build.cjs */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert');
const B = require('../lib/build.js');
const R0 = path.join(__dirname, '..'), J = f => JSON.parse(fs.readFileSync(path.join(R0, f), 'utf8'));
const P = J('data/parts.json'), R = J('data/recipes.json'), SL = J('data/subjects/index.json');

/* 부품 꼴 — 축 다섯, 코드 두 글자 · 축 안에서 겹치지 않음, current 판이 있다, only 가 가리키는 부품이 있다 */
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
    if (a !== 'fx' || k !== 'none') assert(r.versions.find(v => v.v === r.current).text.length > 10, a + '/' + k + ' 글이 비었다');
    if (['direction', 'face', 'paint', 'fx'].includes(a) && k !== 'none') assert(/^[A-Z]/.test(B.part(P, a, k).text) && /\.$/.test(B.part(P, a, k).text), a + '/' + k + ' 은 대문자로 시작해 마침표로 끝나는 문장');
    if (a === 'light') assert(/^[a-z]/.test(B.part(P, a, k).text), 'light/' + k + ' 는 Light: 뒤에 붙는 소문자 시작');
    for (const [oa, list] of Object.entries(r.only || {})) list.forEach(x => assert(P.parts[oa][x], a + '/' + k + ' only 가 없는 부품 ' + oa + '/' + x));
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
assert(cs.every(r => (r.parts[1].key === 'stylised3d') === (r.parts[2].key === 'render3d')), '3D 얼굴 ↔ 3D 렌더');

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
    for (const e of ['bold', 'moderate', 'low']) assert(/^Exposure \(/.test(W.exposure[e]), s.id + ' ' + w + ' 노출 ' + e);
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
      assert.equal((t.match(/^Exposure \(/mg) || []).length, 1, '노출 줄 하나');
      assert(t.includes(B.paragraph(b.recipe)), '화풍 문단');
      n++;
    }
    const lo = B.build(P, R, subj, w, 'semi_smooth', { exposure: 'low' });
    assert(/^Exposure \(low\)/m.test(lo.text) && /-low$/.test(lo.slot), '노출 낮추기');
  }
}
assert.throws(() => B.build(P, R, J('data/subjects/sam.wenyang.json'), 'samguk', { direction: 'kr_mmorpg', face: 'stylised3d', paint: 'smooth', light: 'muted', fx: 'none' }), /같이 못 쓰는 짝/);
assert.throws(() => B.build(P, R, J('data/subjects/sam.wenyang.json'), 'samguk', 'semi_smooth', { kind: 'casual' }), /아직 없는 갈래/);
console.log('PASS 조립부: 부품 ' + B.AXES.map(a => Object.keys(P.parts[a]).length).join('·') + ' · 조합 ' + Object.keys(R.recipes).length + ' · 말 되는 조합 ' + cs.length + ' · 캐릭터 ' + SL.subjects.length + ' · 지시문 ' + n);
