/* 들어갈 때 로딩 화면 — 전경 · 이름 · 빛 입자(2026-11-24, 사용자 「진짜 게임 로딩화면 같네」 → 「응 넣어줘. 이미 도구도 있을텐데. 픽시같은거」).
   도시 공방(지구본 → 도시 무대)과 원소 공방(주기율표 → 나라)이 글자 하나 다르지 않게 같이 쓴다 — 고치면 두 저장소에 같이.
   공방 몫(낱말 · 움직임 판단 · PixiJS 불러오기 · 기억 열쇠 · 들어가기 · 들어간 뒤 초점)은 부르는 쪽이 넘긴다. 겉모습은 lib/splash.css(같이) + 공방 CSS 의 --sp-* 변수.
   차례: 고르면 전경 그림을 받기 시작 → 600ms 안에 다 풀리면(decode) 화면이 어두워지고(0.18초) 그 뒤에서 들어간다 → 전경이 어둠에서 떠오르며 천천히 다가오고(1.0 → 1.06)
   이름 · 세계 · 한 줄 · 빛 입자(PixiJS, 세계마다 다른 결) → 1.3초에 걷힌다(0.3초 — 모두 1.6초). 누르기 · 아무 키(Enter · Esc …)면 곧바로 걷힌다.
   보이지 않는 경우 — 전경이 없거나, 움직임이 꺼졌거나(기기 움직임 줄이기 · 도구 상자), 이 탭에서 그 자리 그 세계를 이미 봤거나(sessionStorage), 그림이 600ms 안에 안 풀리면 그냥 들어간다.
   PixiJS 는 기다리지 않는다 — 못 받거나 WebGL 이 없으면 입자만 빠진다. 덮개는 aria-hidden, 자리 이름은 polite 알림 한 줄(.sp-live).
   window.AtelierSplash 는 검사 손잡이(본 자리 · 건너뜀 · 입자 수 · 상태). */
const LOG = window.AtelierSplash = window.AtelierSplash || { shown: [], skipped: 0, sprites: 0, pixi: '', state: 'idle' };
const T_IN = 180, HOLD = 1300, OUT = 300, OUT_SKIP = 200, WAIT = 600, CAP = 150;

/* 설계표 글에서 첫 마디 — 「 — 」 · 마침표 앞까지, 길면 쉼표 · 가운뎃점 · 띄어쓰기에서 끊고 … */
export function clause(text, max = 40) {
  let s = String(text || '').trim();
  const cut = [' — ', '—', '. ', '.'].map(k => s.indexOf(k)).filter(i => i > 0);
  if (cut.length) s = s.slice(0, Math.min(...cut)).trim();
  if (s.length <= max) return s;
  const head = s.slice(0, max), at = Math.max(head.lastIndexOf(', '), head.lastIndexOf(' · '), head.lastIndexOf(' '));
  return (at > max * .5 ? head.slice(0, at) : head).replace(/[,\s·]+$/, '') + '…';
}

