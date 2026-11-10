#!/usr/bin/env node
/* 시험 캐릭터 가져오기 — 옆 공방 저장소를 읽기만 하고 data/subjects/<id>.json 에 복사본을 쓴다(그 공방 파일은 건드리지 않는다).
   그 공방 조립부로 세계 그림 지시문을 한 번 지어, 화풍이 정하는 말(화풍 문단 · 빛 · Mood)만 빼고 칸별로 나눠 담는다.
   노출은 세 단계(bold · moderate · low)를 다 지어 노출 줄만 따로 둔다 — 막혔을 때 낮출 수 있게.

   node tools/import-subject.cjs sam <장수 열쇠> --id sam.<이름> [--worlds samguk,fantasy,mecha] [--from ../sam-atelier] [--style <칸 꼴 화풍>]
   node tools/import-subject.cjs element <원소 열쇠> --id el.<이름> [--worlds fantasy,steampunk,mecha] [--from ../element-atelier]
   이미 있는 복사본은 덮지 않는다 — 새 판으로 다시 가져오려면 --replace(옛 그림 기록은 source.commit 으로 옛 판을 가리킨다).
   덮어쓰기: data/subjects/<id>.overrides.json 의 replace[{field, from, to, why, worlds?}] 를 가져온 뒤 세계마다(worlds 가 있으면 그 세계만) 적용한다 —
   원본 줄은 worlds.<세계>.original.<칸> 에 남긴다. from 이 원본에 없으면 멈춘다(원본이 바뀌었다는 뜻). */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), cp = require('node:child_process');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [atelier, key] = args;
if (!atelier || !key || !flag('id')) { console.error('쓰는 법: node tools/import-subject.cjs <sam|element> <열쇠> --id <공방.이름> [--worlds …] [--from …]'); process.exit(1); }
const id = flag('id');
if (!/^[a-z]+\.[a-z0-9]+$/.test(id)) { console.error('id 꼴은 공방.이름(소문자 · 숫자): ' + id); process.exit(1); }
const out = path.join(ROOT, 'data/subjects', id + '.json');
if (fs.existsSync(out) && !args.includes('--replace')) { console.error('이미 있다(덮지 않음): ' + out); process.exit(1); }

const CFG = {
  sam: { from: '../sam-atelier', lib: 'prompt-sam.js', design: 'data/sam-design.json', worlds: 'samguk,fantasy,mecha' },
  element: { from: '../element-atelier', lib: 'prompt-element.js', design: 'data/element-design.json', worlds: 'fantasy,steampunk,mecha' }
}[atelier];
if (!CFG) { console.error('모르는 공방: ' + atelier); process.exit(1); }
const SRC = path.resolve(ROOT, flag('from', CFG.from)), worlds = flag('worlds', CFG.worlds).split(',');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/look-spec.js', 'lib/casual-tree.js', 'lib/casual-tree-v2.js', 'lib/' + CFG.lib]) {
  const p = path.join(SRC, f); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx);
}
const T = ctx.window.AtelierSpec, P = ctx.window.AtelierPrompt;
const D = JSON.parse(fs.readFileSync(path.join(SRC, CFG.design), 'utf8')), S = JSON.parse(fs.readFileSync(path.join(SRC, 'data/style.json'), 'utf8'));
const commit = cp.execSync('git rev-parse --short HEAD', { cwd: SRC }).toString().trim();
const EXPOSURES = ['bold', 'moderate', 'low'];
const GENRE = { samguk: 'THREE KINGDOMS', fantasy: 'HIGH FANTASY', mecha: 'MECHA', steampunk: 'STEAMPUNK' };
const warn = [];

/* 삼국지 — 칸 꼴 정리판을 칸별로 */
function samWorld(world, style) {
  const W = {}; W.exposure = {};
  for (const ex of EXPOSURES) {
    const text = P.build(D, S, key, world, { style, look: { exposure: ex } });
    const sec = {}; let cur = 'head';
    for (const line of text.split('\n')) {
      const m = /^([1-5])\. (.*)$/.exec(line);
      if (m) { cur = m[1]; sec[cur] = { title: m[2], lines: [] }; continue; }
      if (!line.trim()) continue;
      (sec[cur] = sec[cur] || { lines: [] }).lines.push(line);
    }
    for (const n of ['1', '2', '3', '4', '5']) if (!sec[n]) throw new Error(world + ' 지시문에 ' + n + ' 칸이 없다 — 칸 꼴 화풍이 아니다(--style)');
    const exLine = sec['3'].lines.filter(l => /^Exposure\b/.test(l));
    W.exposure[ex] = exLine.join(' ');
    if (ex !== 'bold') continue;
    W.genre = (sec['3'].title.split(' — ')[1] || GENRE[world] || world).trim();
    W.head = sec.head.lines.join(' ');
    W.faceFrame = sec['1'].lines.slice(1).join(' ');
    W.character = sec['2'].lines;
    W.costume = sec['3'].lines.filter(l => !/^Exposure\b/.test(l));
    W.scene = sec['4'].lines.filter(l => !/^(Light|Mood):/.test(l));
    W.constraints = sec['5'].lines;
    sec['4'].lines.filter(l => /^Mood:/.test(l)).forEach(l => warn.push(world + ' Mood 줄을 뺐다(화풍 쪽 말): ' + l.slice(0, 60)));
  }
  return W;
}

