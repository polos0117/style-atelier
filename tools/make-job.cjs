#!/usr/bin/env node
/* 일감 만들기 — 칸(조합 × 캐릭터 × 세계)을 정해 지시문을 다 지어 그림 저장소 jobs/ 에 칸 4개씩 끊어 둔다.
   GPT 세션은 일감 하나(REQUEST.md)만 읽고 그려 inbox/ 에 올린다 — docs/STRUCTURE.md 3절.

   칸 고르기(둘 중 하나):
     --recipes a,b,c                 이름 붙인 조합(data/recipes.json) 또는 조합 이름(km1-…)
     --base <조합> --vary <축>[=k1,k2] 기준 조합에서 그 축만 바꾼 것(목록이 없으면 그 축 부품 전부, 같이 못 쓰는 짝은 뺀다)
   그 밖:
     --subject sam.wenyang[,el.fe]  --world samguk[,fantasy]   (캐릭터마다 그 세계가 있어야 한다 — 없으면 건너뛴다)
       비우면 data/focus.json(지금은 문앙 · 무협 — 화풍 비교는 캐릭터 하나로). 그 밖의 캐릭터 · 세계는 --off-focus 를 붙일 때만(사용자가 정할 때).
     --model chatgpt(기본) | api26 | api25    --exposure none|bold|moderate|low(기본은 data/focus.json — 지금 none, 노출 줄 없이)
     --round N(차수 — 화면 「1차 › 문앙」 묶음. 기본은 가장 최근 일감의 차수, 처음이면 1)
     --size 10(일감 하나에 칸 수 — 사용자 2026-11-10 「4장보다 한 번에 맡기는 양 더 늘려도 돼」, 처음엔 4)  --label <짧은 이름>  --repeat(이미 그린 칸도 다시 — 번호를 올린다)
     --img ../style-atelier-img     --dry(쓰지 않고 칸만 보인다)
   아직 아무도 손대지 않은 일감을 크게 다시 묶기: --merge all | j0003,j0004 [--size 10]
     예약(CLAIM.md) · 그림(rec · rec/blocked · inbox)이 하나도 없는 일감만. 차수 · 모델 · 캐릭터가 같은 칸끼리 차례대로 고르게 나눠 새 일감으로,
     옛 일감은 지우지 않고 slots.json 에 retired · merged_into 를 적는다(NEXT.md · 수거 · 겹침 검사에서 빠진다). 칸 이름 · 지시문은 그대로.
   일감 내리기(보류): --hold j0014,j0015 --why '<까닭>' — 예약 · 그림이 없는 일감만, 지우지 않고 retired · hold 를 적는다(NEXT.md 에서 빠진다).
   이미 만든 일감의 REQUEST.md 를 지금 꼴로 다시 쓰기: --rewrite all | j0001,j0002(칸 · 지시문은 그대로)
   이미 그린 칸(rec/)과 열린 일감에 들어 있는 칸은 --repeat 없이는 다시 넣지 않는다. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), cp = require('node:child_process');
const B = require('../lib/build.js');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2), has = k => args.includes('--' + k), flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/parts.json'), 'utf8')), R = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/recipes.json'), 'utf8'));
const IMG = path.resolve(ROOT, flag('img', '../style-atelier-img'));
const model = flag('model', 'chatgpt'), size = +flag('size', 10), label = flag('label', '');
let exposure = flag('exposure', null);   /* 비우면 data/focus.json 의 exposure(지금은 none — 노출 줄 없이) */
if (B.MODELS.indexOf(model) < 0) die('모르는 모델: ' + model + ' (' + B.MODELS.join(' · ') + ')');
if (label && !/^[a-z0-9-]{1,32}$/.test(label)) die('label 은 소문자 · 숫자 · - 로 32자까지');
function die(m) { console.error(m); process.exit(1); }
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
if (flag('rewrite')) { rewrite(flag('rewrite')); process.exit(0); }
if (flag('merge')) { merge(flag('merge')); process.exit(0); }
if (flag('hold')) { hold(flag('hold'), flag('why', '')); process.exit(0); }

/* 조합 목록 */
let recipes = [];
if (flag('recipes')) recipes = flag('recipes').split(',');
else if (flag('base') && flag('vary')) {
  const [axis, list] = flag('vary').split('='), base = B.resolve(P, R, flag('base'));
  if (B.AXES.indexOf(axis) < 0) die('모르는 축: ' + axis);
  const keys = list ? list.split(',') : B.live(P, axis);
  for (const k of keys) {
    const spec = {}; base.parts.forEach(p => { spec[p.axis] = p.key + '@' + p.v; }); spec[axis] = k;
    const rs = B.resolve(P, R, spec), bad = B.clashes(rs);
    if (bad.length) { console.log('  건너뜀(같이 못 쓰는 짝) ' + axis + '/' + k + ': ' + bad.join(' / ')); continue; }
    recipes.push(rs.id);
  }
} else die('--recipes 또는 --base + --vary 가 있어야 한다');