/* 이 탭에서 본 자리 — 「<자리>|<세계>」 목록. 저장소를 못 쓰면 늘 처음(그래도 오류는 없다) */
const list = key => { try { const a = JSON.parse(sessionStorage.getItem(key) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
export const seen = (key, id) => list(key).includes(id);
const mark = (key, id) => { try { const a = list(key); if (!a.includes(id)) { a.push(id); sessionStorage.setItem(key, JSON.stringify(a.slice(-200))); } } catch (e) {} };

/* 그림을 ms 안에 다 풀면 그 <img>, 아니면 null — 늦게 와도 받아 둔다(다음엔 바로) */
export function preload(url, ms = WAIT) {
  return new Promise(done => {
    const im = new Image(); let over = false;
    const fin = v => { if (over) return; over = true; clearTimeout(t); done(v); };
    const t = setTimeout(() => fin(null), ms);
    im.decoding = 'async'; im.src = url;
    (im.decode ? im.decode() : new Promise((a, b) => { im.onload = a; im.onerror = b; })).then(() => fin(im), () => fin(null));
  });
}

const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };
let BUSY = false, LIVE = null;

/* 들어가기. o = { url, id, store, motion, world, kicker, title: [{ text, cls?, cat? }], n(제목 글자 수), line, live, skip, loadPixi, go(splashed), done() } */
export function enterWithSplash(o) {
  if (BUSY) return;   /* 들어가는 중 — 두 번 눌러도 한 번 */
  if (!o.url || !o.motion || seen(o.store, o.id)) { o.go(false); return; }
  BUSY = true;
  const from = location.href, px = o.loadPixi && hasWebGL() ? o.loadPixi().catch(() => null) : Promise.resolve(null);   /* 그림과 같이 받기 시작 — 기다리지는 않는다 */
  preload(o.url, o.wait || WAIT).then(im => {
    if (location.href !== from) { BUSY = false; return; }   /* 기다리는 사이 뒤로 가기 · 다른 길 — 들어가지 않는다 */
    if (!im) { BUSY = false; o.go(false); return; }
    mark(o.store, o.id); show(o, im, px);
  });
}

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

function show(o, im, px) {
  const root = el('div', 'sp'), fx = el('div', 'sp-fx'), text = el('div', 'sp-text'), title = el('h2', 'sp-title'), bar = el('div', 'sp-bar');
  root.dataset.world = o.world; root.setAttribute('aria-hidden', 'true'); root.style.setProperty('--sp-n', String(Math.max(2, o.n || 4)));
  im.className = 'sp-img'; im.alt = ''; im.draggable = false;
  (o.title || []).forEach(p => { const s = el('span', p.cls || '', p.text); if (p.cat) s.dataset.cat = p.cat; title.appendChild(s); });
  text.append(el('p', 'sp-kicker', o.kicker), title);
  if (o.line) text.appendChild(el('p', 'sp-line', o.line));
  bar.appendChild(el('i'));
  root.append(im, fx, el('div', 'sp-scrim'), text, bar, el('p', 'sp-skip', o.skip));
  document.body.appendChild(root);
  if (!LIVE || !LIVE.isConnected) { LIVE = el('p', 'sp-live'); LIVE.setAttribute('role', 'status'); LIVE.setAttribute('aria-live', 'polite'); document.body.appendChild(LIVE); }
  LIVE.textContent = o.live || '';
  LOG.shown.push(o.id); LOG.state = 'on'; LOG.sprites = 0; LOG.pixi = 'wait';

  let went = false, ending = false, kill = null;
  const goNow = () => { if (!went) { went = true; o.go(true); } };
  const tIn = setTimeout(goNow, T_IN), tEnd = setTimeout(() => end(OUT), LOG.hold > 0 ? LOG.hold : HOLD);   /* LOG.hold — 사진 찍을 때만 길게(검사 손잡이) */
  const skip = e => {
    if (e.type === 'keydown' && (e.ctrlKey || e.metaKey || e.altKey || /^(Shift|Control|Alt|Meta)$/.test(e.key))) return;
    e.preventDefault(); e.stopPropagation(); if (!ending) LOG.skipped++; end(OUT_SKIP);
  };
  const eat = e => { e.preventDefault(); e.stopPropagation(); };
  root.addEventListener('pointerdown', skip); root.addEventListener('click', eat); addEventListener('keydown', skip, true);
  function end(ms) {
    if (ending) return; ending = true; clearTimeout(tIn); clearTimeout(tEnd); goNow();
    root.style.setProperty('--sp-out', ms + 'ms'); root.classList.add('is-out');
    setTimeout(finish, ms);
  }
  function finish() {
    removeEventListener('keydown', skip, true); if (kill) kill(); kill = null; root.remove();
    LOG.state = 'idle'; BUSY = false;
    setTimeout(() => { if (LIVE && LOG.state === 'idle') LIVE.textContent = ''; }, 1500);   /* 읽어 줄 틈을 두고 비운다 */
    if (o.done) { try { o.done(); } catch (e) {} }
  }
  px.then(PIXI => (PIXI && !ending ? particles(PIXI, fx, o.world) : null)).then(k => {
    if (!k) { if (LOG.pixi === 'wait') LOG.pixi = 'none'; return; }
    if (ending) k(); else { kill = k; LOG.pixi = 'on'; fx.classList.add('on'); }
  }, () => { LOG.pixi = 'none'; });
}

/* ── 빛 입자(PixiJS) — 세계마다 결 둘. 텍스처는 캔버스로 그린 흰 모양 넷(빛 점 · 김 · 빛줄 · 네모), 색은 tint. 합쳐 150 개 이하, 틱 하나, 걷히면 지운다 ── */
const rnd = (a, b) => a + Math.random() * (b - a), any = a => a[(Math.random() * a.length) | 0];
function shape(kind) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  if (kind === 'streak') { c.width = 128; c.height = 4; const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.7, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 1, 128, 2); return c; }
  if (kind === 'bit') { c.width = c.height = 8; x.fillStyle = '#fff'; x.fillRect(2, 2, 4, 4); x.globalAlpha = .35; x.fillRect(0, 0, 8, 8); return c; }
  const r = kind === 'puff' ? 64 : 16; c.width = c.height = r * 2;
  const g = x.createRadialGradient(r, r, 0, r, r, r);
  if (kind === 'puff') { g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.5, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
  x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2); return c;
}
const env = (p, a = .2, b = .35) => Math.max(0, Math.min(1, p.t / (p.life * a), (p.life - p.t) / (p.life * b)));
/* 무리 — tex · 수(넓은 화면 기준) · 색 · 섞기 · 태어나기 · 한 걸음 · 투명도 */
const LIGHT = (tints, n) => ({ tex: 'glow', n, tints, add: true, size: [.2, .6],
  born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(h * .15, h + 10); p.vx = 0; p.vy = rnd(-30, -10); p.amp = rnd(6, 20); p.fq = rnd(.5, 1.3); p.life = rnd(2.4, 5); },
  step: (p, dt) => { p.y += p.vy * dt; p.x += Math.sin(p.t * p.fq + p.ph) * p.amp * dt; },
  alpha: p => env(p) * (.55 + .45 * Math.sin(p.t * 3 + p.ph)) });
