/* Su ciudad: el mapa (160×200) y el interior de cada lugar (160×120). Todo inventado, sin letreros de marcas. */
(function (root) {
  'use strict';
  const BB = root.BB, { Capa, col, mix, mult, rampa, trama, acl } = BB, U = BB.ESCENAS.util, r = Math.round;
  const W = 160, H = 200, MALVA = '#8d7394';
  // dónde está cada lugar en el mapa (x, y, ancho, alto en pixeles del dibujo)
  const LUGARES = {
    casa: { x: 6, y: 18, w: 46, h: 56, color: '#f6c3d2', techo: '#c9768f' },
    salon: { x: 58, y: 24, w: 46, h: 50, color: '#e6d9f6', techo: '#9a83c4' },
    cafe: { x: 110, y: 26, w: 44, h: 48, color: '#f3dcc0', techo: '#9a6a4e' },
    bazar: { x: 6, y: 112, w: 46, h: 48, color: '#cfe3d2', techo: '#6f9a7c' },
    tienda: { x: 58, y: 106, w: 46, h: 54, color: '#fbe6ee', techo: '#d98aa6' },
    super: { x: 110, y: 112, w: 44, h: 48, color: '#d6e4f4', techo: '#6f8fbd' },
  };
  function edificio(L, id, q, noche) {
    const t = new Capa(W, H), p = rampa(q.color), k = rampa(q.techo), vid = noche ? '#ffe2a0' : '#cfe0f2', y1 = q.y + q.h;
    t.rect(q.x, q.y + 8, q.w, q.h - 8, p.b); t.sombrear(1, 0, 2, p.b, p.s); t.sombrear(-1, 0, 1, p.b, p.l);
    if (id === 'casa') { t.poli([[q.x - 2, q.y + 9], [q.x + q.w / 2, q.y - 4], [q.x + q.w + 2, q.y + 9]], k.b); for (const [x, y] of [[8, 16], [28, 16], [8, 32]]) { t.rect(q.x + x, q.y + y, 10, 10, '#fffaf3'); t.rect(q.x + x + 1, q.y + y + 1, 8, 8, vid); t.vl(q.x + x + 5, q.y + y + 1, q.y + y + 8, '#fffaf3'); t.hl(q.x + x, q.x + x + 9, q.y + y + 11, k.b); } }
    else { t.rect(q.x - 1, q.y + 5, q.w + 2, 5, k.b); for (let x = 0; x < q.w + 2; x++) { const a = (x >> 2) & 1; t.vl(q.x - 1 + x, q.y + 22, q.y + 28 + (a ? 0 : 1), a ? k.b : '#fffaf3'); } t.rect(q.x + 4, q.y + 11, q.w - 8, 9, acl(q.color, .5)); t.rect(q.x + 4, q.y + 31, q.w - 22, 14, '#fffaf3'); t.rect(q.x + 5, q.y + 32, q.w - 24, 12, vid); }
    const dx = q.x + q.w - 15; t.rect(dx, y1 - 18, 11, 18, k.s); t.rect(dx + 1, y1 - 17, 9, 17, k.b); t.rect(dx + 3, y1 - 15, 5, 7, vid); t.px(dx + 8, y1 - 7, '#fbe3a6');
    // seña de cada lugar
    const s = q.x + 8, cx = r(q.x + q.w / 2), sy = q.y + 12;
    if (id === 'salon') t.dibujo(cx - 5, sy, ['..b......b', '.bb.....bb', 'b.bbbbbbb.', '..b..b..b.', '.bb.....bb', '..b......b'], { b: '#9a83c4' });
    if (id === 'cafe') t.dibujo(cx - 5, sy, ['bbbbbbb...', 'bbbbbbbbb.', 'bbbbbbb.b.', 'bbbbbbbbb.', '.bbbbb....', 'bbbbbbbb..'], { b: '#9a6a4e' });
    if (id === 'bazar') t.dibujo(cx - 5, sy, ['....bb....', '.....b....', '....bb....', '..bb..bb..', 'bb......bb', 'bbbbbbbbbb'], { b: '#6f9a7c' });
    if (id === 'tienda') t.dibujo(cx - 5, sy, ['...b..b...', '...bbbb...', '..bbbbbb..', '..b.bb.b..', '...bbbb...', '..bbbbbb..'], { b: '#d98aa6' });
    if (id === 'super') t.dibujo(cx - 5, sy, ['bb........', '.bbbbbbbbb', '.bb.b.b.bb', '..bbbbbbb.', '..........', '..bb...bb.'], { b: '#6f8fbd' });
    if (id !== 'casa') {
      const vy = q.y + 40;
      if (id === 'cafe') for (const x of [0, 7, 14]) { t.rect(s + x, vy, 4, 3, '#fffaf3'); t.px(s + x + 1, vy - 2, '#ffffff'); }
      if (id === 'tienda') { t.dibujo(s, vy - 6, ['.bb.', 'bbbb', '.bb.', 'bbbb', 'bbbb'], { b: '#f58fb0' }); t.dibujo(s + 8, vy - 6, ['.bb.', 'bbbb', '.bb.', '.bb.', '.bb.'], { b: '#b9a3ea' }); t.dibujo(s + 16, vy - 6, ['.b.b.', 'bbbbb', 'bbbbb', 'bbbbb'], { b: '#fbd3a0' }); }
      if (id === 'super') for (const [x, c] of [[0, '#d2485a'], [4, '#f6b36a'], [8, '#8fc99c'], [12, '#d2485a'], [16, '#f3dcae']]) t.rect(s + x, vy, 3, 3, c);
      if (id === 'bazar') for (const [x, c] of [[0, '#bdd5ee'], [5, '#f6c3d2'], [10, '#f3dcae'], [15, '#b4cba9']]) t.rect(s + x, vy - 5, 4, 7, c);
      if (id === 'salon') { t.elipse(s + 5, vy - 2, 4, 5, '#f6fbff'); t.elipse(s + 15, vy - 2, 4, 5, '#f6fbff'); }
    }
    t.contorno(mix(q.techo, '#3d2a45', .45)); L.sobre(t);
  }
  const arbol = (L, x, y, noche) => { const v = rampa('#9ccfa0'); L.rect(x - 1, y - 6, 3, 8, '#9a6a4e'); const t = new Capa(W, H); t.elipse(x, y - 11, 7, 7, v.b); t.elipse(x + 3, y - 14, 5, 5, v.b); t.sombrear(1, 0, 2, v.b, v.s); t.sombrear(-1, 0, 1, v.b, v.l); t.contorno(v.o); L.sobre(t); if (noche) for (const [a, b] of [[-3, -10], [2, -13], [4, -8], [0, -16]]) L.px(x + a, y + b, '#fff3b0'); };
  function mapa(o = {}) {
    const L = new Capa(W, H), noche = !!o.noche;
    U.bandas(L, 0, 0, W, 60, noche ? ['#25245a', '#3a356f', '#57508c'] : ['#c6d9f4', '#e0e2f5', '#fbe6ec']);
    L.rect(0, 60, W, H - 60, '#cfe0c6');
    for (let y = 62; y < H; y += 6) for (let x = (y % 12) * 2; x < W; x += 17) { L.px(x, y, '#b7cfae'); L.px(x + 1, y - 1, '#b7cfae'); }
    if (noche) for (const [x, y] of [[4, 6], [34, 4], [56, 12], [80, 5], [106, 10], [130, 4], [152, 14]]) L.px(x, y, '#ffffff');
    else { L.elipse(70, 10, 10, 2.6, '#ffffff'); L.elipse(128, 7, 8, 2, '#ffffff'); }
    // calles y banquetas
    for (const [y, h] of [[84, 18], [170, 20]]) { L.rect(0, y - 5, W, 5, '#e6dde2'); L.hl(0, W, y - 1, '#c3b5c0'); L.rect(0, y, W, h, '#a9a0b3'); L.rect(0, y + h, W, 4, '#e6dde2'); for (let x = 4; x < W; x += 14) L.rect(x, y + h / 2 - 1, 7, 1, '#fff6df'); }
    for (let x = 60; x < 84; x += 5) L.rect(x, 85, 3, 16, '#f3eef6');
    for (const id in LUGARES) edificio(L, id, LUGARES[id], false);
    for (const [x, y] of [[55, 82], [107, 82], [4, 168], [156, 168], [55, 168], [107, 168]]) arbol(L, x, y, noche);
    // carrito y farol
    const t = new Capa(W, H); t.rect(118, 92, 22, 6, '#f58fb0'); t.rect(122, 87, 13, 6, '#f9b9cb'); t.rect(124, 88, 4, 4, '#dff0fb'); t.rect(130, 88, 4, 4, '#dff0fb'); t.contorno('#a85b78'); t.elipse(123, 98.5, 2.4, 2.4, '#4a4257'); t.elipse(135, 98.5, 2.4, 2.4, '#4a4257'); L.sobre(t);
    if (noche) {
      L.cada((x, y, c) => y < 60 && false ? undefined : mult(c, [.5, .46, .66]));
      const G = new Capa(W, H); for (const id in LUGARES) edificio(G, id, LUGARES[id], true);
      const luz = col('#ffe2a0'); for (let i = 0; i < G.d.length; i++) if (G.d[i] === luz) L.d[i] = luz;
      for (const [x, y] of [[4, 6], [34, 4], [56, 12], [80, 5], [106, 10], [130, 4], [152, 14]]) L.px(x, y, '#ffffff');
      for (const x of [30, 82, 132]) for (const y of [80, 166]) { L.vl(x, y - 16, y, '#4a4257'); U.halo(L, x, y - 18, '#fff3b0', .5); }
    } else for (const x of [30, 82, 132]) for (const y of [80, 166]) { L.vl(x, y - 16, y, '#8d8598'); L.rect(x - 1, y - 18, 3, 3, '#fff3d6'); }
    return L;
  }
  /* ---------- interiores ---------- */
  const IW = 160, IH = 120;
  function ropaColgada(t, x0, x1, y, cs) { t.hl(x0, x1, y, '#b58f5a'); for (let x = x0 + 3, i = 0; x < x1 - 8; x += 11, i++) { const p = rampa(cs[i % cs.length]), m = new Capa(IW, IH); m.vl(x + 4, y + 1, y + 2, '#8d8598'); m.poli([[x, y + 5], [x + 3, y + 3], [x + 6, y + 3], [x + 9, y + 5], [x + 8, y + 22 + (i % 3) * 3], [x + 1, y + 22 + (i % 3) * 3]], p.b); m.sombrear(1, 0, 1, p.b, p.s); m.contorno(p.o); t.sobre(m); } }
  function lugar(id, o = {}) {
    const L = new Capa(IW, IH), q = LUGARES[id], p = rampa(q.color), noche = !!o.noche;
    L.rect(0, 0, IW, 84, mix(q.color, '#ffffff', .45)); for (let x = 6; x < IW; x += 14) L.vl(x, 0, 78, mix(q.color, '#ffffff', .25));
    L.rect(0, 78, IW, 6, '#fffaf3'); L.hl(0, IW, 78, p.s); L.rect(0, 84, IW, 36, '#e6cdb4'); for (let y = 90; y < IH; y += 8) { L.hl(0, IW, y, '#d6b899'); for (let x = (y * 5) % 40; x < IW; x += 40) L.vl(x, y, y + 7, '#d6b899'); }
    const pon = (fn, c) => { const t = new Capa(IW, IH); fn(t); if (c) t.contorno(c); L.sobre(t); };
    if (id === 'bazar') { ropaColgada(L, 4, 76, 18, ['#bdd5ee', '#8f5f48', '#f3dcae', '#b4cba9', '#f6c3d2']); ropaColgada(L, 88, 156, 24, ['#7d7a8c', '#f7ecd9', '#9a3350', '#d9c0a3']); pon(t => { for (const [x, c] of [[6, '#c9a67c'], [30, '#d8b98e'], [112, '#c9a67c'], [134, '#d8b98e']]) { t.rect(x, 64, 22, 22, c); t.rect(x + 3, 60, 7, 5, '#f6c3d2'); t.rect(x + 11, 59, 7, 6, '#bdd5ee'); } }, '#8f6a48'); }
    if (id === 'tienda') { ropaColgada(L, 4, 62, 16, ['#f6c3d2', '#cbb7ee', '#fffaf5', '#f58fb0']); ropaColgada(L, 98, 156, 16, ['#4a4257', '#f7ecd9', '#9a3350', '#bdd5ee']); pon(t => { t.elipse(80, 34, 13, 18, '#efd09a'); t.elipse(80, 34, 11, 16, '#dce9f6'); t.linea(74, 40, 84, 22, '#f6fbff'); }, '#b58f5a'); pon(t => { t.rect(10, 62, 44, 4, '#fffaf5'); t.rect(14, 66, 3, 18, '#e6c27a'); t.rect(47, 66, 3, 18, '#e6c27a'); t.rect(14, 56, 10, 6, '#f6c3d2'); t.rect(27, 57, 10, 5, '#cbb7ee'); t.rect(40, 55, 9, 7, '#fbe3a6'); }, MALVA); pon(t => { t.rect(108, 56, 44, 28, '#fffaf5'); t.hl(108, 151, 66, '#e9d6e4'); t.rect(116, 48, 10, 8, '#f58fb0'); t.vl(119, 45, 47, '#d96f93'); t.vl(122, 45, 47, '#d96f93'); }, MALVA); }
    if (id === 'super') { for (const x of [4, 92]) pon(t => { t.rect(x, 14, 64, 66, '#f3eef2'); for (let y = 18; y < 78; y += 16) { t.hl(x, x + 63, y + 13, '#b9aeb6'); const cs = ['#d2485a', '#f6b36a', '#8fc99c', '#f3dcae', '#bdd5ee', '#f6c3d2']; for (let i = 0; i < 10; i++) t.rect(x + 3 + i * 6, y + 4 + (i * 7 + y) % 4, 4, 9 - (i * 7 + y) % 4, cs[(i + y) % 6]); } }, '#8d8598'); pon(t => { t.rect(68, 62, 24, 20, '#c9a67c'); for (const [x, y, c] of [[70, 58, '#d2485a'], [76, 57, '#8fc99c'], [82, 58, '#f6b36a'], [87, 59, '#d2485a']]) t.elipse(x + 1, y + 3, 3.4, 3.4, c); }, '#8f6a48'); }
    if (id === 'salon') { for (const x of [12, 62, 112]) { pon(t => { t.elipse(x + 18, 30, 15, 19, '#e6c27a'); t.elipse(x + 18, 30, 13, 17, '#dce9f6'); t.linea(x + 11, 36, x + 22, 18, '#f6fbff'); for (let a = 0; a < 360; a += 45) t.rect(r(x + 18 + Math.cos(a * Math.PI / 180) * 14), r(30 + Math.sin(a * Math.PI / 180) * 18), 2, 2, '#fff3d6'); }, '#b58f5a'); pon(t => { const c = rampa('#f6b7c8'); t.rect(x + 8, 58, 20, 16, c.b); t.rect(x + 5, 72, 26, 5, c.s); t.rect(x + 16, 77, 4, 8, '#a79aa8'); t.rect(x + 10, 85, 16, 2, '#a79aa8'); }, rampa('#f6b7c8').o); } pon(t => { t.rect(48, 52, 10, 3, '#fffaf5'); ['#f58fb0', '#9c2f4c', '#b9a3ea'].forEach((c, i) => t.rect(49 + i * 3, 47, 2, 5, c)); t.rect(100, 52, 10, 3, '#fffaf5'); ['#f3dcae', '#a9cdf0', '#d23a4e'].forEach((c, i) => t.rect(101 + i * 3, 47, 2, 5, c)); }, MALVA); }
    if (id === 'cafe') { pon(t => { t.rect(90, 44, 66, 40, '#9a6a4e'); t.rect(88, 40, 70, 5, '#f3e3cf'); for (let x = 94; x < 156; x += 8) t.vl(x, 48, 82, '#86583f'); t.rect(96, 28, 18, 12, '#b9aeb6'); t.rect(99, 31, 5, 4, '#4a4257'); t.rect(126, 30, 22, 10, '#e8f2f8'); for (const [x, c] of [[128, '#e0b070'], [134, '#f6c3d2'], [141, '#8f5f48']]) t.rect(x, 35, 5, 4, c); }, '#5a3b2f'); pon(t => { t.rect(94, 8, 56, 14, '#4a4257'); for (let y = 11; y < 20; y += 3) { t.hl(98, 112, y, '#f3ead8'); t.hl(120, 144, y, '#f3ead8'); } }, '#2b1d26'); pon(t => { t.rect(8, 12, 60, 40, '#fffaf3'); t.rect(11, 15, 54, 34, noche ? '#3a356f' : '#cfe0f2'); t.vl(38, 15, 48, '#fffaf3'); t.rect(16, 34, 10, 15, noche ? '#57508c' : '#b9b3d6'); t.rect(44, 28, 12, 21, noche ? '#57508c' : '#b9b3d6'); if (noche) for (const [x, y] of [[18, 37], [22, 41], [46, 32], [52, 36], [48, 42]]) t.rect(x, y, 2, 2, '#ffe2a0'); }, MALVA); pon(t => { t.elipse(32, 72, 18, 4, '#f3e3cf'); t.rect(31, 75, 3, 14, '#86583f'); t.rect(24, 64, 6, 5, '#fffaf5'); t.rect(34, 60, 12, 8, '#e9d6e4'); t.rect(35, 61, 10, 6, '#b9cdf0'); }, '#5a3b2f'); for (const x of [40, 80, 120]) { L.vl(x, 0, 8, '#5a3b2f'); L.elipse(x + .5, 11, 5, 3.4, '#f6d9a0'); L.hl(x - 3, x + 3, 13, '#fff3d6'); } }
    if (noche && id !== 'cafe') for (let x = 20; x < IW; x += 40) L.elipse(x, 3, 6, 2, '#fff3d6');
    // pared alta arriba y ella al centro, de cuerpo completo
    const T = new Capa(IW, 184), alto = 184 - IH; T.rect(0, 0, IW, alto, mix(q.color, '#ffffff', .45)); for (let x = 6; x < IW; x += 14) T.vl(x, 0, alto, mix(q.color, '#ffffff', .25));
    T.rect(0, 0, IW, 4, '#fffaf3'); T.hl(0, IW, 4, p.s); for (let x = 2; x < IW; x += 12) { T.px(x, 5, p.s); T.px(x + 6, 6, p.l); }
    if (id === 'cafe') for (const x of [40, 80, 120]) T.vl(x, 5, alto, '#5a3b2f');
    T.sobre(L, 0, alto);
    if (o.ella) { T.elipse(82, 180, 17, 2.2, mix('#e6cdb4', '#8a6a9a', .3)); T.sobre(BB.ELLA.figura({ ...o.ella, sinSombra: true }), 40, 179 - BB.ELLA.SUELO); }
    return T;
  }
  BB.CIUDAD = { mapa, lugar, LUGARES, W, H };
})(typeof globalThis !== 'undefined' ? globalThis : this);
