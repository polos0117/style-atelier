#!/usr/bin/env node
/* 찾기 — 그림 저장소 색인(index/images.json)에서 조건으로 거른다. 칸이 빈 곳도 찾는다.

   node tools/find.cjs [--subject sam.wenyang] [--world samguk] [--model chatgpt] [--recipe <이름|조합 이름>]
                       [--direction k] [--face k] [--paint k] [--light k] [--fx k]   (부품은 열쇠 — 판까지 보려면 k@v1)
   node tools/find.cjs --gaps --base <조합> --vary <축> --subject … --world … [--model chatgpt]
       그 축만 바꾼 칸마다 그림이 있는지(있음 · 막힘 · 일감에 있음 · 비었음) — 빈 칸은 make-job 에 같은 인자로 넘기면 된다.
   --img ../style-atelier-img(기본) · --json(줄 대신 JSON)
   평가(data/evals.json): 줄 끝에 ★취향 · 판정을 붙인다. --verdict keep|fix|cross|drop · --rated(평가한 것만) · --unrated */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const B = require('../lib/build.js');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), has = k => args.includes('--' + k), flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/parts.json'), 'utf8')), R = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/recipes.json'), 'utf8'));
const V = require('../lib/evals.js'), EV = (JSON.parse(fs.readFileSync(path.join(ROOT, 'data/evals.json'), 'utf8')).evals) || {};
const IMG = path.resolve(ROOT, flag('img', '../style-atelier-img'));
const ixf = path.join(IMG, 'index/images.json');
const IX = fs.existsSync(ixf) ? JSON.parse(fs.readFileSync(ixf, 'utf8')) : { cols: [], rows: [] };
const rows = IX.rows.map(r => Object.fromEntries(IX.cols.map((c, i) => [c, r[i]])));

if (has('gaps')) {
  const [axis, list] = (flag('vary') || '').split('='), base = B.resolve(P, R, flag('base') || die('--base')), model = flag('model', 'chatgpt');
  if (B.AXES.indexOf(axis) < 0) die('--vary <축>');
  const blocked = new Set(fs.existsSync(path.join(IMG, 'rec/blocked')) ? fs.readdirSync(path.join(IMG, 'rec/blocked')).map(f => B.parseImage(f.slice(0, -5))).filter(Boolean).map(m => m.slot + '__' + m.model) : []);
  const pending = new Set();
  const jd = path.join(IMG, 'jobs');
  if (fs.existsSync(jd)) fs.readdirSync(jd).filter(d => /^j\d{4}/.test(d)).forEach(d => { const s = path.join(jd, d, 'slots.json'); if (fs.existsSync(s)) { const J = JSON.parse(fs.readFileSync(s, 'utf8')); if (!J.retired) J.slots.forEach(x => pending.add(x.slot + '__' + x.model)); } });   /* 보류 · 합쳐진 일감은 빼고(재검토안 R3) */
  const drawn = new Set(rows.map(r => r.id.replace(/__\d+$/, '')));
  const keys = list ? list.split(',') : B.live(P, axis);
  for (const sid of flag('subject', '').split(',').filter(Boolean)) for (const w of flag('world', '').split(',').filter(Boolean)) {
    const subj = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/subjects', sid + '.json'), 'utf8'));
    for (const k of keys) {
      const spec = {}; base.parts.forEach(p => { spec[p.axis] = p.key + '@' + p.v; }); spec[axis] = k;
      const rs = B.resolve(P, R, spec);
      if (B.clashes(rs).length) { console.log('짝 안 맞음  ' + axis + '/' + k); continue; }
      const FOCUS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/focus.json'), 'utf8'));
      const slot = B.slotName(rs.id, sid, w, 'world', flag('exposure', FOCUS.exposure || subj.defaultExposure), subj), key = slot + '__' + model;
      const st = drawn.has(key) ? '있음' : blocked.has(key) ? '막힘' : pending.has(key) ? '일감에 있음' : '비었음';
      console.log(st.padEnd(6) + '  ' + axis + '/' + k.padEnd(16) + ' ' + slot);
    }
  }
  process.exit(0);
}

const want = {};
for (const c of ['subject', 'world', 'model', 'kind', 'exposure', 'direction', 'face', 'paint', 'light', 'fx', 'job']) if (flag(c)) want[c] = flag(c);
let rid = null;
if (flag('recipe')) rid = B.resolve(P, R, flag('recipe')).id;
const hit = rows.filter(r => (!rid || r.recipe === rid) && (!flag('verdict') || (EV[r.id] || {}).verdict === flag('verdict')) && (!has('rated') || !V.empty(EV[r.id])) && (!has('unrated') || V.empty(EV[r.id])) && Object.keys(want).every(c => {
  const v = String(r[c] || ''); return want[c].includes('@') ? v === want[c] : v.split('@')[0] === want[c];
}));
if (has('json')) console.log(JSON.stringify(hit, null, 1));
else { hit.forEach(r => console.log(r.id + (EV[r.id] ? '  ' + V.badge(EV[r.id]) + (EV[r.id].note ? ' — ' + EV[r.id].note : '') : ''))); console.log('— ' + hit.length + '장 / 색인 ' + rows.length + ' · 평가 ' + rows.filter(r => !V.empty(EV[r.id])).length); }
function die(m) { console.error(m); process.exit(1); }