const FLOCKS = {
  fantasy: [LIGHT([0xffe3a0, 0xfff6dc, 0xd8c6ff, 0xffd27a], 90),
    { tex: 'glow', n: 28, tints: [0xffa24a, 0xff7a3a], add: true, size: [.12, .26],   /* 불티 — 빛 알갱이 사이로 조금 빨리 오른다 */
      born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(h * .5, h + 10); p.vx = rnd(-10, 10); p.vy = rnd(-70, -35); p.life = rnd(1.4, 2.8); },
      step: (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; }, alpha: p => env(p) * (Math.random() < .15 ? .4 : 1) }],
  steampunk: [
    { tex: 'puff', n: 18, tints: [0xf4ead8, 0xe9dccb], add: false, size: [1.4, 3.2], grow: .5,   /* 김 — 아래에서 천천히 오르며 퍼진다 */
      born: (p, w, h) => { p.x = rnd(-w * .1, w * 1.1); p.y = rnd(h * .7, h * 1.15); p.vx = rnd(-10, 10); p.vy = rnd(-34, -14); p.life = rnd(2.6, 4.6); },
      step: (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; }, alpha: p => .2 * env(p, .3, .5) },
    { tex: 'glow', n: 55, tints: [0xffb347, 0xff8c2a, 0xffd27a], add: true, size: [.1, .22],   /* 불꽃 — 튀어 올랐다 휘어 떨어진다 */
      born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(h * .55, h + 10); p.vx = rnd(-40, 40); p.vy = rnd(-160, -60); p.life = rnd(.8, 1.9); },
      step: (p, dt) => { p.vy += 70 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }, alpha: p => env(p, .1, .4) * (Math.random() < .2 ? .35 : 1) }],
  cyberpunk: [
    { tex: 'streak', n: 26, tints: [0x3ff0ff, 0xff3fae, 0xb08cff], add: true, size: [.6, 1.8], streak: true,   /* 빛줄 — 옆으로 스친다 */
      born: (p, w, h) => { const r = Math.random() < .5; p.vx = (r ? 1 : -1) * rnd(500, 1100); p.x = r ? rnd(-200, w * .3) : rnd(w * .7, w + 200); p.y = rnd(0, h); p.vy = 0; p.life = rnd(.35, .9); },
      step: (p, dt) => { p.x += p.vx * dt; }, alpha: p => .8 * env(p, .2, .4) },
    { tex: 'bit', n: 70, tints: [0x3ff0ff, 0xff3fae, 0xffffff], add: true, size: [.5, 1.1],   /* 자료 알갱이 — 깜빡이며 떠오른다 */
      born: (p, w, h) => { p.x = rnd(0, w); p.y = rnd(0, h); p.vx = 0; p.vy = rnd(-26, -8); p.life = rnd(1.5, 3.5); },
      step: (p, dt) => { p.y += p.vy * dt; }, alpha: p => env(p) * (Math.sin(p.t * 9 + p.ph) > .25 ? .95 : .12) }]
};
FLOCKS.mecha = FLOCKS.cyberpunk.map(f => Object.assign({}, f, { tints: f.streak ? [0x62d6ff, 0xffffff, 0x9fe8ff] : [0x62d6ff, 0xffffff] }));   /* 메카(원소) — 차가운 청색 */