/* 원소 — 짧은 판(이름표 붙은 문단)을 칸별로 */
function elWorld(world) {
  const W = { exposure: {} };
  for (const ex of EXPOSURES) {
    const text = P.build(D, S, key, world, { style: S['default'], look: { exposure: ex } });
    const paras = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    const c = { head: '', faceFrame: '', character: [], costume: [], scene: [], constraints: [], exposure: '' };
    paras.forEach((p, i) => {
      if (i === 0) { c.head = p; return; }
      if (/^Style:/.test(p) || /^Light:/.test(p)) return;
      if (/^Her:/.test(p)) { c.character.push(p.replace(/^Her:/, 'Look:')); return; }
      if (/^Face proportions:/.test(p)) { c.faceFrame = p; return; }
      if (/^Her element:/.test(p)) { c.character.push(p.replace(/^Her element:/, 'Element:')); return; }
      if (/^World and costume:/.test(p)) { c.costume.push(p.replace(/\s*LIGHT:[^]*?(?=$)/, '').trim()); return; }
      if (/^Outfit silhouette:/.test(p)) { c.costume.push(p.replace(/^Outfit silhouette:/, 'Silhouette:')); return; }
      if (/^EXPOSURE/.test(p)) { c.exposure = p.replace(/^EXPOSURE/, 'Exposure'); return; }
      if (/^(Pose|Composition):/.test(p)) { c.scene.push(p); return; }
      if (/^One figure only/.test(p)) { c.constraints.push(p); return; }
      warn.push(world + ' 모르는 문단 → CHARACTER 에 넣음: ' + p.slice(0, 60)); c.character.push(p);
    });
    W.exposure[ex] = c.exposure;
    if (ex !== 'bold') continue;
    Object.assign(W, { genre: GENRE[world] || world.toUpperCase(), head: c.head, faceFrame: c.faceFrame, character: c.character, costume: c.costume, scene: c.scene, constraints: c.constraints });
  }
  return W;
}

let style = flag('style', null);
if (atelier === 'sam' && !style) style = Object.keys(S.styles).filter(k => P.sectionsOn && P.sectionsOn(S, k, 'world'))[0];
const subj = {
  id, ko: flag('ko', key), defaultExposure: 'bold',
  source: { atelier, key, repo: 'polos0117/' + path.basename(SRC), commit, date: new Date().toISOString().slice(0, 10),
    builder: atelier === 'sam' ? 'lib/prompt-sam.js build (칸 꼴 · 화풍 ' + style + ' — 화풍 말은 뺐다)' : 'lib/prompt-element.js build (짧은 판 — 화풍 말은 뺐다)',
    faceWorld: atelier === 'sam' && T.SECTIONS ? (T.SECTIONS.faceWorld || '') : undefined },
  worlds: {}
};
for (const w of worlds) subj.worlds[w] = atelier === 'sam' ? samWorld(w, style) : elWorld(w);
const ovF = path.join(ROOT, 'data/subjects', id + '.overrides.json');
if (fs.existsSync(ovF)) {
  const OV = JSON.parse(fs.readFileSync(ovF, 'utf8'));
  for (const w of worlds) {
    const W = subj.worlds[w];
    for (const r of OV.replace || []) {
      if (r.worlds && !r.worlds.includes(w)) continue;
      const cur = W[r.field], arr = Array.isArray(cur);
      const txt = arr ? cur.join('\n') : cur;
      if (typeof txt !== 'string' || txt.indexOf(r.from) < 0) { console.error(w + ' ' + r.field + ' 에 「' + r.from + '」 가 없다 — 원본이 바뀌었다. overrides 를 고친다'); process.exit(1); }
      W.original = W.original || {};
      if (!(r.field in W.original)) W.original[r.field] = cur;
      const nt = txt.split(r.from).join(r.to);
      W[r.field] = arr ? nt.split('\n') : nt;
    }
  }
  subj.overrides = (OV.replace || []).map(r => Object.assign({ field: r.field, from: r.from, to: r.to, why: r.why }, r.worlds ? { worlds: r.worlds } : {}));
  /* 노출 줄 통째로 — 「Skin shown:」 꼴(드러나는 부위만), 지킴 말은 exposureConstraint(노출을 넣을 때만 5칸에) */
  if (OV.exposure) for (const w of worlds) if (OV.exposure[w]) {
    const W = subj.worlds[w]; W.original = W.original || {};
    if (!('exposure' in W.original)) W.original.exposure = W.exposure;
    W.exposure = Object.assign({}, W.exposure, OV.exposure[w]);
    if (OV.exposureConstraint && OV.exposureConstraint[w]) W.exposureConstraint = OV.exposureConstraint[w];
    subj.overrides.push({ field: 'exposure', world: w, why: OV.exposure.why });
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(subj, null, 1) + '\n');
/* 목록(data/subjects/index.json) — 화면이 읽는다 */
const listF = path.join(ROOT, 'data/subjects/index.json');
const list = fs.existsSync(listF) ? JSON.parse(fs.readFileSync(listF, 'utf8')) : { subjects: [] };
list.subjects = list.subjects.filter(s => s.id !== id).concat([{ id, ko: subj.ko, atelier, key, worlds, commit, date: subj.source.date }]).sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(listF, JSON.stringify(list, null, 1) + '\n');
console.log('썼다 ' + path.relative(ROOT, out) + ' — 세계 ' + worlds.join(' · ') + ' · 원본 ' + subj.source.repo + '@' + commit);
warn.forEach(w => console.log('  ! ' + w));
