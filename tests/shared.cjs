/* shared — 공방들이 같이 쓰는 파일(shared/manifest.json)의 원본이 있고, 옆 공방(· 건담 · 공방 모음) 사본이 원본과 바이트까지 같은지(있는 곳만).
   즐겨찾기(lib/favorites.js) — 가득 차면 거절 · 저장 공간이 모자라면 못 담았다고만.
   공방마다 다른 규칙은 표로 — 포켓몬 raise_one(가슴 위 · 얼굴 클로즈업에 두 손을 다 올리지 않는다)이 공용 모듈에서 그대로 걸리는지. Run: node tests/shared.cjs */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), SH = path.join(ROOT, 'shared'), SIB = path.join(ROOT, '..');
const M = JSON.parse(fs.readFileSync(path.join(SH, 'manifest.json'), 'utf8'));
assert(Array.isArray(M.files) && M.files.length, 'manifest files');
/* 받는 쪽 — 공방(*-atelier) · 건담(atelier) · 공방 모음(polos0117.github.io). 자리는 dests[이름] 이 있으면 그것(공방 모음은 뿌리) */
const dests = new Set(), destOf = (f, a) => (f.dests && f.dests[a]) || f.dest;
for (const f of M.files) {
  assert(f.src && f.dest && Array.isArray(f.ateliers) && f.ateliers.length, 'manifest 칸: ' + JSON.stringify(f));
  assert(fs.existsSync(path.join(SH, f.src)), '원본 없음: shared/' + f.src);
  assert(f.ateliers.every(a => /^([a-z]+-)?atelier$|^polos0117\.github\.io$/.test(a) && a !== 'style-atelier'), '공방 이름: ' + f.ateliers);
  assert(Object.keys(f.dests || {}).every(a => f.ateliers.includes(a)), 'dests 는 받는 쪽에만: ' + f.src);
  for (const a of f.ateliers) { const k = a + '/' + destOf(f, a); assert(!dests.has(k), '같은 자리에 두 원본: ' + k); dests.add(k); }
}
/* 즐겨찾기 — 가득 차면 더 담지 않는다(오래된 것을 몰래 빼지 않는다) · 저장 공간이 모자라면 못 담았다고만(담아 둔 칸은 그대로) */
{
  const vm = require('node:vm'), src = fs.readFileSync(path.join(SH, 'lib/favorites.js'), 'utf8');
  const run = st => { const win = { localStorage: st, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} }, box = { window: win, CustomEvent: function () {}, JSON, Date, Array, String, Math };
    vm.createContext(box); vm.runInContext(src, box); return win.AtelierFavorites; };
  const m = {}, st = { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }, F = run(st);
  const e = i => ({ a: 'book', key: 'k', file: 'f' + i + '.webp', title: 't', thumb: 'x', full: 'x', link: '/x' });
  assert(F.MAX >= 3000, 'MAX ' + F.MAX);
  m[F.KEY] = JSON.stringify(Array.from({ length: F.MAX }, (_, i) => ({ ...e(i), at: 'x' })));
  assert.equal(F.toggle(e('new')), false, '가득 차면 못 담는다'); assert.equal(F.error(), 'full'); assert.equal(F.message(), '', '말은 파일에 없다 — 공방 낱말 표나 setMessages'); F.setMessages({ full: '가득 {max}' }); assert.equal(F.message(), '가득 ' + F.MAX);
  assert.equal(F.count(), F.MAX, '가득일 때 하나도 안 빠진다'); assert.equal(F.list()[F.MAX - 1].file, 'f' + (F.MAX - 1) + '.webp', '오래된 것 그대로'); assert.equal(F.room(), 0);
  assert.equal(F.toggle(e(5)), false, '가득이어도 빼기는 된다'); assert.equal(F.error(), ''); assert.equal(F.toggle(e('new')), true, '하나 빼면 담긴다');
  const Q = run({ getItem: k => m[k] || null, setItem: () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError', code: 22 }); }, removeItem() {} });
  const before = m[F.KEY]; F.remove('book', 'fnew.webp');
  assert.equal(Q.toggle(e('q')), false, '저장 공간이 모자라면 못 담는다'); assert.equal(Q.error(), 'quota'); assert.equal(Q.message(), ''); Q.setMessages({ quota: '저장 공간' }); assert.match(Q.message(), /저장 공간/);
  assert.equal(Q.count(), F.MAX - 1, '못 담아도 담아 둔 칸은 그대로'); assert.notEqual(before, undefined);
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
console.log('PASS shared: 원본 ' + M.files.length + '개 · 옆 공방 ' + here.length + '곳 사본 ' + n + '개 = 원본 · 즐겨찾기 가득 · 저장 공간' + raised);
