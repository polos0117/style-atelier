/* core — 판마다 원본 vocab.json 꼴 · 가장 새 판의 바꾼 글 · 옆 공방 블록이 가장 새 판과 같은지(있을 때). Run: node tests/core.cjs */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), VERS = fs.readdirSync(path.join(ROOT, 'core')).filter(d => /^v\d+$/.test(d)).sort((a, b) => +a.slice(1) - +b.slice(1));
const LATEST = VERS[VERS.length - 1], C = JSON.parse(fs.readFileSync(path.join(ROOT, 'core', LATEST, 'vocab.json'), 'utf8'));
for (const v of VERS) assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT, 'core', v, 'vocab.json'), 'utf8')).version, v, v + ' 폴더 판 이름');
assert.equal(C.version, LATEST);
/* v2 (2026-11-11 「넣어주고」) — 긴 얼굴 글. 눈 small · 인상 fierce 는 v1 글 그대로(「그대로 두고」) */
assert.equal(C.VOCAB_EN.face_shape.long, 'gently long oval face');
/* v4 (2026-11-11 3단계) — 칸 꼴 틀. 공방은 AtelierSpec.CORE_FRAME 으로 읽는다 */
assert(C.FRAME && ['s1', 's2', 's3', 's4', 's5', 'anatomy', 'avoid'].every(k => typeof C.FRAME[k] === 'string' && C.FRAME[k]), 'FRAME 칸');
assert.equal(C.FRAME.s1, '1. STYLE'); assert(C.FRAME.s3.includes('{costume}') && C.FRAME.s3.includes('{genre}') && C.FRAME.avoid.includes('{list}'), 'FRAME 자리 표');
/* v3 (2026-11-11 「정리하는 김에 깔끔하게」) — 각진 얼굴 · 광대 · 웃는 입 글 */
assert.equal(C.VOCAB_EN.face_shape.square_soft, 'softly squared face with a rounded jaw');
assert.equal(C.VOCAB_EN.face_shape.angular, 'refined face with a clean, softly tapered outline');
assert.equal(C.VOCAB_EN.lips.wide_smile, 'a wide mouth with softly upturned corners');
assert.equal(C.FACE_DESIGN.eye_size.small, 'smaller, narrower eyes than usual anime proportion');
assert.equal(C.FACE_DESIGN.impression.fierce, 'a fierce, wild ferocity');
for (const t of ['FACE_DESIGN', 'EXPRESSION_DETAIL', 'VOCAB_EN']) assert(C[t] && typeof C[t] === 'object' && Object.keys(C[t]).length, t);
assert(!('head' in C.FACE_DESIGN), 'FACE_DESIGN.head 는 공방 몫');
assert.equal(C.FACE_DESIGN.skin_tone.golden_tan, 'light warm-beige skin with a golden undertone');
assert.equal(C.FACE_DESIGN.eye_size.medium, 'medium-sized eyes');
const strings = []; (function walk(o) { for (const v of Object.values(o)) typeof v === 'string' ? strings.push(v) : walk(v); })(C);
assert(strings.every(s => s.trim() === s && s.length), '빈 글 · 앞뒤 빈칸 없음');
assert(!strings.some(s => /realistically proportioned|golden tan skin/.test(s)) && !Object.values(C.FACE_DESIGN.age).some(s => /cheekbones/.test(s)), '오늘 뺀 말(사실형 눈 비율 · golden tan · 나이 줄의 광대)이 돌아오지 않았다');
let n = 0;
for (const r of ['sam-atelier', 'element-atelier', 'pkm-atelier', 'game-atelier', 'book-atelier']) {
  const d = path.join(ROOT, '..', r); if (!fs.existsSync(d)) continue;
  const x = cp.spawnSync('node', [path.join(ROOT, 'core/sync.cjs'), d, '--check'], { encoding: 'utf8' });
  assert.equal(x.status, 0, r + ' 블록이 원본과 다르다\n' + x.stdout); n++;
}
console.log('PASS core: 판 ' + VERS.join(' · ') + ' 꼴 · 옆 공방 ' + n + '곳 블록 = ' + LATEST);