const FOCUS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/focus.json'), 'utf8'));
const subjects = flag('subject', FOCUS.subject).split(',').filter(Boolean), worlds = flag('world', FOCUS.world).split(',').filter(Boolean);
if (!has('off-focus') && (subjects.some(s => s !== FOCUS.subject) || worlds.some(w => w !== FOCUS.world)))
  die('지금은 ' + FOCUS.subject + ' · ' + FOCUS.world + ' 만 그린다(data/focus.json — ' + FOCUS.why.slice(0, 60) + '…). 사용자가 정했으면 --off-focus');

/* 이미 있는 것 — 그린 그림(rec) · 막힌 칸 · 열린 일감 */
const taken = {}; /* 칸__모델 → 가장 큰 번호 */
const bump = (base) => { const m = B.parseImage(base); if (!m) return; const k = m.slot + '__' + m.model; taken[k] = Math.max(taken[k] || 0, m.n); };
for (const d of ['rec', 'rec/blocked']) { const p = path.join(IMG, d); if (fs.existsSync(p)) fs.readdirSync(p).filter(f => f.endsWith('.json')).forEach(f => bump(f.slice(0, -5))); }
const jobsDir = path.join(IMG, 'jobs'); fs.mkdirSync(jobsDir, { recursive: true });
const jobDirs = fs.readdirSync(jobsDir).filter(d => /^j\d{4}/.test(d)).sort();
for (const d of jobDirs) { const s = path.join(jobsDir, d, 'slots.json'); if (fs.existsSync(s)) { const J = JSON.parse(fs.readFileSync(s, 'utf8')); if (!J.retired) J.slots.forEach(x => bump(x.file)); } }

const slots = [];
for (const sid of subjects) {
  const sf = path.join(ROOT, 'data/subjects', sid + '.json'); if (!fs.existsSync(sf)) die('없는 캐릭터: ' + sid + ' (tools/import-subject.cjs 로 가져온다)');
  const subj = JSON.parse(fs.readFileSync(sf, 'utf8'));
  for (const w of worlds) {
    if (!subj.worlds[w]) { console.log('  건너뜀 ' + sid + ' 에 세계 ' + w + ' 없음'); continue; }
    for (const rc of recipes) {
      if (R.recipes[rc] && R.recipes[rc].retired) die('내린 조합: ' + rc + ' — ' + R.recipes[rc].retired_why);
      const dead = B.retiredIn(B.resolve(P, R, rc)); if (dead.length) die('내린 부품이 들어 있다: ' + rc + ' — ' + dead.join(' · '));
      /* 노출 — 고른 값, 없으면 초점 노출(그 캐릭터 · 세계에 그 단계가 있을 때만 — slit 은 문앙 복사본에만 있다), 없으면 캐릭터 기본값 */
      const ex = exposure || (FOCUS.exposure && (FOCUS.exposure === 'none' || (subj.worlds[w].exposure || {})[FOCUS.exposure] != null) ? FOCUS.exposure : undefined);
      const b = B.build(P, R, subj, w, rc, { model, exposure: ex });
      const k = b.slot + '__' + model;
      if (taken[k] && !has('repeat')) { console.log('  있음(건너뜀) ' + b.slot); continue; }
      const n = (taken[k] || 0) + 1; taken[k] = n;
      slots.push({ slot: b.slot, file: B.imageName(b.slot, model, n), subject: sid, subject_commit: subj.source.commit, world: w, kind: b.kind, exposure: b.exposure, model, n,
        recipe: { id: b.recipe.id, name: b.recipe.name, display: B.displayName(b.recipe), parts: b.recipe.parts.map(p => ({ axis: p.axis, key: p.key, v: p.v, code: p.code, ko: p.ko, pairs: p.pairs || null, requires: p.requires || null })), untested: B.untested(b.recipe) },   /* 그 판의 한글 이름 · 짝 규칙을 박아 둔다(검토안 6.2 — 나중에 이름 · 규칙이 바뀌어도 옛 그림 기록은 그대로) */
        subject_overrides: (subj.overrides || []).map(o => o.field + ': ' + o.from + ' → ' + o.to),
        prompt: b.text, prompt_sha256: sha(b.text) });
    }
  }
}
if (!slots.length) { console.log('새 칸이 없다'); process.exit(0); }
let next = jobDirs.length ? +jobDirs[jobDirs.length - 1].slice(1, 5) + 1 : 1;
const lastRound = jobDirs.length ? (JSON.parse(fs.readFileSync(path.join(jobsDir, jobDirs[jobDirs.length - 1], 'slots.json'), 'utf8')).round || 1) : 1;
const round = +flag('round', lastRound);
if (!(round >= 1 && Number.isInteger(round))) die('--round 는 1 이상 정수');
const made = [];
const per = Math.ceil(slots.length / Math.ceil(slots.length / size));   /* 고르게 — 12칸이면 10 · 2 가 아니라 6 · 6 */
for (let i = 0; i < slots.length; i += per) {
  const part = slots.slice(i, i + per), jid = 'j' + String(next++).padStart(4, '0') + (label ? '-' + label : '');
  made.push([jid, part]);
}
console.log(round + '차');
for (const [jid, part] of made) console.log(jid + ': ' + part.map(s => s.file).join('\n        '));
if (has('dry')) process.exit(0);

