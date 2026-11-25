/* Escenas en pixel art: el depa (160×192) de día y de noche, y el ícono del juego (64×64, normal y de Navidad).
   De noche el cuarto se oscurece por zonas según la distancia a la lámpara; ella se dibuja aparte y queda iluminada. */
(function (root) {
  'use strict';
  const BB = root.BB, { Capa, col, mix, mult, rampa, curva, trama } = BB;
  const r = Math.round;

  // degradado vertical en bandas, con trama solo en el cambio de banda
  function bandas(L, x0, y0, w, h, tonos) {
    tonos = tonos.map(col); const n = tonos.length;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const t = y / h * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = Math.max(0, Math.min(1, (t - i - .3) / .4));
      L.px(x0 + x, y0 + y, f > trama(x0 + x, y0 + y) ? tonos[i + 1] : tonos[i]);
    }
    return L;
  }
  // edificios: lista de [x, ancho, techo]
  function edificios(L, lista, c, o) {
    for (const [x, w, top] of lista) {
      L.rect(x, top, w, o.base - top, c);
      if (o.ventanas) for (let yy = top + 2; yy < o.base - 1; yy += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if (((xx * 7 + yy * 5 + x * 3) % 5) < (o.densidad || 2)) L.px(xx, yy, o.ventanas);
      if (o.nieve) L.hl(x - 1, x + w, top - 1, o.nieve);
    }
  }
  function halo(L, x, y, c, f = .4) { for (const [a, b] of [[-1, 0], [2, 0], [-1, 1], [2, 1], [0, -1], [1, -1], [0, 2], [1, 2]]) { const q = L.get(x + a, y + b); if (q) L.px(x + a, y + b, mix(q, c, f)); } L.rect(x, y, 2, 2, c); }

  /* ================= depa ================= */
  const DW = 160, DH = 192, YS = 136, LAMP = [56.5, 99];
  const MALVA = '#b79bb0';

  function ventana(noche) {
    const V = new Capa(DW, DH), F = new Capa(DW, DH), x0 = 31, y0 = 22, w = 46, h = 56, base = y0 + h;
    bandas(V, x0, y0, w, h, noche ? ['#25245a', '#322e6c', '#47407f', '#655592'] : ['#bcd0f4', '#d6d9f3', '#ecdcf0', '#fbe3e8']);
    if (noche) {
      for (const [x, y] of [[3, 4], [9, 11], [15, 3], [21, 15], [27, 7], [33, 20], [41, 5], [44, 16], [6, 22], [18, 26], [38, 27]]) V.px(x0 + x, y0 + y, (x + y) % 3 ? '#ffffff' : '#c9c8f4');
      V.elipse(x0 + 36, y0 + 11, 3.2, 3.2, '#fff4cf'); V.px(x0 + 35, y0 + 10, '#f1e2b4'); V.px(x0 + 37, y0 + 12, '#f1e2b4');
    } else {
      V.elipse(x0 + 12, y0 + 12, 8, 2.2, '#ffffff'); V.elipse(x0 + 17, y0 + 10, 5, 2, '#ffffff'); V.elipse(x0 + 37, y0 + 24, 6, 1.7, '#ffffff');
    }
    const lejos = noche ? '#4c4684' : '#b9b3d6', cerca = noche ? '#342f66' : '#9087b8', nieve = noche ? '#b7b4e2' : '#ffffff', luz = noche ? '#ffdf86' : '#fbe7b4';
    V.vl(x0 + 29, base - 36, base - 28, lejos); V.hl(x0 + 27, x0 + 31, base - 31, lejos); V.hl(x0 + 28, x0 + 30, base - 32, lejos);
    edificios(V, [[x0, 5, base - 16], [x0 + 5, 6, base - 22], [x0 + 12, 4, base - 13], [x0 + 17, 7, base - 19], [x0 + 26, 6, base - 27], [x0 + 33, 5, base - 15], [x0 + 39, 7, base - 21]], lejos, { base, nieve, ventanas: noche ? luz : 0, densidad: 1 });
    edificios(V, [[x0 + 1, 8, base - 9], [x0 + 10, 6, base - 12], [x0 + 18, 8, base - 7], [x0 + 28, 6, base - 11], [x0 + 36, 9, base - 8]], cerca, { base, nieve, ventanas: luz, densidad: noche ? 3 : 2 });
    if (!noche) { V.linea(x0 + 4, y0 + 12, x0 + 10, y0 + 4, '#ffffff'); V.linea(x0 + 27, y0 + 44, x0 + 35, y0 + 33, '#ffffff'); }
    V.cada((x, y) => (x < x0 || x >= x0 + w || y < y0 || y >= base) ? null : undefined);
    // marco blanco con cruz y repisa
    const c = rampa('#fffaf3'), P = new Capa(DW, DH);
    F.rect(x0 - 3, y0 - 3, w + 6, h + 6, c.b);
    P.rect(x0, y0, 22, 27, 1); P.rect(x0 + 24, y0, 22, 27, 1); P.rect(x0, y0 + 29, 22, 27, 1); P.rect(x0 + 24, y0 + 29, 22, 27, 1);
    F.quitar(P); F.rect(x0 - 6, base + 3, w + 12, 3, c.b);
    F.sombrear(0, 1, 1, c.b, c.s); F.contorno(MALVA);
    V.quitar(F);
    return { V, F };
  }
  function cortinas() {
    const C = new Capa(DW, DH), c = rampa('#fbc9d8'), oro = rampa('#e6c27a');
    for (const s of [-1, 1]) {
      const P = new Capa(DW, DH), xa = s < 0 ? 21 : 75, xb = xa + 12;
      P.perfil(16, 104, y => xa + (s < 0 ? 0 : Math.max(0, 2 - Math.abs(y - 66) / 6)), y => xb - (s < 0 ? Math.max(0, 2 - Math.abs(y - 66) / 6) : 0), c.b);
      P.cada((x, y) => (y > 100 && ((x + (y > 102 ? 1 : 0)) % 4 === 0)) ? null : undefined);
      P.encima(t => { for (let x = xa + 2; x < xb; x += 3) t.vl(x, 17, 104, c.s); for (let x = xa + 1; x < xb; x += 6) t.vl(x, 17, 104, c.l); t.hl(xa, xb, 66, c.d); t.hl(xa, xb, 67, c.s); });
      P.contorno(c.o); C.sobre(P);
    }
    C.rect(18, 13, 73, 2, oro.b); C.hl(18, 90, 15, oro.o); C.rect(16, 12, 3, 4, oro.b); C.rect(90, 12, 3, 4, oro.b); C.px(16, 12, oro.l); C.px(90, 12, oro.l);
    return C;
  }
  const cableY = x => 3 + 5.5 * Math.sin(Math.PI * ((x % 40) / 40));
  function luces(L, noche, calidas) {
    for (let x = 0; x < DW; x++) L.px(x, r(cableY(x)), noche ? '#3a3560' : '#c9a9bd');
    for (let x = 3; x < DW; x += 8) {
      const y = r(cableY(x)) + 1, cs = ['#fff0b3', '#ffd3df', '#fff0b3', '#d9f1e2'], cn = ['#fff3b0', '#ffb3c6', '#fff3b0', '#b8f0d2'], i = calidas ? 0 : ((x - 3) / 8) % 4;
      if (noche) halo(L, x, y, cn[i], .45); else { L.rect(x, y, 2, 2, cs[i]); L.px(x + 1, y + 1, mix(cs[i], '#b79bb0', .35)); }
    }
  }
  function paredPiso(noche) {
    const L = new Capa(DW, DH);
    // pared con puntitos, zoclo y piso de duela
    L.rect(0, 0, DW, YS, '#f7e1e9');
    for (let y = 6; y < YS - 6; y += 8) for (let x = 4 + ((y / 8) & 1) * 4; x < DW; x += 8) L.px(x, y, '#f0d0dd');
    L.rect(0, YS - 5, DW, 5, '#fffaf3'); L.hl(0, DW, YS - 6, MALVA); L.hl(0, DW, YS - 1, '#ead9cf');
    L.rect(0, YS, DW, DH - YS, '#e6c5a6');
    for (let y = YS, f = 0; y < DH; y += 7 + f, f++) { L.hl(0, DW, y, '#d3ad8a'); for (let x = (f * 37) % 46 - 10; x < DW; x += 46) L.vl(x, y, y + 6 + f, '#d3ad8a'); }
    L.hl(0, DW, YS, '#c39c7c');
    if (!noche) { const sol = new Capa(DW, DH); sol.poli([[40, YS + 3], [84, YS + 3], [70, YS + 26], [16, YS + 26]], 1); for (let i = 0; i < sol.d.length; i++) if (sol.d[i]) L.d[i] = mix(L.d[i], '#fff6dc', .4); }
    return L;
  }
  function mueblesSolo(noche) {
    const L = new Capa(DW, DH), pone = (fn, o) => { const t = new Capa(DW, DH); fn(t); if (o) t.contorno(o); L.sobre(t); return t; };
    // espejo de pie
    pone(t => {
      const o = rampa('#efd09a');
      t.elipse(14, 68, 9.5, 9, o.b); t.rect(5, 68, 19, 68, o.b); t.sombrear(1, 0, 1, o.b, o.s);
      t.elipse(14, 68, 7.5, 7, '#dce9f6'); t.rect(7, 68, 15, 66, '#dce9f6');
      t.encima(q => { q.rect(7, 112, 15, 22, '#e9dcee'); q.linea(9, 84, 17, 66, '#f6fbff'); q.linea(10, 86, 18, 68, '#f6fbff'); q.linea(13, 102, 20, 88, '#f6fbff'); q.vl(7, 62, 133, '#c5d6ea'); q.hl(8, 20, 134, '#f6fbff'); });
      t.rect(5, 136, 3, 3, o.s); t.rect(21, 136, 3, 3, o.s);
    }, '#b58f5a');
    // cuadrito con moño
    pone(t => { const c = rampa('#fffaf3'); t.rect(127, 20, 19, 20, c.b); t.rect(129, 22, 15, 16, '#fbd9e3'); t.dibujo(131, 26, ['.bb.....bb.', 'bbbb.k.bbbb', 'bbbbkkkbbbb', 'bbbb.k.bbbb', '.bb.k.k.bb.', '...k...k...'], { b: '#f58fb0', k: '#d96f93' }); t.hl(127, 145, 39, c.s); }, MALVA);
    // planta
    pone(t => { const m = rampa('#f4a9bd'); t.perfil(124, 139, [[124, 28], [139, 30.5]], [[124, 42], [139, 39.5]], m.b); t.rect(27, 122, 16, 3, m.l); t.sombrear(1, 0, 2, m.b, m.s); t.hl(28, 41, 125, m.s); }, rampa('#f4a9bd').o);
    const v = rampa('#8fc99c');
    for (const [x, y, rx, ry] of [[27, 106, 4, 6], [43, 108, 4, 6], [30, 97, 4, 6.5], [40, 99, 4, 6.5], [35, 92, 4.2, 7]]) {
      L.linea(35, 122, x, y + 3, v.o);
      pone(t => { t.elipse(x + .5, y, rx, ry, v.b); t.sombrear(1, 0, 1, v.b, v.s); t.encima(q => { q.vl(x, r(y - ry + 2), r(y + ry), v.d); q.px(x - 2, r(y - 2), v.l); q.px(x - 2, r(y - 1), v.l); }); }, v.o);
    }
    // buró con lámpara
    pone(t => {
      const c = rampa('#fff4ea'), oro = rampa('#e6c27a');
      t.rect(46, 137, 2, 4, '#d9b99a'); t.rect(65, 137, 2, 4, '#d9b99a');
      t.rect(45, 115, 23, 22, c.b); t.sombrear(1, 0, 2, c.b, c.s); t.rect(43, 112, 27, 3, c.l);
      t.encima(q => { q.hl(45, 67, 115, c.s); q.hl(46, 66, 125, c.s); q.hl(46, 66, 126, c.l); q.rect(55, 119, 3, 2, oro.b); q.rect(55, 130, 3, 2, oro.b); q.px(55, 119, oro.l); q.px(55, 130, oro.l); });
    }, MALVA);
    pone(t => { const p = rampa('#f58fb0'); t.rect(62, 107, 4, 5, p.b); t.px(62, 107, p.l); t.rect(63, 105, 2, 2, '#e6c27a'); }, rampa('#f58fb0').o);
    pone(t => {
      const oro = rampa('#e6c27a'), c = noche ? { l: col('#ffffff'), b: col('#fff6cf'), s: col('#ffe9a6') } : rampa('#fff1d2');
      t.rect(53, 109, 7, 3, oro.b); t.px(53, 109, oro.l); t.rect(56, 103, 1, 6, oro.b);
      t.perfil(91, 104, [[91, 52.5], [104, 48.5]], [[91, 60.5], [104, 64.5]], c.b);
      t.encima(q => { q.hl(48, 65, 103, c.s); q.vl(52, 92, 102, c.l); q.vl(53, 91, 102, c.l); if (noche) q.rect(54, 95, 5, 6, c.l); });
    }, '#c9a66a');
    // repisa con libros, florero y marquito
    pone(t => {
      const c = rampa('#fffaf3');
      t.rect(118, 58, 39, 2, c.b); t.px(121, 60, c.s); t.px(153, 60, c.s); t.px(121, 61, c.s); t.px(153, 61, c.s);
      t.rect(121, 48, 3, 10, '#b9a3ea'); t.rect(125, 50, 3, 8, '#f58fb0'); t.rect(129, 47, 3, 11, '#a8dcc0'); t.px(122, 50, '#ffffff'); t.px(126, 52, '#ffffff'); t.px(130, 49, '#ffffff');
      t.rect(136, 53, 4, 5, '#fffaf3'); t.px(137, 52, '#6aa884'); t.px(138, 51, '#6aa884'); t.px(137, 50, '#f58fb0'); t.px(139, 50, '#ffd98a'); t.px(138, 49, '#f58fb0');
      t.rect(144, 49, 9, 9, '#fffaf3'); t.rect(145, 50, 7, 7, '#fbd9e3'); t.dibujo(146, 51, ['.h.h.', 'hhhhh', '.hhh.', '..h..'], { h: '#f58fb0' });
    }, MALVA);
    // cama: cabecera, colchón, almohadas y cobija
    pone(t => { const c = rampa('#f7b9cc'); t.elipse(154.5, 96, 5.5, 6, c.b); t.rect(149, 96, 11, 42, c.b); t.sombrear(-1, 0, 1, c.b, c.l); t.encima(q => { for (let y = 100; y < 136; y += 8) { q.px(154, y, c.d); q.px(153, y + 1, c.s); q.px(155, y + 1, c.s); } }); }, rampa('#f7b9cc').o);
    pone(t => { t.rect(106, 136, 3, 5, '#d9b99a'); t.rect(146, 136, 3, 5, '#d9b99a'); const c = rampa('#f3c9d6'); t.rect(104, 128, 46, 8, c.b); t.encima(q => q.hl(104, 150, 135, c.s)); const m = rampa('#fffaf3'); t.rect(104, 118, 46, 10, m.b); t.encima(q => q.hl(104, 150, 127, m.s)); }, MALVA);
    pone(t => { const c = rampa('#fbd0dc'); t.elipse(143, 110, 6.5, 5, c.b); t.sombrear(0, 1, 1, c.b, c.s); }, rampa('#fbd0dc').o);
    pone(t => { const c = rampa('#ffffff'); t.elipse(139, 114, 8.5, 4.6, c.b); t.sombrear(0, 1, 1, c.b, c.s); t.encima(q => q.hl(134, 138, 112, '#ffffff')); }, MALVA);
    pone(t => {
      const c = rampa('#f9c4d4');
      t.perfil(116, 138, y => 102.5, y => 131 + (y > 134 ? -1 : 0) + (y < 119 ? -1 : 0), c.b);
      t.cada((x, y) => (y > 135 && (x % 6 < 2)) ? null : undefined);
      t.encima(q => { for (let y = 121; y < 136; y += 5) for (let x = 105 + ((y / 5) & 1) * 3; x < 131; x += 6) q.px(x, y, '#ffffff'); q.rect(127, 116, 5, 22, '#fffaf3'); q.vl(127, 116, 138, c.s); q.hl(103, 126, 128, c.s); });
      t.sombrear(1, 0, 1, c.b, c.s);
    }, rampa('#f9c4d4').o);
    // tapete
    pone(t => {
      const c = rampa('#fff6ee');
      t.elipse(88, 177, 62, 12, c.b); for (let a = 0; a < 360; a += 8) t.elipse(88 + Math.cos(a * Math.PI / 180) * 61, 177 + Math.sin(a * Math.PI / 180) * 11.4, 2.6, 1.8, c.b);
      t.encima(q => { q.elipse(88, 177, 53, 9, '#fbd3df'); q.elipse(88, 177, 50, 7.6, c.b); for (let y = 170; y < 186; y += 4) for (let x = 44 + (y % 8) * 2; x < 134; x += 11) q.px(x, y, c.s); });
      t.sombrear(0, 1, 1, c.b, c.s);
    }, '#d8bfd0');
    return L;
  }
  // de noche: cada pixel se oscurece según qué tan lejos queda de la lámpara (zonas con trama en la orilla)
  function penumbra(L) {
    return L.cada((x, y, c) => {
      const d = Math.hypot(x + .5 - LAMP[0], (y + .5 - LAMP[1]) * .9) + (trama(x, y) - .5) * 8;
      return mult(c, d < 20 ? [1, .94, .8] : d < 40 ? [.86, .76, .72] : d < 64 ? [.66, .58, .68] : d < 92 ? [.5, .45, .63] : [.4, .37, .58]);
    });
  }
  // ella de noche: tonos cálidos de la lámpara y una sombra fría del lado contrario; nunca se oscurece entera
  function iluminada(F) {
    const out = F.copia();
    return out.cada((x, y, c) => {
      let k = 9; for (let i = 1; i <= 4; i++) if (!F.get(x + i, y)) { k = i; break; }
      const b = mult(c, [1, .97, .9]);
      if (k <= 2) return mix(b, '#3a2f63', .36);
      if (k <= 4 && trama(x, y) > .5) return mix(b, '#3a2f63', .26);
      return b;
    });
  }
  function depa(o = {}) {
    const noche = !!o.noche, { V, F } = ventana(noche), C = cortinas(), M = mueblesSolo(noche);
    // pared y piso → ventana y cortinas → muebles encima
    const T = paredPiso(noche); T.sobre(F); T.sobre(C); T.sobre(M);
    if (noche) penumbra(T);
    V.quitar(C); V.quitar(M); T.sobre(V);
    luces(T, noche);
    if (noche) { for (const [x, y] of [[50, 97], [63, 97], [56, 89], [56, 106]]) { const q = T.get(x, y); T.px(x, y, mix(q, '#fff6cf', .35)); } T.px(15, 80, '#fff0b3'); T.px(16, 79, '#fff0b3'); }
    if (o.ella) {
      const ox = 50, oy = 183 - BB.ELLA.SUELO, fig = BB.ELLA.figura({ ...o.ella, sinSombra: true });
      const sx = noche ? 100 : 92, sy = BB.ELLA.SUELO + oy + 1.5, rx = noche ? 22 : 16, ry = noche ? 2.6 : 2;
      for (let y = Math.floor(sy - ry); y <= sy + ry; y++) for (let x = Math.floor(sx - rx); x <= sx + rx; x++) if (Math.pow((x + .5 - sx) / rx, 2) + Math.pow((y + .5 - sy) / ry, 2) < 1) T.px(x, y, mix(T.get(x, y), noche ? '#241e4a' : '#8a6a9a', noche ? .45 : .22));
      T.sobre(noche ? iluminada(fig) : fig, ox, oy);
    }
    return T;
  }

  /* ================= ícono ================= */
  function icono(o = {}) {
    const N = 64, L = new Capa(N, N), nav = !!o.navidad, cx = 37.5;
    bandas(L, 0, 0, N, N, ['#c6d3f2', '#d9d7f1', '#e9dcf0', '#f8e0e8', '#fff1ea']);
    const nube = '#f7f3fb';
    L.elipse(14, 21.5, 10, 2.2, nube); L.elipse(21, 19.5, 6, 2, nube); L.elipse(58, 33.5, 8, 1.8, nube); L.elipse(8, 36.5, 7, 1.6, nube);
    // ciudad con nieve en los techos y la torre
    const lejos = '#b9b3d6', cerca = '#8f86b8', nieve = '#ffffff';
    L.vl(56, 14, 20, lejos); L.rect(55, 20, 2, 44, lejos); L.elipse(56, 27.5, 3.6, 1.4, lejos); L.hl(54, 57, 26, lejos);
    edificios(L, [[0, 5, 40], [5, 5, 45], [10, 6, 41], [16, 5, 35], [21, 6, 42], [47, 6, 46], [58, 6, 41]], lejos, { base: N, nieve });
    edificios(L, [[-1, 4, 54], [3, 9, 50], [12, 6, 55], [18, 5, 52], [49, 5, 57], [57, 7, 48]], cerca, { base: N, nieve, ventanas: '#fbe3a6', densidad: 3 });
    L.rect(0, 63, N, 1, nieve);
    // hombros y suéter (de Navidad: grecas rojas)
    const p = BB.PIELES.clara, S = new Capa(N, N), sw = rampa('#fff6ea');
    S.perfil(55, 64, [[55, 27], [58, 19], [64, 13]], [[55, 48], [58, 56], [64, 62]], col(p.b)); S.contorno(col(p.o));
    const Q = new Capa(N, N); Q.perfil(59, 64, [[59, 16], [64, 10]], [[59, 59], [64, 65]], sw.b);
    Q.encima(t => { t.hl(0, N, 59, sw.l); if (nav) { for (let x = 0; x < N; x++) { t.px(x, 61 + [0, 1, 2, 1][x & 3], '#d2485a'); if ((x & 3) === 0) t.px(x, 63, '#d2485a'); } } else for (let x = 0; x < N; x += 2) t.vl(x, 61, 63, sw.s); });
    Q.sombrear(1, 0, 3, sw.b, sw.s); Q.sombrear(-1, 0, 2, sw.b, mix(sw.b, '#ffffff', .6)); S.sombrear(-1, 0, 2, col(p.b), col(p.l)); S.sombrear(1, 0, 2, col(p.b), col(p.s));
    Q.contorno('#b08a72'); L.sobre(S); L.sobre(Q);
    // pelo café cenizo con ondas
    const hc = { h: col('#e2d3c2'), l: col('#b9a797'), m: col('#8f7c6d'), d: col('#74625a'), o: col('#4d3f3b') };
    const hw = curva([18.6, 20, 22, 25, 29, 34, 46, 54, 64], [1.2, 4.6, 8, 11, 13, 13.8, 15.2, 16.6, 17.6]), onda = y => y > 27 ? Math.sin((y - 27) / 3.1) * 1.3 * Math.min(1, (y - 27) / 7) : 0;
    const H = new Capa(N, N); H.perfil(18.6, 64, y => cx - hw(y) - onda(y), y => cx + hw(y) + onda(y + 5), hc.m);
    H.elipse(cx - 6.5, 23.6, 3.4, 2.2, hc.m); H.elipse(cx + 7.4, 25, 3, 2, hc.m);                // volumen: la coronilla no es una bola lisa
    H.sombrear(1, 0, 3, hc.m, hc.d); H.sombrear(1, 0, 1, hc.d, mix(hc.d, hc.o, .45)); H.sombrear(-1, 0, 1, hc.m, hc.l);
    H.encima(t => {
      // mechones con ondas que bajan desde la coronilla y se recogen en el moño (media cola)
      const mech = (sx, c) => { for (let y = 20; y <= 37; y++) { const f = (y - 20) / 17, x = cx + sx * (1 - .78 * f * f) * Math.min(1, .35 + f * 2.2) + Math.sin(y / 2.2 + sx) * .7; t.px(r(x - .5), y, c); } };
      for (const sx of [-10, -4, 7]) mech(sx, hc.l);
      for (const sx of [-7, 2, 11]) mech(sx, hc.d);
      for (const sx of [-11, -5.5, 6.5, 12]) for (let y = 47; y < 64; y++) t.px(r(cx + sx + Math.sin((y - 40) / 3.4) * 1.1), y, hc.l);
      for (const sx of [-8, 9.5]) for (let y = 45; y < 64; y++) t.px(r(cx + sx + Math.sin((y - 40) / 3.4) * 1.1), y, hc.d);
    });
    // brillo del pelo sano: banda de luz en la coronilla, con la orilla en zigzag
    H.encima(t => { for (let a = 38; a <= 150; a += 2) { if (a > 84 && a < 96) continue; const x = r(cx - .5 + Math.cos(a * Math.PI / 180) * 10.2), y = r(33 - Math.sin(a * Math.PI / 180) * 9.6); t.px(x, y, Math.abs(a - 112) < 22 ? hc.h : hc.l); if (x & 1) t.px(x, y + 1, hc.l); } });
    H.contorno(hc.o); L.sobre(H);
    for (const [pts, c] of [[[[23, 40], [21, 43], [21, 46]], hc.m], [[[53, 41], [55, 44], [55, 47]], hc.d]]) L.trazo(pts, c);       // mechones sueltos
    // moño crema con perla y colas largas
    const mo = { h: col('#ffffff'), b: col('#fffaf0'), s: col('#efe2cf'), d: col('#dcc7ae'), o: col('#a98a72') };
    for (const pts of [[[35.4, 39], [37.6, 39], [36.4, 64], [31.4, 64]], [[37.4, 39], [39.6, 39], [43.6, 64], [38.6, 64]]]) { const t = new Capa(N, N); t.poli(pts, '#f4e8d9'); t.sombrear(1, 0, 2, col('#f4e8d9'), mo.s); t.sombrear(1, 0, 1, mo.s, mo.d); t.sombrear(-1, 0, 1, col('#f4e8d9'), mo.h); t.contorno(mo.o); L.sobre(t); }
    for (const s of [-1, 1]) {
      const t = new Capa(N, N);
      t.poli([[cx + s * 1.5, 37.2], [cx + s * 6, 33.6], [cx + s * 10.5, 31.6], [cx + s * 13.6, 32.6], [cx + s * 14.8, 37.6], [cx + s * 13.6, 43], [cx + s * 10.5, 44.4], [cx + s * 6, 42.6], [cx + s * 1.5, 39.8]], mo.b);
      t.sombrear(0, 1, 2, mo.b, mo.s); t.sombrear(0, 1, 1, mo.s, mo.d); t.sombrear(0, -1, 1, mo.b, mo.h); if (s > 0) t.sombrear(1, 0, 2, mo.b, mo.s);
      t.encima(q => { q.linea(cx + s * 5 - .5, 35.4, cx + s * 8 - .5, 34, mo.h); q.linea(cx + s * 4 - .5, 36, cx + s * 7 - .5, 37, mo.s); });
      t.encima(q => { q.linea(cx + s * 3 - .5, 38, cx + s * 9 - .5, 35, mo.s); q.linea(cx + s * 3 - .5, 39, cx + s * 9 - .5, 41, mo.s); });
      t.contorno(mo.o); L.sobre(t);
    }
    const pe = new Capa(N, N); pe.elipse(cx, 38.5, 2.5, 2.5, '#f8f0e6'); pe.sombrear(1, 0, 1, col('#f8f0e6'), mo.s); pe.sombrear(0, 1, 1, col('#f8f0e6'), mo.s); pe.contorno(mo.o); L.sobre(pe); L.px(36, 37, '#ffffff'); L.px(37, 37, '#ffffff'); L.px(36, 38, '#ffffff'); L.px(38, 39, mo.d);
    if (nav) {
      // acebo en el moño y serie de luces
      const g = { g: col('#4f8a63'), G: col('#2f6247') };
      L.dibujo(31, 32, ['GG...', 'GgGg.', '.GgGG', '...GG'], g); L.dibujo(39, 32, ['GG...', 'GgGg.', '.GgGG', '...GG'], g, true);
      L.rect(36, 34, 3, 2, '#d2485a'); L.rect(37, 33, 1, 1, '#d2485a'); L.px(36, 34, '#f28a96'); L.px(38, 35, '#a8323f');
      const cy = x => 7 + 2 * Math.sin(x / 10.2 + .5);
      for (let x = 0; x < N; x++) L.px(x, r(cy(x)), '#4f6f5c');
      ['#ffe9a3', '#ff9aa8', '#ffe9a3', '#a8dcc0', '#ffe9a3', '#ff9aa8', '#ffe9a3'].forEach((c, i) => halo(L, 3 + i * 9, r(cy(3 + i * 9)) + 1, c, .45));
    }
    // nieve
    for (const [x, y, g] of [[11, 2, 1], [27, 3, 0], [33, 4, 0], [6, 17, 0], [28, 18, 0], [42, 16, 1], [46, 14, 0], [16, 10, 0], [36, 11, 1], [59, 21, 1], [50, 26, 0], [14, 28, 0], [10, 30, 1], [23, 27, 0], [0, 32, 0], [13, 34, 0], [5, 40, 1], [52, 34, 0], [53, 37, 0], [61, 38, 0], [31, 29, 1], [41, 42, 0], [25, 47, 0], [38, 53, 1], [48, 57, 1], [9, 46, 0], [55, 53, 0], [44, 23, 0], [20, 14, 0], [60, 8, 0]]) { if (nav && y < 12) continue; L.px(x, y, '#ffffff'); if (g) { L.px(x + 1, y, '#ffffff'); L.px(x, y + 1, '#ffffff'); L.px(x + 1, y + 1, '#ffffff'); } }
    return L;
  }

  BB.ESCENAS = { util: { bandas, edificios, halo, ventana, cortinas, luces, iluminada }, depa, icono, DW, DH };
})(typeof globalThis !== 'undefined' ? globalThis : this);
