/* Vistas de cerca en pixel art: cara 96×96 (maquillaje), manos 128×80 y pies 128×80 (uñas y joyería).
   La cara usa la misma forma y el mismo peinado que el cuerpo completo, a escala 2.6.
   Estilo: ojos grandes y oscuros con brillo, pestañas en picos arriba y abajo, pecas finas, glow en nariz y pómulos,
   labios llenitos con gloss; manos y pies lisos, sin líneas en los nudillos. */
(function (root) {
  'use strict';
  const BB = root.BB, { Capa, col, mix, acl, rampa, curva, trama } = BB;
  const r = Math.round;
  const ORO = col('#e9bd62'), ORO_L = col('#fbe6a6'), ORO_O = col('#b58a3c'), PLATA = col('#dfe3ea'), PLATA_O = col('#9aa2b2'), PERLA = col('#fffaf2');

  // fondo pastel en bandas, con trama solo en el cambio de banda
  function fondo(L, tonos) {
    tonos = (tonos || ['#dcd8f6', '#e7dcf5', '#f2dff1', '#fbe3ea', '#fdeee6']).map(col);
    const n = tonos.length;
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
      const t = y / L.h * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = Math.max(0, Math.min(1, (t - i - .3) / .4));
      L.px(x, y, f > trama(x, y) ? tonos[i + 1] : tonos[i]);
    }
    return L;
  }
  function destello(L, x, y, n = 2, c = '#ffffff') { L.px(x, y, c); for (let k = 1; k <= n; k++) { L.px(x - k, y, c); L.px(x + k, y, c); L.px(x, y - k, c); L.px(x, y + k, c); } return L; }
  // mancha suave: centro lleno y orilla en trama
  function mancha(L, cx, cy, rx, ry, c, lleno = .5) {
    c = col(c);
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const d = Math.hypot((x + .5 - cx) / rx, (y + .5 - cy) / ry);
      if (d < lleno || (d < 1 && trama(x, y) > (d - lleno) / (1 - lleno))) { if (L.hay(x, y)) L.px(x, y, c); }
    }
    return L;
  }
  const tonos = sk => ({ l: col(sk.l), b: col(sk.b), s: col(sk.s), d: col(sk.d), o: col(sk.o) });

  /* ================= cara =================
     Una chica de veintitantos: ojos almendrados de tamaño natural con brillo, cara ovalada, nariz con forma
     (sombra suave de un lado y brillo en la punta) y labios llenitos. El maquillaje es discreto: el natural casi
     no se nota y el glam es elegante (delineado fino, pestañas un poco más largas, sombra suave, labios con color). */
  function ojo(L, ex, ey, s, E, ir, p, mk, lash, pest) {
    const w2 = E.w / 2, u = x => (x + .5 - ex) / w2, fuera = x => s * u(x);          // fuera = +1 en el rabillo
    const yT = x => ey - E.hT * Math.pow(Math.max(0, 1 - u(x) * u(x)), .6) - E.tilt * fuera(x);
    const yB = x => ey + E.hB * Math.pow(Math.max(0, 1 - u(x) * u(x)), .8) - E.tilt * fuera(x);
    const x0 = Math.ceil(ex - w2 - .5), x1 = Math.ceil(ex + w2 - .5) - 1, lim = x => Math.min(x1, Math.max(x0, x));
    const fondoOjo = Math.ceil(ey + E.hB - .5) - 1;                                     // el párpado de abajo nunca baja más que en el centro
    const top = x => Math.ceil(yT(lim(x)) - .5), bot = x => Math.max(top(x), Math.min(fondoOjo, Math.ceil(yB(lim(x)) - .5) - 1));
    const glam = !!mk.delin, M = new Capa(L.w, L.h), blanco = col('#fffaf7');
    // sombra de ojos suave (solo glam): dos filas y una tercera en trama
    if (mk.sombra) { const sc = mix(p.b, mk.sombra, .55), sc2 = mix(p.b, mk.sombra, .32); for (let x = x0 - 1; x <= x1 + 1; x++) { const a = top(x); L.px(x, a - 2, sc); L.px(x, a - 3, sc); if (fuera(x) > -.4 && trama(x, a - 4) > .45) L.px(x, a - 4, sc2); } }
    for (let x = x0; x <= x1; x++) for (let y = top(x); y <= bot(x); y++) M.px(x, y, blanco);
    M.sombrear(0, -1, 1, blanco, mix('#ffffff', p.s, .45));                              // sombra del párpado
    // iris: oscuro arriba, color en medio, claro abajo; pupila y un brillo arriba a la izquierda
    const I = new Capa(L.w, L.h), ix = ex - s * .2, iy = ey + E.irisY, R = E.iris, od = mix(ir.d, '#2b1d26', .4);
    I.elipse(ix, iy, R, R + .2, ir.m);
    I.cada((x, y) => (y + .5 < iy - R * .15) ? od : (y + .5 > iy + R * .5 ? ir.l : undefined));
    I.filo(od);
    I.elipse(ix, iy - .1, R * .45, R * .5, '#2b1d26');
    const hx = r(ix - R * .75), hy = r(iy - R * .85);
    I.rect(hx, hy, 2, 2, '#ffffff'); I.px(r(ix + R * .3), r(iy + R * .4), mix(ir.l, '#ffffff', .4));
    I.recortar(M); M.sobre(I); L.sobre(M);
    // pliegue del párpado (sin sombra) y línea suave de abajo
    if (!mk.sombra) for (let x = x0 + 2; x <= x1 - 1; x++) L.px(x, top(x) - 3, mix(p.b, p.s, .7));
    for (let x = x0; x <= x1; x++) if (fuera(x) > -.2) L.px(x, bot(x) + 1, mix(p.b, p.d, .45));
    // línea de pestañas: fina; en glam, doble del centro al rabillo y un rabillo cortito
    for (let x = x0; x <= x1; x++) L.px(x, top(x) - 1, lash);
    const xe = s < 0 ? x0 - 1 : x1 + 1, ye = top(xe) - 1;
    L.px(xe, ye, lash);
    if (mk.delin === 'fino') { L.px(xe + s, ye - 1, lash); L.px(xe + s * 2, ye - 2, lash); }
    if (mk.delin === 'alado') { for (let x = x0; x <= x1; x++) if (fuera(x) > -.3) L.px(x, top(x) - 2, lash); L.px(xe, ye - 1, lash); for (let j = 1; j <= 4; j++) L.px(xe + s * j, ye - j, lash); L.px(xe + s, ye - 2, lash); L.px(xe + s, ye, lash); }
    if (mk.delin === 'suave') { for (let x = x0; x <= x1; x++) if (fuera(x) > 0) L.px(x, top(x) - 2, mix(p.b, lash, .55)); L.px(xe + s, ye, mix(p.b, lash, .6)); }
    if (mk.brillo) { for (const [f, j] of [[-.8, 2], [-.4, 3], [0, 3], [.4, 3], [-.6, 4], [.2, 4]]) { const x = r(ex + s * f * w2 - .5); L.px(x, bot(lim(x)) + j, j & 1 ? '#ffffff' : '#ffd9ee'); } L.px(r(ex - s * (w2 + 1)), r(ey + 1), '#ffffff'); }
    // picos: en natural apenas dos puntitos; en glam tres pestañas de 2 pixeles
    const suave = mix(p.b, lash, .7);
    for (const f of pest.f) { const x = r(ex + s * f * w2 - .5), a = top(x) - 1, c = pest.suave ? suave : lash, d = f > .3 ? s : 0; for (let j = 0; j < pest.alto; j++) L.px(x + d * (j + (f > .8 && pest.alto === 1 ? 1 : 0)), a - 1 - j, j === pest.alto - 1 && pest.alto > 1 ? suave : c); }
    for (const f of pest.abajo) { const x = r(ex + s * f * w2 - .5), c = mix(p.b, lash, pest.alto > 2 ? .7 : .45); L.px(x, bot(x) + 2, c); if (pest.alto > 2) L.px(x + (f > .5 ? s : 0), bot(x) + 3, c); }
  }
  function ceja(L, ex, ey, s, C, c) {
    const P = t => [ex - s * 5 + s * C.largo * t, ey + C.y - C.arco * Math.sin(Math.PI * Math.pow(t, .8)) + C.inclin * t];
    const a = P(0), b = P(.55), d = P(1);
    L.tubo([[a[0], a[1], C.grosor], [b[0], b[1], C.grosor], [d[0], d[1] + .4, 1]], c);
  }
  function labios(L, cx, cy, B, lab, mk, p) {
    const w2 = B.w / 2, u = x => (x + .5 - cx) / w2, x0 = Math.ceil(cx - w2 - .5), x1 = Math.ceil(cx + w2 - .5) - 1;
    const yM = x => cy + .5 - B.sonrisa * u(x) * u(x);
    const yT = x => yM(x) - B.hU * Math.pow(Math.max(0, 1 - Math.abs(u(x))), .62) + B.arco * Math.exp(-Math.pow(u(x) / .2, 2));
    const yB = x => yM(x) + B.hL * Math.pow(Math.max(0, 1 - u(x) * u(x)), .62);
    const arriba = mix(lab, '#5a2a45', .14), linea = mix(lab, '#5a2a45', .42), luz = mk.mate ? mix(lab, '#5a2a45', .05) : acl(lab, .18), glam = mk.gloss > .5;
    const M = new Capa(L.w, L.h);
    for (let x = x0; x <= x1; x++) {
      const m = Math.ceil(yM(x) - .5);
      for (let y = Math.ceil(yT(x) - .5); y < m; y++) M.px(x, y, arriba);
      for (let y = m + 1; y <= Math.ceil(yB(x) - .5) - 1; y++) M.px(x, y, lab);
      M.px(x, m, linea);
    }
    M.px(x0 - 1, Math.ceil(yM(x0) - .5) - 1, mix(p.b, linea, .6)); M.px(x1 + 1, Math.ceil(yM(x1) - .5) - 1, mix(p.b, linea, .6));      // comisuras hacia arriba: sonrisa suave
    mancha(M, cx, cy + 1 + B.hL * .5, B.w * .26, B.hL * .34, luz, .7);                 // volumen del labio de abajo
    // gloss: en natural un brillito casi transparente; en glam un brillo claro
    const yg = r(cy + 1 + B.hL * .3), xg = r(cx - B.w * .18);
    M.encima(t => {
      if (glam) { t.hl(xg, xg + 2, yg, acl(lab, .55)); t.px(xg + 1, yg, '#ffffff'); t.px(r(cx + B.w * .14), yg + 1, acl(lab, .4)); t.px(r(cx - 1), r(cy - B.hU * .5), acl(lab, .35)); }
      else if (!mk.mate) { t.hl(xg, xg + 1, yg, acl(lab, .38)); }
    });
    L.sobre(M);
    for (let x = r(cx - B.w * .2); x <= r(cx + B.w * .2); x++) L.px(x, Math.ceil(yB(x) - .5) + 1, mix(p.b, p.s, .8));      // sombrita bajo el labio
  }

  function cara(o) {
    const W = 96, H = 96, cx = 48, y0 = 12, k = 2.6, kx = 2.3, ky = 2.7, L = fondo(new Capa(W, H));
    const sk = BB.PIELES[o.piel], p = tonos(sk), F = BB.rasgos(o), mk = BB.maq(o), hc = BB.PELOS_COLOR[o.colorPelo], an = o.animo, ropa = o.ropa || null;
    const Z = { ...F.cerca, ojo: { ...F.cerca.ojo }, ceja: { ...F.cerca.ceja }, labio: { ...F.cerca.labio } }, glam = !!mk.delin;
    if (an === 'contenta') { Z.labio.sonrisa += 1.5; Z.labio.w += 1.5; Z.ojo.hB *= .85; }
    if (an === 'triste') { Z.labio.sonrisa -= 2.6; Z.ceja.inclin += 2.4; Z.ceja.y -= 1.4; }
    if (an === 'cansada') { Z.ojo.hT *= .62; Z.ojo.irisY += .3; Z.labio.sonrisa = 0; }
    destello(L, 9, 12, 2); destello(L, 87, 20, 1); destello(L, 90, 70, 1); L.px(6, 60, '#ffffff'); L.px(84, 44, '#ffffff');
    const pel = BB.ELLA.peloT({ cx, y0, k, w: W, h: H }, o);
    L.sobre(pel.atras);
    // cuello y hombros con el top básico y un collar
    const C = new Capa(W, H);
    for (let y = 66; y <= 88; y++) C.tramo(y, cx - 7.6, cx + 7.6, p.b);
    C.perfil(83, 96, [[83, cx - 7.6], [86, cx - 15], [90, cx - 33], [96, cx - 47]], [[83, cx + 7.6], [86, cx + 15], [90, cx + 33], [96, cx + 47]], p.b);
    C.sombrear(1, 0, 2, p.b, p.s); C.contorno(p.o);
    C.encima(t => { t.hl(cx - 22, cx - 12, 90, p.s); t.hl(cx + 12, cx + 22, 90, p.s); });
    const top = rampa('#fffaf5');
    for (const s of [-1, 1]) { C.linea(cx + s * 16, 87, cx + s * 19, 96, top.o); C.linea(cx + s * 17, 87, cx + s * 20, 96, top.b); C.linea(cx + s * 18, 87, cx + s * 21, 96, top.o); }
    if (ropa ? ropa.cuello && ropa.cuello.id === 'cadenita' : o.collar !== false) { const f = x => 84 + 6 * (1 - Math.pow((x - cx) / 9, 2)); for (let x = cx - 9; x <= cx + 9; x++) C.px(x, r(f(x)), (x & 1) ? ORO : ORO_O); C.rect(cx - 1, 91, 2, 2, PERLA); C.px(cx, 92, '#e8dccb'); }
    if (ropa && ropa.cuello && ropa.cuello.id === 'perlas') for (let x = cx - 9; x <= cx + 9; x += 3) { const y = r(83 + 5 * (1 - Math.pow((x - cx) / 9, 2))); C.rect(x - 1, y, 3, 3, ropa.cuello.color); C.px(x - 1, y, '#ffffff'); C.px(x + 1, y + 2, '#d8cabb'); }
    if (o.forma && BB.PECAS[o.pecas].hombros) for (const [x, y] of [[-30, 93], [-26, 91], [-22, 94], [-34, 95], [24, 91], [28, 94], [32, 92], [20, 94]]) C.px(cx + x, y, mix(p.b, p.d, .45));
    // ropa que se alcanza a ver en los hombros
    const visible = ropa && (ropa.encima || ropa.vestido || ropa.base), dv = visible && BB.CATALOGO[visible.id];
    if (dv && !['tirantes', 'caido'].includes((dv.q.arriba || dv.q).escote) && dv.dibujo !== 'sueterHombro') { const q = rampa(visible.color), V = new Capa(W, H), alto = dv.q.cuello === 'alto' || dv.q.cuello === 'doblado' || dv.dibujo === 'vestidoPunto', cap = dv.dibujo === 'hoodie' || dv.q.cuello === 'capucha'; V.perfil(86, 96, [[86, cx - 14], [90, cx - 33], [96, cx - 48]], [[86, cx + 14], [90, cx + 33], [96, cx + 48]], q.b); if (!alto && !cap) { const m = new Capa(W, H); m.elipse(cx, 86, 11, 8, 1); V.quitar(m); } if (alto) { V.rect(cx - 10, 76, 20, 14, q.b); V.encima(t => { for (let x = cx - 10; x < cx + 10; x += 2) t.vl(x, 76, 89, q.s); }); } if (cap) { V.elipse(cx, 88, 17, 7, q.b); const m = new Capa(W, H); m.elipse(cx, 83, 9, 6, 1); V.quitar(m); V.encima(t => { t.vl(cx - 6, 92, 96, '#fffaf4'); t.vl(cx + 6, 92, 96, '#fffaf4'); }); } V.sombrear(1, 0, 2, q.b, q.s); V.sombrear(0, -1, 1, q.b, q.l); V.contorno(q.o); C.sobre(V); }
    L.sobre(C);
    // cabeza: más ovalada y menos ancha que el pelo, con la mandíbula afinada
    const f = curva(F.forma.map(q => q[0]), F.forma.map(q => q[1])), yb = F.forma[F.forma.length - 1][0], Hd = new Capa(W, H);
    const fino = v => 1 - .14 * Math.min(1, Math.max(0, (v - 11) / 11)), medio = y => f((y - y0) / ky) * kx * fino((y - y0) / ky);
    Hd.perfil(y0, y0 + yb * ky, y => cx - medio(y), y => cx + medio(y), p.b);
    const yo = r(y0 + 15 * ky), xo = 11 * kx + 1.2;
    Hd.elipse(cx - xo, yo, 3, 5.2, p.b); Hd.elipse(cx + xo, yo, 3, 5.2, p.b);
    Hd.sombrear(1, 0, 2, p.b, p.s); Hd.contorno(p.o);
    Hd.encima(t => { for (const s of [-1, 1]) { const x = Math.floor(cx + s * (xo + .6)); t.vl(x, yo - 2, yo + 2, p.s); } });
    // sombra suave bajo la quijada: sigue la curva de la cara sobre el cuello
    for (let y = 58; y < H; y++) for (let x = 0; x < W; x++) if (L.get(x, y) === p.b && !Hd.hay(x, y)) { let q = 0; for (let j = 1; j <= 8; j++) if (Hd.hay(x, y - j)) { q = j; break; } if (q && (q <= 4 || trama(x, y) > (q - 4) / 5)) L.px(x, y, p.s); }
    L.sobre(Hd);
    const piel = (x, y) => L.get(x, y) === p.b;
    const ey = r(y0 + 13.7 * ky), dx = Z.ojo.dx || 10.5, ny = r(y0 + 17 * ky), nb = r(y0 + 17.7 * ky), by = y0 + 19.9 * ky;      // ny: base de la nariz (corta) · nb: altura de las mejillas
    // rubor difuminado: una mancha ancha y bajita, toda en trama (sin círculo relleno)
    const rub = mix(p.b, mk.ruborC || sk.rubor, .1 + mk.rubor * .32 + (an === 'contenta' ? .05 : 0));
    for (const s of [-1, 1]) for (let y = nb - 7; y <= nb + 3; y++) for (let x = Math.floor(cx + s * 15.5 - 9); x <= cx + s * 15.5 + 9; x++) {
      const d = Math.hypot((x + .5 - (cx + s * 15.5)) / 8.6, (y + .5 - (nb - 2)) / 4.2);
      if (d < 1 && trama(x, y) > d * .85 + (mk.ruborC ? -.1 : .1) && piel(x, y)) L.px(x, y, rub);
    }
    // pocas pecas y tenues
    { const pc = mix(p.b, p.d, .42); for (const [x, y] of F.pecasD.cerca) L.px(cx + x, nb + y, pc); }
    if (o.granitos) for (const [x, y] of [[-17, 6], [13, 8], [6, -36], [-9, 13]]) { L.rect(cx + x, nb + y, 2, 2, mix(p.b, '#d8484f', .5)); L.px(cx + x, nb + y, mix(p.b, '#ffd9d2', .6)); }
    // luz suave en la frente y en los pómulos (la luz viene de arriba a la izquierda)
    const pm = mix(p.b, p.l, .55);
    const luz = (lx, ly, rx, ry, nucleo) => { for (let y = Math.floor(ly - ry); y <= ly + ry; y++) for (let x = Math.floor(lx - rx); x <= lx + rx; x++) { const d = Math.hypot((x + .5 - lx) / rx, (y + .5 - ly) / ry); if (d < 1 && (d < .78 || trama(x, y) > .5) && (piel(x, y) || L.get(x, y) === rub)) L.px(x, y, d < nucleo ? p.l : pm); } };
    luz(cx - 4, y0 + 7.4 * ky, 6, 1.9, .4);                 // frente: luz chica
    if (mk.glow || !o.forma) { luz(cx - 15, nb - 6.5, 4.8, 1.8, .55); luz(cx + 15, nb - 6.5, 3.8, 1.5, 0); }
    if (mk.glowFuerte) { luz(cx - 16, nb - 7, 5.6, 2, .7); luz(cx + 16, nb - 7, 5, 1.8, .7); L.hl(cx - 18, cx - 15, r(nb - 8), mix(p.l, '#ffffff', .6)); L.hl(cx + 15, cx + 17, r(nb - 8), mix(p.l, '#ffffff', .6)); }
    if (an === 'cansada') for (const q of [-1, 1]) for (let x = -4; x <= 4; x++) if (trama(cx + x, 1) > .2) L.px(r(cx + q * 10.5 + x), ey + 5 - (Math.abs(x) > 2 ? 1 : 0), mix(p.b, '#8a6a9a', .28));
    if (mk.ruborNariz) mancha(L, cx, ny - 3, 5, 3.6, mix(p.b, rub, .75), .3);
    // nariz corta con forma: sombra suave de un lado, aletas, base y brillo en la punta
    const sn = mix(p.b, p.s, .7);
    const N = Z.nariz, a = N.an, nz = ny - N.sube;
    L.vl(cx + 2, nz - 4 - N.largo, nz - 4, sn); L.px(cx + a, nz - 3, sn); L.px(cx + a + 1, nz - 2, p.s); L.px(cx + a + 1, nz - 1, p.s); L.px(cx - a - 2, nz - 1, sn); if (a > 3) { L.px(cx - a - 2, nz - 2, sn); L.px(cx - a - 1, nz, p.s); L.px(cx + a, nz, p.s); }
    L.hl(cx - a, cx - 2, nz, p.d); L.hl(cx + 1, cx + a - 1, nz, p.d); L.hl(cx - 1, cx, nz + (N.sube ? 0 : 1), p.s);
    if (N.sube) { L.hl(cx - 2, cx + 1, nz + 1, sn); }
    L.vl(cx - 1, nz - 4 - N.largo, nz - 6, mix(p.b, p.l, .6));
    L.rect(cx - 1, nz - 4, Math.min(2, N.punta + 1), Math.min(2, N.punta), p.l); if (N.punta > 2) L.px(cx, nz - 5, p.l); if (glam || mk.glowFuerte) L.px(cx - 1, nz - 4, mix(p.l, '#ffffff', .6));
    // ojos, cejas y labios
    const ir = BB.IRIS[o.iris || F.iris], lash = mix(hc.o, '#2b1d26', glam ? (mk.delin === 'suave' ? .6 : .75) : .45);
    for (const s of [-1, 1]) { ojo(L, cx + s * dx, ey, s, Z.ojo, ir, p, mk, lash, mk.pest || F.pest); ceja(L, cx + s * dx, ey, s, Z.ceja, mix(hc.m, p.b, .18)); }
    labios(L, cx, by, Z.labio, mk.labio ? (o.forma ? mix(p.b, mk.labio, .9) : col(mk.labio)) : mix(p.b, sk.labio, .82), mk, p);
    if (F.lunar && F.lunar.cerca) { const q = mix(p.o, '#3d2a45', .4); L.px(cx + F.lunar.cerca[0], nb + F.lunar.cerca[1], q); L.px(cx + F.lunar.cerca[0] + 1, nb + F.lunar.cerca[1], mix(p.b, q, .5)); }
    if (o.piercing) { L.px(cx + 5, ny - 2, PLATA); L.px(cx + 5, ny - 1, PLATA_O); }
    // sombra suave bajo el pelo: cae hacia abajo y a la derecha de cada mechón
    const fr = pel.frente, bajoPelo = (x, y) => { for (const [a, b] of [[0, 1], [0, 2], [1, 1], [1, 0], [2, 2], [0, 3], [2, 0]]) if (fr.hay(x - a, y - b)) return a + b; return 0; };
    for (let y = y0; y < 80; y++) for (let x = 0; x < W; x++) { const c = L.get(x, y); if ((c === p.b || c === p.l || c === pm) && !fr.hay(x, y) && Hd.hay(x, y)) { const q = bajoPelo(x, y); if (q && (q <= 2 || trama(x, y) > .5)) L.px(x, y, p.s); } }
    L.sobre(fr);
    // aretes: gancho de oro y perla
    if (ropa && ropa.lentes) { const q = rampa(ropa.lentes.color); for (const s of [-1, 1]) { const M = new Capa(W, H); M.elipse(cx + s * dx, ey, 8.4, 7.4, q.b); const m = new Capa(W, H); m.elipse(cx + s * dx, ey, 7.2, 6.2, 1); M.quitar(m); L.sobre(M); L.linea(cx + s * dx - 4, ey - 2, cx + s * dx - 2, ey - 4, '#ffffff'); } L.hl(cx - 3, cx + 2, ey - 2, q.b); }
    if (ropa && ropa.pelo) { if (ropa.pelo.id === 'mono') BB.ELLA.mono(L, cx - 22, 0, ropa.pelo.color, 2.6); else { const q = rampa(ropa.pelo.color), M = new Capa(W, H); M.dibujo(cx + 14, y0 + 2, ['.bbbbbbbbbb.', 'bblllllllbbb', 'bbbbbbbbbbbb', 'b.bb.bb.bb.b', 'b.b..b..b..b'], { b: q.b, l: q.h }); M.contorno(q.o); L.sobre(M); } }
    if (ropa ? ropa.orejas : o.aretes !== false) for (const s of [-1, 1]) { const x = Math.floor(cx + s * (xo + .6)), y = yo + 5; if (!pel.frente.hay(x, y - 2)) { L.px(x, y, ORO); L.px(x, y + 1, ORO_O); const q = new Capa(W, H); q.elipse(x + .5, y + 4, 2, 2, PERLA); q.contorno('#cfc3b4'); L.sobre(q); L.px(x - 1, y + 3, '#ffffff'); L.px(x + 1, y + 5, '#e8dccb'); } }
    return L;
  }

  /* ================= manos ================= */
  // punto local (a: a lo ancho, t: a lo largo del dedo desde la punta) -> pixel
  const eje = d => { const g = d.a * Math.PI / 180, ux = Math.sin(g), uy = -Math.cos(g); return { ux, uy, px: -uy, py: ux, tx: d.x + ux * d.l, ty: d.y + uy * d.l }; };
  function formaUna(N, h, cama) {
    const ext = N.ext !== undefined ? N.ext : { corta: .6, media: 3, larga: 7 }[N.largo], a = -cama;
    if (N.forma === 'almendra') return { ext, pts: [[-h * .75, a], [h * .75, a], [h, a + 1.4], [h, a + (cama + ext) * .5], [h * .6, ext - 2], [h * .22, ext], [-h * .22, ext], [-h * .6, ext - 2], [-h, a + (cama + ext) * .5], [-h, a + 1.4]] };
    if (N.forma === 'coffin') return { ext, pts: [[-h * .75, a], [h * .75, a], [h, a + 1.4], [h, a + (cama + ext) * .45], [h * .55, ext], [-h * .55, ext], [-h, a + (cama + ext) * .45], [-h, a + 1.4]] };
    const q = N.forma === 'squoval' ? 1.2 : .3;
    return { ext, pts: [[-h * .75, a], [h * .75, a], [h, a + 1.4], [h, ext - q], [h - q, ext], [-h + q, ext], [-h, ext - q], [-h, a + 1.4]] };
  }
  function una(L, d, N, p, k = 1) {
    if (!N) return;
    const e = eje(d), h = d.w * (d.unaAncho || .37) * k, cama = d.cama || 5.4, { ext, pts } = formaUna(N, h, cama);
    const W2 = (a, t) => [e.tx + e.px * a + e.ux * t, e.ty + e.py * a + e.uy * t];
    const base = N.color ? col(N.color) : mix(p.b, '#ffd9dd', .6), cuerpo = N.acabado === 'jelly' ? mix(base, p.b, .3) : base, borde = mix(base, '#5a2a45', N.acabado === 'jelly' ? .12 : .22);
    const M = new Capa(L.w, L.h); M.poli(pts.map(([a, t]) => W2(a, t)), cuerpo);
    const loc = (x, y) => { const qx = x + .5 - e.tx, qy = y + .5 - e.ty; return [qx * e.px + qy * e.py, qx * e.ux + qy * e.uy]; };
    // jelly: la orilla es más intensa y el centro deja ver la piel
    M.filo(borde);
    if (N.french) M.cada((x, y) => { const [a, t] = loc(x, y); return t > ext - N.frenchLargo + 1.1 * Math.pow(Math.abs(a) / h, 2) ? col(N.french) : undefined; });
    if (N.acabado === 'glitter') M.cada((x, y) => ((x * 7 + y * 13) % 11 === 0) ? '#ffffff' : undefined);
    if (N.glaseado) M.cada((x, y) => { const [a, t] = loc(x, y); return Math.abs(a) < h * .5 && ((x + y) & 1) ? mix(cuerpo, '#ffffff', .75) : Math.abs(a) < h * .8 ? mix(cuerpo, '#f3e6ff', .45) : undefined; });
    if (N.puntos) M.cada((x, y) => { const [a, t] = loc(x, y); return (Math.abs(a) < .6 && Math.abs(((t + cama) % 3) - 1.5) < .6 && t < ext - 2) ? col(N.puntos) : undefined; });
    // brillo: raya de luz a lo largo y un puntito
    if (N.acabado !== 'mate') { const br = N.french ? acl(cuerpo, .55) : '#ffffff'; M.encima(t2 => { const [x0, y0] = W2(-h * .42, -cama + 1.6), [x1, y1] = W2(-h * .42, -cama + 1.6 + Math.min(5, (cama + ext) * .42)); t2.linea(Math.floor(x0), Math.floor(y0), Math.floor(x1), Math.floor(y1), br); const [x2, y2] = W2(-h * .3, Math.min(ext - 2.2, -cama + 8.6)); if (ext > 2) t2.px(Math.floor(x2), Math.floor(y2), br); }); }
    if (N.dib) { const [hx, hy] = W2(0, -cama + (cama + ext) * .5); M.encima(t2 => t2.dibujo(Math.floor(hx) - 1, Math.floor(hy) - 1, N.dib.filas, { h: col(N.dib.c) })); }
    if (N.rota) M.cada((x, y) => { const [a, t] = loc(x, y); return t > ext - 2.4 && ((x * 5 + y * 3) % 4 < 2) || (t < -cama + 2 && a > 0) ? mix(p.b, '#ffd9dd', .6) : undefined; });
    if (N.corazon) { const [hx, hy] = W2(h * .1, -cama + (cama + ext) * .5); M.encima(t2 => t2.dibujo(Math.floor(hx) - 1, Math.floor(hy) - 1, ['h.h', 'hhh', '.h.'], { h: col(N.corazon) })); }
    L.sobre(M);
  }
  // anillo: banda que cruza el dedo a `d0` pixeles de su base
  function anillo(L, d, d0, tipo) {
    const e = eje(d), w = d.w / 2 + .8, B = (t0, t1, c) => L.poli([[-w, t0], [w, t0], [w, t1], [-w, t1]].map(([a, t]) => [d.x + e.px * a + e.ux * t, d.y + e.py * a + e.uy * t]), c);
    const P = (a, t) => [Math.floor(d.x + e.px * a + e.ux * t), Math.floor(d.y + e.py * a + e.uy * t)];
    const oro = tipo.plata ? PLATA : ORO, oroO = tipo.plata ? PLATA_O : ORO_O;
    B(d0 - .3, d0 + 2.3, oroO); B(d0 + .5, d0 + 1.9, oro); L.px(...P(-w * .5, d0 + 1.2), ORO_L);
    if (tipo.doble) { const n = 6; for (let i = 0; i <= n; i++) L.px(...P(-w + 2 * w * i / n, d0 + 4.4), i % 2 ? ORO : ORO_L); }
    if (tipo.perla) { const [x, y] = P(0, d0 + 1.2); const q = new Capa(L.w, L.h); q.elipse(x + .5, y + .5, 1.7, 1.7, PERLA); q.contorno(oroO); L.sobre(q); L.px(x - 1, y - 1, '#ffffff'); }
    if (tipo.mono) { const [x, y] = P(0, d0 + 1.2); L.dibujo(x - 2, y - 1, ['b...b', 'bbkbb', 'b...b'], { b: ORO_L, k: oroO }); }
  }
  function mano(sk, N, joyas, manga) {
    const L = new Capa(128, 80), p = tonos(sk), ox = 94, oy = 62;
    const D = [
      { x: -8.4, y: -15.5, a: -9, l: 29, w: 5.6 }, { x: -2.8, y: -17.5, a: -3, l: 33, w: 5.9 }, { x: 3.2, y: -17, a: 4, l: 30, w: 5.6 }, { x: 8.6, y: -14, a: 12, l: 23.5, w: 5 },
      { x: -9.8, y: -1.5, a: -42, l: 17, w: 6.2, cama: 5.8 },
    ].map(d => ({ ...d, x: ox + d.x, y: oy + d.y }));
    const M = new Capa(128, 80);
    M.poli([[-9.4, 12], [-10.6, -3], [-11.2, -11], [-8, -17], [0, -19.5], [7, -17.5], [11, -13], [10.6, -3], [8.8, 12]].map(([x, y]) => [ox + x, oy + y]), p.b);
    for (const d of D) { const e = eje(d); M.tubo([[d.x, d.y, d.w + .5], [d.x + e.ux * d.l * .55, d.y + e.uy * d.l * .55, d.w], [e.tx - e.ux * d.w * .45, e.ty - e.uy * d.w * .45, d.w - .9]], p.b); }
    // piel lisa: solo luz a la izquierda, sombra a la derecha y contorno
    M.sombrear(-1, 0, 1, p.b, p.l); M.sombrear(1, 0, 1, p.b, p.s); M.contorno(p.o);
    L.sobre(M);
    D.forEach((d, i) => una(L, d, Array.isArray(N) ? (N[i] || N[0]) : N, p));
    (joyas.anillos || []).forEach(([i, d0, tipo]) => anillo(L, D[i], d0, tipo));
    // pulseras
    const yb = oy + 4;
    if (joyas.cadena) { for (let x = -10; x <= 9; x++) L.px(ox + x, yb + r(1.2 * (1 - Math.pow(x / 11, 2))), (x & 1) ? ORO : ORO_O); L.dibujo(ox - 2, yb + 3, ['h.h', 'hhh', '.h.'], { h: joyas.dije || ORO }); L.px(ox - 1, yb + 2, ORO_O); }
    if (joyas.perlas) { for (let x = -9; x <= 8; x += 3) { const y = yb - 3 + r(1.2 * (1 - Math.pow(x / 11, 2))); L.rect(ox + x, y, 2, 2, PERLA); L.px(ox + x + 1, y + 1, '#dccfbe'); } }
    if (joyas.aro) { for (let x = -10; x <= 9; x++) { const y = yb - 3 + r(1.2 * (1 - Math.pow(x / 11, 2))); L.px(ox + x, y, ORO); L.px(ox + x, y + 1, ORO_O); } L.px(ox - 5, yb - 2, ORO_L); L.px(ox - 4, yb - 2, ORO_L); }
    // puño de la manga
    if (manga === null) return L;
    const c = rampa(manga || '#f7ecd9'), Q = new Capa(128, 80);
    Q.perfil(oy + 8.5, 80, [[oy + 8.5, ox - 13], [oy + 12, ox - 14.5], [80, ox - 16]], [[oy + 8.5, ox + 12.5], [oy + 12, ox + 14], [80, ox + 15.5]], c.b);
    Q.encima(t => { for (let x = 0; x < 128; x += 2) t.vl(x, oy + 9, oy + 14, c.s); t.hl(0, 128, r(oy + 15), c.s); });
    Q.sombrear(1, 0, 2, c.b, c.s); Q.contorno(c.o); L.sobre(Q);
    return L;
  }
  function manos(o) {
    const L = fondo(new Capa(128, 80)), sk = BB.PIELES[o.piel || 'clara'];
    destello(L, 8, 10, 2); destello(L, 120, 14, 1); destello(L, 64, 8, 1); L.px(60, 40, '#ffffff'); L.px(4, 50, '#ffffff'); L.px(124, 52, '#ffffff');
    if (o.forma) {                                       // en el juego: sus uñas y sus joyas
      const N = BB.unasCerca(o.manos), q = o.ropa || {}, t = q.encima || q.vestido || q.base, d = t && BB.CATALOGO[t.id], larga = d && (d.q.manga === 'larga' || (d.q.arriba && d.q.arriba.manga === 'larga') || ['hoodie', 'sueterHombro', 'vestidoPunto'].includes(d.dibujo));
      const plata = x => x && x.color === '#dfe3ea', M = larga ? t.color : null;
      L.sobre(mano(sk, N, { anillos: q.manos ? [[1, 5, { doble: !plata(q.manos), plata: plata(q.manos) }], [2, 6, { mono: true, plata: plata(q.manos) }]] : [], cadena: !!q.munecas }, M).espejo());
      L.sobre(mano(sk, N, { anillos: q.manos ? [[1, 6, { perla: true, plata: plata(q.manos) }]] : [], aro: !!q.munecas, cadena: !!q.munecas, dije: '#f58fb0' }, M));
      return L;
    }
    const A = BB.DISENOS_UNAS[o.unasA || 'jelly'], B = BB.DISENOS_UNAS[o.unasB || 'french'];
    const acento = { ...A, corazon: A.toque };
    const izq = mano(sk, [A, A, acento, A, A], { anillos: [[1, 5, { doble: true }], [2, 6, { mono: true }]], cadena: true, perlas: true }, o.manga);
    L.sobre(izq.espejo());
    L.sobre(mano(sk, B, { anillos: [[1, 6, { perla: true }], [3, 5, { plata: true }]], aro: true, cadena: true, dije: '#f58fb0' }, o.manga));
    return L;
  }

  /* ================= pies =================
     Vistos desde arriba: el dedo gordo es el más grande y los demás van bajando de tamaño (cortos y redonditos);
     el pie se angosta hacia el tobillo y no lleva puño ni dobladillo, para que no parezca una mano con manga. */
  function pie(sk, N, o) {
    const L = new Capa(128, 80), p = tonos(sk), ox = 93, oy = 42, tira = rampa(o.sandalia || '#f58fb0');
    const T = [
      { x: -9.4, y: -16, a: -2, l: 10.5, w: 11, unaAncho: .34, cama: 5.4 }, { x: -.6, y: -16.8, a: 2, l: 7.8, w: 6.4, unaAncho: .32, cama: 3.3 }, { x: 5.1, y: -15.6, a: 6, l: 6.6, w: 5.8, unaAncho: .32, cama: 2.9 }, { x: 10, y: -13.4, a: 10, l: 5.6, w: 5.3, unaAncho: .32, cama: 2.5 }, { x: 14.2, y: -10.4, a: 15, l: 4.6, w: 4.8, unaAncho: .32, cama: 2.2 },
    ].map(d => ({ ...d, x: ox + d.x, y: oy + d.y }));
    const cuerpo = [[-9, 40], [-9.4, 26], [-11.5, 12], [-14.6, -2], [-15.2, -11], [-13.5, -16.5], [-4, -18.5], [5, -17.5], [11.5, -14.6], [16, -10], [16.6, -3], [15.2, 8], [12, 20], [10, 30], [9.6, 40]].map(([x, y]) => [ox + x, oy + y]);
    // suela de la sandalia: asoma alrededor del pie
    const S = new Capa(128, 80); if (!o.sinSandalia) S.poli(cuerpo, tira.l);
    for (const d of o.sinSandalia ? [] : T) { const e = eje(d); S.tubo([[d.x, d.y, d.w + 1], [e.tx - e.ux * d.w * .4, e.ty - e.uy * d.w * .4, d.w]], tira.l); }
    S.contorno(tira.l); S.contorno(tira.o); L.sobre(S);
    const M = new Capa(128, 80); M.poli(cuerpo, p.b);
    for (const d of T) { const e = eje(d); M.tubo([[d.x, d.y, d.w + .3], [e.tx - e.ux * d.w * .45, e.ty - e.uy * d.w * .45, d.w - .5]], p.b); }
    M.sombrear(-1, 0, 1, p.b, p.l); M.sombrear(1, 0, 1, p.b, p.s); M.contorno(p.o);
    // separación de los dedos: una rayita corta y suave entre cada par
    M.encima(t => { for (let i = 0; i < 4; i++) { const a = T[i], b = T[i + 1], ea = eje(a), eb = eje(b), x0 = (a.x + a.w / 2 * ea.px + b.x - b.w / 2 * eb.px) / 2, y0 = (a.y + b.y) / 2, len = Math.min(a.l, b.l) * .7; t.linea(Math.floor(x0), Math.floor(y0 - 1), Math.floor(x0 + (ea.ux + eb.ux) / 2 * len), Math.floor(y0 - len), p.s); } });
    // huesito del tobillo: una sombra chiquita de cada lado
    M.encima(t => { t.vl(ox - 8, oy + 31, oy + 33, p.s); t.vl(ox + 8, oy + 30, oy + 32, p.s); });
    L.sobre(M);
    T.forEach(d => una(L, d, o.forma ? { ...N, ext: { corta: .6, media: 1.7, larga: 2.9 }[N.largo], frenchLargo: 2.2 } : { ...N, forma: 'squoval', largo: 'corta' }, p));
    if (o.anilloPie) anillo(L, T[1], 1.5, { plata: true });
    // tiras de la sandalia con moñito
    const vx = ox - 4.6, vy = oy - 13.5, Q = new Capa(128, 80);
    if (!o.sinSandalia) {
    Q.tubo([[vx, vy, 3], [ox - 14.6, oy + 3, 3.2]], tira.b); Q.tubo([[vx, vy, 3], [ox + 16, oy + 4, 3.2]], tira.b);
    Q.sombrear(0, 1, 1, tira.b, tira.s); Q.contorno(tira.o); L.sobre(Q);
    const m = new Capa(128, 80); m.dibujo(r(vx) - 4, r(vy) - 2, ['bb.....bb', 'blb.k.bbb', 'bbbkkkbbs', 'bbb.k.bbs', 'bs.....bs'], { b: tira.b, l: tira.l, s: tira.s, k: tira.s }); m.contorno(tira.o); L.sobre(m); L.px(r(vx), r(vy), PERLA);
    }
    // tobillera con corazón
    if (o.tobillera !== false) { const ya = oy + 24; for (let x = -9; x <= 9; x++) L.px(ox + x, ya + r(1.8 * (1 - Math.pow(x / 10, 2))), (x & 1) ? ORO : ORO_O); L.dibujo(ox + 1, ya + 3, ['h.h', 'hhh', '.h.'], { h: ORO }); L.px(ox + 2, ya + 4, ORO_L); for (const x of [-6, -2, 6]) L.px(ox + x, ya + r(1.8 * (1 - Math.pow(x / 10, 2))) + 1, PERLA); }
    return L;
  }
  function pies(o) {
    const L = fondo(new Capa(128, 80)), sk = BB.PIELES[o.piel || 'clara'], juego = !!o.forma, q0 = o.ropa || {}, N = juego ? BB.unasCerca(o.pies) : BB.DISENOS_UNAS[o.unasPies || 'rosa'];
    const zap = q0.pies && BB.CATALOGO[q0.pies.id], sand = zap && (zap.dibujo === 'sandalia' || zap.dibujo === 'chanclas');
    if (juego) o = { ...o, tobillera: !!q0.tobillos, sinSandalia: !sand, sandalia: sand ? q0.pies.color : undefined };
    // tapete peludito
    const t = rampa('#fff6ee'), R = new Capa(128, 80);
    R.elipse(64, 46, 58, 33, t.b);
    for (let a = 0; a < 360; a += 9) R.elipse(64 + Math.cos(a * Math.PI / 180) * 57, 46 + Math.sin(a * Math.PI / 180) * 32, 3, 2.6, t.b);
    R.sombrear(0, 1, 2, t.b, t.s); R.contorno(t.o);
    R.encima(q => { for (let y = 16; y < 80; y += 5) for (let x = 8 + (y % 2) * 4; x < 124; x += 9) { q.px(x, y, t.s); q.px(x + 1, y + 1, t.s); } });
    L.sobre(R); destello(L, 8, 8, 1); destello(L, 119, 9, 1);
    L.sobre(pie(sk, N, { ...o, anilloPie: false }).espejo());
    L.sobre(pie(sk, N, { ...o, anilloPie: juego ? !!q0.piesAcc : true }));
    return L;
  }

  BB.CERCA = { cara, manos, pies, fondo, destello, mancha };
})(typeof globalThis !== 'undefined' ? globalThis : this);
