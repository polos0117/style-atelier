/* 화풍공방 조립부 — 부품(data/parts.json) + 조합 + 시험 캐릭터 복사본(data/subjects/*.json)으로 지시문을 짓는다.
   브라우저(window.StyleAtelier)와 node(require) 둘 다. 다른 공방의 조립부는 부르지 않는다 — 캐릭터 쪽 문장은 복사본에 이미 풀려 있다.

   지시문 꼴(다섯 칸 — 삼국지 공방 칸 꼴 정리판과 같은 차례):
     머리말 / 1. STYLE(화풍 문단 + 얼굴 비율) / 2. CHARACTER / 3. COSTUME AND EQUIPMENT — 장르(+ 노출) / 4. SCENE(구도 앞에 빛 줄) / 5. CONSTRAINTS(+ 피할 것)
   화풍 문단 = direction + face + paint, 빛 줄 = 'Light: ' + light + fx.

   이름(docs/STRUCTURE.md 1절):
     조합 = 축 차례로 부품 코드 + 판 번호, '-' 로 잇는다 — km1-ss1-sm1-mu1-xf1
     칸   = <조합>__<캐릭터>__<세계>-<갈래>[-<노출>] — 노출은 캐릭터 기본값이 아닐 때만
     그림 = <칸>__<모델>__<번호>                                                         */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StyleAtelier = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var AXES = ['direction', 'face', 'paint', 'light', 'fx'];
  var KINDS = ['world'];                       /* 일상컷(casual · far)은 아직 — docs/STRUCTURE.md 6절 */
  var MODELS = ['chatgpt', 'api26', 'api25']; /* chatgpt = GPT 세션(ChatGPT 이미지 생성), apiNN = OpenAI 그림 API */

  function vnum(v) { var m = /^v(\d+)$/.exec(v || ''); if (!m) throw new Error('판 꼴이 아니다: ' + v); return +m[1]; }
  function splitRef(ref) { var i = String(ref).indexOf('@'); return i < 0 ? { key: String(ref), v: null } : { key: ref.slice(0, i), v: ref.slice(i + 1) }; }

  /* 부품 하나 — ref 는 '열쇠' 또는 '열쇠@v2'. 모델 · 세계에서만 쓰는 글이 있으면 그것 */
  function part(P, axis, ref, ctx) {
    var r = splitRef(ref), row = ((P.parts || {})[axis] || {})[r.key];
    if (!row) throw new Error('없는 부품: ' + axis + '/' + r.key);
    var v = r.v || row.current, ver = (row.versions || []).filter(function (x) { return x.v === v; })[0];
    if (!ver) throw new Error('없는 판: ' + axis + '/' + r.key + '@' + v);
    ctx = ctx || {};
    var text = ver.text;
    if (ctx.model && ver.models && ver.models[ctx.model] != null) text = ver.models[ctx.model];
    if (ctx.world && ver.worlds && ver.worlds[ctx.world] != null) text = ver.worlds[ctx.world];
    return { axis: axis, key: r.key, v: v, code: row.code, ko: ver.ko || row.ko, text: text, avoid: ver.avoid || [], pairs: row.pairs || null, requires: row.requires || null, retired: row.retired || null };
  }

  /* 조합 — 이름(recipes.json 열쇠) · {축: 부품} · 조합 이름(km1-…) 무엇이든 */
  function resolve(P, R, recipe, ctx) {
    var spec = recipe;
    if (typeof recipe === 'string') {
      if (R && R.recipes && R.recipes[recipe]) spec = R.recipes[recipe].parts;
      else spec = parseRecipeId(P, recipe);
    }
    var parts = AXES.map(function (a) {
      if (!spec[a]) throw new Error('조합에 ' + a + ' 칸이 없다');
      return part(P, a, spec[a], ctx);
    });
    return { id: recipeId(parts), parts: parts, name: typeof recipe === 'string' && R && R.recipes && R.recipes[recipe] ? recipe : null };
  }
  /* 조합 이름 찾기 — 부품 열쇠만 맞춘다(판은 따지지 않는다). 부품이 v2 가 돼도 1차(v1) 그림이 제 조합 이름을 지킨다 */
  function recipeNameOf(R, resolved) {
    var rs = (R && R.recipes) || {}, keys = resolved.parts.map(function (p) { return p.key; }).join('|');
    return Object.keys(rs).filter(function (k) { return AXES.map(function (a) { return String(rs[k].parts[a]).split('@')[0]; }).join('|') === keys; })[0] || null;
  }
  function recipeId(parts) { return parts.map(function (p) { return p.code + vnum(p.v); }).join('-'); }
  function parseRecipeId(P, id) {
    var bits = String(id).split('-');
    if (bits.length !== AXES.length) throw new Error('조합 이름 꼴이 아니다: ' + id);
    var out = {};
    bits.forEach(function (b, i) {
      var m = /^([a-z0-9]{2})(\d+)$/.exec(b); if (!m) throw new Error('조합 이름 조각이 틀렸다: ' + b);
      var a = AXES[i], rows = (P.parts || {})[a] || {}, key = Object.keys(rows).filter(function (k) { return rows[k].code === m[1]; })[0];
      if (!key) throw new Error('없는 코드: ' + a + '/' + m[1]);
      out[a] = key + '@v' + m[2];
    });
    return out;
  }
  /* 같이 못 쓰는 짝(진짜 모순) — 부품의 requires 를 서로 본다. 어긴 것을 글로. 막는다(검토안 6.1 「충돌」) */
  function rule(resolved, field, say) {
    var by = {}, out = [];
    resolved.parts.forEach(function (p) { by[p.axis] = p; });
    resolved.parts.forEach(function (p) {
      if (!p[field]) return;
      Object.keys(p[field]).forEach(function (a) { if (by[a] && p[field][a].indexOf(by[a].key) < 0) out.push(p.axis + '/' + p.key + say + a + ' ' + p[field][a].join(' · ')); });
    });
    return out;
  }
  function clashes(resolved) { return rule(resolved, 'requires', ' 는 '); }
  /* 추천 짝 밖 — 막지 않고 알리기만(검토안 6.1 「검증 전」) */
  function untested(resolved) { return rule(resolved, 'pairs', ' 의 추천 짝 밖 — '); }
  function paragraph(resolved) {
    return resolved.parts.filter(function (p) { return ['direction', 'face', 'paint'].indexOf(p.axis) >= 0 && p.text; }).map(function (p) { return p.text; }).join(' ');
  }
  function lightLine(resolved) {
    var l = resolved.parts.filter(function (p) { return p.axis === 'light'; })[0], x = resolved.parts.filter(function (p) { return p.axis === 'fx'; })[0];
    return 'Light: ' + l.text + (x && x.text ? ' ' + x.text : '');
  }
  function displayName(resolved) {
    var by = {}; resolved.parts.forEach(function (p) { by[p.axis] = p; });
    return by.face.ko + ' · ' + by.paint.ko + ' — ' + by.light.ko + (by.fx.key !== 'none' ? ' · 이펙트 ' + by.fx.ko : '') + ' (' + by.direction.ko + ')';
  }

  function slotName(rid, sid, world, kind, exposure, subject) {
    var ex = exposure && subject && exposure !== subject.defaultExposure ? '-' + exposure : '';
    return rid + '__' + sid + '__' + world + '-' + kind + ex;
  }
  function parseSlot(slot) {
    var m = /^([a-z0-9-]+)__([a-z0-9.]+)__([a-z0-9]+)-([a-z0-9]+)(?:-([a-z]+))?$/.exec(slot || '');
    return m ? { recipe: m[1], subject: m[2], world: m[3], kind: m[4], exposure: m[5] || null } : null;
  }
  function imageName(slot, model, n) { return slot + '__' + model + '__' + n; }
  function parseImage(name) {
    var m = /^(.+)__([a-z0-9]+)__(\d+)$/.exec(name || ''); if (!m) return null;
    var s = parseSlot(m[1]); if (!s) return null;
    s.slot = m[1]; s.model = m[2]; s.n = +m[3]; return s;
  }

  /* 지시문 — 캐릭터 복사본의 한 세계 + 조합 */
  function build(P, R, subject, world, recipe, opts) {
    opts = opts || {};
    var kind = opts.kind || 'world';
    if (KINDS.indexOf(kind) < 0) throw new Error('아직 없는 갈래: ' + kind);
    var W = (subject.worlds || {})[world];
    if (!W) throw new Error(subject.id + ' 에 세계 ' + world + ' 가 없다');
    var ex = opts.exposure || subject.defaultExposure, exLine = (W.exposure || {})[ex];
    if (exLine == null) throw new Error(subject.id + ' ' + world + ' 에 노출 ' + ex + ' 글이 없다');
    var rs = resolve(P, R, recipe, { model: opts.model, world: world });
    var bad = clashes(rs); if (bad.length && !opts.allowClash) throw new Error('같이 못 쓰는 짝: ' + bad.join(' / '));
    var scene = W.scene.slice(), light = lightLine(rs), ci = -1;
    scene.forEach(function (l, i) { if (ci < 0 && /^Composition:/.test(l)) ci = i; });
    if (ci < 0) scene.push(light); else scene.splice(ci, 0, light);
    var avoid = [];
    rs.parts.forEach(function (p) { p.avoid.forEach(function (a) { if (avoid.indexOf(a) < 0) avoid.push(a); }); });
    var out = [W.head, '',
      '1. STYLE', paragraph(rs)].concat(W.faceFrame ? [W.faceFrame] : []).concat(['',
      '2. CHARACTER']).concat(W.character).concat(['',
      '3. COSTUME AND EQUIPMENT — ' + W.genre]).concat(W.costume).concat(exLine ? [exLine] : []).concat(['',
      '4. SCENE']).concat(scene).concat(['',
      '5. CONSTRAINTS']).concat(W.constraints).concat(avoid.length ? ['Avoid: ' + avoid.join(', ') + '.'] : []);
    return { text: out.join('\n'), recipe: rs, slot: slotName(rs.id, subject.id, world, kind, ex, subject), kind: kind, exposure: ex };
  }

  /* 살아 있는 부품 · 조합 — retired(내린 것)는 옛 그림 기록 때문에 남아 있지만 새로 쓰지 않는다 */
  function live(P, axis) { var rows = (P.parts || {})[axis] || {}; return Object.keys(rows).filter(function (k) { return !rows[k].retired; }); }
  function liveRecipes(R) { var rs = (R && R.recipes) || {}; return Object.keys(rs).filter(function (k) { return !rs[k].retired; }); }
  function retiredIn(rs) { return rs.parts.filter(function (p) { return p.retired; }).map(function (p) { return p.axis + '/' + p.key; }); }

  /* 말 되는 조합 — 모든 축의 살아 있는 부품을 곱하고 requires(진짜 모순)를 어긴 것은 뺀다 — pairs(추천 짝) 밖은 남긴다 */
  function combos(P) {
    var lists = AXES.map(function (a) { return live(P, a); }), out = [];
    (function walk(i, acc) {
      if (i === AXES.length) {
        var spec = {}; AXES.forEach(function (a, j) { spec[a] = acc[j]; });
        var rs = resolve(P, null, spec);
        if (!clashes(rs).length) out.push(rs);
        return;
      }
      lists[i].forEach(function (k) { walk(i + 1, acc.concat([k])); });
    })(0, []);
    return out;
  }

  return { AXES: AXES, KINDS: KINDS, MODELS: MODELS, part: part, resolve: resolve, recipeId: recipeId, parseRecipeId: parseRecipeId,
    recipeNameOf: recipeNameOf, clashes: clashes, untested: untested, live: live, liveRecipes: liveRecipes, retiredIn: retiredIn, paragraph: paragraph, lightLine: lightLine, displayName: displayName,
    slotName: slotName, parseSlot: parseSlot, imageName: imageName, parseImage: parseImage, build: build, combos: combos };
});
