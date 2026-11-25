/* El depa del juego (160×192): recámara, cocina con rincón de trabajo, y baño; más el cuarto compartido y el sofá de
   la mentora. Cada mueble comprado se dibuja con la función de su mismo nombre; lo que no tiene, no está. */
(function (root) {
  'use strict';
  const BB = root.BB, { Capa, col, mix, mult, rampa, trama, acl } = BB, U = BB.ESCENAS.util, r = Math.round;
  const DW = 160, DH = 192, YS = 136, MALVA = '#b79bb0';
  const pone = (L, fn, o) => { const t = new Capa(DW, DH); fn(t); if (o) t.contorno(o); L.sobre(t); return t; };
  const oro = rampa('#e6c27a'), CREMA = '#fffaf3';

  function paredPiso(o) {
    const L = new Capa(DW, DH), w = BB.PAREDES[o.pared] || BB.PAREDES.gris, f = BB.PISOS[o.piso] || BB.PISOS.gastado;
    L.rect(0, 0, DW, YS, w.c);
    if (o.pared === 'rosa') { for (let y = 6; y < YS - 6; y += 8) for (let x = 4 + ((y / 8) & 1) * 4; x < DW; x += 8) L.px(x, y, w.t); }
    else if (o.pared === 'gris') { for (const [x, y, l] of [[92, 20, 9], [98, 24, 5], [14, 48, 7], [140, 110, 8], [120, 60, 4]]) L.hl(x, x + l, y, w.t); L.linea(96, 60, 99, 70, w.t); L.linea(99, 70, 97, 78, w.t); }
    else for (let x = 8; x < DW; x += 12) L.vl(x, 0, YS - 6, w.t);
    L.rect(0, YS - 5, DW, 5, CREMA); L.hl(0, DW, YS - 6, MALVA); L.hl(0, DW, YS - 1, '#ead9cf');
    L.rect(0, YS, DW, DH - YS, f.c);
    for (let y = YS, k = 0; y < DH; y += 7 + k, k++) { L.hl(0, DW, y, f.t); for (let x = (k * 37) % 46 - 10; x < DW; x += 46) L.vl(x, y, y + 6 + k, f.t); }
    L.hl(0, DW, YS, mix(f.t, '#6a4a5a', .2));
    if (o.piso === 'gastado') for (const [x, y] of [[20, 150], [66, 160], [120, 148], [140, 176], [40, 182]]) { L.hl(x, x + 5, y, f.t); L.px(x + 2, y + 1, f.t); }
    return L;
  }
  const sol = L => { const s = new Capa(DW, DH); s.poli([[40, YS + 3], [84, YS + 3], [70, YS + 26], [16, YS + 26]], 1); for (let i = 0; i < s.d.length; i++) if (s.d[i]) L.d[i] = mix(L.d[i], '#fff6dc', .35); };

  /* ---------- muebles ---------- */
  const cojin = (t, x, y, c) => { const p = rampa(c), m = new Capa(DW, DH); m.dibujo(x, y, ['.bbb..bbb.', 'bblbbbbbbb', 'blbbbbbbbs', 'bbbbbbbbbs', '.bbbbbbbs.', '..bbbbbs..', '...bbbs...', '....bs....'], { b: p.b, l: p.l, s: p.s }); m.contorno(p.o); t.sobre(m); };
  const D = {
    camaBasica(L) {
      pone(L, t => { t.rect(106, 136, 3, 5, '#a79a9f'); t.rect(146, 136, 3, 5, '#a79a9f'); const m = rampa('#f1ece8'); t.rect(104, 124, 50, 12, m.b); t.encima(q => { q.hl(104, 154, 134, m.s); q.hl(104, 154, 129, m.s); }); }, '#8d8090');
      pone(L, t => { const c = rampa('#ffffff'); t.elipse(144, 121, 8.5, 4.2, c.b); t.sombrear(0, 1, 1, c.b, c.s); }, '#a79aa8');
    },
    camaCapitonada(L) {
      pone(L, t => { const c = rampa('#f7b9cc'); t.elipse(154.5, 96, 5.5, 6, c.b); t.rect(149, 96, 11, 42, c.b); t.sombrear(-1, 0, 1, c.b, c.l); t.encima(q => { for (let y = 100; y < 136; y += 8) { q.px(154, y, c.d); q.px(153, y + 1, c.s); q.px(155, y + 1, c.s); } }); }, rampa('#f7b9cc').o);
      pone(L, t => { t.rect(106, 136, 3, 5, '#d9b99a'); t.rect(146, 136, 3, 5, '#d9b99a'); const c = rampa('#f3c9d6'); t.rect(104, 128, 46, 8, c.b); t.encima(q => q.hl(104, 150, 135, c.s)); const m = rampa(CREMA); t.rect(104, 118, 46, 10, m.b); t.encima(q => q.hl(104, 150, 127, m.s)); }, MALVA);
      pone(L, t => { const c = rampa('#ffffff'); t.elipse(139, 114, 8.5, 4.6, c.b); t.sombrear(0, 1, 1, c.b, c.s); }, MALVA);
    },
    camaMadera(L) {
      const w = rampa('#ddb88f');
      pone(L, t => { t.rect(150, 98, 8, 40, w.b); t.sombrear(1, 0, 1, w.b, w.s); t.encima(q => { for (let y = 102; y < 134; y += 6) q.hl(151, 156, y, w.s); }); }, w.o);
      pone(L, t => { t.rect(106, 136, 3, 5, w.s); t.rect(146, 136, 3, 5, w.s); t.rect(104, 128, 46, 8, w.b); t.encima(q => q.hl(104, 150, 135, w.s)); }, w.o);
      pone(L, t => { const m = rampa(CREMA); t.rect(104, 118, 46, 10, m.b); t.encima(q => q.hl(104, 150, 127, m.s)); }, MALVA);
      pone(L, t => { const c = rampa('#ffffff'); t.elipse(139, 114, 8.5, 4.6, c.b); t.sombrear(0, 1, 1, c.b, c.s); }, MALVA);
    },
    cobija(L, c, fn) {
      pone(L, t => { t.perfil(116, 138, () => 102.5, y => 131 + (y > 134 ? -1 : 0) + (y < 119 ? -1 : 0), c.b); fn(t, c); t.sombrear(1, 0, 1, c.b, c.s); }, c.o);
    },
    cobijaPuntos(L) { D.cobija(L, rampa('#f9c4d4'), (t, c) => { t.cada((x, y) => (y > 135 && (x % 6 < 2)) ? null : undefined); t.encima(q => { for (let y = 121; y < 136; y += 5) for (let x = 105 + ((y / 5) & 1) * 3; x < 131; x += 6) q.px(x, y, '#ffffff'); q.rect(127, 116, 5, 22, CREMA); q.vl(127, 116, 138, c.s); q.hl(103, 126, 128, c.s); }); }); },
    cobijaBurbuja(L) { D.cobija(L, rampa('#fffaf5'), (t, c) => t.encima(q => { for (let y = 118; y < 138; y += 4) for (let x = 103 + ((y >> 2) & 1) * 2; x < 132; x += 5) { q.px(x, y, c.s); q.px(x + 1, y + 1, c.s); q.px(x + 2, y, c.s); q.px(x + 1, y - 1, c.l); } })); },
    cobijaTejida(L) { D.cobija(L, rampa('#cbb7ee'), (t, c) => { t.encima(q => { for (let y = 117; y < 137; y++) for (let x = 103; x < 131; x += 4) q.px(x + [0, 1, 0, -1][y & 3] + 1, y, (y & 2) ? c.l : c.s); }); t.cada((x, y) => y > 135 && x % 3 === 0 ? null : undefined); }); },
    cojinesCorazon(L) { cojin(L, 126, 108, '#f58fb0'); cojin(L, 134, 110, '#fff6ea'); },
    cojinesMono(L) { pone(L, t => { const c = rampa('#f7ecd9'); t.rect(127, 108, 10, 9, c.b); t.sombrear(1, 0, 1, c.b, c.s); t.dibujo(129, 111, ['b...b', 'bbkbb', 'b...b'], { b: '#f58fb0', k: '#d96f93' }); }, rampa('#f7ecd9').o); pone(L, t => { const c = rampa('#f6c3d2'); t.rect(136, 110, 9, 8, c.b); t.sombrear(1, 0, 1, c.b, c.s); t.dibujo(138, 112, ['b...b', 'bbkbb', 'b...b'], { b: '#fffaf5', k: '#efe0d0' }); }, rampa('#f6c3d2').o); },
    peluche(L) { pone(L, t => { const c = rampa('#f3e6dc'); t.elipse(114, 111, 4.4, 4, c.b); t.elipse(114, 117, 4, 3.6, c.b); t.rect(110, 101, 2, 8, c.b); t.rect(116, 101, 2, 8, c.b); t.sombrear(1, 0, 1, c.b, c.s); t.px(112, 110, '#4a3148'); t.px(116, 110, '#4a3148'); t.px(114, 112, '#f58fb0'); t.dibujo(112, 114, ['b...b', '.bkb.', 'b...b'], { b: '#f58fb0', k: '#d96f93' }); }, rampa('#f3e6dc').o); },
    buro(L) {
      pone(L, t => { const c = rampa('#fff4ea'); t.rect(46, 137, 2, 4, '#d9b99a'); t.rect(65, 137, 2, 4, '#d9b99a'); t.rect(45, 115, 23, 22, c.b); t.sombrear(1, 0, 2, c.b, c.s); t.rect(43, 112, 27, 3, c.l); t.encima(q => { q.hl(45, 67, 115, c.s); q.hl(46, 66, 125, c.s); q.hl(46, 66, 126, c.l); q.rect(55, 119, 3, 2, oro.b); q.rect(55, 130, 3, 2, oro.b); q.px(55, 119, oro.l); q.px(55, 130, oro.l); }); }, MALVA);
    },
    cajaBuro(L) { pone(L, t => { const c = rampa('#c9a67c'); t.rect(45, 117, 22, 20, c.b); t.encima(q => { q.vl(55, 117, 137, c.s); q.vl(57, 117, 137, c.s); q.hl(45, 66, 118, c.l); }); }, rampa('#c9a67c').o); },
    lamparaMesa(L, o) {
      pone(L, t => { const c = o.noche ? { l: col('#ffffff'), b: col('#fff6cf'), s: col('#ffe9a6') } : rampa('#fff1d2'); t.rect(53, 109, 7, 3, oro.b); t.px(53, 109, oro.l); t.rect(56, 103, 1, 6, oro.b); t.perfil(91, 104, [[91, 52.5], [104, 48.5]], [[91, 60.5], [104, 64.5]], c.b); t.encima(q => { q.hl(48, 65, 103, c.s); q.vl(52, 92, 102, c.l); q.vl(53, 91, 102, c.l); if (o.noche) q.rect(54, 95, 5, 6, c.l); }); }, '#c9a66a');
    },
    lamparaHongo(L, o) { pone(L, t => { const c = o.noche ? { l: col('#ffffff'), b: col('#ffe6c4'), s: col('#ffd09a') } : rampa('#f6b7a6'), m = rampa('#fff4ea'); t.elipse(56.5, 100, 9, 7, c.b); t.cada((x, y, q) => y > 101 ? 0 : undefined); t.rect(54, 102, 5, 8, m.b); t.rect(52, 109, 9, 3, m.b); t.encima(q => { q.hl(48, 65, 101, c.s); q.px(52, 96, c.l); q.px(53, 95, c.l); q.px(58, 97, c.l); }); }, '#b98072'); },
    velas(L, o) { pone(L, t => { const c = rampa('#f7cfd8'); t.rect(62, 106, 5, 6, c.b); t.px(62, 106, c.l); t.sombrear(1, 0, 1, c.b, c.s); t.rect(47, 108, 4, 4, '#fff4ea'); }, rampa('#f7cfd8').o); for (const [x, y] of [[64, 103], [48, 105]]) { L.px(x, y + 1, '#8f5f48'); L.px(x, y, '#ffb347'); L.px(x, y - 1, '#ffe9a3'); if (o.noche) for (const [a, b] of [[-1, -1], [1, -1], [0, -2], [-1, 0], [1, 0]]) L.px(x + a, y + b, mix(L.get(x + a, y + b) || '#fff', '#ffd98a', .4)); } },
    espejoArco(L) {
      pone(L, t => { const o = rampa('#efd09a'); t.elipse(14, 68, 9.5, 9, o.b); t.rect(5, 68, 19, 68, o.b); t.sombrear(1, 0, 1, o.b, o.s); t.elipse(14, 68, 7.5, 7, '#dce9f6'); t.rect(7, 68, 15, 66, '#dce9f6'); t.encima(q => { q.rect(7, 112, 15, 22, '#e9dcee'); q.linea(9, 84, 17, 66, '#f6fbff'); q.linea(10, 86, 18, 68, '#f6fbff'); q.linea(13, 102, 20, 88, '#f6fbff'); q.vl(7, 62, 133, '#c5d6ea'); q.hl(8, 20, 134, '#f6fbff'); }); t.rect(5, 136, 3, 3, o.s); t.rect(21, 136, 3, 3, o.s); }, '#b58f5a');
    },
    espejoLuz(L, o) { pone(L, t => { const m = rampa('#fffaf3'); t.rect(4, 60, 21, 77, m.b); t.rect(7, 63, 15, 71, '#dce9f6'); t.encima(q => { q.rect(7, 112, 15, 22, '#e9dcee'); q.linea(9, 84, 17, 66, '#f6fbff'); q.linea(13, 102, 20, 88, '#f6fbff'); }); for (let y = 62; y < 136; y += 8) { t.rect(5, y, 2, 2, o.noche ? '#fff3b0' : '#ffe9c8'); t.rect(22, y, 2, 2, o.noche ? '#fff3b0' : '#ffe9c8'); } for (let x = 9; x < 22; x += 6) t.rect(x, 61, 2, 2, '#fff3b0'); }, MALVA); },
    plantaPiso(L) {
      pone(L, t => { const m = rampa('#f4a9bd'); t.perfil(124, 139, [[124, 28], [139, 30.5]], [[124, 42], [139, 39.5]], m.b); t.rect(27, 122, 16, 3, m.l); t.sombrear(1, 0, 2, m.b, m.s); t.hl(28, 41, 125, m.s); }, rampa('#f4a9bd').o);
      const v = rampa('#8fc99c');
      for (const [x, y, rx, ry] of [[27, 106, 4, 6], [43, 108, 4, 6], [30, 97, 4, 6.5], [40, 99, 4, 6.5], [35, 92, 4.2, 7]]) { L.linea(35, 122, x, y + 3, v.o); pone(L, t => { t.elipse(x + .5, y, rx, ry, v.b); t.sombrear(1, 0, 1, v.b, v.s); t.encima(q => { q.vl(x, r(y - ry + 2), r(y + ry), v.d); q.px(x - 2, r(y - 2), v.l); q.px(x - 2, r(y - 1), v.l); }); }, v.o); }
    },
    cuadroMono(L) { pone(L, t => { const c = rampa(CREMA); t.rect(127, 20, 19, 20, c.b); t.rect(129, 22, 15, 16, '#fbd9e3'); t.dibujo(131, 26, ['.bb.....bb.', 'bbbb.k.bbbb', 'bbbbkkkbbbb', 'bbbb.k.bbbb', '.bb.k.k.bb.', '...k...k...'], { b: '#f58fb0', k: '#d96f93' }); t.hl(127, 145, 39, c.s); }, MALVA); },
    fotosPared(L) { [[97, 22, '#bdd5ee', 0], [108, 25, '#f6c3d2', 1], [99, 38, '#f3dcae', 2], [110, 41, '#cbb7ee', 0], [97, 54, '#b4cba9', 1], [109, 56, '#f7c4a8', 2]].forEach(([x, y, c, k]) => { pone(L, t => { t.rect(x, y, 9, 11, '#ffffff'); t.rect(x + 1, y + 1, 7, 7, c); if (k === 0) { t.elipse(x + 4.5, y + 4, 1.6, 1.6, '#ffffff'); t.hl(x + 1, x + 7, y + 7, acl(c, .5)); } if (k === 1) t.dibujo(x + 2, y + 3, ['h.h.h', 'hhhhh', '.hhh.', '..h..'].map(s => s.slice(0, 5)), { h: '#f58fb0' }); if (k === 2) { t.rect(x + 2, y + 4, 2, 4, '#9087b8'); t.rect(x + 5, y + 3, 2, 5, '#b9b3d6'); } }, MALVA); L.px(x + 4, y - 1, '#f58fb0'); }); },
    repisa(L) { pone(L, t => { const c = rampa(CREMA); t.rect(118, 58, 39, 2, c.b); t.px(121, 60, c.s); t.px(153, 60, c.s); t.px(121, 61, c.s); t.px(153, 61, c.s); t.rect(121, 48, 3, 10, '#b9a3ea'); t.rect(125, 50, 3, 8, '#f58fb0'); t.rect(129, 47, 3, 11, '#a8dcc0'); t.px(122, 50, '#ffffff'); t.px(126, 52, '#ffffff'); t.px(130, 49, '#ffffff'); t.rect(136, 53, 4, 5, CREMA); t.px(137, 52, '#6aa884'); t.px(138, 51, '#6aa884'); t.px(137, 50, '#f58fb0'); t.px(139, 50, '#ffd98a'); t.px(138, 49, '#f58fb0'); t.rect(144, 49, 9, 9, CREMA); t.rect(145, 50, 7, 7, '#fbd9e3'); t.dibujo(146, 51, ['.h.h.', 'hhhhh', '.hhh.', '..h..'], { h: '#f58fb0' }); }, MALVA); },
    puff(L) { pone(L, t => { const c = rampa('#fff0f4'); t.elipse(20, 166, 17, 10, c.b); t.elipse(20, 160, 14, 8, c.b); for (let a = 0; a < 360; a += 18) t.elipse(20 + Math.cos(a * Math.PI / 180) * 16, 165 + Math.sin(a * Math.PI / 180) * 10, 2.2, 2, c.b); t.sombrear(0, 1, 2, c.b, c.s); t.sombrear(1, 0, 2, c.b, c.s); t.encima(q => { for (let y = 154; y < 176; y += 4) for (let x = 6 + (y & 4); x < 36; x += 7) { q.px(x, y, c.s); q.px(x + 1, y + 1, c.s); } q.px(20, 156, '#f58fb0'); }); }, rampa('#fff0f4').o); },
    tapetePeludo(L) { pone(L, t => { const c = rampa('#fff6ee'); t.elipse(88, 177, 62, 12, c.b); for (let a = 0; a < 360; a += 8) t.elipse(88 + Math.cos(a * Math.PI / 180) * 61, 177 + Math.sin(a * Math.PI / 180) * 11.4, 2.6, 1.8, c.b); t.encima(q => { q.elipse(88, 177, 53, 9, '#fbd3df'); q.elipse(88, 177, 50, 7.6, c.b); for (let y = 170; y < 186; y += 4) for (let x = 44 + (y % 8) * 2; x < 134; x += 11) q.px(x, y, c.s); }); t.sombrear(0, 1, 1, c.b, c.s); }, '#d8bfd0'); },
    tapeteCorazon(L) { pone(L, t => { const c = rampa('#f9b9cb'); t.elipse(66, 172, 25, 10, c.b); t.elipse(112, 172, 25, 10, c.b); t.poli([[42, 174], [136, 174], [112, 185], [89, 191], [66, 185]], c.b); t.encima(q => { for (let y = 164; y < 191; y += 4) for (let x = 42 + (y & 4); x < 138; x += 9) { q.px(x, y, c.l); q.px(x + 1, y + 1, c.s); } }); t.sombrear(0, 1, 1, c.b, c.s); }, rampa('#f9b9cb').o); },
    /* cocina y rincón de trabajo */
    mesaPlegable(L) { pone(L, t => { const c = rampa('#b9aeb6'); t.rect(6, 112, 46, 3, c.b); t.linea(12, 115, 20, 138, c.s); t.linea(13, 115, 21, 138, c.s); t.linea(44, 115, 36, 138, c.s); t.linea(45, 115, 37, 138, c.s); }, '#8d8090'); },
    escritorio(L) { pone(L, t => { const c = rampa('#fffaf5'); t.rect(4, 110, 50, 4, c.b); t.rect(6, 114, 3, 24, c.b); t.rect(34, 114, 18, 22, c.b); t.rect(35, 136, 3, 3, '#d9b99a'); t.rect(48, 136, 3, 3, '#d9b99a'); t.sombrear(1, 0, 1, c.b, c.s); t.encima(q => { q.hl(35, 51, 121, c.s); q.hl(35, 51, 128, c.s); for (const y of [117, 124, 131]) { q.rect(42, y, 3, 1, oro.b); } }); }, MALVA); },
    banquito(L) { pone(L, t => { const c = rampa('#c9a67c'); t.rect(20, 134, 16, 3, c.b); t.rect(22, 137, 2, 12, c.s); t.rect(32, 137, 2, 12, c.s); t.hl(23, 32, 143, c.s); }, rampa('#c9a67c').o); },
    silla(L) { pone(L, t => { const c = rampa('#f9c4d4'); t.elipse(28, 128, 11, 11, c.b); t.rect(17, 128, 23, 8, c.b); t.elipse(28, 138, 12, 4, c.l); t.encima(q => { for (const x of [20, 24, 28, 32, 36]) q.linea(28, 136, x, 118, c.s); q.hl(18, 38, 136, c.s); }); t.rect(27, 141, 2, 7, oro.b); t.rect(21, 148, 14, 2, oro.b); }, rampa('#f9c4d4').o); },
    laptop(L, o) { pone(L, t => { t.rect(18, 96, 22, 14, '#e9d6e4'); t.rect(20, 98, 18, 10, o.noche ? '#cfe0ff' : '#b9cdf0'); t.hl(22, 32, 101, '#ffffff'); t.hl(22, 29, 103, '#ffffff'); t.rect(31, 104, 5, 3, '#f58fb0'); t.rect(15, 110, 28, 2, '#d9c3d4'); }, '#8d7394'); pone(L, t => { t.rect(45, 105, 5, 6, '#fff4ea'); t.px(46, 104, '#8f5f48'); t.px(48, 104, '#8f5f48'); }, MALVA); },
    cuadroFrase(L) { pone(L, t => { t.rect(14, 58, 28, 22, CREMA); t.rect(16, 60, 24, 18, '#fbe3ea'); t.dibujo(22, 63, ['b.b.bbb.b.b', 'bbb.b.b.bbb', '.b..bbb..b.'], { b: '#b98096' }); t.dibujo(25, 70, ['.h.h.', 'hhhhh', '.hhh.', '..h..'], { h: '#f58fb0' }); }, MALVA); },
    plantaColgante(L) { const v = rampa('#8fc99c'); L.vl(50, 18, 34, '#c9a66a'); pone(L, t => { t.rect(45, 34, 11, 7, '#fff4ea'); t.hl(45, 55, 40, '#ead9cf'); }, MALVA); for (const [x, y] of [[43, 36], [58, 37], [46, 44], [55, 46], [42, 46], [58, 50], [45, 53], [54, 56]]) pone(L, t => { t.elipse(x, y, 2.6, 2.6, v.b); t.sombrear(1, 0, 1, v.b, v.s); t.px(x - 1, y - 1, v.l); }, v.o); },
    tocador(L, o) { pone(L, t => { const c = rampa('#fffaf5'); t.rect(60, 112, 32, 4, c.b); t.rect(62, 116, 28, 10, c.b); t.rect(63, 126, 3, 12, c.b); t.rect(86, 126, 3, 12, c.b); t.encima(q => { q.vl(76, 117, 125, c.s); q.rect(68, 120, 3, 1, oro.b); q.rect(81, 120, 3, 1, oro.b); q.hl(62, 89, 125, c.s); }); t.rect(62, 78, 28, 30, c.b); t.rect(66, 82, 20, 22, '#dce9f6'); t.encima(q => { q.linea(69, 96, 78, 83, '#f6fbff'); q.linea(72, 100, 82, 86, '#f6fbff'); }); for (const [x, y] of [[63, 80], [63, 88], [63, 96], [63, 104], [87, 80], [87, 88], [87, 96], [87, 104], [71, 79], [79, 79]]) t.rect(x, y, 2, 2, o.noche ? '#fff3b0' : '#ffe9c8'); t.rect(74, 108, 4, 4, c.s); }, MALVA); },
    perfumes(L) { pone(L, t => { t.hl(106, 124, 101, '#e9bd62'); t.rect(108, 95, 4, 6, '#f7b9cc'); t.rect(109, 93, 2, 2, '#e9bd62'); t.rect(114, 92, 4, 9, '#cbb7ee'); t.rect(115, 90, 2, 2, '#fffaf2'); t.rect(119, 96, 4, 5, '#fbe3a6'); t.rect(120, 94, 2, 2, '#e9bd62'); }, '#b98aa4'); },
    cocineta(L, o) {
      // refri, barra con estufa y alacena
      pone(L, t => { const c = rampa('#f3eef2'); t.rect(136, 74, 22, 64, c.b); t.sombrear(1, 0, 2, c.b, c.s); t.encima(q => { q.hl(136, 158, 94, c.s); q.vl(139, 80, 88, '#a79aa8'); q.vl(139, 99, 110, '#a79aa8'); q.rect(146, 100, 4, 4, '#fbd9e3'); q.rect(150, 106, 3, 3, '#bdd5ee'); }); }, MALVA);
      pone(L, t => { const c = rampa('#e9e1da'); t.rect(98, 106, 38, 32, c.b); t.encima(q => { q.vl(111, 112, 136, c.s); q.vl(123, 112, 136, c.s); q.rect(108, 120, 1, 4, '#a79aa8'); q.rect(114, 120, 1, 4, '#a79aa8'); }); t.rect(96, 102, 41, 4, '#cfc3c0'); t.rect(112, 112, 11, 14, '#8d8090'); t.rect(114, 115, 7, 6, o.noche ? '#ffcf7a' : '#5f566a'); t.hl(113, 121, 101, '#5f566a'); t.hl(125, 132, 101, '#b9c6d6'); t.vl(130, 96, 100, '#a9b6c8'); t.hl(128, 130, 96, '#a9b6c8'); }, '#8d8090');
      pone(L, t => { const c = rampa('#efe7e0'); t.rect(98, 56, 36, 20, c.b); t.encima(q => { q.vl(115, 57, 75, c.s); q.px(113, 66, '#a79aa8'); q.px(117, 66, '#a79aa8'); }); }, MALVA);
      pone(L, t => { t.rect(114, 97, 7, 4, '#f58fb0'); t.hl(121, 123, 98, '#d96f93'); }, '#a85b78');
      for (let y = 80; y < 101; y += 5) for (let x = 98 + ((y / 5) & 1) * 3; x < 135; x += 6) if (!L.hay(x, y) || L.get(x, y) === L.get(97, 79)) L.px(x, y, '#d9cfd6');
    },
    puerta(L) { pone(L, t => { const c = rampa('#e9ddd2'); t.rect(64, 66, 24, 71, c.b); t.encima(q => { q.rect(67, 70, 18, 26, c.s); q.rect(68, 71, 16, 24, c.b); q.rect(67, 100, 18, 32, c.s); q.rect(68, 101, 16, 30, c.b); }); t.rect(84, 102, 2, 3, oro.b); }, MALVA); },
  };
  /* ---------- baño ---------- */
  function bano(L, o) {
    for (let y = 60; y < YS - 6; y += 8) for (let x = ((y / 8) & 1) * 6; x < DW; x += 12) { L.hl(x, x + 11, y, '#dbe3ec'); L.vl(x, y, y + 7, '#dbe3ec'); }
    pone(L, t => { const c = rampa('#f4f8fb'); t.rect(4, 108, 58, 30, c.b); t.elipse(8, 112, 6, 5, c.b); t.elipse(58, 112, 6, 5, c.b); t.sombrear(0, 1, 2, c.b, c.s); t.rect(4, 106, 58, 4, c.l); t.rect(8, 138, 5, 4, oro.b); t.rect(52, 138, 5, 4, oro.b); }, '#93a3b5');
    pone(L, t => { t.vl(12, 40, 104, '#c3cdd8'); t.vl(13, 40, 104, '#a9b6c8'); t.hl(12, 24, 40, '#c3cdd8'); t.rect(20, 41, 9, 3, '#c3cdd8'); }, '#8796a8');
    pone(L, t => { t.hl(2, 66, 34, oro.b); const c = rampa('#f9d3dd'); t.perfil(36, 124, () => 46, () => 66, c.b); t.encima(q => { for (let x = 48; x < 66; x += 4) q.vl(x, 36, 124, c.s); for (let y = 44; y < 122; y += 9) for (let x = 47 + ((y / 9) & 1) * 4; x < 66; x += 8) q.px(x, y, '#ffffff'); }); }, rampa('#f9d3dd').o);
    pone(L, t => { const c = rampa('#ffffff'); t.elipse(100, 108, 17, 5, c.b); t.rect(83, 104, 35, 4, c.b); t.rect(95, 112, 10, 26, c.b); t.sombrear(1, 0, 2, c.b, c.s); t.vl(100, 98, 104, '#a9b6c8'); t.hl(100, 103, 98, '#a9b6c8'); }, '#93a3b5');
    pone(L, t => { t.elipse(100, 76, 15, 17, oro.b); t.elipse(100, 76, 13, 15, '#dce9f6'); t.encima(q => { q.linea(93, 80, 103, 64, '#f6fbff'); q.linea(96, 84, 107, 68, '#f6fbff'); }); }, '#b58f5a');
    pone(L, t => { const c = rampa('#ffffff'); t.rect(132, 98, 22, 18, c.b); t.elipse(143, 122, 12, 6, c.b); t.rect(137, 124, 12, 14, c.b); t.sombrear(1, 0, 2, c.b, c.s); t.rect(140, 101, 4, 2, '#a9b6c8'); }, '#93a3b5');
    pone(L, t => { t.rect(130, 54, 24, 2, CREMA); t.rect(133, 46, 4, 8, '#f7b9cc'); t.rect(139, 48, 5, 6, '#cbb7ee'); t.rect(146, 44, 3, 10, '#b4cba9'); }, MALVA);
    pone(L, t => { const c = rampa('#cfe0ee'); t.elipse(96, 168, 34, 9, c.b); t.encima(q => { for (let x = 64; x < 130; x += 5) q.px(x, 166 + (x % 3), c.l); }); t.sombrear(0, 1, 1, c.b, c.s); }, rampa('#cfe0ee').o);
    if (o.noche) void 0;
  }
  /* ---------- cuando pierde su depa ---------- */
  function compartido(L) {
    pone(L, t => { const c = rampa('#9aa0ab'); t.rect(96, 60, 3, 80, c.b); t.rect(154, 60, 3, 80, c.b); t.rect(96, 82, 61, 4, c.b); t.rect(96, 124, 61, 4, c.b); t.vl(102, 86, 124, c.s); for (let y = 92; y < 124; y += 8) t.hl(98, 104, y, c.s); }, '#5f6672');
    for (const [y, c] of [[74, '#c9c3b8'], [116, '#b8c3c9']]) pone(L, t => { const q = rampa(c); t.rect(99, y, 55, 8, q.b); t.rect(140, y - 4, 13, 5, '#eeeae6'); t.encima(m => { for (let x = 101; x < 138; x += 5) m.vl(x, y, y + 7, q.s); }); }, '#6c6878');
    pone(L, t => { const c = rampa('#c9a67c'); t.rect(8, 116, 24, 22, c.b); t.rect(36, 124, 18, 14, c.b); t.encima(q => { q.vl(19, 116, 138, c.s); q.vl(44, 124, 138, c.s); }); }, rampa('#c9a67c').o);
    pone(L, t => { t.rect(58, 88, 16, 50, '#a3a9b3'); t.rect(60, 92, 12, 2, '#878d98'); t.rect(60, 96, 12, 2, '#878d98'); t.rect(70, 110, 2, 5, '#6c7280'); }, '#5f6672');
    for (const [x, y, w, h] of [[14, 20, 16, 9], [120, 24, 22, 8], [84, 100, 8, 14]]) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (Math.hypot((i - w / 2) / w * 2, (j - h / 2) / h * 2) < 1 && trama(i, j) > .4) L.px(x + i, y + j, '#d2cbc8');
  }
  function sofa(L) {
    pone(L, t => { const c = rampa('#cfc5b4'); t.rect(16, 92, 128, 26, c.b); t.rect(8, 102, 14, 36, c.b); t.rect(138, 102, 14, 36, c.b); t.rect(20, 116, 120, 20, c.l); t.sombrear(0, 1, 1, c.b, c.s); t.encima(q => { q.vl(60, 94, 134, c.s); q.vl(100, 94, 134, c.s); q.hl(20, 140, 116, c.s); }); t.rect(14, 138, 4, 4, '#8f5f48'); t.rect(142, 138, 4, 4, '#8f5f48'); }, rampa('#cfc5b4').o);
    pone(L, t => { const c = rampa('#b7a3c9'); t.perfil(112, 136, () => 22, y => 86 + (y > 130 ? -2 : 0), c.b); t.encima(q => { for (let y = 114; y < 136; y += 5) q.hl(22, 86, y, c.s); }); }, rampa('#b7a3c9').o);
    pone(L, t => { const c = rampa('#ffffff'); t.elipse(126, 110, 11, 6, c.b); t.sombrear(0, 1, 1, c.b, c.s); }, MALVA);
    pone(L, t => { t.rect(60, 40, 40, 26, '#e9d6b4'); t.rect(63, 43, 34, 20, '#bcd0f4'); t.elipse(80, 60, 14, 6, '#8fb894'); t.elipse(72, 50, 5, 2, '#ffffff'); }, '#a8875a');
    pone(L, t => { t.vl(148, 60, 100, '#8f7a68'); t.perfil(50, 62, [[50, 144], [62, 139]], [[50, 152], [62, 157]], '#fff1d2'); }, '#b89868');
  }
  /* ---------- tiradero: lo que aparece con los días ---------- */
  function tiradero(L, s, vista) {
    const cosa = (min, fn) => { if (s >= min) fn(); };
    const polvo = (x, y) => { for (const [a, b] of [[0, 0], [2, 1], [4, 0], [1, 2], [5, 2]]) if (L.hay(x + a, y + b)) L.px(x + a, y + b, mix(L.get(x + a, y + b), '#7d6f78', .45)); };
    cosa(20, () => { for (const [x, y] of [[8, 148], [130, 150], [46, 186], [146, 182]]) polvo(x, y); });
    cosa(35, () => pone(L, t => { t.dibujo(128, 156, ['..bb..b...', '.bbbbbbb..', 'bbbsbbbbbb', '.bbbbsbb..'], { b: '#bdd5ee', s: '#98b6d8' }); }, '#6f88ac'));
    cosa(50, () => { for (const [x, y] of [[20, 180], [110, 146], [84, 152]]) polvo(x, y); pone(L, t => { t.rect(8, 178, 8, 7, '#f3ead8'); t.hl(9, 14, 181, '#d2485a'); }, '#a8875a'); pone(L, t => { t.dibujo(40, 150, ['.bb.bb.', 'bbbbbbb', 'bbsbbsb', '.bb.bb.'], { b: '#f6c3d2', s: '#d99db2' }); }, '#a8708a'); });
    cosa(65, () => pone(L, t => { const c = rampa('#8d8598'); t.elipse(150, 172, 8, 9, c.b); t.rect(147, 160, 6, 4, c.b); t.sombrear(1, 0, 2, c.b, c.s); }, '#4a4257'));
    cosa(80, () => { pone(L, t => { const c = rampa('#d9b98a'); t.rect(30, 172, 16, 5, c.b); t.rect(31, 167, 14, 5, c.b); t.encima(q => { q.hl(30, 46, 172, c.s); q.px(37, 169, '#d2485a'); }); }, '#8f6a48'); for (const [x, y] of [[60, 146], [100, 182], [136, 142], [10, 162]]) polvo(x, y); });
    cosa(vista === 'cocina' ? 45 : 999, () => pone(L, t => { for (let i = 0; i < 4; i++) t.rect(100 + (i & 1), 99 - i * 2, 9, 2, i & 1 ? '#e9e1da' : '#cfd9e6'); }, '#8d8090'));
    cosa(vista === 'bano' ? 45 : 999, () => pone(L, t => { t.dibujo(104, 150, ['.bbbbbb..', 'bbbbbbbbb', '.bbsbbsb.'], { b: '#fffaf5', s: '#d9cfd6' }); }, '#a79aa8'));
  }
  /* ---------- luz de noche ---------- */
  function penumbra(L, luces) {
    return L.cada((x, y, c) => {
      let d = 999; for (const [lx, ly, f] of luces) d = Math.min(d, Math.hypot(x + .5 - lx, (y + .5 - ly) * .9) * (f || 1));
      d += (trama(x, y) - .5) * 8;
      return mult(c, d < 20 ? [1, .94, .8] : d < 40 ? [.86, .76, .72] : d < 64 ? [.66, .58, .68] : d < 92 ? [.5, .45, .63] : [.4, .37, .58]);
    });
  }
  const PUESTOS = { cama: 1, cobija: 1, cojines: 1, buro: 1, lampara: 1 };
  function casa(o) {
    const noche = !!o.noche, m = o.muebles || {}, tipo = o.tipo || 'estudio', vista = tipo === 'estudio' ? (o.vista || 'cuarto') : 'cuarto', P = { noche };
    const T = paredPiso(tipo === 'compartido' ? { pared: 'gris', piso: 'gastado' } : tipo === 'sofa' ? { pared: 'crema', piso: 'claro' } : vista === 'bano' ? { ...o, piso: 'blanco' } : o), luces = [];
    let V = null; const M = new Capa(DW, DH), hay = k => m[k] && D[m[k]] && D[m[k]](M, P);
    if (tipo === 'compartido') { compartido(M); luces.push([80, 8, .8]); }
    else if (tipo === 'sofa') { sofa(M); luces.push([148, 56]); }
    else if (vista === 'cuarto') {
      const w = U.ventana(noche); V = w.V; T.sobre(w.F); if (!noche) sol(T);
      if (m.cortinas) { const C = U.cortinas(); T.sobre(C); V.quitar(C); }
      for (const k of ['espejo', 'cuadro', 'fotos', 'repisa', 'planta']) hay(k);
      if (m.buro) D.buro(M); else if (m.lampara || m.velas) D.cajaBuro(M);
      for (const k of ['lampara', 'velas']) hay(k);
      (D[m.cama] || D.camaBasica)(M, P);
      for (const k of ['cojines', 'cobija', 'peluche', 'tapete', 'puff']) hay(k);
      if (m.lampara) luces.push([56.5, 99]); else luces.push([80, 6, .85]);
      if (m.velas) luces.push([64, 103, 2]); if (m.espejo === 'espejoLuz') luces.push([14, 90, 1.4]);
    } else if (vista === 'cocina') {
      D.cocineta(M, P); if (m.tocador) D.tocador(M, P); else D.puerta(M);
      for (const k of ['frase', 'colgante']) hay(k);
      if (m.escritorio) D.escritorio(M); else D.mesaPlegable(M);
      D.laptop(M, P); if (m.silla) D.silla(M); else D.banquito(M);
      hay('perfumes');
      luces.push([118, 90, 1.1]); luces.push([29, 102, 1.5]); if (m.tocador) luces.push([76, 92, 1.4]);
    } else { bano(M, P); luces.push([100, 56, .8]); }
    T.sobre(M);
    tiradero(T, o.suciedad || 0, vista);
    if (noche) penumbra(T, luces);
    if (V) { V.quitar(M); T.sobre(V); }
    if (tipo === 'estudio' && m.luces) U.luces(T, noche, m.luces === 'lucesCalidas');
    if (noche && vista === 'cuarto' && m.lampara && tipo === 'estudio') T.px(15, 80, T.get(15, 80));
    if (tipo !== 'estudio' || !m.lampara) { if (vista === 'cuarto' && tipo !== 'sofa') { T.vl(80, 0, 5, '#6c6878'); T.elipse(80.5, 8, 2.6, 3, noche ? '#fff3b0' : '#f3ead0'); } }
    if (o.ella) {
      const dx = vista === 'cocina' ? 30 : vista === 'bano' ? -22 : 0, oy = 183 - BB.ELLA.SUELO, sx = (noche ? 100 : 92) + dx, sy = 184.5, rx = noche ? 22 : 16, ry = noche ? 2.6 : 2;
      for (let y = Math.floor(sy - ry); y <= sy + ry; y++) for (let x = Math.floor(sx - rx); x <= sx + rx; x++) if (Math.pow((x + .5 - sx) / rx, 2) + Math.pow((y + .5 - sy) / ry, 2) < 1) T.px(x, y, mix(T.get(x, y), noche ? '#241e4a' : '#8a6a9a', noche ? .45 : .22));
      if (!o.sinElla) { const fig = BB.ELLA.figura({ ...o.ella, sinSombra: true }); T.sobre(noche ? U.iluminada(fig) : fig, 50 + dx, oy); }
    }
    return T;
  }
  // miniatura de un mueble: solo su dibujo, recortado
  function mini(id) {
    const L = new Capa(DW, DH), w = BB.MUEBLES[id];
    if (w.lugar === 'luces') { U.luces(L, false, id === 'lucesCalidas'); L.contorno(MALVA); return L.recorte(2, 0, 34, 14); }
    if (id === 'cortinas') { L.sobre(U.cortinas()); return L.recorte(14, 10, 79, 96); }
    if (w.lugar === 'cobija') D.camaBasica(L);
    D[id](L, { noche: false });
    let a = DW, b = 0, c = DH, d = 0; for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) if (L.hay(x, y)) { a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); }
    return L.recorte(a, c, b - a + 1, d - c + 1);
  }
  BB.DEPA = { casa, mini, DIBUJOS: D, DW, DH };
})(typeof globalThis !== 'undefined' ? globalThis : this);
