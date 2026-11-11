#!/usr/bin/env node
/* 일상컷 일감 — 옆 공방(삼국지)의 일상컷 계획(tools/casual-plan.cjs --out)을 읽어, 그 지시문의 STYLE 줄만 화풍공방 조합(+ 피부 마감)으로 바꾼 API 일감을 만든다.
   사용자 2026-11-11 「확정화풍에서 피부 광 효과 추가한 버전으로 일상컷도 만들어줘. 여기서 만들어주면 돼」.
   일상컷은 세계 그림을 첨부해 고치는 꼴(images/edits) — 칸마다 ref(그림 저장소의 그림 이름)를 박고 tools/draw-api.cjs 가 첨부해 보낸다.
   칸 이름: <조합>__<캐릭터>__<세계>-casual<N>[-노출][=피부]  (N = 삼국지 계획의 컷 번호 — 장면이 서로 다르다)

   node tools/casual-job.cjs --plan <계획 폴더> --recipe <조합 열쇠|이름> --subject sam.wenyang --ref <첨부할 그림 이름> [--skin <열쇠@판>]
        [--model api26] [--round N] [--label …] [--free N=<옷 한 줄>] [--img ../style-atelier-img] [--dry]
   바꾸는 것: 「STYLE: …」 한 줄 → 조합의 화풍 문단(방향 · 얼굴 · 채색) + 피부 마감 줄(SKIN FINISH:), 끝에 AVOID 줄(조합 · 피부 avoid).
   조명 줄은 넣지 않는다 — 조합의 Light 줄은 갑옷 · 세계 그림용이고, 일상컷의 빛은 장면이 정한다. 옷 자유 컷(계획의 ofree)은 --free 로 받은 옷 한 줄을 Outfit 줄에. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), cp = require('node:child_process');
const B = require('../lib/build.js');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), has = k => args.includes('--' + k), flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flags = k => args.map((a, i) => a === '--' + k ? args[i + 1] : null).filter(Boolean);
const die = m => { console.error(m); process.exit(1); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const P = J('data/parts.json'), R = J('data/recipes.json'), SK = J('data/skins.json');
const IMG = path.resolve(ROOT, flag('img', '../style-atelier-img')), model = flag('model', 'api26'), label = flag('label', ''), sid = flag('subject', 'sam.wenyang');
const planDir = flag('plan'), recipe = flag('recipe'), ref = flag('ref'), skinRef = flag('skin', null);
if (!planDir || !recipe || !ref) die('쓰는 법: node tools/casual-job.cjs --plan <계획 폴더> --recipe <조합> --ref <첨부할 그림 이름> [--skin 열쇠@판]');
if (B.MODELS.indexOf(model) < 0 || !/^api/.test(model)) die('일상컷은 첨부 그림을 보내는 API 일감만(api26 · api25): ' + model);
const plan = JSON.parse(fs.readFileSync(path.join(planDir, 'plan.json'), 'utf8'));
const subj = J('data/subjects/' + sid + '.json');
const refRec = path.join(IMG, 'rec', ref + '.json'); if (!fs.existsSync(refRec)) die('첨부할 그림이 그림 저장소에 없다: ' + ref);
const refMeta = B.parseImage(ref); if (!refMeta || refMeta.subject !== sid || refMeta.world !== plan.world) die('첨부 그림의 캐릭터 · 세계가 계획과 다르다: ' + ref);
const rs = B.resolve(P, R, recipe); if (B.retiredIn(rs).length) die('내린 부품: ' + B.retiredIn(rs).join(' · '));
const sk = skinRef ? B.skin(SK, skinRef) : null;
const free = {}; flags('free').forEach(x => { const i = x.indexOf('='); free[+x.slice(0, i)] = x.slice(i + 1).trim(); });
const avoid = [...new Set(rs.parts.flatMap(p => p.avoid).concat(sk ? sk.avoid : []))];

const slots = [];
for (const cut of plan.cuts) {
  const n = cut.n, pf = path.join(planDir, plan.world + '-casual' + n + '-prompt.txt');
  if (!fs.existsSync(pf)) die('계획에 지시문이 없다: ' + pf);
  let text = fs.readFileSync(pf, 'utf8').trim();
  const lines = text.split('\n'), si = lines.findIndex(l => /^STYLE: /.test(l));
  if (si < 0) die(pf + ' 에 STYLE 줄이 없다');
  lines.splice(si, 1, 'STYLE: ' + B.paragraph(rs), ...(sk ? ['', 'SKIN FINISH: ' + sk.text] : []));
  if (cut.ofree) {
    if (!free[n]) die('컷 ' + n + ' 은 옷 자유 — --free ' + n + '=<옷 한 줄> 이 있어야 한다');
    const oi = lines.findIndex(l => /^Outfit: /.test(l)); if (oi < 0) die(pf + ' 에 Outfit 줄이 없다');
    lines[oi] = 'Outfit: ' + free[n];
  }
  if (avoid.length) lines.push('', 'AVOID: ' + avoid.join(', ') + '.');
  text = lines.join('\n');
  const kind = 'casual' + n, ex = 'bold';   /* 삼국지 일상컷 기본(skin_exposure bold) — 캐릭터 기본 노출과 같아 칸 이름에 안 붙는다 */
  const slot = B.slotName(rs.id, sid, plan.world, kind, ex, subj, null, null, sk && sk.code);
  slots.push({ slot, file: B.imageName(slot, model, 1), subject: sid, subject_commit: subj.source.commit, world: plan.world, kind, exposure: ex, model, n: 1,
    recipe: { id: rs.id, name: rs.name, display: B.displayName(rs), parts: rs.parts.map(p => ({ axis: p.axis, key: p.key, v: p.v, code: p.code, ko: p.ko, pairs: p.pairs || null, requires: p.requires || null })), untested: B.untested(rs) },
    subject_overrides: [], background: null, boost: null, skin: sk ? { key: sk.key, v: sk.v, code: sk.code, ko: sk.ko } : null,
    ref, casual: { from: 'sam-atelier tools/casual-plan.cjs', card: plan.card, cut: n, seed: plan.seed || null, ofree: !!cut.ofree, outfit_free: cut.ofree ? free[n] : null },
    prompt: text, prompt_sha256: sha(text) });
}
const jobsDir = path.join(IMG, 'jobs'), dirs = fs.readdirSync(jobsDir).filter(d => /^j\d{4}/.test(d)).sort();
for (const s of slots) if (fs.existsSync(path.join(IMG, 'rec', s.file + '.json'))) die('이미 있는 그림: ' + s.file);
const jid = 'j' + String(+dirs[dirs.length - 1].slice(1, 5) + 1).padStart(4, '0') + (label ? '-' + label : '');
const round = +flag('round', JSON.parse(fs.readFileSync(path.join(jobsDir, dirs[dirs.length - 1], 'slots.json'), 'utf8')).round || 1);
console.log(round + '차 ' + jid + ' — 일상컷 ' + slots.length + '장 · 첨부 ' + ref + '\n  ' + slots.map(s => s.file).join('\n  '));
if (has('dry')) process.exit(0);
const dir = path.join(jobsDir, jid); fs.mkdirSync(path.join(dir, 'prompts'), { recursive: true });
slots.forEach(s => fs.writeFileSync(path.join(dir, 'prompts', s.file + '.txt'), s.prompt + '\n'));
fs.writeFileSync(path.join(dir, 'slots.json'), JSON.stringify({ job: jid, round, created: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), model, label, size: slots.length,
  slots: slots.map(s => { const o = Object.assign({}, s); delete o.prompt; o.prompt_file = 'jobs/' + jid + '/prompts/' + s.file + '.txt'; return o; }) }, null, 1) + '\n');
fs.writeFileSync(path.join(dir, 'REQUEST.md'), '# 일감 ' + jid + ' — ' + round + '차 · 일상컷 ' + slots.length + '장(API)\n\nClaude 가 `tools/draw-api.cjs` 로 그린다(첨부 그림 `' + ref + '` 를 images/edits 로). GPT 세션 일감이 아니다.\n');
cp.execFileSync('python3', [path.join(__dirname, 'ingest.py'), '--img', IMG, '--refresh'], { stdio: 'inherit' });
