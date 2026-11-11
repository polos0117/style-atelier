/* core — 원본 v1/vocab.json 꼴 · 옆 공방 블록이 원본과 같은지(있을 때). Run: node tests/core.cjs */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), C = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/v1/vocab.json'), 'utf8'));
assert.equal(C.version, 'v1');
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
console.log('PASS core: v1 원본 꼴 · 옆 공방 ' + n + '곳 블록 같음');
