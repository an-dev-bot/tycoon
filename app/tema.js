/* Tema claro u oscuro. Va en la cabeza de la página para que nunca parpadee el color equivocado.
   automático = sigue al teléfono (lo decide el CSS); claro u oscuro = se fija aquí. */
(function (root) {
  'use strict';
  const BB = root.BB = root.BB || {}, doc = root.document, TEMAS = ['claro', 'oscuro', 'auto'], mq = root.matchMedia ? root.matchMedia('(prefers-color-scheme: dark)') : null;
  let tema = 'auto';
  const oscuro = () => tema === 'oscuro' || (tema === 'auto' && !!(mq && mq.matches));
  function pinta() {
    if (!doc) return;
    if (tema === 'auto') delete doc.documentElement.dataset.tema; else doc.documentElement.dataset.tema = tema;
    const m = doc.querySelector('meta[name="theme-color"]'); if (m) m.content = oscuro() ? '#241a2e' : '#fffafc';
  }
  function pon(t) { tema = TEMAS.includes(t) ? t : 'auto'; pinta(); }
  if (mq && mq.addEventListener) mq.addEventListener('change', () => { pinta(); if (tema === 'auto' && BB.app && BB.app.dibuja) BB.app.dibuja(); });
  if (doc) { let t = 'auto'; try { const s = JSON.parse(root.localStorage.getItem('bb_partida')); t = s.ajustes.tema; } catch (e) { /* sin partida todavía */ } pon(t); }
  BB.TEMA = { TEMAS, pon, oscuro, cual: () => tema };
})(typeof globalThis !== 'undefined' ? globalThis : this);
