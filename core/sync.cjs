#!/usr/bin/env node
/* core 낱말을 공방에 옮긴다 — 원본은 core/<판>/vocab.json 하나(사용자 2026-11-11 「프롬포트 생성 관련 테스트나 문구관리를 하나의 공방에서 관리는 못하나」 → 「응 원소 글로 하고 core v1 만들어줘」).
   공방의 lib/prompt-spec.js 끝에 FACE_DESIGN(head 빼고) · EXPRESSION_DETAIL, lib/look-spec.js 끝에 VOCAB_EN 을 「core:<판>」 블록으로 쓴다(look-spec.js 가 없으면 prompt-spec.js 에 셋 다) —
   공방 생성기 · 도구 · 검사는 지금처럼 제 파일만 읽어도 core 글을 쓴다. 블록 안은 손으로 고치지 않는다(고치면 --check 가 잡는다).
   블록은 공방에 이미 있는 열쇠만 덮는다 — 공통 열쇠는 core 글로 맞고, 공방에만 있는 열쇠는 그 공방 글 그대로, core 에만 있는 열쇠는 들이지 않는다
   (원소 체형 표처럼 열쇠 목록에 맞춘 표가 있어서 — 2026-11-11).

   node core/sync.cjs <공방 폴더> [<공방 폴더> …] [--ver vN — 없으면 가장 새 판] [--check]
     --check  블록이 원본과 같은지만 본다(다르면 1로 끝난다) */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
/* 판을 안 주면 가장 새 판(core/v<N>/ 중 N 이 가장 큰 것) */
const latest = () => fs.readdirSync(__dirname).filter(d => /^v\d+$/.test(d)).sort((a, b) => +a.slice(1) - +b.slice(1)).pop();
const args = process.argv.slice(2), ver = (i => i >= 0 ? args[i + 1] : latest())(args.indexOf('--ver')), check = args.includes('--check');
const dirs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--ver');
if (!dirs.length) { console.error('쓰는 법: node core/sync.cjs <공방 폴더> … [--check]'); process.exit(1); }
const src = path.join(__dirname, ver, 'vocab.json');
const C = JSON.parse(fs.readFileSync(src, 'utf8'));
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

function block(kind) {
  const part = kind === 'spec' ? { FACE_DESIGN: C.FACE_DESIGN, EXPRESSION_DETAIL: C.EXPRESSION_DETAIL } : kind === 'all' ? { FACE_DESIGN: C.FACE_DESIGN, EXPRESSION_DETAIL: C.EXPRESSION_DETAIL, VOCAB_EN: C.VOCAB_EN } : { VOCAB_EN: C.VOCAB_EN };
  const json = JSON.stringify(part);
  return [
    '/* ── core:' + ver + ' begin ' + sha(json) + ' — style-atelier core/' + ver + '/vocab.json 에서 core/sync.cjs 가 옮긴 것. 손으로 고치지 않는다 ── */',
    '(function (S) {',
    '  if (!S) return;',
    '  var C = ' + json + ';',
    '  Object.keys(C).forEach(function (t) { if (!S[t]) return; Object.keys(C[t]).forEach(function (g) {',
    '    if (!(g in S[t])) return;',
    '    if (C[t][g] && typeof C[t][g] === "object") { if (!S[t][g] || typeof S[t][g] !== "object") return; Object.keys(C[t][g]).forEach(function (k) { if (k in S[t][g]) S[t][g][k] = C[t][g][k]; }); }',
    '    else S[t][g] = C[t][g];',
    '  }); });',
    '  S.CORE_VERSION = "' + ver + '";',
    '})((typeof window !== "undefined" ? window : globalThis).AtelierSpec);',
    '/* ── core:' + ver + ' end ── */'
  ].join('\n');
}
const RE = /\n?\/\* ── core:v\d+ begin[\s\S]*?\/\* ── core:v\d+ end ── \*\/\n?/;
let bad = 0;
for (const d of dirs) {
  /* look-spec.js 가 없는 공방(포켓몬 · 게임 · 책 — VOCAB_EN 이 prompt-spec.js 안)은 prompt-spec.js 에 한 블록 */
  const pairs = fs.existsSync(path.join(d, 'lib/look-spec.js')) ? [['lib/prompt-spec.js', 'spec'], ['lib/look-spec.js', 'look']] : [['lib/prompt-spec.js', 'all']];
  for (const [file, kind] of pairs) {
    const f = path.join(d, file);
    if (!fs.existsSync(f)) { console.error('없다: ' + f); bad++; continue; }
    const cur = fs.readFileSync(f, 'utf8'), want = block(kind), m = cur.match(RE);
    const same = m && m[0].trim() === want;
    if (check) { if (!same) { console.log('다름: ' + f + (m ? '' : ' (블록 없음)')); bad++; } else console.log('같음: ' + f + ' · core:' + ver); continue; }
    const next = m ? cur.replace(RE, '\n' + want + '\n') : cur.replace(/\s*$/, '\n\n' + want + '\n');
    if (next !== cur) { fs.writeFileSync(f, next); console.log('썼다: ' + f + ' · core:' + ver); } else console.log('그대로: ' + f);
  }
}
process.exit(bad ? 1 : 0);