async function particles(PIXI, host, world) {
  if (!host.isConnected) return null;
  const flocks = FLOCKS[world] || FLOCKS.fantasy, w = Math.max(2, innerWidth), h = Math.max(2, innerHeight);
  const app = new PIXI.Application(), canvas = document.createElement('canvas');
  try {
    /* lib/holo.js · walk-fx 와 같이 — 배열로 줘야 WebGPU · Canvas 로 넘어가지 않고, WebGL 을 못 얻으면 여기서 멈춘다 */
    await app.init({ canvas, width: w, height: h, backgroundAlpha: 0, antialias: false, preference: ['webgl'],
      resolution: Math.min(window.devicePixelRatio || 1, 1.5), autoDensity: true, autoStart: false, sharedTicker: false });
  } catch (e) { try { app.destroy(); } catch (x) {} return null; }
  const kill = () => { try { app.destroy({ removeView: true }, { children: true, texture: true, textureSource: true }); } catch (e) {} canvas.remove(); LOG.sprites = 0; };   /* 전역 자원은 놓지 않는다 — 다른 효과가 같은 PixiJS 를 쓴다 */
  if (!host.isConnected) { kill(); return null; }
  const scale = Math.max(.5, Math.min(1, (w * h) / (1280 * 800))), tex = {}, parts = [];
  const texOf = k => (tex[k] = tex[k] || PIXI.Texture.from(shape(k)));
  for (const f of flocks) {
    const n = Math.round(f.n * scale);
    for (let i = 0; i < n && parts.length < CAP; i++) {
      const sp = new PIXI.Sprite(texOf(f.tex)); sp.anchor.set(.5); sp.tint = any(f.tints); sp.alpha = 0; if (f.add) sp.blendMode = 'add';
      const p = { sp, f, t: 0, ph: rnd(0, 6.3), s: rnd(f.size[0], f.size[1]) };
      f.born(p, w, h); p.t = rnd(0, p.life * .8);   /* 처음부터 나이를 흩어 한꺼번에 태어나지 않게 */
      if (f.streak) sp.scale.set(p.s, 1); else sp.scale.set(p.s);
      app.stage.addChild(sp); parts.push(p);
    }
  }
  app.ticker.add(tk => {
    const dt = Math.min(.1, tk.deltaMS / 1000);
    for (const p of parts) {
      p.t += dt; if (p.t >= p.life) { p.f.born(p, w, h); p.t = 0; }
      p.f.step(p, dt); p.sp.position.set(p.x, p.y); p.sp.alpha = Math.max(0, Math.min(1, p.f.alpha(p)));
      if (p.f.grow) p.sp.scale.set(p.s * (1 + p.f.grow * p.t / p.life));
    }
  });
  canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas); app.ticker.start();
  LOG.sprites = parts.length;
  return kill;
}
