#!/usr/bin/env node
/* 같은 파일 맞추기 — 공방들이 같이 쓰는 파일(일상컷 트리 모듈 · 채우기 화면 · 첫 화면)의 원본은 여기 shared/ 하나(2026-11-25, 사용자 「추천 순서대로 1번부터 진행해줘」 4번 —
   손으로 옮기던 사본이 한 저장소에만 고쳐지고 어긋났다). 무엇을 어느 공방에 쓰는지는 shared/manifest.json.
   받는 쪽은 옆 폴더 이름 — 공방(*-atelier) · 건담(atelier) · 공방 모음(polos0117.github.io). 자리가 공방과 다르면 칸의 dests[이름] 이 dest 를 덮는다(2026-11-25 즐겨찾기 · 꽉 채우기 몸통).
   core/sync.cjs(낱말 블록)와 달리 파일 통째를 바이트 그대로 쓴다 — 공방 사본은 손으로 고치지 않는다(고치면 --check 가 잡고 다음 sync 가 덮는다).

   node shared/sync.cjs [--check] [<공방 폴더> …]
     공방 폴더를 안 주면 manifest 의 공방 전부(이 저장소 옆 ../<공방>, 없는 폴더는 건너뛴다).
     --check  쓰지 않고 같은지만 본다 — 다른 사본이 있으면 목록을 찍고 1로 끝난다 */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const HERE = __dirname, SIB = path.join(HERE, '..', '..');
const M = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8'));
const args = process.argv.slice(2), check = args.includes('--check');
const given = args.filter(a => !a.startsWith('--')).map(d => path.resolve(d));
const all = [...new Set(M.files.flatMap(f => f.ateliers))], destOf = (f, name) => (f.dests && f.dests[name]) || f.dest;
for (const d of given) if (!all.includes(path.basename(d))) { console.error('manifest 에 없는 공방: ' + d + ' (있는 것: ' + all.join(' · ') + ')'); process.exit(2); }
const dirs = given.length ? given : all.map(a => path.join(SIB, a)).filter(d => fs.existsSync(d));
let bad = 0, wrote = 0, same = 0;
for (const d of dirs) {
  const name = path.basename(d);
  if (!fs.existsSync(d)) { console.error('없다: ' + d); bad++; continue; }
  for (const f of M.files.filter(x => x.ateliers.includes(name))) {
    const want = fs.readFileSync(path.join(HERE, f.src)), dest = path.join(d, destOf(f, name));
    const cur = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
    if (cur && cur.equals(want)) { same++; continue; }
    if (check) { console.log('다름: ' + name + '/' + destOf(f, name) + (cur ? '' : ' (없음)') + ' ≠ shared/' + f.src); bad++; continue; }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, want); wrote++;
    console.log('썼다: ' + name + '/' + destOf(f, name) + ' ← shared/' + f.src);
  }
}
console.log((check ? '검사' : '맞춤') + ': 공방 ' + dirs.length + '곳 · 같음 ' + same + (check ? ' · 다름 ' + bad : ' · 씀 ' + wrote));
process.exit(bad ? 1 : 0);