const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
for (const [jid, part] of made) {
  const dir = path.join(jobsDir, jid); fs.mkdirSync(path.join(dir, 'prompts'), { recursive: true });
  part.forEach(s => fs.writeFileSync(path.join(dir, 'prompts', s.file + '.txt'), s.prompt + '\n'));
  fs.writeFileSync(path.join(dir, 'slots.json'), JSON.stringify({ job: jid, round, created: today, model, label, size: part.length,
    slots: part.map(s => { const o = Object.assign({}, s); delete o.prompt; o.prompt_file = 'jobs/' + jid + '/prompts/' + s.file + '.txt'; return o; }) }, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'REQUEST.md'), request(jid, part, model, round));
}
/* NEXT.md · 색인은 수거 도구가 다시 짓는다(파일만 보고) */
cp.execFileSync('python3', [path.join(__dirname, 'ingest.py'), '--img', IMG, '--refresh'], { stdio: 'inherit' });
console.log('일감 ' + made.length + '개 · 칸 ' + slots.length + ' — ' + path.relative(process.cwd(), jobsDir));

/* 이미 만든 일감의 REQUEST.md 를 지금 꼴로 다시 쓴다 — 칸 · 지시문(prompts/)은 그대로. --rewrite all | j0001,j0002 */
/* 손대지 않은 일감을 크게 다시 묶는다 */
function merge(which) {
  const IMGR = path.resolve(ROOT, flag('img', '../style-atelier-img')), jd = path.join(IMGR, 'jobs'), sz = +flag('size', 10);
  const all = fs.readdirSync(jd).filter(d => /^j\d{4}/.test(d)).sort();
  const want = which === 'all' ? all : which.split(',');
  const touched = f => ['rec/' + f + '.json', 'rec/blocked/' + f + '.json'].some(p => fs.existsSync(path.join(IMGR, p)))
    || (fs.existsSync(path.join(IMGR, 'inbox')) && fs.readdirSync(path.join(IMGR, 'inbox')).some(x => x.startsWith(f + '.')));
  const pick = [];
  for (const jid of want) {
    const J = JSON.parse(fs.readFileSync(path.join(jd, jid, 'slots.json'), 'utf8'));
    if (J.retired) continue;
    if (fs.existsSync(path.join(jd, jid, 'CLAIM.md')) || J.slots.some(s => touched(s.file))) { console.log('  그대로(예약 · 그림 있음) ' + jid); continue; }
    pick.push(J);
  }
  if (!pick.length) { console.log('묶을 일감이 없다'); return; }
  const groups = new Map();   /* 차수 · 모델 · 캐릭터 → 칸 */
  pick.forEach(J => J.slots.forEach(s => { const k = (J.round || 1) + '|' + J.model + '|' + s.subject; if (!groups.has(k)) groups.set(k, { J, labels: [], slots: [] }); const g = groups.get(k); g.slots.push(Object.assign({}, s, { prompt: fs.readFileSync(path.join(IMGR, s.prompt_file), 'utf8').trim() })); if (J.label && !g.labels.includes(J.label)) g.labels.push(J.label); }));
  let next = +all[all.length - 1].slice(1, 5) + 1;
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), made = {};
  for (const [, g] of groups) {
    const parts = Math.ceil(g.slots.length / sz), per = Math.ceil(g.slots.length / parts);   /* 고르게 나눈다 — 17 → 9 · 8 */
    for (let i = 0; i < g.slots.length; i += per) {
      const part = g.slots.slice(i, i + per), lb = g.labels.join('-').slice(0, 32), jid = 'j' + String(next++).padStart(4, '0') + (lb ? '-' + lb : '');
      part.forEach(s => { if (sha(s.prompt) !== s.prompt_sha256) die(s.file + ' 지시문 해시가 다르다'); });
      const dir = path.join(jd, jid); fs.mkdirSync(path.join(dir, 'prompts'), { recursive: true });
      part.forEach(s => fs.writeFileSync(path.join(dir, 'prompts', s.file + '.txt'), s.prompt + '\n'));
      fs.writeFileSync(path.join(dir, 'slots.json'), JSON.stringify({ job: jid, round: g.J.round || 1, created: today, model: g.J.model, label: lb, size: part.length,
        merged_from: [...new Set(pick.filter(J => J.slots.some(x => part.some(p => p.file === x.file))).map(J => J.job))],
        slots: part.map(s => { const o = Object.assign({}, s); delete o.prompt; o.prompt_file = 'jobs/' + jid + '/prompts/' + s.file + '.txt'; return o; }) }, null, 1) + '\n');
      fs.writeFileSync(path.join(dir, 'REQUEST.md'), request(jid, part, g.J.model, g.J.round || 1));
      part.forEach(s => { made[s.file] = jid; });
      console.log(jid + ' — 칸 ' + part.length);
    }
  }
  for (const J of pick) {
    J.retired = today; J.merged_into = [...new Set(J.slots.map(s => made[s.file]))];
    fs.writeFileSync(path.join(jd, J.job, 'slots.json'), JSON.stringify(J, null, 1) + '\n');
    fs.writeFileSync(path.join(jd, J.job, 'REQUEST.md'), '# 일감 ' + J.job + ' — 합쳐짐\n\n이 일감은 ' + today + ' 에 ' + J.merged_into.join(' · ') + ' 로 합쳤다. 여기서는 그리지 않는다 — `jobs/NEXT.md` 에서 열린 일감을 고른다.\n');
  }
  cp.execFileSync('python3', [path.join(__dirname, 'ingest.py'), '--img', IMGR, '--refresh'], { stdio: 'inherit' });
}

