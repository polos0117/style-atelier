/* 평가 — 그림 한 장에 한 칸(data/evals.json 의 evals.<그림 이름>). 화면(index.html 상세) · 검사 · 찾기 도구가 같이 쓴다.
   항목은 검토안 7.5(docs/AXIS_REVIEW.md) 다섯 + 판정 · 메모(사용자 2026-11-10 「응 평가 칸 붙여줘」).
   저장은 코드 저장소 — 그림 저장소에 쓰면 GPT 세션이 그림을 올리는 중에 main 이 밀린다(2026-11-10 멈춤). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.StyleEvals = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var FIELDS = [
    { key: 'taste', ko: '취향', type: 'score', hint: '얼마나 마음에 드나' },
    { key: 'intent', ko: '의도 반영', type: 'score', hint: '바꾼 부품이 요구한 특징이 드러났나' },
    { key: 'keep', ko: '캐릭터 유지', type: 'score', hint: '얼굴 · 머리 · 의상 · 체형이 유지됐나' },
    { key: 'side', ko: '다른 특징 변화', type: 'level', levels: ['없음', '조금', '큼'], hint: '바꾸지 않은 얼굴 · 채색 · 조명도 같이 변했나 — 무엇이 변했는지는 메모에' },
    { key: 'repeat', ko: '반복 유지', type: 'score', optional: true, hint: '같은 칸을 여러 장 그렸을 때 특징이 유지됐나(한 장이면 비움)' },
    { key: 'verdict', ko: '판정', type: 'choice', choices: [['keep', '좋다 — 후보로'], ['fix', '고칠 것 — 부품 문장'], ['cross', '축 사이 영향'], ['drop', '내리기']] },
    { key: 'note', ko: '메모', type: 'text' }
  ];
  var VERDICT_KO = { keep: '후보', fix: '고칠 것', cross: '축 사이', drop: '내리기' };

  function check(e) {
    var bad = [];
    if (!e || typeof e !== 'object') return ['평가가 객체가 아니다'];
    FIELDS.forEach(function (f) {
      var v = e[f.key];
      if (v == null || v === '') return;
      if (f.type === 'score' && !(Number.isInteger(v) && v >= 1 && v <= 5)) bad.push(f.key + ' 는 1~5');
      if (f.type === 'level' && f.levels.indexOf(v) < 0) bad.push(f.key + ' 는 ' + f.levels.join(' · '));
      if (f.type === 'choice' && !f.choices.some(function (c) { return c[0] === v; })) bad.push(f.key + ' 는 ' + f.choices.map(function (c) { return c[0]; }).join(' · '));
      if (f.type === 'text' && typeof v !== 'string') bad.push(f.key + ' 는 글');
    });
    Object.keys(e).forEach(function (k) { if (['at', 'by'].indexOf(k) < 0 && !FIELDS.some(function (f) { return f.key === k; })) bad.push('모르는 칸 ' + k); });
    return bad;
  }
  function empty(e) { return !e || FIELDS.every(function (f) { return e[f.key] == null || e[f.key] === ''; }); }
  /* 짧은 표시 — 카드 · 축 비교 칸 밑 */
  function badge(e) {
    if (empty(e)) return '';
    return [e.taste ? '★' + e.taste : '', e.verdict ? VERDICT_KO[e.verdict] : '', e.side && e.side !== '없음' ? '변화 ' + e.side : ''].filter(Boolean).join(' · ');
  }
  return { FIELDS: FIELDS, VERDICT_KO: VERDICT_KO, check: check, empty: empty, badge: badge };
});
