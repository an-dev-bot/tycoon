/* El estado de la pantalla (qué pestaña está abierta). La partida vive en BB.app.s. */
(function (root) {
  'use strict';
  const BB = root.BB;
  BB.app = { s: null, ui: { tab: 'ella', ella: 'ropa', cat: 'todo', catT: 'base', vista: 'cuarto', desliza: 0, decorar: false, decoTab: 'muebles', decoSel: null, grupo: { cara: 'piel', cuerpo: 'cuerpo', pelo: 'pelo', mk: 'delineado', unas: 'color' }, zona: 'manos', iguales: false, tienda: 'ropa', appTel: null, mapa: false, prev: null, pruebaUnas: false, unas: null, crear: null } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