/* 일감 내리기 — 손대지 않은 일감만, 지우지 않는다 */
function hold(which, why) {
  const IMGR = path.resolve(ROOT, flag('img', '../style-atelier-img')), jd = path.join(IMGR, 'jobs'), today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  if (!why) die('--why 가 있어야 한다');
  for (const jid of which.split(',')) {
    const f = path.join(jd, jid, 'slots.json'), J = JSON.parse(fs.readFileSync(f, 'utf8'));
    const busy = fs.existsSync(path.join(jd, jid, 'CLAIM.md')) || J.slots.some(s => ['rec/' + s.file + '.json', 'rec/blocked/' + s.file + '.json'].some(p => fs.existsSync(path.join(IMGR, p))));
    if (busy) { console.log('  그대로(예약 · 그림 있음) ' + jid); continue; }
    J.retired = today; J.hold = why;
    fs.writeFileSync(f, JSON.stringify(J, null, 1) + '\n');
    fs.writeFileSync(path.join(jd, jid, 'REQUEST.md'), '# 일감 ' + jid + ' — 보류\n\n' + today + ' 에 내렸다. 여기서는 그리지 않는다 — `jobs/NEXT.md` 에서 열린 일감을 고른다.\n\n까닭: ' + why + '\n');
    console.log('보류 ' + jid);
  }
  cp.execFileSync('python3', [path.join(__dirname, 'ingest.py'), '--img', IMGR, '--refresh'], { stdio: 'inherit' });
}

function rewrite(which) {
  const IMGR = path.resolve(ROOT, flag('img', '../style-atelier-img')), jd = path.join(IMGR, 'jobs');
  const ids = which === 'all' ? fs.readdirSync(jd).filter(d => /^j\d{4}/.test(d)).sort() : which.split(',');
  for (const jid of ids) {
    const J = JSON.parse(fs.readFileSync(path.join(jd, jid, 'slots.json'), 'utf8'));
    if (J.retired) continue;   /* 합쳐진 일감은 안내 한 줄 그대로 */
    const part = J.slots.map(s => Object.assign({}, s, { prompt: fs.readFileSync(path.join(IMGR, s.prompt_file), 'utf8').trim() }));
    part.forEach(s => { if (sha(s.prompt) !== s.prompt_sha256) die(jid + ' ' + s.file + ' 지시문 해시가 다르다'); });
    fs.writeFileSync(path.join(jd, jid, 'REQUEST.md'), request(jid, part, J.model, J.round || 1));
    console.log('다시 씀 ' + jid + '/REQUEST.md');
  }
}

