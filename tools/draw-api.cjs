#!/usr/bin/env node
/* API 로 일감 그리기 — 모델이 api26 · api25 인 일감(make-job --model api26)의 빈 칸을 OpenAI 그림 API 로 그려 inbox/ 에 둔다.
   그림 옆에 <그림>.gen.json(모델 · 사용량 · 걸린 시간 · 재시도)을 두면 수거가 기록(rec)의 generation 으로 옮긴다.
   키는 환경 변수 OPENAI_API_KEY 로만(값을 찍지 않는다). 클라우드 세션은
   NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_NO_WARNINGS=1 을 붙인다.

   node tools/draw-api.cjs <일감> [<일감> …] [--img ../style-atelier-img] [--quality medium] [--dry]
     막히면 같은 지시문으로 한 번 더 → 그래도 막히면 <그림>.blocked.txt(AGENTS.md 6절 — 노출 낮추기는 새 일감으로).
     끝나면 node tools/ingest.py --img … 로 받고 그림 저장소를 민다(또는 inbox 째 밀면 워크플로가 받는다).
   장 수 · 출력 토큰은 그리기 전에 사용자에게 말한다(AGENTS.md 7절). */
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const ROOT = path.join(__dirname, '..');
const B = require('../lib/build.js');
const args = process.argv.slice(2), has = k => args.includes('--' + k), flag = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const IMG = path.resolve(ROOT, flag('img', '../style-atelier-img')), quality = flag('quality', 'medium');
const jobs = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && ['img', 'quality'].includes(args[i - 1].slice(2))));
const MODEL = { api26: 'gpt-image-2.6-sunburst', api25: 'gpt-image-2.5-sunburst' };
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
if (!jobs.length) { console.error('쓰는 법: node tools/draw-api.cjs <일감> …'); process.exit(1); }

const todo = [];
for (const j of jobs) {
  const f = path.join(IMG, 'jobs', j, 'slots.json');
  if (!fs.existsSync(f)) { console.error('없는 일감: ' + j); process.exit(1); }
  const J = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!MODEL[J.model]) { console.error(j + ' 는 모델이 ' + J.model + ' — API 일감(api26 · api25)이 아니다'); process.exit(1); }
  for (const s of J.slots) {
    const done = fs.existsSync(path.join(IMG, 'rec', s.file + '.json')) || fs.existsSync(path.join(IMG, 'rec/blocked', s.file + '.json'))
      || ['.png', '.blocked.txt'].some(x => fs.existsSync(path.join(IMG, 'inbox', s.file + x)));
    if (!done) todo.push({ job: J, slot: s });
  }
}
console.log('그릴 칸 ' + todo.length + '장 — ' + todo.map(t => t.slot.file).join('\n  '));
if (has('dry') || !todo.length) process.exit(0);
const KEY = process.env.OPENAI_API_KEY; if (!KEY) { console.error('OPENAI_API_KEY 가 없다'); process.exit(1); }
fs.mkdirSync(path.join(IMG, 'inbox'), { recursive: true });

async function one({ job, slot }) {
  const prompt = fs.readFileSync(path.join(IMG, slot.prompt_file), 'utf8').trim(), model = MODEL[job.model];
  if (sha(prompt) !== slot.prompt_sha256) throw new Error(slot.file + ' 지시문 해시가 일감과 다르다');
  let last = '';
  for (let retry = 0; retry < 2; retry++) {
    const t0 = Date.now();
    /* 첨부 그림이 있는 칸(일상컷 — tools/casual-job.cjs)은 images/edits 로 그 그림을 함께 보낸다 */
    let r, endpoint = 'images/generations';
    try {
    if (slot.ref) {
      const fd = new FormData(), rm = B.parseImage(slot.ref), rf = path.join(IMG, 'img', rm.subject, rm.world, slot.ref + '.webp');
      if (!fs.existsSync(rf)) throw new Error('첨부 그림이 없다: ' + rf);
      fd.append('model', model); fd.append('prompt', prompt); fd.append('n', '1'); fd.append('size', '1024x1536'); fd.append('quality', quality); fd.append('output_format', 'png');
      fd.append('image[]', new Blob([fs.readFileSync(rf)], { type: 'image/webp' }), path.basename(rf));
      r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY }, body: fd }); endpoint = 'images/edits';
    } else r = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { Authorization: 'Bearer ' + KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ model, prompt, n: 1, size: '1024x1536', quality, output_format: 'png' }) });
    } catch (e) { last = '네트워크: ' + e.message; console.log('  다시 — ' + slot.file + ' · ' + last); continue; }   /* fetch failed(연결 끊김)는 한 번 더 */
    const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { /* 아래에서 */ }
    if (r.ok && j && j.data && j.data[0] && j.data[0].b64_json) {
      const png = Buffer.from(j.data[0].b64_json, 'base64');
      fs.writeFileSync(path.join(IMG, 'inbox', slot.file + '.png'), png);
      fs.writeFileSync(path.join(IMG, 'inbox', slot.file + '.gen.json'), JSON.stringify({ tool: 'tools/draw-api.cjs', model, endpoint, quality, ref: slot.ref || null,
        usage: j.usage || null, seconds: (Date.now() - t0) / 1000, retries: retry, png_sha256: sha(png), date: new Date().toISOString().slice(0, 10) }, null, 1) + '\n');
      console.log('받았다 ' + slot.file + ' · ' + ((Date.now() - t0) / 1000).toFixed(1) + '초 · 출력 ' + (j.usage && j.usage.output_tokens));
      return (j.usage && j.usage.output_tokens) || 0;
    }
    last = (j && j.error && j.error.message) || t.slice(0, 300);
    const policy = r.status === 400 && /safety|policy|moderation|rejected/i.test(last);
    if (!policy && r.status !== 429 && r.status < 500) break;
  }
  fs.writeFileSync(path.join(IMG, 'inbox', slot.file + '.blocked.txt'), last + '\n');
  console.log('막힘 ' + slot.file + ' — ' + last.slice(0, 120));
  return 0;
}
(async () => {
  let tok = 0;
  for (let i = 0; i < todo.length; i += 3) tok += (await Promise.all(todo.slice(i, i + 3).map(one))).reduce((a, b) => a + b, 0);
  console.log('출력 토큰 ' + tok + ' — 다음: python3 tools/ingest.py --img ' + path.relative(process.cwd(), IMG));
})().catch(e => { console.error(e.message); process.exit(1); });
