/* Ella de cuerpo completo en una cuadrícula de 80×176 pixeles.
   El «rig» convierte la complexión y la estatura en medidas (bordes del torso, piernas, brazos, cabeza) y TODAS las
   prendas se dibujan a partir de esas medidas: por eso una prenda se dibuja una vez y le queda a los 12 cuerpos.
   Pose: peso en una pierna, cadera un poco de lado, una mano en la cadera y la otra suelta (con o sin bolsa). */
(function (root) {
  'use strict';
  const BB = root.BB, { Capa, col, mix, acl, lum, curva, borde } = BB;
  /* Acabado hi-bit: cada color tiene 4 tonos (brillo, luz, base, sombra) más una sombra profunda, y su contorno es
     el mismo color en oscuro (rosa oscuro en ropa rosa, café en la piel...), no una línea igual para todo. */
  function oscuro(c) {
    c = col(c); const R = (c >>> 16 & 255) / 255, G = (c >>> 8 & 255) / 255, B = (c & 255) / 255;
    const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, d = mx - mn;
    let h = 0;
    if (d) h = mx === R ? ((G - B) / d + 6) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
    const l2 = l > .25 ? Math.max(.24, l * .53) : l * .62, s2 = Math.min(.42, Math.max(.16, (mx ? d / mx : 0) * 2.2 - .02)), C = (1 - Math.abs(2 * l2 - 1)) * s2, X = C * (1 - Math.abs(h % 2 - 1)), m = l2 - C / 2;
    const q = h < 1 ? [C, X, 0] : h < 2 ? [X, C, 0] : h < 3 ? [0, C, X] : h < 4 ? [0, X, C] : h < 5 ? [X, 0, C] : [C, 0, X];
    return mix((0xff000000 | Math.round((q[0] + m) * 255) << 16 | Math.round((q[1] + m) * 255) << 8 | Math.round((q[2] + m) * 255)) >>> 0, '#3d2a45', .1);
  }
  const rampas = new Map();
  function rampa(c) { const k = col(c); let q = rampas.get(k); if (!q) { const b = BB.rampa(k); q = { l: b.l, b: b.b, s: b.s, d: b.d, h: mix(b.l, '#ffffff', .55), o: oscuro(k) }; rampas.set(k, q); } return q; }
  // volumen con la luz arriba a la izquierda: sombra a la derecha y por debajo, luz a la izquierda y por arriba, brillo en la esquina
  function volumen(L, p, n = 1) {
    L.sombrear(1, 0, n, p.b, p.s); L.sombrear(0, 1, 1, p.b, p.s);
    if (n > 1) L.sombrear(1, 0, 1, p.s, p.d);
    L.sombrear(-1, 0, 1, p.b, p.l); L.sombrear(0, -1, 1, p.b, p.l);
    const l = col(p.l), marcas = [];
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (L.get(x, y) === l && !L.hay(x - 1, y) && (!L.hay(x, y - 1) || !L.hay(x, y - 2))) marcas.push(y * L.w + x);
    for (const i of marcas) L.d[i] = col(p.h);
    return L;
  }
  const W = 80, H = 176, SUELO = 173;
  const capa = () => new Capa(W, H);
  const r = Math.round;

  /* ================= rig ================= */
  // medidas con las proporciones elegidas (pasos de -1 a 1) y estatura por nombre o por número (-5 a 5)
  function medidas(cuerpo, prop) {
    const C = { ...BB.CUERPOS[cuerpo] };
    for (const k in prop || {}) { const d = BB.PROPORCIONES[k].d; for (const m in d) C[m] += d[m] * prop[k]; }
    return C;
  }
  const alturas = e => typeof e === 'number' ? { pierna: e, torso: 2 * Math.round(e * .4) } : BB.ESTATURAS[e];
  function rig(cuerpo, estatura, prop) {
    const C = medidas(cuerpo, prop), S = alturas(estatura);
    const yTob = SUELO - 6, yRod = yTob - 30 - S.pierna, yEntre = yRod - 31 - S.pierna, yCad = yEntre - 6,
      yCint = yCad - 15 - S.torso / 2, yBusto = yCint - 14 - S.torso / 2, yHom = yBusto - 10, yMenton = yHom - 4, y0 = yMenton - 24;
    const cc = 42, pc = 39.8, hx = C.hom - C.brazo / 2;        // cc: centro del pecho · pc: centro de la cadera (de lado)
    const cen = curva([yBusto, yCint, yCad], [cc, cc - .6, pc]);
    const tI = borde([[yHom - 1, cc - C.cuello], [yHom + .5, cc - C.cuello - 2.4], [yHom + 3, cc - hx], [yHom + 6, cc - hx], [yBusto, cc - C.busto], [yBusto + 4, cc - C.bajo], [yCint, cen(yCint) - C.cintura], [yCad - 2, pc - C.cadera - .4], [yEntre + 1, pc - C.cadera + .2]]);
    const tD = borde([[yHom - 1, cc + C.cuello], [yHom + .5, cc + C.cuello + 2.4], [yHom + 3, cc + hx - .5], [yHom + 6, cc + hx - .5], [yBusto, cc + C.busto - .4], [yBusto + 4, cc + C.bajo - .4], [yCint, cen(yCint) + C.cintura], [yCad + 1, pc + C.cadera], [yEntre + 1, pc + C.cadera - .4]]);
    // piernas: [y, centro, ancho]. Izquierda (en pantalla) carga el peso; la derecha va relajada, con el pie hacia afuera.
    const kI = pc - .3 - C.rod / 2, aI = pc - 1.5, kD = pc + .9 + C.rod / 2, aD = pc + 7.6;
    // forma natural: muslo lleno que se afina hacia la rodilla, rodilla marcada, un angostito debajo y la curva de la pantorrilla
    const muI = pc - C.muslo / 2 - .1, muD = pc + C.muslo / 2 - .1, tm = 6 / (yRod - yEntre - 10);
    const pI = [[yCad - 1, pc - C.cadera + C.muslo / 2 + .3, C.muslo], [yEntre + 1, pc - C.muslo / 2 + .1, C.muslo], [yEntre + 10, muI, C.muslo - .5], [yRod - 6, kI + (muI - kI) * tm, C.rod + 1.3], [yRod, kI, C.rod + .3], [yRod + 3, kI - .1, C.rod - .3], [yRod + 10, kI - .5, C.pant], [yTob - 5, aI - .1, C.tob + 1], [yTob - 1, aI, C.tob + .2], [yTob + 1, aI, C.tob]];
    const pD = [[yCad - 1, pc + C.cadera - C.muslo / 2 - .3, C.muslo], [yEntre + 1, pc + C.muslo / 2 - .1, C.muslo], [yEntre + 10, muD, C.muslo - .5], [yRod - 7, kD + (muD - kD) * tm, C.rod + 1.3], [yRod - 1, kD, C.rod + .3], [yRod + 2, kD + .3, C.rod - .3], [yRod + 9, kD + 1.5, C.pant], [yTob - 5, aD - .2, C.tob + 1], [yTob - 1, aD + .1, C.tob + .2], [yTob + 1, aD + .2, C.tob]];
    const fn = k => { const ys = k.map(q => q[0]), c = curva(ys, k.map(q => q[1])), w = curva(ys, k.map(q => q[2])); return { c, w, i: y => c(y) - w(y) / 2, d: y => c(y) + w(y) / 2 }; };
    // brazos: [x, y, diámetro] hombro → codo → muñeca
    const jI = [cc - hx - .2, yHom + 4 + C.brazo / 2], jD = [cc + hx - .7, yHom + 2.9 + C.brazo / 2];
    const bD = [[jD[0], jD[1], C.brazo + .4], [jD[0] + 2.5, yCint - .5, C.ante + .5], [jD[0] + 1.9, yCad + 1, C.muneca]];
    const mI = [tI(yCint + 6.5) + 1.2, yCint + 6.2];
    const bI = [[jI[0], jI[1], C.brazo + .4], [jI[0] - 5.2, yCint - 1, C.ante + .6], [mI[0], mI[1], C.muneca + .3]];
    return { C, cuerpo, estatura, yTob, yRod, yEntre, yCad, yCint, yBusto, yHom, yMenton, y0, cc, pc, hx, cen, tI, tD, pI, pD, fI: fn(pI), fD: fn(pD), aI, aD, bI, bD, cx: cc };
  }

  /* ================= piel ================= */
  const tonos = sk => ({ h: mix(sk.l, '#ffffff', .55), l: col(sk.l), b: col(sk.b), s: col(sk.s), d: col(sk.d), o: col(sk.o) });
  function acabar(L, p, n = 1) { volumen(L, p, n); return L.contorno(p.o); }

  // contorno del pie: el izquierdo se ve de frente, el derecho apunta hacia afuera
  function pieI(L, G, c, e = 0) {
    const a = G.aI, t = G.C.tob, k = t / 4;
    L.perfil(G.yTob, SUELO, [[G.yTob, a - t / 2 - e], [G.yTob + 2.5, a - 2.8 * k - e], [SUELO - 1.5, a - 3.7 * k - e], [SUELO, a - 3.1 * k - e]], [[G.yTob, a + t / 2 + e], [G.yTob + 2.5, a + 3 * k + e], [SUELO - 1.5, a + 3.9 * k + e], [SUELO, a + 3.3 * k + e]], c);
  }
  function pieD(L, G, c, e = 0) {
    const a = G.aD + .2, t = G.C.tob, k = t / 4;
    L.poli([[a - t / 2 - e, G.yTob], [a + t / 2 + e, G.yTob], [a + t / 2 + 2 + e, G.yTob + 2.2 - e], [a + 7.4 * k + e, SUELO - 2.7 - e], [a + 8.8 * k + e, SUELO - 1.2], [a + 8.2 * k + e, SUELO], [a - t / 2 - .8 - e, SUELO], [a - t / 2 - 1 - e, SUELO - 2.6]], c);
  }
  function piernas(G, p, o) {
    const out = capa(), un = o.forma ? BB.unasLejos(o.pies) : BB.UNAS[o.unasPies || o.unas || 'natural'], nc = un.color || mix(p.b, '#ffd9dd', .6);
    for (const lado of ['D', 'I']) {
      const L = capa();
      L.columna(lado === 'I' ? G.pI : G.pD, p.b);
      (lado === 'I' ? pieI : pieD)(L, G, p.b);
      acabar(L, p, G.C.rod >= 6 ? 2 : 1);
      { const fl = lado === 'I' ? G.fI : G.fD, xa = y => Math.ceil(fl.i(y) - .5); L.encima(t => { for (let y = G.yEntre + 7; y <= G.yEntre + 10; y++) t.px(xa(y), y, p.h); for (let y = G.yRod + 7; y <= G.yRod + 9; y++) t.px(xa(y), y, p.h); }); }
      // rodilla y tobillo
      const f = lado === 'I' ? G.fI : G.fD, yk = G.yRod - (lado === 'I' ? 0 : 1);
      const xk = r(f.c(yk) - .5), m = f.w(yk) < 6 ? 1 : 2;
      L.encima(t => { t.hl(xk - m + 1, xk + m - 1, yk + 2, p.s); t.px(xk - m, yk + 1, p.s); t.px(xk + m, yk + 1, p.s); t.px(xk, yk - 1, p.l); });
      if (G.cuerpo === 'atletica') L.encima(t => t.vl(r(f.c(G.yRod + 9) + (lado === 'I' ? -1.6 : 1.4)), G.yRod + 6, G.yRod + 13, p.s));
      // uñas de los pies
      if (lado === 'I') { const x = r(G.aI); L.encima(t => { t.hl(x, x + 1, SUELO - 2, nc); t.px(x - 2, SUELO - 2, nc); t.px(x - 3, SUELO - 3, nc); if (un.toque) t.px(x + 1, SUELO - 2, un.toque); if (un.rota) t.px(x, SUELO - 2, p.b); }); }
      else { const x = r(G.aD + .2 + 7.4 * G.C.tob / 4); L.encima(t => { t.hl(x - 1, x, SUELO - 2, nc); t.px(x - 3, SUELO - 2, nc); }); }
      out.sobre(L);
    }
    return out;
  }
  function torso(G, p, o = {}) {
    const L = capa(), { C, cc, yHom, yMenton, yBusto, yCint } = G;
    for (let y = yMenton - 3; y <= yHom; y++) L.tramo(y, cc - C.cuello - .1, cc + C.cuello - .1, p.b);
    L.perfil(yHom - 1, G.yEntre + 1, G.tI, G.tD, p.b);
    acabar(L, p, 2);
    L.encima(t => {
      t.hl(cc - 7, cc - 4, yHom + 3, p.s); t.hl(cc + 3, cc + 6, yHom + 3, p.s);       // clavículas
      if (o.forma && BB.PECAS[o.pecas].hombros) for (const [x, y] of [[-8, 3], [-6, 5], [-9, 6], [7, 3], [5, 5], [8, 6], [-4, 6], [3, 7]]) t.px(cc + x, yHom + y, mix(p.b, p.d, .5));
      t.px(r(G.cen(yCint + 5)), yCint + 5, p.s);                                       // ombligo
      if (G.cuerpo === 'atletica') { const x = r(G.cen(yCint)); t.vl(x, yBusto + 8, yCint + 2, p.s); t.px(x - 3, yCint - 2, p.s); t.px(x + 3, yCint - 2, p.s); }
    });
    return L;
  }
  function brazos(G, p, o = {}) {
    const out = capa();
    for (const b of [G.bD, G.bI]) { const L = capa(); L.tubo(b, p.b); acabar(L, p, 1); out.sobre(L); }
    if (o.forma && BB.PECAS[o.pecas].hombros) out.encima(t => { for (const b of [G.bI, G.bD]) for (const [x, y] of [[-1, 0], [1, 2], [0, 4], [-1, 6]]) t.px(r(b[0][0] + x), r(b[0][1] + y), mix(p.b, p.d, .5)); });
    if (G.cuerpo === 'atletica') out.encima(t => { t.px(r(G.bD[0][0] - 1), r(G.bD[0][1] + 5), p.s); t.px(r(G.bI[0][0] + 1), r(G.bI[0][1] + 5), p.s); });
    return out;
  }
  function manos(G, p, o) {
    const un = o.forma ? BB.unasLejos(o.manos) : BB.UNAS[o.unas || 'natural'], n = un.color || mix(p.b, '#ffd9dd', .6), a = un.rota ? p.b : un.toque || n, L = capa();
    const pal = { s: p.b, d: p.s, n, a };
    const [dx, dy] = G.bD[2];
    L.dibujo(r(dx - 2.6), r(dy + .4), ['.sss.', 'sssss', 'sssss', 'ssssd', 's.ssd', 'n.sss', '..nan'], pal);
    const [ix, iy] = G.bI[2];
    L.dibujo(r(ix - 1.4), r(iy - 2.4), ['.sss..', 'sssss.', 'sssssn', '.ssssa', '..sssn'], pal);
    return L.contorno(p.o);
  }

  /* ================= cara ================= */
  function cabeza(G, o, sk, p) {
    const F = BB.rasgos(o), mk = BB.maq(o), L = capa(), cx = G.cx, y0 = G.y0, fx = cx, an = o.animo;
    const f = curva(F.forma.map(k => k[0]), F.forma.map(k => k[1])), yb = F.forma[F.forma.length - 1][0];
    L.perfil(y0, y0 + yb, y => cx - f(y - y0), y => cx + f(y - y0), p.b);
    L.rect(cx - 13, y0 + 13, 2, 4, p.b); L.px(cx - 12, y0 + 17, p.b); L.rect(cx + 11, y0 + 13, 1, 4, p.b);     // orejas
    acabar(L, p, 1);
    L.px(cx - 12, y0 + 14, p.s); L.px(cx - 12, y0 + 15, p.s);
    const ir = BB.IRIS[o.iris || F.iris], hc = BB.PELOS_COLOR[o.colorPelo], glam = !!mk.delin, fuerte = glam ? (mk.delin === 'suave' ? .5 : .75) : .35, lash = mix(hc.o, '#3d2a45', fuerte);
    const pal = { L: lash, w: mix(mix('#ffffff', p.s, .22), '#c3b8de', .3), h: '#ffffff', I: mix(ir.d, '#2b1d26', .3), m: ir.m, k: mix(p.b, lash, .5) };
    const wE = F.ojo[0].length, yE = y0 + F.ojoY;
    // el rubor y la sombra de ojos van debajo de los ojos
    const ruborC = mk.ruborC || sk.rubor, rub = mix(p.b, ruborC, .12 + mk.rubor * .34 + (an === 'contenta' ? .08 : 0));
    for (const x of [fx - 8, fx + 7]) { L.hl(x - 1, x + 1, y0 + 17, rub); L.px(x, y0 + 16, mix(p.b, rub, .55)); if (mk.ruborC) { L.px(x - 2, y0 + 17, mix(p.b, rub, .6)); L.px(x + 2, y0 + 17, mix(p.b, rub, .6)); } }
    if (mk.glow && o.forma) { for (const x of [fx - 8, fx + 6]) { L.px(x, y0 + 15, mix(p.l, '#ffffff', mk.glowFuerte ? .7 : .25)); L.px(x + 1, y0 + 15, mix(p.l, '#ffffff', mk.glowFuerte ? .5 : .1)); } }
    for (const [x, y] of F.pecasD.lejos) L.px(fx + x, y0 + y, mix(p.b, p.d, .42));
    if (o.granitos) for (const [x, y] of [[-6, 20], [7, 19], [2, 10]]) L.px(fx + x, y0 + y, mix(p.b, '#d8484f', .55));
    if (mk.sombra) { const sc = mix(p.b, mk.sombra, .6); L.hl(fx - 1 - wE, fx - 3, yE - 1, sc); L.hl(fx + 2, fx + wE, yE - 1, sc); }
    if (an === 'cansada') for (const x of [fx - 5, fx + 3]) L.hl(x - 1, x + 2, yE + F.ojo.length, mix(p.b, '#8a6a9a', .3));
    const ojoF = an === 'cansada' ? ['.....', 'LLLLL', '.wIm.'] : F.ojo, yO = an === 'cansada' ? y0 + 13 : yE;
    if (o.ojos === 'cerrados') {                                                        // parpadeo: la línea de pestañas baja en arco
      const cerrado = ['L...L', '.LLL.'], yc = yO + ojoF.length - 2;
      L.dibujo(fx - 2 - wE, yc, cerrado, pal); L.dibujo(fx + 2, yc, cerrado, pal, true);
    } else {
      L.dibujo(fx - 2 - wE, yO, ojoF, pal);
      L.dibujo(fx + 2, yO, ojoF.map(s => s.replace('hI', 'Ih').replace('Im', 'mI')), pal, true);
      // insinuación de pestañas en el rabillo
      const fila = yO + ojoF.findIndex(s => s[0] === 'L') - 1, np = mk.pest ? mk.pest.cuerpo : F.pest.cuerpo, cp = np >= 2 || glam ? lash : pal.k, xi = fx - 3 - wE, xd = fx + 2 + wE;
      if (np > 0) { L.px(xi, fila, cp); L.px(xd, fila, cp); }
      if (np > 2) { L.px(xi + 2, fila - (ojoF[0][2] === '.' ? 0 : 0), cp); L.px(xd - 2, fila, cp); L.px(xi + 1, yO + ojoF.length, pal.k); L.px(xd - 1, yO + ojoF.length, pal.k); }
      if (mk.delin === 'alado') { L.px(xi - 1, fila - 1, lash); L.px(xd + 1, fila - 1, lash); }
      if (mk.delin === 'fino' && o.forma) { L.px(xi + 1, fila + 1, lash); L.px(xd - 1, fila + 1, lash); }
      if (mk.brillo) { L.px(fx - 5, yO + ojoF.length, '#fff6ff'); L.px(fx + 4, yO + ojoF.length, '#fff6ff'); L.px(fx - 3, yO + ojoF.length - 1, '#ffe9f4'); }
    }
    const cj = mix(hc.m, p.b, .28), wC = F.ceja[0].length, yC = y0 + F.cejaY + (an === 'contenta' ? 0 : 0), tri = an === 'triste';                  // cejas finas y claras
    L.dibujo(fx - 3 - wC, yC, F.ceja, { B: cj }, tri);
    L.dibujo(fx + 3, yC, F.ceja, { B: cj }, !tri);
    if (mk.ruborNariz) { L.px(fx, y0 + 17, mix(p.b, rub, .8)); L.px(fx - 1, y0 + 18, mix(p.b, rub, .8)); }
    F.nariz.forEach(([x, y], i) => L.px(fx + x, y0 + y, i === F.nariz.length - 1 ? p.d : p.s));
    L.px(fx - 1, y0 + F.nariz[F.nariz.length - 1][1] - 1, p.l);                                   // brillo en la punta de la nariz
    if (F.lunar && F.lunar.lejos) L.px(fx + F.lunar.lejos[0], y0 + F.lunar.lejos[1], mix(p.o, '#3d2a45', .4));
    if (o.piercing) L.px(fx + 1, y0 + 18, '#eef1f7');
    const lab = mk.labio ? (o.forma ? mix(p.b, mk.labio, .9) : col(mk.labio)) : mix(p.b, sk.labio, .85);
    const boca = an === 'contenta' ? ['u....u', '.uwwu.', '..oo..'] : tri ? ['.uu.', 'u..u'] : an === 'cansada' ? ['....', 'uoou'] : F.boca, wB = boca[0].length;
    L.dibujo(fx - Math.floor(wB / 2), y0 + F.bocaY, boca, { u: mix(lab, '#5a2a45', .12), o: lab, g: mk.mate ? lab : acl(lab, glam || mk.gloss > .5 ? .5 : .3), w: '#fffaf7' });
    // aretes: perlita colgando (en el juego son un accesorio aparte)
    if (o.aretes !== false && !o.ropa) { L.px(cx - 13, y0 + 18, '#e9bd62'); L.px(cx - 13, y0 + 19, '#fffaf2'); L.px(cx + 11, y0 + 18, '#e9bd62'); L.px(cx + 11, y0 + 19, '#fffaf2'); }
    return L;
  }

  /* ================= pelo =================
     Cada peinado se define una sola vez en «unidades de cabeza» (1 unidad = 1 pixel en el cuerpo completo) y se
     dibuja a cualquier escala: k=1 para el cuerpo completo y k=2.6 para la vista de cerca de la cara. */
  const MONO = ['.bbbb.......bbbb.', 'bblbbb.....bbbbbb', 'blbbbbbkkkbbbbbsb', 'bbbbsbbkpkbbsbbbb', 'bbbbbbbkkkbbbbbsb', 'bbbbbb.....bbbbbb', '.bsss.......bsss.'];
  function mono(L, x, y, c, k = 1) {
    const p = rampa(c), M = new Capa(L.w, L.h);
    if (k === 1) {
      M.dibujo(x, y, MONO, { b: p.b, l: p.l, s: p.s, k: p.s, p: p.s });
      M.contorno(p.o);
      M.px(x + 8, y + 3, '#ffffff');           // perla al centro
    } else {
      const cx = x + 8.5 * k, cy = y + 3.5 * k;
      for (const s of [-1, 1]) {
        M.poli([[cx + s * 1.2 * k, cy - 1.2 * k], [cx + s * 4 * k, cy - 3.6 * k], [cx + s * 7.6 * k, cy - 3.4 * k], [cx + s * 8.6 * k, cy - 1.5 * k], [cx + s * 8.6 * k, cy + 1.5 * k], [cx + s * 7.4 * k, cy + 3.5 * k], [cx + s * 4 * k, cy + 3.4 * k], [cx + s * 1.2 * k, cy + 1.2 * k]], p.b);
      }
      M.sombrear(0, 1, 2, p.b, p.s); M.sombrear(-1, 0, 1, p.b, p.l);
      M.encima(t => { for (const s of [-1, 1]) { t.linea(cx + s * 2 * k, cy, cx + s * 6 * k, cy - .8 * k, p.s); t.linea(cx + s * 2 * k, cy + .8 * k, cx + s * 5 * k, cy + 1.6 * k, p.s); t.linea(cx + s * 3.4 * k, cy - 2.4 * k, cx + s * 6.4 * k, cy - 2.6 * k, p.l); } });
      M.contorno(p.o);
      const N = new Capa(L.w, L.h); N.elipse(cx, cy, 1.9 * k, 2 * k, p.b); N.sombrear(1, 0, 1, p.b, p.s); N.contorno(p.o); M.sobre(N);
      M.elipse(cx, cy, 1 * k, 1 * k, '#fffaf2'); M.px(Math.floor(cx - .6 * k), Math.floor(cy - .6 * k), '#ffffff');
    }
    return L.sobre(M);
  }
  function peloT(T, o) {
    const hc = BB.PELOS_COLOR[o.colorPelo], P = { l: col(hc.l), b: col(hc.m), s: col(hc.d), o: col(hc.o) };
    const { cx, y0, k } = T, nueva = () => new Capa(T.w, T.h), atras = nueva(), fr = nueva(), estilo = o.pelo;
    const X = v => cx + v * k, Y = v => y0 + v * k, V = y => (y - y0) / k;
    const K = l => l.map(([vy, vx]) => [Y(vy), X(vx)]), sim = l => l.map(([vy, vx]) => [vy, -vx]);
    const casco = (L, hasta) => { L.elipse(cx, Y(11.4), 12.5 * k, 12.6 * k, P.b); L.cada((x, y) => y >= Y(hasta) ? null : undefined); };
    const ventana = pts => { const m = nueva(); m.poli(pts.map(([vx, vy]) => [X(vx), Y(vy)]), 1); fr.quitar(m); };
    // hebra: línea fina en unidades de cabeza [[x, y], ...]
    const hebra = (t, pts, c) => t.trazo(pts.map(([vx, vy]) => [Math.floor(X(vx) + (k > 1 ? .5 : 0)), Math.floor(Y(vy) + (k > 1 ? .5 : 0))]), c);
    // brillo: arco de luz sobre la coronilla, con huecos
    // brillo: banda de luz sobre la coronilla (el reflejo del pelo sano), con la orilla de abajo en zigzag y el centro más claro
    const Ph = mix(P.l, '#ffffff', .5);
    const brillo = (cy, rx, ry, a0, a1, salto) => fr.encima(t => { for (let a = a0; a <= a1; a += 1.2 / k) if (!salto || Math.floor(a / salto) % 3 !== 1) { const x = Math.floor(cx + Math.cos(a * Math.PI / 180) * rx * k), y = Math.floor(Y(cy) - Math.sin(a * Math.PI / 180) * ry * k), centro = Math.abs(a - 90) < 30, largo = Math.ceil(k) + ((x >> (k > 1 ? 1 : 0)) & 1); for (let j = 0; j < largo; j++) t.px(x, y + j, centro && j < Math.ceil(k / 2) ? Ph : P.l); } });
    const mechon = (pts, c) => { const t = nueva(); hebra(t, pts, c); if (k > 1) { const t2 = nueva(); hebra(t2, pts.map(([a, b]) => [a + .4, b]), c); t.sobre(t2); } fr.sobre(t); };
    const fin = L => { L.sombrear(1, 0, k > 1 ? 2 : 1, P.b, P.s); return L.contorno(P.o); };
    const chico = (L, vx, vy, c) => { if (k === 1) { const q = rampa(c), m = nueva(); m.dibujo(r(X(vx)) - 2, r(Y(vy)) - 1, ['bb.bb', 'bbkbb', 'bb.bb'], { b: q.b, k: q.l }); m.contorno(q.o); L.sobre(m); } else mono(L, X(vx) - 8.5 * k * .4, Y(vy) - 3.5 * k * .4, c, k * .4); };
    // trenza: cadena de gajos que se van haciendo chicos
    const trenza = (s, x0, v0, v1, d0) => { const n = Math.round((v1 - v0) / 3.4); for (let i = 0; i <= n; i++) { const t = nueva(), q = i / n, d = d0 * (1 - q * .35); t.elipse(X(s * x0 + (i & 1 ? .7 : -.7) + s * q * 1.2), Y(v0 + i * 3.4), d * k, 2.5 * k, P.b); t.encima(m => hebra(m, [[s * x0 + (i & 1 ? 2 : -2), v0 + i * 3.4 - 1.2], [s * x0 + (i & 1 ? -1 : 1), v0 + i * 3.4 + 1]], i & 1 ? P.s : P.l)); t.sombrear(1, 0, Math.ceil(k / 2), P.b, P.s); t.contorno(P.o); fr.sobre(t); } };
    const raya = 1;
    if (estilo === 'lacio') {
      const e = [[3, -11.5], [13, -13.2], [32, -15.2], [52, -15], [59, -13.4], [62, -10]];
      atras.perfil(Y(3), Y(62), K(e), K(sim(e)), P.s); atras.contorno(P.o);
      casco(fr, 14); fr.cada((x, y) => (x > X(8) && y >= Y(13)) ? null : undefined);      // el lado derecho va detrás de la oreja
      const oi = [[10, -12.4], [21, -13.4], [42, -13.8], [52, -13.2], [57, -11.4]];
      const ii = [[10, -8.8], [15, -9.6], [24, -9.4], [28, -8], [47, -7.5], [53, -8.3], [57, -10.2]];
      fr.perfil(Y(10), Y(57), K(oi), K(ii), P.b);
      ventana([[raya, 3.4], [-6, 7], [-9.1, 12], [-9.6, 15.5], [10.8, 15.5], [10.6, 12], [8, 7.4]]);
      fr.encima(t => {
        hebra(t, [[-11, 17], [-11, 53]], P.s); hebra(t, [[-13, 26], [-13, 47]], P.l); hebra(t, [[raya, 0], [raya, 3]], P.s); hebra(t, [[8, 5], [11, 9], [11, 12]], P.s);
        if (k > 1) { hebra(t, [[-9.4, 20], [-9, 30]], P.s); hebra(t, [[-12, 14], [-12.4, 24]], P.s); hebra(t, [[-4, 3], [-9, 9], [-10.6, 15]], P.s); hebra(t, [[-2, 1.4], [-7.4, 6], [-10.4, 11]], P.l); hebra(t, [[4, 1.6], [8.6, 5.6], [10.8, 10]], P.l); }
      });
      brillo(12, 10.2, 9, 25, 155, 18);
      fin(fr);
      mechon([[9.4, 12.6], [10, 15], [9.6, 18], [10, 20.4]], P.b); mechon([[-14.6, 54], [-15.6, 57], [-15.2, 59]], P.b);          // mechones sueltos
    } else if (estilo === 'ondas') {
      const on = (v, f = 0) => 1.3 * Math.min(1, Math.max(0, (v - 13) / 9)) * Math.sin(v * .45 + f), punta = v => Math.max(0, v - 55) * .9;
      atras.perfil(Y(3), Y(62), y => X(-(Math.min(13.8, 11 + V(y) * .3) + on(V(y)) - punta(V(y)))), y => X(Math.min(13.8, 11 + V(y) * .3) + on(V(y), 2) - punta(V(y))), P.s); atras.contorno(P.o);
      casco(fr, 18);
      const lado = s => {
        const f = s > 0 ? 2 : 0, ext = v => Math.min(13.6, 12.3 + (v - 14) * .15) + on(v, f) - punta(v), int = v => (v < 25 ? 11.2 : Math.max(7.8, 11.2 - (v - 25) * .9) + on(v, f) * .9) + punta(v) * .9;
        fr.perfil(Y(14), Y(60), y => X(s < 0 ? -ext(V(y)) : int(V(y))), y => X(s < 0 ? -int(V(y)) : ext(V(y))), P.b);
        return { ext, int, f };
      };
      const li = lado(-1), ld = lado(1);
      ventana([[raya, 3.6], [-5, 6.4], [-8.8, 11], [-11.3, 16.6], [-11.3, 25], [11.3, 25], [11.3, 16.6], [9.2, 11], [6, 6.4]]);
      fr.encima(t => {
        for (let y = Math.round(Y(20)); y < Y(58); y++) {
          const v = V(y);
          t.px(r(X(-(li.ext(v) + li.int(v)) / 2 - on(v, 1) * .4)), y, P.s); t.px(r(X((ld.ext(v) + ld.int(v)) / 2 + on(v, 3) * .4) - 1), y, P.s);
          if (on(v, li.f) > .5) { const x = Math.ceil(X(-li.ext(v)) - .5) + 1; t.px(x, y, P.l); if (k > 1) t.px(x + 1, y, P.l); }
          if (on(v, ld.f + .9) < -.2 && v > 27) { const x = Math.ceil(X(ld.int(v)) - .5) + 1; t.px(x, y, P.l); if (k > 1) t.px(x + 1, y, P.l); }
        }
        hebra(t, [[-5, 7], [-8, 10], [-10, 14], [-11, 17]], P.s); hebra(t, [[5, 7], [8, 10], [10, 14], [11, 17]], P.s); hebra(t, [[raya, 0], [raya, 3]], P.s);
        if (k > 1) { hebra(t, [[-2, 2], [-7, 6.4], [-10.4, 12], [-12, 17]], P.l); hebra(t, [[4, 2], [8.4, 6.4], [11, 12], [12, 17]], P.l); hebra(t, [[-1, 4], [-5.4, 8.4], [-8.4, 13]], P.s); }
      });
      brillo(12, 10.4, 9.2, 25, 155, 18);
      fin(fr);
      mechon([[-14.6, 31], [-15.6, 33], [-15.4, 35]], P.b); mechon([[14.4, 43], [15.4, 45], [15, 47]], P.b); mechon([[-9.6, 13], [-10.2, 16], [-9.8, 19]], P.b);      // mechones sueltos
    } else if (estilo === 'fleco') {
      const e = [[3, -11.5], [13, -13.2], [32, -14.6], [50, -14.4], [56, -12.6], [59, -9.6]];
      atras.perfil(Y(3), Y(59), K(e), K(sim(e)), P.s); atras.contorno(P.o);
      casco(fr, 18);
      const oi = [[10, -12.4], [21, -13.2], [40, -13.4], [50, -12.6], [55, -11]], ii = [[10, -9], [15, -10.6], [24, -10], [30, -8.6], [46, -8], [52, -9], [55, -10.4]];
      fr.perfil(Y(10), Y(55), K(oi), K(ii), P.b); fr.perfil(Y(10), Y(55), K(sim(ii)), K(sim(oi)), P.b);
      ventana([[-9.6, 9.6], [-7.4, 8.5], [-5.4, 9.4], [-3, 8.3], [-1, 9.2], [1.4, 8.2], [3.6, 9.2], [5.6, 8.4], [7.4, 9.4], [9.6, 9.8], [10.8, 14], [11, 18], [10.2, 30], [-10.2, 30], [-11, 18], [-10.8, 14]]);
      fr.encima(t => {
        for (const [a, b] of [[-7, -5.4], [-3, -2], [1.4, 1.8], [5.6, 5]]) hebra(t, [[b * .5, 3.4], [a, 8]], P.s);
        for (const [a, b] of [[-5.4, -3], [3.6, 2]]) hebra(t, [[b, 4], [a, 7.4]], P.l);
        hebra(t, [[-11, 17], [-11, 50]], P.s); hebra(t, [[-13, 26], [-12.6, 44]], P.l); hebra(t, [[11, 17], [11, 50]], P.s); hebra(t, [[9.6, 28], [9.4, 46]], P.l);
        if (k > 1) { hebra(t, [[-6, 3], [-10.6, 12]], P.l); hebra(t, [[6, 3], [10.8, 12]], P.s); hebra(t, [[-4.4, 5], [-6.4, 8.6]], P.s); }
      });
      brillo(12, 10.2, 9.4, 35, 145, 16);
      fin(fr);
    } else if (estilo === 'capas') {
      const be = [[3, -11.4], [13, -13.2], [30, -15.4], [40, -16], [46, -18], [50, -19], [53, -17]];
      atras.perfil(Y(3), Y(53), K(be), K(sim(be)), P.s); atras.contorno(P.o);
      casco(fr, 18);
      const oi = [[12, -12.4], [20, -13.6], [30, -14.6], [38, -14.2], [44, -16.2], [47.5, -18.6], [49, -19]], ii = [[12, -11.2], [20, -11.2], [26, -9.8], [32, -8], [39, -7.8], [45, -11.4], [49, -17.4]];
      fr.perfil(Y(12), Y(49), K(oi), K(ii), P.b); fr.perfil(Y(12), Y(49), K(sim(ii)), K(sim(oi)), P.b);
      ventana([[raya, 3], [-4, 6.4], [-8, 10.6], [-11.4, 15.4], [-11.4, 25], [11.4, 25], [11.4, 15.4], [9, 10.6], [5.4, 6.4]]);
      fr.encima(t => {
        for (const q of [-1, 1]) { hebra(t, [[q * 3, 4], [q * 7.4, 8.4], [q * 11, 14], [q * 13, 22]], P.s); hebra(t, [[q * 12.4, 22], [q * 12, 32], [q * 11, 38], [q * 13, 43], [q * 16, 47]], P.s); hebra(t, [[q * 10, 30], [q * 9.6, 38], [q * 12, 44]], P.l); hebra(t, [[q * 13.4, 18], [q * 13.8, 30]], P.l); if (k > 1) { hebra(t, [[q * 2, 2], [q * 8, 6.4], [q * 12, 13]], P.l); hebra(t, [[q * 11.4, 18], [q * 11, 27]], P.l); } }
        hebra(t, [[raya, 0], [raya, 3]], P.s);
      });
      brillo(12, 10.4, 9.2, 25, 155, 14);
      fin(fr);
      for (const q of [-1, 1]) mechon([[q * 11.4, 15], [q * 12.4, 18], [q * 14.4, 20.4], [q * 15.6, 20]], P.b);              // capa de mariposa que se abre junto a la mejilla
    } else if (estilo === 'rizos') {
      atras.perfil(Y(3), Y(50), y => X(-Math.min(15.5, 11 + V(y) * .3)), y => X(Math.min(15.5, 11 + V(y) * .3)), P.s);
      for (let i = 0; i < 8; i++) for (const q of [-1, 1]) atras.elipse(X(q * (14.4 + (i & 1))), Y(15 + i * 5), 3.4 * k, 3 * k, P.s);
      for (let i = -3; i <= 3; i++) atras.elipse(X(i * 4.2), Y(50), 3.2 * k, 3 * k, P.s);
      atras.contorno(P.o);
      casco(fr, 17); fr.elipse(X(-9), Y(5), 4 * k, 3.4 * k, P.b); fr.elipse(X(9.4), Y(5), 4 * k, 3.4 * k, P.b); fr.elipse(X(-3.5), Y(.6), 4 * k, 2.4 * k, P.b); fr.elipse(X(4.5), Y(.6), 4 * k, 2.4 * k, P.b);
      ventana([[raya, 5], [-3, 6.6], [-6, 7.2], [-8.4, 10.4], [-11.2, 16], [-11.2, 26], [11.2, 26], [11.2, 16], [8.8, 10.4], [6.4, 7.2], [3.4, 6.8]]);
      fr.encima(t => { for (const q of [-1, 1]) { hebra(t, [[q * 4, 5.6], [q * 7, 5.6], [q * 9, 8]], P.s); hebra(t, [[q * 8, 4], [q * 10.6, 6], [q * 11.6, 10]], P.s); } hebra(t, [[raya, 0], [raya, 4]], P.s); });
      brillo(12, 10.2, 9.4, 30, 150, 12);
      fin(fr);
      // rizos: cada uno es una bolita con su sombra y su luz en espiral
      for (let i = 0; i < 8; i++) for (const q of [-1, 1]) {
        const t = nueva(), vx = q * (12.4 + (i & 1 ? 1.3 : -.7)), vy = 15.5 + i * 4.9, rr = i === 7 ? 2.6 : 3.5;
        t.elipse(X(vx), Y(vy), rr * k, (rr - .2) * k, P.b); t.sombrear(1, 0, Math.ceil(k / 2), P.b, P.s); t.sombrear(0, 1, Math.ceil(k / 2), P.b, P.s);
        t.encima(m => { hebra(m, [[vx - 2, vy], [vx - 1, vy - 1.6], [vx + 1, vy - 1.6]], P.l); hebra(m, [[vx - .6, vy + 1], [vx + 1, vy + .6], [vx + 1.2, vy - .4]], P.s); }); t.contorno(P.o); fr.sobre(t);
      }
      mechon([[-2, 5], [-2.6, 7], [-2, 8.4]], P.b); mechon([[3, 5.4], [4, 7.4], [3.4, 8.8]], P.b);
    } else {
      // pelo recogido: nacimiento redondo y mechones sueltos
      casco(fr, 13);
      const m = nueva(); m.elipse(cx, Y(16.8), 10.3 * k, 12 * k, 1); fr.quitar(m);
      fr.encima(t => { hebra(t, [[-8, 6], [-5, 2], [-1, 0]], P.s); hebra(t, [[7, 6], [4, 2], [1, 0]], P.s); hebra(t, [[-11, 10], [-9, 5]], P.s); if (k > 1) { hebra(t, [[-10, 8], [-6.4, 3], [-3, .4]], P.l); hebra(t, [[10.4, 9], [7.4, 3.6], [4, .8]], P.s); hebra(t, [[-3, 4.8], [-1.4, 1]], P.s); hebra(t, [[2.6, 4.8], [1.6, 1]], P.s); } });
      brillo(12, 10.6, 10.4, 55, 125, 0);
      if (estilo === 'chongo') {
        const b = nueva(); b.elipse(cx, Y(-4.2), 6.2 * k, 4.4 * k, P.b);
        for (const [vx, vy] of [[-6, -7], [6, -6], [2, -9], [-2, -9], [3, -9]]) b.elipse(X(vx) + .5, Y(vy) + .5, .62 * k, .62 * k, P.b);
        b.encima(t => { hebra(t, [[-4, -3], [-2, -5], [3, -6]], P.s); hebra(t, [[-3, -7], [1, -8]], P.l); hebra(t, [[3, -4], [3.4, -3.6]], P.s); hebra(t, [[-4, -5], [-4.4, -4.6]], P.l); });
        b.sombrear(1, 0, 1, P.b, P.s); b.contorno(P.o); atras.sobre(b);
        fin(fr);
        const sc = rampa(o.adorno || '#f6c3d2'), q = nueva(), x0 = r(X(-5)), y1 = r(Y(-2)), w = r(10 * k), h = r(2 * k);
        q.rect(x0, y1, w, h, sc.b); q.encima(t => { for (let x = x0; x < x0 + w; x += 2 * Math.ceil(k)) t.rect(x, y1 + Math.floor(h / 2), Math.ceil(k), h - Math.floor(h / 2), sc.s); }); q.contorno(sc.o); fr.sobre(q);
        mechon([[-11, 13], [-11, 15], [-12, 16], [-12, 18], [-11, 19], [-11, 21]], P.b); mechon([[10, 13], [10, 14], [11, 15], [11, 17], [10, 18]], P.b);
        mechon([[-3, 5], [-4, 6]], P.b); mechon([[3, 5], [3, 5.4]], P.b);
      } else if (estilo === 'coleta') {
        const t = nueva(); t.tubo([[3, -1.6, 6], [10, -3, 7.4], [15.2, 4, 8.6], [16.8, 16, 9], [16, 28, 8.2], [14.6, 37, 5.8], [13.4, 43, 2.2]].map(([a, b, d]) => [X(a), Y(b), d * k]), P.b);
        t.encima(m => { hebra(m, [[6, -3], [11, -1], [14, 6], [15, 18], [14.6, 32]], P.s); hebra(m, [[8, -5], [14, -1], [17.4, 8], [18.4, 18], [17.4, 28]], P.l); if (k > 1) hebra(m, [[12, 4], [13.4, 14], [13.2, 26]], P.s); });
        t.sombrear(1, 0, Math.ceil(k), P.b, P.s); t.contorno(P.o); atras.sobre(t);
        fin(fr);
        const sc = rampa(o.adorno || '#f6c3d2'), q = nueva(); q.elipse(X(3), Y(-1.4), 2.6 * k, 3.4 * k, sc.b); q.sombrear(1, 0, Math.ceil(k), sc.b, sc.s); q.encima(m => hebra(m, [[2, -3], [2.4, 1]], sc.l)); q.contorno(sc.o); fr.sobre(q);
        mechon([[-11, 13], [-11.4, 16], [-11, 19]], P.b); mechon([[10, 13], [10.8, 16], [10.4, 18.4]], P.b);
      } else if (estilo === 'trenza') {
        fin(fr);
        const t = nueva(); t.elipse(X(11), Y(16.4), 3.4 * k, 4 * k, P.b); t.contorno(P.o); fr.sobre(t);
        trenza(1, 10.6, 20, 51, 3.5); { const z = nueva(); z.poli([[X(9.8), Y(52)], [X(14), Y(52)], [X(13.4), Y(57)], [X(11.4), Y(58.4)]], P.b); z.contorno(P.o); fr.sobre(z); }
        chico(fr, 11.8, 52, o.adorno || '#f6c3d2');
        mechon([[-10.6, 12], [-11.4, 15], [-11.2, 19], [-10.4, 22]], P.b); mechon([[-9, 9], [-10, 12]], P.s); mechon([[9.4, 11], [10, 14]], P.b);
      } else if (estilo === 'trenzas') {
        fin(fr);
        for (const q of [-1, 1]) { const t = nueva(); t.elipse(X(q * 11.2), Y(16.6), 3.2 * k, 4 * k, P.b); t.contorno(P.o); fr.sobre(t); trenza(q, 11, 20.4, 46, 3.1); const z = nueva(); z.poli([[X(q * 10.4), Y(47)], [X(q * 14), Y(47)], [X(q * 13.4), Y(52)], [X(q * 11.8), Y(53)]], P.b); z.contorno(P.o); fr.sobre(z); chico(fr, q * 12.2, 47.6, o.adorno || '#4a4257'); }
        hebra(fr, [[0, -1], [0, 4]], P.s); mechon([[-6, 6], [-8, 9], [-9, 13]], P.b); mechon([[6, 6], [8, 9], [9, 13]], P.b);
      } else if (estilo === 'espacio') {
        for (const q of [-1, 1]) { const b = nueva(); b.elipse(X(q * 9), Y(-1.6), 5.4 * k, 4.8 * k, P.b); b.encima(m => { hebra(m, [[q * 9 - 3, -2], [q * 9, -4], [q * 9 + 3, -2]], P.s); hebra(m, [[q * 9 - 2.6, -4], [q * 9 + 1, -5.4]], P.l); hebra(m, [[q * 9 - 1, 0], [q * 9 + 2, -.4]], P.s); }); b.sombrear(1, 0, Math.ceil(k / 2), P.b, P.s); b.contorno(P.o); atras.sobre(b); }
        fin(fr); hebra(fr, [[0, -1], [0, 4.4]], P.s);
        mechon([[-9, 10], [-10.6, 14], [-10.2, 19], [-9.4, 22]], P.b); mechon([[9, 10], [10.2, 14], [9.8, 19], [9, 22]], P.b);
      } else {
        const e = [[11, -12], [23, -14], [34, -15.4], [50, -15], [57, -13.4], [60, -10]];
        atras.perfil(Y(11), Y(60), K(e), K(sim(e)), P.s); atras.contorno(P.o);
        const oi = [[18, -12.9], [31, -14], [46, -13.7], [53, -12]], ii = [[18, -11.7], [25, -10.3], [42, -9.6], [53, -11.2]];
        fr.perfil(Y(18), Y(53), K(oi), K(ii), P.b);
        fr.encima(t => { hebra(t, [[-13, 28], [-13, 42]], P.l); });
        fin(fr);
        mechon([[-10.4, 12.6], [-11, 15.6], [-10.4, 18]], P.b); mechon([[10, 12.6], [10.6, 15], [10.2, 17]], P.b);                    // mechones sueltos
        if (estilo === 'topknot') {
          const b = nueva(); b.elipse(cx, Y(-2.6), 5 * k, 3.8 * k, P.b); b.encima(m => { hebra(m, [[-3, -2], [-1, -4], [3, -4]], P.s); hebra(m, [[-2, -4.6], [1, -5.4]], P.l); hebra(m, [[0, -1.6], [2.6, -2]], P.s); }); b.sombrear(1, 0, Math.ceil(k / 2), P.b, P.s); b.contorno(P.o); atras.sobre(b);
          hebra(fr, [[-4, .4], [4, .4]], P.s);
        } else mono(fr, r(X(-8) - (k > 1 ? k : 0)), r(Y(-6)), o.adorno || '#f7ecd9', k);
      }
    }
    // luces: mechones claros que siguen la caída del pelo, o puntas claras
    const lz = BB.LUCES && BB.LUCES[o.luces];
    if (lz && lz.c) for (const L of [atras, fr]) L.cada((x, y, c) => {
      if (c !== P.b && c !== P.l && c !== P.s) return;
      const vx = (x + .5 - cx) / k, vy = V(y + .5), f = c === P.s ? .45 : c === P.l ? .7 : .8;
      if (lz.ombre) { const q = Math.max(0, Math.min(1, (vy - (k > 1 ? 12 : 20)) / 20)), n = Math.floor(q * 4 + BB.trama(x, y) * .7) / 4; return n > 0 ? mix(c, lz.c, f * Math.min(1, n)) : undefined; }
      const u = vx + Math.sin(vy * .32) * 1.1 + (vy < 8 ? vx * (8 - vy) * .05 : 0);
      return vy > 3 && ((u % 5) + 5) % 5 < (k > 1 ? 1 : 1.05) ? mix(c, lz.c, f) : undefined;
    });
    return { atras, frente: fr };
  }
  const pelo = (G, o) => peloT({ cx: G.cx, y0: G.y0, k: 1, w: W, h: H }, o);

  /* ================= prendas ================= */
  // manga: sigue el brazo con `e` pixeles de holgura; hasta<1 la corta en el brazo; largo la alarga o acorta en la muñeca
  function manga(G, lado, e, p, o = {}) {
    const a = lado === 'I' ? G.bI : G.bD, L = capa();
    let pts = a.map(([x, y, d]) => [x, y, d + e]);
    if (o.hasta) { const [x0, y0, d0] = pts[0], [x1, y1, d1] = pts[1], t = o.hasta; pts = [pts[0], [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, d0 + (d1 - d0) * t + (o.vuelo || 0)]]; }
    const n = pts.length, [ax, ay] = pts[n - 2], q = pts[n - 1], len = Math.hypot(q[0] - ax, q[1] - ay) || 1, ux = (q[0] - ax) / len, uy = (q[1] - ay) / len;
    if (o.boca) q[2] += o.boca;
    if (!o.hasta) { const k = (o.largo || 0) - q[2] / 2 + 1.5; q[0] += ux * k; q[1] += uy * k; }
    L.tubo(pts, p.b);
    if (o.puno) L.encima(t => t.tubo([[q[0] + ux * (q[2] / 2 - o.puno + .5), q[1] + uy * (q[2] / 2 - o.puno + .5), q[2] + 1], [q[0] + ux * q[2], q[1] + uy * q[2], q[2] + 1]], o.punoColor || p.s));
    return L;
  }
  const lados = (G, e, p, o) => { const out = capa(); for (const l of ['D', 'I']) out.sobre(acabar(manga(G, l, e, p, o), p, 1, o && o.luz)); return out; };
  // resorte: columnas alternas en las últimas n filas de la capa entre y0 e y1
  const resorte = (L, y0, y1, p) => L.encima(t => { for (let y = y0; y <= y1; y++) for (let x = 0; x < W; x++) t.px(x, y, (x & 1) ? p.s : p.b); });
  const ex = (f, e) => y => f(y) + e;

  // borra la raya que deja la pieza de la cadera sobre la otra pierna
  function sinCostura(L, G, p) { for (let y = G.yEntre - 1; y <= G.yEntre + 4; y++) for (let x = Math.ceil(G.pc) + 1; x < W; x++) if (L.get(x, y) === p.o && L.hay(x + 1, y) && L.hay(x - 1, y) && L.hay(x, y - 1) && L.hay(x, y + 1) && L.hay(x + 2, y)) L.px(x, y, p.b); return L; }
  const PRENDAS = {
    // capa básica: top y short sencillos, siempre puestos
    cami(G) {
      const p = rampa('#fffaf5'), L = capa(), { cc, yHom, yBusto, yCint } = G;
      L.perfil(yBusto - 4.5, yCint - 3.5, ex(G.tI, -.2), ex(G.tD, .2), p.b);
      const m = capa(); m.elipse(cc, yBusto - 5.4, 4.2, 2.6, 1); L.quitar(m);
      volumen(L, p, 1); L.contorno(p.o);
      L.encima(t => t.hl(0, W, r(yCint - 4.5), p.s));
      for (const s of [-1, 1]) L.vl(cc + s * 5 + (s > 0 ? -1 : 0), yHom + 1, r(yBusto - 5.5), p.s);
      L.px(cc, r(yBusto - 3), '#f6a9c0'); L.px(cc - 1, r(yBusto - 3), '#f6a9c0');
      return { cuerpo: L };
    },
    shortBase(G) {
      const p = rampa('#fffaf5'), L = capa(), { yCint, yEntre } = G, y1 = yEntre + 4.5;
      L.perfil(yCint + 5.5, yEntre + 1, ex(G.tI, -.3), ex(G.tD, .3), p.b);
      L.perfil(G.yCad - 1, y1, ex(G.fI.i, -.4), ex(G.fI.d, .2), p.b); L.perfil(G.yCad - 1, y1, ex(G.fD.i, -.2), ex(G.fD.d, .4), p.b);
      volumen(L, p, 1); L.contorno(p.o);
      L.encima(t => { t.hl(0, W, r(yCint + 6.5), p.s); t.vl(r(G.pc), yEntre - 1, r(y1), p.s); });
      return { cuerpo: L };
    },

    hoodie(G, c) {
      const p = rampa(c), { C, cc, pc, yHom, yBusto, yCint, yCad, yEntre } = G, hem = yEntre + 5, L = capa();
      const k = s => borde([[yHom - 1.5, cc + s * 5], [yHom + 2, cc + s * (C.hom + .8)], [yHom + 7, cc + s * (C.hom + 1.2)], [yBusto + 2, cc + s * (C.busto + 3.6)], [yCint, G.cen(yCint) + s * (C.cintura + 4.4)], [yCad, pc + s * (C.cadera + 2.7)], [hem - 3, pc + s * (C.cadera + 2.7)], [hem, pc + s * (C.cadera + 1.6)]]);
      L.perfil(yHom - 1.5, hem, k(-1), k(1), p.b);
      resorte(L, hem - 3, hem, p);
      volumen(L, p, 2);
      const x0 = r(G.cen(yCad)), by = r(yCint + 1), bh = r(yCad + 3) - by;
      L.encima(t => { t.hl(x0 - 5, x0 + 5, by, p.d); t.linea(x0 - 5, by, x0 - 8, by + bh, p.d); t.linea(x0 + 5, by, x0 + 8, by + bh, p.d); t.hl(x0 - 8, x0 + 8, by + bh, p.d); t.hl(0, W, hem - 4, p.s); t.linea(cc - 9, yBusto + 3, cc - 6, yBusto + 5, p.s); t.linea(cc + 9, yBusto + 4, cc + 6, yBusto + 6, p.s); });
      L.contorno(p.o);
      const atras = capa(); atras.perfil(yHom - 10, yHom + 2, [[yHom - 10, cc - 7.5], [yHom - 5, cc - 10], [yHom + 2, cc - 10.5]], [[yHom - 10, cc + 7.5], [yHom - 5, cc + 10], [yHom + 2, cc + 10.5]], p.s); atras.contorno(p.o);
      const fr = capa(); fr.elipse(cc, yHom + 1.2, 8.6, 5.8, p.b);
      const m = capa(); m.elipse(cc, yHom - 2.2, 4.6, 5.6, 1); m.rect(0, 0, W, yHom - 3, 1); fr.quitar(m);
      fr.sombrear(0, 1, 1, p.b, p.s); fr.contorno(p.o);
      const cord = lum(c) > 215 ? p.s : col('#fffaf4');
      fr.vl(cc - 3, yHom + 6, yHom + 13, cord); fr.px(cc - 3, yHom + 14, p.o); fr.vl(cc + 3, yHom + 6, yHom + 15, cord); fr.px(cc + 3, yHom + 16, p.o);
      return { atras, cuerpo: L, mangas: lados(G, 3.2, p, { puno: 3, largo: 1, luz: true }), frente: fr };
    },

    sueter(G, c) {
      const p = rampa(c), { C, cc, yHom, yCint } = G, hem = yCint + 2.5, L = capa();
      L.perfil(yHom - 1.5, hem, ex(G.tI, -1.2), ex(G.tD, 1.2), p.b);
      // escote de un hombro: línea de arriba-izquierda a abajo-derecha; todo lo de arriba se quita
      const x0 = cc - 6.5, ya = yHom - 2, x1 = cc + C.hom + 1, yb = yHom + 9, yl = x => ya + (x - x0) / (x1 - x0) * (yb - ya);
      const corte = M => M.cada((x, y) => (y + .5 < yl(x + .5)) ? null : undefined);
      const banda = M => M.encima(t => { for (let x = 0; x < W; x++) { const y = Math.ceil(yl(x + .5) - .5); t.px(x, y, p.l); t.px(x, y + 1, (x & 1) ? p.s : p.l); t.px(x, y + 2, p.s); } });
      corte(L); resorte(L, r(hem) - 2, r(hem), p); volumen(L, p, 2); banda(L); L.contorno(p.o);
      const mg = capa();
      for (const l of ['D', 'I']) { const M = manga(G, l, 2.4, p, { largo: 1.5, boca: 1.2, puno: 2 }); if (l === 'D') corte(M); volumen(M, p, 1); if (l === 'D') banda(M); M.contorno(p.o); mg.sobre(M); }
      return { cuerpo: L, mangas: mg };
    },

    pijama(G, c) {
      const p = rampa(c), { C, cc, pc, yHom, yBusto, yCint, yCad } = G, hem = yCad + 4, L = capa(), blanco = col('#ffffff');
      const k = s => borde([[yHom - 1.5, cc + s * 4.6], [yHom + 2, cc + s * (G.hx + 1)], [yHom + 6, cc + s * (G.hx + 1.2)], [yBusto + 1, cc + s * (C.busto + 1.8)], [yCint, G.cen(yCint) + s * (C.cintura + 2.8)], [yCad, pc + s * (C.cadera + 1.6)], [hem, pc + s * (C.cadera + 1.8)]]);
      L.perfil(yHom - 1.5, hem, k(-1), k(1), p.b);
      { const v = capa(); v.poli([[cc - 3, yHom - 2], [cc + 3, yHom - 2], [cc + .5, yHom + 6]], 1); L.quitar(v); }
      volumen(L, p, 2);
      // brillo de satín: franjas de luz a lo alto
      L.encima(t => { for (let y = yHom + 4; y < hem - 1; y++) { const a = r(G.cen(y) - C.busto * .55), b2 = r(G.cen(y) + C.busto * .5); if (y % 7 !== 3) t.px(a, y, p.l); if (y % 5 < 3) t.px(a + 1, y, p.l); if (y % 6 > 1) t.px(b2, y, p.l); } });
      L.encima(t => { const x = cc + 1; for (let y = yHom + 3; y < hem; y++) t.px(x + 1, y, p.s); for (let y = yBusto - 2; y < hem - 2; y += 6) t.px(x, r(y), blanco); t.hl(0, W, r(hem) - 1, blanco); });
      const bx = cc + 4, byy = r(yBusto - 1); L.encima(t => { t.rect(bx, byy, 5, 5, p.b); t.hl(bx, bx + 4, byy, blanco); t.vl(bx, byy + 1, byy + 5, p.s); t.vl(bx + 4, byy + 1, byy + 5, p.s); t.hl(bx, bx + 4, byy + 5, p.s); });
      L.contorno(p.o);
      const mg = capa();
      for (const l of ['D', 'I']) { const M = manga(G, l, 2.6, p, { hasta: .55, vuelo: 1 }); volumen(M, p, 1); M.contorno(p.o); mg.sobre(M); }
      // cuello de solapas con vivo blanco
      const fr = capa(), q = capa();
      q.poli([[cc - 6, yHom - 1.5], [cc - 3.5, yHom - 2], [cc - .5, yHom + 5.5], [cc - 2.5, yHom + 6.5], [cc - 6.5, yHom + 2]], p.b); fr.sobre(q.contorno(blanco));
      const q2 = capa(); q2.poli([[cc + 6, yHom - 1.5], [cc + 3.5, yHom - 2], [cc + 1.5, yHom + 5.5], [cc + 3.5, yHom + 6.5], [cc + 7.5, yHom + 2]], p.b); fr.sobre(q2.contorno(blanco));
      return { cuerpo: L, mangas: mg, frente: fr };
    },

    vestido(G, c) {
      const p = rampa(c), { C, cc, yHom, yMenton, yBusto, yEntre } = G, hem = yEntre + 13, L = capa();
      const iz = y => y <= yEntre ? G.tI(y) - 1 : Math.min(G.tI(yEntre) - 1, G.fI.i(y) - 1.2), de = y => y <= yEntre ? G.tD(y) + 1 : Math.max(G.tD(yEntre) + 1, G.fD.d(y) + 1.2);
      L.perfil(yHom - 1.5, hem, iz, de, p.b);
      volumen(L, p, 2);
      // trenzas de punto: tres columnas que siguen el centro del cuerpo
      L.encima(t => { for (const dx of [-5, 0, 5]) for (let y = yHom + 5; y < hem - 3; y++) { const x = r(G.cen(Math.min(y, yEntre)) + dx * (dx ? C.busto / 8.5 : 1)), k = [0, 1, 0, -1][y & 3]; t.px(x + k, y, p.l); t.px(x - k, y, p.d); if (dx) { t.px(x - 2 * Math.sign(dx) + (dx > 0 ? 4 : -4), y, 0); } } });
      resorte(L, hem - 3, hem, p);
      L.contorno(p.o);
      const fr = capa();
      for (let y = yMenton - 2; y <= yHom + 1; y++) fr.tramo(y, cc - C.cuello - 1.6, cc + C.cuello + 1.4, p.b);
      resorte(fr, yMenton - 2, yHom + 1, p); fr.encima(t => t.hl(0, W, yHom - 1, p.l)); fr.contorno(p.o);
      return { cuerpo: L, mangas: lados(G, 1.8, p, { puno: 3, largo: .5 }), frente: fr };
    },

    pants(G, c) {
      const p = rampa(c), { yCint, yEntre, yRod, yTob } = G, out = capa(), ytop = yCint + 5;
      for (const l of ['D', 'I']) {
        const f = l === 'I' ? G.fI : G.fD, L = capa(), puno = yTob - 3;
        const w = y => y < yRod ? 2.2 + (y - yEntre) * .02 : 3.2, cz = y => f.c(y);
        L.perfil(G.yCad - 1, puno, y => cz(y) - f.w(y) / 2 - w(y) / 2 - (l === 'I' ? .6 : 0), y => cz(y) + f.w(y) / 2 + w(y) / 2 + (l === 'D' ? .6 : 0), p.b);
        L.perfil(puno, yTob + 1, y => cz(y) - f.w(y) / 2 - 1.2, y => cz(y) + f.w(y) / 2 + 1.2, p.b);
        if (l === 'I') L.perfil(ytop, yEntre + 2, ex(G.tI, -1), ex(G.tD, 1), p.b);
        resorte(L, puno, yTob + 1, p);
        volumen(L, p, 1);
        L.encima(t => { t.hl(0, W, puno - 1, p.s); const xk = r(cz(yRod)); t.hl(xk - 2, xk + 1, yRod + 1, p.s); t.px(xk + 2, yRod, p.s); t.linea(r(f.d(yTob - 8)) , yTob - 9, r(f.c(yTob - 6)), yTob - 6, p.s); });
        if (l === 'I') { L.encima(t => { for (let x = 0; x < W; x++) { t.px(x, ytop, (x & 1) ? p.s : p.b); t.px(x, ytop + 1, (x & 1) ? p.s : p.b); } t.hl(0, W, ytop + 2, p.s); t.px(r(G.cen(ytop)), ytop + 3, p.l); t.px(r(G.cen(ytop)) - 1, ytop + 4, p.l); t.px(r(G.cen(ytop)) + 1, ytop + 4, p.l); }); }
        L.contorno(p.o); out.sobre(L);
      }
      return { cuerpo: sinCostura(out, G, p) };
    },

    falda(G, c) {
      const p = rampa(c), { C, pc, yCint, yCad, yEntre } = G, hem = yEntre + 13, L = capa(), y0 = yCint - 1.5;
      const hw = C.cadera + 5.2;
      const iz = borde([[y0, G.cen(yCint) - C.cintura - .8], [yCad - 3, pc - C.cadera - 1.6], [hem, pc - hw - .6]]), de = borde([[y0, G.cen(yCint) + C.cintura + .8], [yCad - 1, pc + C.cadera + 1.4], [hem, pc + hw]]);
      L.perfil(y0, hem, iz, de, p.b);
      // tablas: líneas que se abren hacia abajo, una de sombra y una de luz
      const n = Math.max(6, Math.round(hw * 2 / 3.6));
      L.encima(t => { for (let k = 1; k < n; k++) { const u = k / n, xa = G.cen(yCint) - C.cintura + u * C.cintura * 2, xb = pc - hw + u * hw * 2; t.linea(xa, y0 + 3, xb, hem, p.s); t.linea(xa + 1, y0 + 6, xb + 1, hem, k % 2 ? p.l : p.b); } });
      volumen(L, p, 2);
      L.encima(t => { t.rect(0, r(y0), W, 2, p.b); t.hl(0, W, r(y0) + 2, p.s); });
      // orilla en zigzag de las tablas
      for (let k = 0; k < n; k++) { const xb = r(pc - hw + (k + .5) / n * hw * 2); if (k % 2) L.px(xb, r(hem) - 1, 0); }
      L.contorno(p.o);
      return { cuerpo: L };
    },

    shortPijama(G, c) {
      const p = rampa(c), { yCint, yEntre } = G, L = capa(), y1 = yEntre + 8, blanco = col('#ffffff');
      L.perfil(yCint + 4.5, yEntre + 1, ex(G.tI, -.8), ex(G.tD, .8), p.b);
      L.perfil(G.yCad - 1, y1, y => G.fI.i(y) - 1.6 - (y - yEntre) * .12, ex(G.fI.d, .3), p.b);
      L.perfil(G.yCad - 1, y1, ex(G.fD.i, -.1), y => G.fD.d(y) + 1.6 + (y - yEntre) * .12, p.b);
      volumen(L, p, 1);
      L.encima(t => { t.hl(0, W, r(y1) - 1, blanco); t.vl(r(G.pc), yEntre - 2, r(y1), p.s); for (let y = yCint + 8; y < y1 - 2; y++) if (y % 4) t.px(r(G.fI.c(y)) - 1, y, p.l); });
      L.contorno(p.o);
      return { cuerpo: L };
    },

    calcetas(G, c) {
      const p = rampa(c), { yRod, yTob } = G, out = capa(), top = yRod + 6;
      for (const l of ['D', 'I']) {
        const f = l === 'I' ? G.fI : G.fD, L = capa();
        L.perfil(top, yTob + 1, ex(f.i, -.5), ex(f.d, .5), p.b);
        (l === 'I' ? pieI : pieD)(L, G, p.b, .4);
        volumen(L, p, 1);
        resorte(L, top, top + 2, p); L.encima(t => t.hl(0, W, top + 3, p.s));
        L.contorno(p.o); out.sobre(L);
      }
      return { cuerpo: out };
    },

    chanclas(G, c) {
      const p = rampa(c), L = capa(), tira = rampa('#f58fb0'), k = G.C.tob / 4;
      const xi = G.aI, xd = G.aD + .2;
      L.tramo(SUELO, xi - 4.2 * k, xi + 4.4 * k, p.b); L.tramo(SUELO, xd - G.C.tob / 2 - 1.6, xd + 9.6 * k, p.b);
      L.contorno(p.o);
      const x = r(xi);
      L.pts([[x - 3, SUELO - 4], [x - 2, SUELO - 3], [x - 1, SUELO - 2], [x, SUELO - 2], [x + 1, SUELO - 3], [x + 2, SUELO - 4]], tira.b);
      L.pts([[x - 3, SUELO - 5], [x + 2, SUELO - 5]], tira.s);
      const xt = r(xd + 5.2 * k);
      L.pts([[xt - 4, SUELO - 5], [xt - 3, SUELO - 4], [xt - 2, SUELO - 4], [xt - 1, SUELO - 3], [xt, SUELO - 3], [xt + 1, SUELO - 2], [xt - 1, SUELO - 2]], tira.b);
      L.px(xt - 5, SUELO - 5, tira.s);
      return { cuerpo: L };
    },

    flats(G, c) {
      const p = rampa(c), out = capa(), m = rampa('#f6a9c0');
      for (const l of ['D', 'I']) {
        const L = capa(); (l === 'I' ? pieI : pieD)(L, G, p.b, .5);
        L.cada((x, y) => y < SUELO - (l === 'I' ? 4 : 3) ? null : undefined);
        if (l === 'I') { const x = r(G.aI); L.px(x - 1, SUELO - 4, 0); L.px(x, SUELO - 4, 0); L.px(x + 1, SUELO - 4, 0); }
        L.encima(t => t.hl(0, W, SUELO - 1, p.s)); L.sombrear(-1, 0, 1, p.b, p.l); L.sombrear(0, -1, 1, p.b, p.l); L.contorno(p.o);
        if (l === 'I') { const x = r(G.aI); L.px(x - 1, SUELO - 3, m.b); L.px(x + 1, SUELO - 3, m.b); L.px(x, SUELO - 3, m.l); }
        else { const x = r(G.aD + 6 * G.C.tob / 4); L.px(x, SUELO - 3, m.b); L.px(x + 1, SUELO - 3, m.l); }
        out.sobre(L);
      }
      return { cuerpo: out };
    },

    pantuflas(G, c) {
      const p = rampa(c), out = capa(), m = rampa('#f6a9c0'), k = G.C.tob / 4;
      for (const l of ['D', 'I']) {
        const L = capa(), cx = l === 'I' ? G.aI + .1 : G.aD + 3.6 * k, rx = l === 'I' ? 5 * k + .6 : 6.6 * k + .4;
        L.elipse(cx, SUELO - 2.6, rx, 3.6, p.b);
        // borde peludito: bolitas alrededor
        for (let a = 0; a < 360; a += 40) { const x = cx + Math.cos(a * Math.PI / 180) * rx, y = SUELO - 2.6 + Math.sin(a * Math.PI / 180) * 3.3; if (y < SUELO - .5) L.elipse(x, y, 1.3, 1.2, p.b); }
        L.cada((x, y) => y > SUELO ? null : undefined);
        volumen(L, p, 1);
        L.encima(t => { for (let x = 0; x < W; x += 3) t.px(x, SUELO - 4 + (x % 2), p.l); });
        L.contorno(p.o);
        const x = r(cx); L.px(x - 1, SUELO - 4, m.b); L.px(x + 1, SUELO - 4, m.b); L.px(x, SUELO - 4, m.s); L.px(x - 1, SUELO - 5, m.b); L.px(x + 1, SUELO - 5, m.b);
        out.sobre(L);
      }
      return { cuerpo: out };
    },

    botas(G, c) {
      const p = rampa(c), { yRod, yTob } = G, out = capa(), top = yRod + 4;
      for (const l of ['D', 'I']) {
        const f = l === 'I' ? G.fI : G.fD, L = capa();
        L.perfil(top, yTob + 1, ex(f.i, -1.1), ex(f.d, 1.1), p.b);
        (l === 'I' ? pieI : pieD)(L, G, p.b, 1);
        volumen(L, p, 2);
        L.encima(t => { t.hl(0, W, SUELO - 1, p.d); t.hl(0, W, top + 1, p.s); for (let y = top + 4; y < yTob - 5; y++) if (y % 11 !== 0) t.px(r(f.i(y)), y, p.l); t.hl(0, W, yTob - 1, p.s); });
        L.contorno(p.o); out.sobre(L);
      }
      return { cuerpo: out };
    },
  };

  // accesorios que no dependen del outfit
  function collar(G) {
    const L = capa(), { cc, yHom } = G, oro = col('#e9bd62');
    L.pts([[cc - 4, yHom], [cc - 3, yHom + 1], [cc - 2, yHom + 2], [cc - 1, yHom + 3], [cc + 1, yHom + 3], [cc + 2, yHom + 2], [cc + 3, yHom + 1], [cc + 3, yHom]], oro);
    L.px(cc, yHom + 4, '#fffaf2'); L.px(cc, yHom + 3, oro);
    return L;
  }
  function bolsa(G, c) {
    const p = rampa(c || '#f6a9c0'), L = capa(), [mx, my] = G.bD[2], x = r(mx - 5), y = r(my + 9), oro = col('#e9bd62');
    L.rect(x + 1, y, 9, 8, p.b); L.rect(x, y + 1, 11, 6, p.b);
    L.sombrear(1, 0, 2, p.b, p.s); L.sombrear(0, 1, 1, p.b, p.s);
    L.encima(t => { t.rect(x, y, 11, 3, p.l); t.hl(x + 3, x + 7, y + 3, p.l); t.hl(x + 1, x + 3, y + 1, p.h); t.px(x + 5, y + 4, oro); t.px(x + 5, y + 5, oro); });
    L.contorno(p.o);
    L.vl(x + 3, y - 4, y - 2, p.o); L.vl(x + 7, y - 4, y - 2, p.o); L.hl(x + 4, x + 6, y - 5, p.o);
    L.px(x + 9, y + 3, oro); L.px(x + 10, y + 4, '#fffaf2');
    return L;
  }

  /* ================= figura completa =================
     capasDe arma la lista de capas de atrás hacia adelante; figura las junta. Así las pruebas pueden revisar,
     pixel por pixel, de qué capa es lo que se ve. */
  const ORDEN = ['piernas', 'pies', 'abajo', 'arriba', 'vestido'];
  const guardadas = new Map();                   // prendas ya dibujadas para este cuerpo
  function vestir(G, slot, p, o) {
    const d = BB.CATALOGO[p.id], clave = d.piel ? null : [p.id, p.color, G.clave].join('|');
    let v = clave && guardadas.get(clave);
    if (!v) { v = BB.VESTIR[d.dibujo](G, p.color, d.q || {}, o); if (clave) { if (guardadas.size > 90) guardadas.delete(guardadas.keys().next().value); guardadas.set(clave, v); } }
    return v;
  }
  function partes(o) {
    const G = rig(o.cuerpo, o.estatura, o.prop), sk = BB.PIELES[o.piel], p = tonos(sk), pr = {};
    G.clave = o.cuerpo + o.estatura + JSON.stringify(o.prop || 0);
    if (o.ropa) { for (const s in o.ropa) if (o.ropa[s] && BB.CATALOGO[o.ropa[s].id]) pr[s] = vestir(G, s, o.ropa[s], o); }
    else { const of = BB.OUTFITS[o.outfit], capas = o.outfit === 'base' ? {} : of.capas(o.color || of.colores[0]); for (const s in capas) pr[s] = PRENDAS[capas[s][0]](G, capas[s][1], o); }
    return { G, sk, p, pr };
  }
  function ordenRopa(o, pr) {
    if (!o.ropa) return ORDEN.filter(s => pr[s]);
    const def = s => o.ropa[s] ? BB.CATALOGO[o.ropa[s].id] : {}, ajustado = def('abajo').ajustado, alto = def('pies').alto;
    return [...(ajustado ? ['abajo'] : []), 'calcetas', ...(alto ? ['calentadores', 'pies'] : ['pies', 'calentadores']), 'base', ...(ajustado ? [] : ['abajo']), 'vestido', 'encima'].filter(s => pr[s]);
  }
  // mecer: corre 1 pixel a un lado las filas de abajo de una capa (el pelo suelto)
  function mecer(L, y1, dx) {
    for (let y = Math.max(0, y1); y < L.h; y++) { const f = L.d.slice(y * L.w, (y + 1) * L.w); for (let x = 0; x < L.w; x++) { const s = x - dx; L.d[y * L.w + x] = (s >= 0 && s < L.w) ? f[s] : 0; } }
    return L;
  }
  // lo que va debajo se aplasta: no asoma por los lados de lo que lo tapa, y las mangas de abajo no se ven bajo las de encima
  function aplastar(v, tapa, y0, y1) {
    const L = v.cuerpo.copia();
    for (let y = Math.ceil(y0); y <= y1; y++) {
      let a = W, b = -1;
      for (let x = 0; x < W; x++) if (tapa.hay(x, y)) { if (x < a) a = x; b = x; }
      if (b >= 0) for (let x = 0; x < W; x++) if (x < a || x > b) L.d[y * W + x] = 0;
    }
    return { ...v, cuerpo: L };
  }
  function acomodar(o, pr) {
    const def = s => BB.CATALOGO[o.ropa[s].id];
    if (pr.abajo && pr.base && !def('abajo').ajustado) { const t = pr.abajo.cubre.torso; pr.base = aplastar(pr.base, pr.abajo.cuerpo, t[0] + 1, H - 1); }
    for (const s of ['base', 'abajo', 'vestido']) if (pr[s] && pr.encima) {
      const z = pr.encima.aplasta || pr.encima.cubre.torso; pr[s] = aplastar(pr[s], pr.encima.cuerpo, z[0], z[1]);
      pr[s].mangas = null;
      if (pr[s].frente) { const f = pr[s].frente.copia(); f.d.fill(0, Math.ceil(yCorte(pr[s])) * W); pr[s] = { ...pr[s], frente: f }; }
    }
  }
  const yCorte = v => v.yCuello === undefined ? H : v.yCuello;
  // lo que no depende de la ropa (piel, cara, pelo, capa básica) se guarda ya dibujado
  const hechas = new Map();
  function fija(clave, fn) { let v = hechas.get(clave); if (!v) { v = fn(); if (hechas.size > 60) hechas.delete(hechas.keys().next().value); hechas.set(clave, v); } return v; }
  const RECOGIDOS = ['chongo', 'espacio'];
  function capasDe(o) {
    const { G, sk, p, pr } = partes(o), { ropa, mecer: mz, respira, sinSombra, colorSombra, ...cuerpo } = o, K = JSON.stringify(cuerpo) + !!ropa, pel = { ...fija('pelo' + K, () => pelo(G, o)) }, out = [], orden = ordenRopa(o, pr);
    const pon = (id, capa, n = 0, f = 0) => { if (capa) out.push({ id, capa, n, f }); };
    if (o.ropa) acomodar(o, pr);
    if (o.mecer) { const y1 = G.y0 + (RECOGIDOS.includes(o.pelo) ? 14 : 30); for (const k of ['atras', 'frente']) if (pel[k]) pel[k] = mecer(pel[k].copia(), y1, o.mecer); }
    pon('pelo', pel.atras);
    for (const s of orden) pon(s, pr[s].atras);
    pon('piel', fija('pi' + K, () => piernas(G, p, o))); pon('piel', fija('to' + K, () => torso(G, p, o)));
    for (const s of ['tobillos', 'piesAcc', 'medias']) if (pr[s]) pon(s, pr[s].cuerpo);
    pon('basica', fija('sb' + G.clave, () => PRENDAS.shortBase(G).cuerpo), 1, .14); pon('basica', fija('ca' + G.clave, () => PRENDAS.cami(G).cuerpo), 1, .14);
    for (const s of orden) pon(s, pr[s].cuerpo, s === 'pies' || s === 'calcetas' ? 0 : 1, .16);
    if (o.ropa) { if (pr.cuello) pon('cuello', pr.cuello.cuerpo); } else if (o.collar !== false && !pr.vestido) pon('cuello', collar(G));
    pon('piel', fija('br' + K, () => brazos(G, p, o))); pon('piel', fija('ma' + K, () => manos(G, p, o)));
    for (const s of ['manos', 'munecas']) if (pr[s]) pon(s, pr[s].cuerpo);
    for (const s of orden) { pon(s + '.manga', pr[s].mangas); pon(s + '.cuello', pr[s].frente); }
    pon('cabeza', fija('cb' + K, () => cabeza(G, o, sk, p)), 2, .13);
    if (pr.orejas) pon('orejas', pr.orejas.cuerpo);
    if (pr.lentes) pon('lentes', pr.lentes.cuerpo);
    pon('pelo', pel.frente, 1, .14);
    if (pr.pelo) pon('adorno', pr.pelo.cuerpo);
    if (pr.gorro) pon('gorro', pr.gorro.cuerpo, 1, .14);
    if (pr.bolsa) pon('bolsa', pr.bolsa.cuerpo); else if (o.bolsa === true) pon('bolsa', bolsa(G, o.colorBolsa));
    return { G, capas: out, pr };
  }
  function figura(o) {
    const { G, capas } = capasDe(o), F = capa();
    if (!o.sinSombra) F.elipse(G.pc + 2.5, SUELO + 1.4, 16, 1.7, o.colorSombra || '#e6d6ea');
    for (const c of capas) { if (c.n) F.sobreConSombra(c.capa, c.n, c.f); else F.sobre(c.capa); }
    // respiración: todo lo que queda arriba de la cintura sube 1 pixel (la fila de la cintura se repite)
    if (o.respira) for (let y = 0; y < G.yCint; y++) F.d.copyWithin(y * W, (y + 1) * W, (y + 2) * W);
    return F;
  }
  // los 4 cuadros del reposo: quieta, respirando (con el pelo meciéndose) y las dos con los ojos cerrados
  const cuadros = o => [figura(o), figura({ ...o, respira: 1, mecer: 1 }), figura({ ...o, ojos: 'cerrados' }), figura({ ...o, respira: 1, mecer: 1, ojos: 'cerrados' })];

  BB.ELLA = { W, H, SUELO, capasDe, util: { sinCostura, capa, rampa, volumen, acabar, manga, lados, resorte, ex, pieI, pieD, mono }, rig, figura, cuadros, partes, pelo, peloT, cabeza, torso, piernas, brazos, manos, PRENDAS, collar, bolsa, mono, tonos };
})(typeof globalThis !== 'undefined' ? globalThis : this);
