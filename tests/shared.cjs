/* shared — 공방들이 같이 쓰는 파일(shared/manifest.json)의 원본이 있고, 옆 공방 사본이 원본과 바이트까지 같은지(있는 공방만).
   공방마다 다른 규칙은 표로 — 포켓몬 raise_one(가슴 위 · 얼굴 클로즈업에 두 손을 다 올리지 않는다)이 공용 모듈에서 그대로 걸리는지. Run: node tests/shared.cjs */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), SH = path.join(ROOT, 'shared'), SIB = path.join(ROOT, '..');
const M = JSON.parse(fs.readFileSync(path.join(SH, 'manifest.json'), 'utf8'));
assert(Array.isArray(M.files) && M.files.length, 'manifest files');
const dests = new Set();
for (const f of M.files) {
  assert(f.src && f.dest && Array.isArray(f.ateliers) && f.ateliers.length, 'manifest 칸: ' + JSON.stringify(f));
  assert(fs.existsSync(path.join(SH, f.src)), '원본 없음: shared/' + f.src);
  assert(!dests.has(f.dest), '같은 자리에 두 원본: ' + f.dest); dests.add(f.dest);
  assert(f.ateliers.every(a => /^[a-z]+-atelier$/.test(a) && a !== 'style-atelier'), '공방 이름: ' + f.ateliers);
}
/* 옆 공방 대조 — 없는 폴더는 건너뛴다(core.cjs 와 같게) */
const all = [...new Set(M.files.flatMap(f => f.ateliers))], here = all.filter(a => fs.existsSync(path.join(SIB, a)));
let n = 0;
if (here.length) {
  const x = cp.spawnSync('node', [path.join(SH, 'sync.cjs'), '--check', ...here.map(a => path.join(SIB, a))], { encoding: 'utf8' });
  assert.equal(x.status, 0, '공방 사본이 원본과 다르다 — node shared/sync.cjs 로 맞춘다\n' + x.stdout + x.stderr);
  n = M.files.reduce((s, f) => s + f.ateliers.filter(a => here.includes(a)).length, 0);
}
/* 포켓몬 raise_one — 표가 있으면 걸리고, 표를 빼면 안 걸린다(다른 공방은 표가 없어 그대로) */
let raised = '';
const pkm = path.join(SIB, 'pkm-atelier');
if (fs.existsSync(path.join(pkm, 'data/casual-tree-v2.json'))) {
  const ctx = {}; ctx.window = ctx;
  for (const f of ['lib/casual-tree.js', 'lib/casual-tree-v2.js']) new Function('window', fs.readFileSync(path.join(SH, f), 'utf8'))(ctx);
  const C = ctx.AtelierCasualTreeV2, rd = f => JSON.parse(fs.readFileSync(path.join(pkm, f), 'utf8'));
  const v2 = rd('data/casual-tree-v2.json'), t = C.make(v2, rd('data/casual-tree.json'));
  assert.deepEqual(v2.raise_one, { frames: ['chest_up', 'face_close'], zones: ['face', 'chest', 'overhead'] }, '포켓몬 raise_one 표');
  const sc = { treeV: 2, era: 'now', place: 'spa_sauna', ofam: 'roleplay', item: 'baker_jacket_apron', posture: 'stand', support: 'none', frame: 'chest_up', body: 'front', head: 'with_body', right: 'wave' };
  assert.equal((C.why(t, sc, 'left', 'hair_tuck', { gen: 1 }) || {}).code, 'raised', '가슴 위 두 손 올리기');
  assert.equal(C.why(t, { ...sc, frame: 'waist_up' }, 'left', 'hair_tuck', { gen: 1 }), null, '허리 위는 된다');
  const t0 = C.make({ ...v2, raise_one: undefined }, t.v1);
  assert.notEqual((C.why(t0, sc, 'left', 'hair_tuck', { gen: 1 }) || {}).code, 'raised', '표가 없으면 안 거른다');
  raised = ' · 포켓몬 raise_one';
}
console.log('PASS shared: 원본 ' + M.files.length + '개 · 옆 공방 ' + here.length + '곳 사본 ' + n + '개 = 원본' + raised);