function request(jid, part, model, round) {
  const how = model === 'chatgpt'
    ? 'ChatGPT 이미지 생성으로 그린다(세로 2:3, 1024×1536).'
    : '그림 API(' + model + ')로 그린다 — Claude 쪽 일감.';
  return [
    '# 일감 ' + jid + ' — ' + round + '차 · 그림 ' + part.length + '장',
    '',
    'polos0117/style-atelier-img 저장소의 일감이야. 아래 칸마다 그림 한 장씩 그려서 WebP 로 바꿔 `inbox/` 폴더에 정해진 이름으로 올려줘(main 에 일반 push). ' + how,
    '',
    '진행 방식 — **묻지 않고 끝까지 한다**(사용자 2026-11-10 「gpt쪽 작업이 둘 다 채팅창에 멈춰서 진행이 안되고있어」)',
    '- 그림을 보여 주고 확인을 기다리지 않는다. 「계속할까요?」 도 묻지 않는다 — 사용자는 올라간 뒤 화풍공방 화면에서 본다.',
    '- 이 환경에서 그림 파일을 저장소에 올릴 수 없으면(파일 쓰기 · push 가 안 되는 채팅) 그리지 말고 예약도 하지 말고, 바로 「이 환경에선 그림을 올릴 수 없다」 고 한 줄 말하고 끝낸다.',
    '',
    '시작 전 — 예약(다른 세션과 겹치지 않게)',
    '1. `jobs/' + jid + '/CLAIM.md` 를 **새 파일로** 만들어 올린다. 내용은 두 줄 — 이 세션을 알아볼 이름(대화 제목 같은 것) · 지금 시각.',
    '2. 이미 `CLAIM.md` 가 있으면(새로 만들기가 실패하면) 다른 세션이 하는 중이다 — `jobs/NEXT.md` 로 돌아가 「예약」 칸이 — 인 다른 일감을 고른다.',
    '   예외: 사용자가 이 일감을 콕 집어 이어서 하라고 했거나 NEXT.md 에 「예약 만료」 로 나오면, 그 파일 끝에 두 줄(이름 · 시각)을 더 적고 이어서 한다.',
    '3. 예약했으면 `rec/` 에 기록이 없는 칸만 그린다.',
    '',
    '그리기',
    '- 이미지 도구(image_gen)로, **크기를 세로 1024×1536 으로 지정**해서, 칸 하나에 호출 한 번. 「아래 지시문을 고치지 말고 그대로 그려라」 로 지시문만 넘긴다.',
    '- 올리는 꼴은 **다른 공방과 같게** — 원본 PNG 는 올리지 않고, WebP(품질 90, 1024×1536)로 바꿔 `inbox/<이름>.webp` 로 올린다(장당 수백 KB).',
    '- 이 일감의 칸을 다 그린 뒤 **한 커밋으로** 올린다(main 에 일반 push). 예약(`CLAIM.md`)만 시작할 때 따로 올린다.',
    '',
    '규칙',
    '- 지시문(코드 블록 안 영어)은 **한 글자도 바꾸지 않고** 그대로 넣는다. 설명 · 앞말을 붙이지 않는다.',
    '- 파일 이름은 칸에 적힌 이름 그대로 + `.webp`. 예: `inbox/' + part[0].file + '.webp`',
    '- 막히면(정책 거절) 같은 지시문으로 한 번 더. 그래도 막히면 그림 대신 `inbox/<이름>.blocked.txt` 에 거절 문구 한 줄. 지시문은 고치지 않는다.',
    '- 그림을 보고 한 줄 남기고 싶으면 `inbox/<이름>.note.txt`(선택).',
    '- `CLAIM.md` 말고 다른 파일은 고치지 않는다. 이미 있는 이름은 덮지 않는다.',
    '- 하다 끊기면 이어받는 세션은 위 예외대로 `CLAIM.md` 에 두 줄을 더 적고, `rec/` 에 기록이 없는 칸만 그린다.',
    '- 다 올리면 끝. 변환 · 썸네일 · 기록 · 목록은 워크플로가 한다.',
    ''
  ].concat(part.map((s, i) => [
    '## ' + (i + 1) + '. `' + s.file + '`',
    '',
    s.recipe.display + ' — ' + s.subject + ' · ' + s.world + (s.exposure ? ' · 노출 ' + s.exposure : ''),
    '',
    '```text', s.prompt, '```', ''
  ].join('\n'))).join('\n');
}
