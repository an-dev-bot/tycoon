/* Idiomas: T('llave', datos) escribe un texto; N(objeto) da el nombre de un dato; $$ escribe dinero corto. */
(function (root) {
  'use strict';
  const BB = root.BB; let idioma = 'es';
  const DINERO = ['monto', 'recargo', 'deposito', 'remate', 'queda', 'debe', 'a', 'b'];
  const N = d => d ? (idioma === 'en' ? d.en || d.nombre : d.nombre) : '';
  const $$ = n => (n < 0 ? '-$' : '$') + BB.L.corto(Math.abs(n));
  // saldo exacto, para el banco y el resumen
  const exacto = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  function cosa(d) { return d.mueble ? N(BB.MUEBLES[d.mueble]) : d.tipo === 'mueble' ? N(BB.MUEBLES[d.id]) : BB.CATALOGO[d.id] ? N(BB.CATALOGO[d.id]) : ''; }
  function T(llave, datos) {
    const t = BB.TEXTOS[idioma][llave]; if (t === undefined) return llave; if (!datos) return t;
    return t.replace(/\{(\w+)\}/g, (m, k) => k === 'cosa' && datos.cosa === undefined ? cosa(datos) : k === 'trabajo' && datos.trabajo === undefined ? N(BB.TRABAJOS[datos.id]) : datos[k] === undefined ? m : DINERO.includes(k) && typeof datos[k] === 'number' ? $$(datos[k]) : datos[k]);
  }
  function hora(h) { const x = ((h % 24) + 24) % 24, hh = Math.floor(x), m = Math.round((x - hh) * 60); return (hh % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + T(hh < 12 ? 'am' : 'pm'); }
  const diaSem = dia => T('dias_sem').split(',')[BB.L.semana(dia)];
  BB.I = { T, N, $$, exacto, hora, diaSem, pon(i) { idioma = BB.TEXTOS[i] ? i : 'es'; }, cual: () => idioma, delSistema: () => (root.navigator && /^es/i.test(root.navigator.language || 'es')) || !root.navigator ? 'es' : 'en' };
})(typeof globalThis !== 'undefined' ? globalThis : this);
