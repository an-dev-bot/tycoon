/* Dibujos de la ropa. Cada función recibe las medidas del cuerpo (G), el color y los detalles del artículo (q) y
   dibuja la prenda una sola vez para todos los cuerpos. Devuelve sus partes: atras, cuerpo, mangas, frente.
   `cubre` dice qué zonas tapa (filas del torso, de las piernas, y hasta dónde del brazo): lo revisan las pruebas. */
(function (root) {
  'use strict';
  const BB = root.BB, { col, mix, acl, lum, borde, trama } = BB, E = BB.ELLA, { capa, rampa, volumen, acabar, manga, resorte, ex, pieI, pieD } = E.util;
  const { W, SUELO, PRENDAS } = E, r = Math.round, ORO = col('#e9bd62'), PERLA = col('#fffaf2');
  const entre = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

  /* ---------- estampados y tejidos ---------- */
  const TEJIDOS = {
    rayas(t, p, q, z) { const c = rampa(q.c2 || '#6b5f86'); for (let y = z.y0 + 6; y < z.y1 - 1; y += q.paso || 5) { t.hl(0, W, y, c.b); if (q.gruesa) t.hl(0, W, y + 1, c.b); } },
    canale(t, p, q, z) { for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x += 3) t.px(x, y, p.s); },
    trenzas(t, p, q, z) { for (const dx of [-5, 0, 5]) for (let y = z.y0 + 5; y < z.y1 - 2; y++) { const x = r(z.cen(y) + dx), k = [0, 1, 0, -1][y & 3]; t.px(x + k, y, p.l); t.px(x - k, y, p.d); } },
    grecas(t, p, q, z) { const c = col(q.c2 || '#b8505a'), y = z.y0 + 8; for (let x = 0; x < W; x++) { t.px(x, y + [0, 1, 2, 1][x & 3], c); t.px(x, y + 6 + [2, 1, 0, 1][x & 3], c); if ((x & 3) === 0) { t.px(x, y + 4, c); t.px(x + 1, y + 4, c); } if (x % 6 === 2) { t.px(x, y + 13, c); t.px(x, y + 18, c); } } t.hl(0, W, y - 2, p.s); },
    cuadros(t, p, q, z) { const c = mix(p.b, q.c2 || '#b8505a', .62), c3 = col(q.c3 || '#fff6ea'); for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x++) { const a = x % 8 < 2, b = y % 8 < 2; if (a && b) t.px(x, y, mix(c, '#3d2a45', .25)); else if (a || b) { if ((x + y) & 1 || a && b) t.px(x, y, c); } else if (x % 8 === 5 || y % 8 === 5) t.px(x, y, mix(p.b, c3, .4)); } },
    vichy(t, p, q, z) { const c = mix(p.b, '#ffffff', .75); for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x++) { const a = (x >> 1) & 1, b = (y >> 1) & 1; if (a && b) t.px(x, y, c); else if (a || b) t.px(x, y, mix(p.b, c, .5)); } },
    floral(t, p, q, z) { const c = col(q.c2 || '#f58fb0'); for (let y = z.y0 + 3, f = 0; y < z.y1 - 1; y += 5, f++) for (let x = (f & 1) * 4 + 1; x < W; x += 8) { t.px(x, y, c); t.px(x - 1, y, acl(c, .4)); t.px(x + 1, y, acl(c, .4)); t.px(x, y - 1, acl(c, .4)); t.px(x + 2, y + 1, '#8fb894'); } },
    puntos(t, p, q, z) { for (let y = z.y0 + 2, f = 0; y < z.y1 - 1; y += 4, f++) for (let x = (f & 1) * 3; x < W; x += 6) t.px(x, y, q.c2 || '#ffffff'); },
    corazones(t, p, q, z) { const c = col(q.c2 || '#d2485a'); for (let y = z.y0 + 6, f = 0; y < z.y1 - 3; y += 8, f++) for (let x = (f & 1) * 5 + 2; x < W; x += 10) t.dibujo(x, y, ['h.h', 'hhh', '.h.'], { h: c }); },
    ositos(t, p, q, z) { const c = col(q.c2 || '#b98a68'); for (let y = z.y0 + 4, f = 0; y < z.y1 - 3; y += 8, f++) for (let x = (f & 1) * 5 + 2; x < W; x += 10) t.dibujo(x, y, ['c.c', 'ccc', 'cnc'], { c, n: '#5a3b2f' }); },
    monitos(t, p, q, z) { const c = col(q.c2 || '#3a2f3f'); for (let y = z.y0 + 5, f = 0; y < z.y1 - 3; y += 8, f++) for (let x = (f & 1) * 6; x < W; x += 12) t.dibujo(x, y, ['b...b', 'bbkbb', 'b...b'], { b: c, k: acl(c, .3) }); },
    peludo(t, p, q, z) { for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x++) { const h = (x * 7 + y * 13) % 17; if (h === 0) t.px(x, y, p.h); else if (h === 5) t.px(x, y, p.s); } },
    borrega(t, p, q, z) { for (let y = z.y0 + 1; y < z.y1; y += 3) for (let x = (y / 3 & 1) * 2; x < W; x += 4) { t.px(x, y, p.s); t.px(x + 1, y + 1, p.s); t.px(x + 1, y - 1, p.l); } },
    satin(t, p, q, z) { for (let y = z.y0 + 3; y < z.y1 - 1; y++) { const c = z.cen(y); if (y % 7 !== 3) t.px(r(c - 5), y, p.l); if (y % 5 < 3) t.px(r(c - 4), y, p.l); if (y % 6 > 1) t.px(r(c + 4), y, p.l); } },
    mezclilla(t, p, q, z) { for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x++) if ((x + y * 2) % 7 === 0) t.px(x, y, p.l); },
    pana(t, p, q, z) { for (let x = 0; x < W; x += 2) t.vl(x, z.y0, z.y1, p.s); },
    encaje(t, p, q, z) { for (let y = z.y0; y < z.y1; y++) for (let x = 0; x < W; x++) if (((x + y) & 3) === 0 || ((x - y) & 3) === 0) t.px(x, y, p.s); },
  };
  // adornos al frente: uno por prenda
  function adorno(t, G, p, q, hem) {
    const { cc, yBusto, yHom } = G, y = r(yBusto + 2), c = col(q.c3 || q.c2 || '#d2485a');
    if (q.adorno === 'corazon') t.dibujo(cc - 3, y, ['.hh.hh.', 'hhhhhhh', 'hhhhhhh', '.hhhhh.', '..hhh..', '...h...'], { h: c });
    if (q.adorno === 'cerezas') for (const [x, yy] of [[-6, 0], [3, 4], [-3, 9], [5, -3]]) { t.px(cc + x, y + yy - 2, '#6aa884'); t.px(cc + x + 1, y + yy - 3, '#6aa884'); t.px(cc + x + 2, y + yy - 2, '#6aa884'); t.rect(cc + x - 1, y + yy - 1, 2, 2, c); t.rect(cc + x + 2, y + yy - 1, 2, 2, c); t.px(cc + x - 1, y + yy - 1, acl(c, .5)); t.px(cc + x + 2, y + yy - 1, acl(c, .5)); }
    if (q.adorno === 'numero') t.dibujo(cc - 5, y, ['nnnn.nnnn', 'n..n.n..n', 'n..n.nnnn', 'n..n.n..n', 'n..n.n..n', 'nnnn.nnnn'], { n: c });
    if (q.adorno === 'sol') { t.elipse(cc, y + 4, 4.4, 4.4, '#f6b36a'); t.hl(cc - 6, cc + 5, y + 5, '#e57f7a'); t.hl(cc - 7, cc + 6, y + 7, '#6f93c4'); t.hl(cc - 5, cc + 4, y + 9, '#6f93c4'); t.rect(cc - 5, y + 5, 10, 1, '#f58f7a'); }
    if (q.adorno === 'mono' || q.adorno === 'monoNegro') t.dibujo(cc - 6, y - 1, ['bb.......bb', 'bbbb...bbbb', 'bbbbbkbbbbb', 'bbbbbkbbbbb', 'bbb..k..bbb', '....b.b....', '...bb.bb...', '...b...b...'], { b: c, k: mix(c, '#ffffff', .35) });
    if (q.adorno === 'letras') t.dibujo(cc - 7, y, ['b...bb..b.b..b', 'b..b..b.bb.b.b'.replace('.b', 'b.'), 'bb..bb..b..bb.'], { b: c });
    if (q.adorno === 'botones') for (let yy = yHom + 6; yy < hem - 2; yy += 5) t.px(cc, r(yy), c);
    if (q.adorno === 'cierre') { t.vl(cc, yHom - 2, r(yBusto + 1), '#b9b3c4'); t.px(cc, r(yBusto + 2), ORO); }
  }
  function tela(L, G, p, q, y0, y1, cen, hem) {
    const z = { y0: r(y0), y1: r(y1), cen };
    L.encima(t => { for (const k of q.tela ? [].concat(q.tela) : []) TEJIDOS[k](t, p, q, z); if (q.adorno) adorno(t, G, p, q, hem === undefined ? y1 : hem); });
    return L;
  }

  /* ---------- arriba: bases, suéteres, sudaderas, cárdigans, abrigos ---------- */
  const LARGOS = G => ({ crop: G.yCint - 3, cintura: G.yCint + 3, cadera: G.yCad + 2, largo: G.yEntre + 4, tunica: G.yEntre + 11, abrigo: G.yRod - 4 });
  function lados(G, q, hem) {
    const { yBusto, yCint, yEntre } = G, e = q.e === undefined ? .9 : q.e, caja = q.caja || 0;
    const ext = y => e + caja * Math.max(0, 1 - Math.abs(y - yCint) / 16) * 2.4 + (y > yBusto ? (q.vuelo || 0) * (y - yBusto) / (hem - yBusto) : 0);
    return [
      y => y <= yEntre ? G.tI(y) - ext(y) : Math.min(G.tI(yEntre) - ext(yEntre), G.fI.i(y) - Math.max(1, e)),
      y => y <= yEntre ? G.tD(y) + ext(y) : Math.max(G.tD(yEntre) + ext(yEntre), G.fD.d(y) + Math.max(1, e)),
    ];
  }
  function escote(L, G, tipo) {
    const { cc, yHom, yBusto } = G, m = capa();
    if (tipo === 'redondo') m.elipse(cc, yHom - .6, 4.8, 3.6, 1);
    else if (tipo === 'amplio') m.elipse(cc, yHom, 6.6, 6, 1);
    else if (tipo === 'v') m.poli([[cc - 4.6, yHom - 3], [cc + 4.6, yHom - 3], [cc + .6, yHom + 8], [cc - .6, yHom + 8]], 1);
    else if (tipo === 'cuadrado') m.rect(cc - 6, 0, 12, yHom + 5, 1);
    else if (tipo === 'camisa') m.poli([[cc - 3, yHom - 2], [cc + 3, yHom - 2], [cc + .5, yHom + 6]], 1);
    if (tipo === 'v' || tipo === 'camisa') m.rect(cc - 4, 0, 8, yHom - 1, 1);
    L.quitar(m);
  }
  function cuelloAlto(G, p, doblado) {
    const { C, cc, yHom, yMenton } = G, fr = capa(), y0 = yMenton - (doblado ? 1 : 0);
    for (let y = y0; y <= yHom + 1; y++) fr.tramo(y, cc - C.cuello - 1.6 - (doblado ? .6 : 0), cc + C.cuello + 1.4 + (doblado ? .6 : 0), p.b);
    resorte(fr, y0, yHom + 1, p); fr.encima(t => t.hl(0, W, yHom - 1, p.l));
    return fr.contorno(p.o);
  }
  function capucha(G, p, cordon) {
    const { cc, yHom } = G, atras = capa(), fr = capa();
    atras.perfil(yHom - 10, yHom + 2, [[yHom - 10, cc - 7.5], [yHom - 5, cc - 10], [yHom + 2, cc - 10.5]], [[yHom - 10, cc + 7.5], [yHom - 5, cc + 10], [yHom + 2, cc + 10.5]], p.s); atras.contorno(p.o);
    fr.elipse(cc, yHom + 1.2, 8.6, 5.8, p.b);
    const m = capa(); m.elipse(cc, yHom - 2.2, 4.6, 5.6, 1); m.rect(0, 0, W, yHom - 3, 1); fr.quitar(m);
    fr.sombrear(0, 1, 1, p.b, p.s); fr.sombrear(-1, 0, 1, p.b, p.l); fr.contorno(p.o);
    if (cordon) { fr.vl(cc - 3, yHom + 6, yHom + 12, cordon); fr.vl(cc + 3, yHom + 6, yHom + 13, cordon); if (cordon !== 0) { fr.rect(cc - 4, yHom + 13, 2, 2, cordon); fr.rect(cc + 3, yHom + 14, 2, 2, cordon); } }
    return { atras, fr };
  }
  function arriba(G, c, q) {
    const p = rampa(c), { C, cc, yHom, yBusto, yCint, yEntre } = G, hem = r(LARGOS(G)[q.largo || 'cintura']), L = capa(), [iz, de] = lados(G, q, hem);
    const tir = q.escote === 'tirantes', caido = q.escote === 'caido', y0 = tir ? yBusto - 5 : caido ? yHom + 6 : yHom - 1.5;
    L.perfil(y0, hem, iz, de, p.b);
    if (q.hombreras || (q.caja && !tir && !caido)) L.perfil(yHom - 1.5, yHom + 12, borde([[yHom - 1.5, cc - 5], [yHom + 3, cc - C.hom - .4], [yHom + 12, cc - C.hom + 2]]), borde([[yHom - 1.5, cc + 5], [yHom + 3, cc + C.hom], [yHom + 12, cc + C.hom - 2]]), p.b);
    if (!tir && !caido) escote(L, G, q.escote || 'redondo');
    if (tir) { const m = capa(); m.elipse(cc, yBusto - 6, 4, 2.8, 1); L.quitar(m); }
    if (q.abierto) { const m = capa(); m.poli([[cc - 3.4, yHom - 3], [cc + 3.4, yHom - 3], [cc + 3, yBusto + 4], [G.cen(Math.min(hem, yEntre)) + 4, hem + 2], [G.cen(Math.min(hem, yEntre)) - 3, hem + 2], [cc - 3, yBusto + 4]], 1); L.quitar(m); }
    volumen(L, p, q.caja ? 2 : 1);
    tela(L, G, p, q, y0, hem, y => G.cen(Math.min(y, yEntre)), hem);
    if (q.resorte) resorte(L, hem - q.resorte, hem, p);
    if (q.bolsillos) L.encima(t => { const y = r(yCint + 5); t.hl(r(cc - C.busto - 1), cc - 5, y, p.d); t.hl(cc + 4, r(cc + C.busto), y, p.d); t.hl(r(cc - C.busto - 1), cc - 5, y + 1, p.l); t.hl(cc + 4, r(cc + C.busto), y + 1, p.l); });
    if (q.canguro) L.encima(t => { const x0 = r(G.cen(G.yCad)), by = r(yCint + 1), bh = Math.min(r(G.yCad + 3), hem - 4) - by; t.hl(x0 - 5, x0 + 5, by, p.d); t.linea(x0 - 5, by, x0 - 8, by + bh, p.d); t.linea(x0 + 5, by, x0 + 8, by + bh, p.d); t.hl(x0 - 8, x0 + 8, by + bh, p.d); });
    if (q.orilla) L.encima(t => { const o2 = col(q.orilla); for (let x = 0; x < W; x++) { t.px(x, hem - 1, o2); if (x & 1) t.px(x, hem - 2, o2); } if (tir) for (let x = 0; x < W; x++) for (let y = r(yBusto - 6); y < yBusto + 1; y++) if (!L.hay(x, y - 1) || (!L.hay(x, y - 2) && (x & 1))) t.px(x, y, o2); });
    if (q.peplum) L.encima(t => t.hl(0, W, r(yCint - 1), p.d));
    if (caido) L.encima(t => { for (let x = 0; x < W; x++) { const y = r(yHom + 6); t.px(x, y, p.l); t.px(x, y + 1, (x & 1) ? p.s : p.l); t.px(x, y + 2, (x & 1) ? p.s : p.l); t.px(x, y + 3, p.s); } });
    if (q.abierto) { L.encima(t => { for (let y = yHom - 1; y < hem; y++) { let a = -1; for (let x = cc - 8; x <= cc + 1; x++) if (L.hay(x, y) && !L.hay(x + 1, y)) a = x; if (a >= 0) t.px(a, y, q.solapa ? col(q.solapa) : p.s); let b = -1; for (let x = cc + 8; x >= cc; x--) if (L.hay(x, y) && !L.hay(x - 1, y)) b = x; if (b >= 0) t.px(b, y, q.solapa ? col(q.solapa) : p.l); } if (q.adorno === 'botones' || q.boton) for (let y = yHom + 8; y < hem - 2; y += 6) { let b = -1; for (let x = cc + 9; x >= cc; x--) if (L.hay(x, y) && !L.hay(x - 1, y)) b = x; if (b >= 0) t.px(b + 1, y, q.boton || '#fffaf2'); } }); }
    L.contorno(p.o);
    if (tir) for (const s of [-1, 1]) { const x = cc + s * 5 + (s > 0 ? -1 : 0); L.vl(x, yHom, r(yBusto - 5), p.s); }
    // mangas
    let mg = null, cubreB = 0;
    if (q.manga) {
      mg = capa(); cubreB = q.manga === 'corta' ? .5 : 1;
      for (const l of ['D', 'I']) {
        const eM = q.eManga === undefined ? Math.max(1.4, (q.e || 0) + .9) : q.eManga;
        const M = q.manga === 'corta' ? manga(G, l, eM, p, { hasta: .6, vuelo: .8 }) : manga(G, l, eM, p, { largo: q.mangaLargo === undefined ? .6 : q.mangaLargo, boca: q.boca || 0, puno: q.puno || 0 });
        if (caido) M.cada((x, y) => y < yHom + 6 ? null : undefined);
        volumen(M, p, 1);
        tela(M, G, p, { ...q, adorno: null }, yHom, G.yCad + 6, y => l === 'I' ? G.bI[1][0] : G.bD[1][0]);
        if (q.puno) { const a = l === 'I' ? G.bI : G.bD; M.encima(t => { const [qx, qy, qd] = a[2], [bx, by] = a[1], n = Math.hypot(qx - bx, qy - by), ux = (qx - bx) / n, uy = (qy - by) / n; t.tubo([[qx - ux * .4, qy - uy * .4, qd + 5], [qx + ux * 3, qy + uy * 3, qd + 5]], p.s); }); }
        if (caido) M.encima(t => { for (let x = 0; x < W; x++) { const y = r(yHom + 6); t.px(x, y, p.l); t.px(x, y + 1, (x & 1) ? p.s : p.l); t.px(x, y + 2, (x & 1) ? p.s : p.l); t.px(x, y + 3, p.s); } });
        M.contorno(p.o); mg.sobre(M);
      }
    }
    // cuello
    let fr = null, atras = null;
    if (q.cuello === 'alto' || q.cuello === 'doblado') fr = cuelloAlto(G, p, q.cuello === 'doblado');
    if (q.cuello === 'capucha') { const k = capucha(G, p, q.cordon === undefined ? (lum(c) > 215 ? p.s : col('#fffaf4')) : q.cordon); atras = k.atras; fr = k.fr; }
    if (q.cuello === 'camisa') { fr = capa(); for (const s of [-1, 1]) { const k = capa(); k.poli([[cc + s * 6, yHom - 1.5], [cc + s * 3.2, yHom - 2], [cc + s * .8, yHom + 5], [cc + s * 3, yHom + 6.4], [cc + s * 6.6, yHom + 2]], p.l); fr.sobre(k.contorno(p.o)); } }
    if (q.cuello === 'mono') { fr = capa(); const k = capa(); k.dibujo(cc - 6, yHom + 1, ['.bb.......bb', 'bbbb.....bbbb', 'bbbbbbkbbbbbb', '.bbb.bkb.bbb.', '....bb.bb....', '....bb.bb....', '...bb...bb...', '...bb...bb...', '...b.....b...'], { b: p.b, k: p.s }); k.sombrear(0, 1, 1, p.b, p.s); fr.sobre(k.contorno(p.o)); }
    if (q.cuello === 'peludo') { fr = capa(); const k = capa(), p2 = rampa(q.solapa || '#fff6ea'); for (const s of [-1, 1]) { k.tubo([[cc + s * 5.5, yHom - 1, 5], [cc + s * 5.4, yHom + 5, 5.4], [cc + s * 4.6, yHom + 12, 4]], p2.b); } volumen(k, p2, 1); TEJIDOS.borrega && k.encima(t => TEJIDOS.borrega(t, p2, q, { y0: r(yHom - 4), y1: r(yHom + 16) })); fr.sobre(k.contorno(p2.o)); }
    return { atras, cuerpo: L, mangas: mg, frente: fr, hem, yCuello: yHom + 2, aplasta: [yHom + 9, hem], cubre: { torso: q.abierto ? null : [r(tir ? yBusto - 1 : caido ? yHom + 10 : yHom + 9), Math.min(hem - 1, yEntre - 1)], piernas: hem > yEntre + 2 && !q.abierto ? [yEntre, hem - 1] : null, brazos: caido ? 0 : cubreB } };
  }

  /* ---------- abajo ---------- */
  function pantalon(G, c, q) {
    const p = rampa(c), { C, yCint, yEntre, yRod, yTob } = G, out = capa(), ytop = r(yCint + (q.tiro === undefined ? 2 : q.tiro)), corte = q.corte || 'recto';
    const yf = corte === 'ancho' || corte === 'campana' ? SUELO - 1 : corte === 'ajustado' ? yTob - 2 : yTob + 1;
    const extra = (f, y) => {
      const u = (y - yEntre) / (yf - yEntre), w = f.w(y);
      if (corte === 'ajustado') return 1;
      if (corte === 'recto') return Math.max(1.8, C.rod + 3.4 - w);
      if (corte === 'ancho') return Math.max(2.6, C.muslo + 2.4 + u * 1.5 - w);
      if (corte === 'campana') return y < yRod ? 1.6 : Math.max(1.6, entre(C.rod + 1.6, C.rod + 7, (y - yRod) / (yf - yRod)) - w);
      return y < yRod ? 2.4 : Math.max(2.4, C.rod + 2.6 - w);
    };
    for (const l of ['D', 'I']) {
      const f = l === 'I' ? G.fI : G.fD, L = capa();
      L.perfil(G.yCad - 1, yf, y => f.c(y) - f.w(y) / 2 - extra(f, y) / 2 - (l === 'I' ? .4 : 0), y => f.c(y) + f.w(y) / 2 + extra(f, y) / 2 + (l === 'D' ? .4 : 0), p.b);
      if (l === 'I') L.perfil(ytop, yEntre + 2, ex(G.tI, -.9), ex(G.tD, .9), p.b);
      volumen(L, p, corte === 'ajustado' ? 1 : 2);
      tela(L, G, p, q, ytop, yf, y => f.c(y));
      if (q.jeans) L.encima(t => { const x = r(l === 'I' ? f.d(yf - 4) : f.i(yf - 4)); t.hl(0, W, yf - 2, p.s); for (let y = yEntre + 12; y < yRod + 4; y++) if ((y + (l === 'I' ? 0 : 1)) % 3) t.px(r(f.c(y)), y, p.l); for (let y = yEntre + 14; y < yRod; y += 2) t.px(r(f.c(y)) - 1, y, p.l); void x; });
      if (q.puno) resorte(L, yf - 3, yf, p);
      L.encima(t => { const xk = r(f.c(yRod)); if (corte !== 'ajustado') { t.hl(xk - 2, xk + 1, yRod + 1, p.s); t.px(xk + 2, yRod, p.s); } });
      if (l === 'I') L.encima(t => {
        if (q.resorteCintura) { for (let x = 0; x < W; x++) { t.px(x, ytop, (x & 1) ? p.s : p.b); t.px(x, ytop + 1, (x & 1) ? p.s : p.b); } t.hl(0, W, ytop + 2, p.s); const x = r(G.cen(ytop)); t.px(x, ytop + 3, p.l); t.px(x - 1, ytop + 4, p.l); t.px(x + 1, ytop + 4, p.l); }
        else { t.hl(0, W, ytop + 3, p.s); const x = r(G.cen(ytop + 4)); t.vl(x, ytop + 4, ytop + 9, p.s); t.px(x, ytop + 1, q.jeans ? ORO : p.d); if (q.jeans) { t.linea(x - 8, ytop + 4, x - 5, ytop + 8, p.s); t.linea(x + 8, ytop + 4, x + 5, ytop + 8, p.s); } }
        if (q.cinturon) { t.rect(0, ytop, W, 3, q.cinturon); t.rect(r(G.cen(ytop)) - 1, ytop, 3, 3, ORO); }
      });
      L.contorno(p.o); out.sobre(L);
    }
    E.util.sinCostura(out, G, p);
    return { cuerpo: out, cubre: { torso: [ytop + 1, yEntre - 1], piernas: [yEntre, Math.min(yf - 1, yTob - 3)] } };
  }
  function corto(G, c, q) {
    const p = rampa(c), { yCint, yEntre } = G, L = capa(), y1 = yEntre + (q.alto || 9), ytop = r(yCint + 2), e = q.e || 1;
    L.perfil(ytop, yEntre + 1, ex(G.tI, -.9), ex(G.tD, .9), p.b);
    L.perfil(G.yCad - 1, y1, y => G.fI.i(y) - e - (y - yEntre) * .12, ex(G.fI.d, .4), p.b);
    L.perfil(G.yCad - 1, y1, ex(G.fD.i, -.2), y => G.fD.d(y) + e + (y - yEntre) * .12, p.b);
    volumen(L, p, 1); tela(L, G, p, q, ytop, y1, y => G.cen(Math.min(y, yEntre)));
    L.encima(t => { t.hl(0, W, ytop + 3, p.s); t.vl(r(G.pc), yEntre - 2, r(y1), p.s); if (q.jeans) { t.px(r(G.cen(ytop)), ytop + 1, ORO); t.vl(r(G.cen(ytop)), ytop + 4, ytop + 8, p.s); for (let x = 0; x < W; x += 2) t.px(x, r(y1) - 1, p.h); } if (q.orilla) { t.hl(0, W, r(y1) - 1, q.orilla); for (let x = 0; x < W; x += 2) t.px(x, r(y1) - 2, q.orilla); } if (q.resorteCintura) { for (let x = 0; x < W; x += 2) { t.px(x, ytop, p.s); t.px(x, ytop + 1, p.s); } const x = r(G.cen(ytop)); t.px(x - 1, ytop + 4, p.l); t.px(x + 1, ytop + 4, p.l); t.px(x, ytop + 3, p.l); } });
    L.contorno(p.o);
    return { cuerpo: L, cubre: { torso: [ytop + 1, yEntre - 1], piernas: [yEntre, r(y1) - 2] } };
  }
  function falda(G, c, q) {
    const p = rampa(c), { C, pc, yCint, yCad, yEntre, yRod } = G, L = capa(), y0 = r(yCint - 1), forma = q.forma || 'plisada';
    const hem = q.largo === 'midi' ? yRod + 14 : yEntre + (q.alto || 13), v = forma === 'tubo' ? 1.2 : forma === 'recta' ? 2 : forma === 'holanes' ? 6 : 4.6;
    const hw = C.cadera + v;
    const iz = borde([[y0, G.cen(yCint) - C.cintura - .8], [yCad - 3, pc - C.cadera - 1.5], [hem, pc - hw - .6]]), de = borde([[y0, G.cen(yCint) + C.cintura + .8], [yCad - 1, pc + C.cadera + 1.4], [hem, pc + hw]]);
    L.perfil(y0, hem, iz, de, p.b);
    const n = Math.max(6, r(hw * 2 / 3.6));
    if (forma === 'plisada') L.encima(t => { for (let k = 1; k < n; k++) { const u = k / n, xa = G.cen(yCint) - C.cintura + u * C.cintura * 2, xb = pc - hw + u * hw * 2; t.linea(xa, y0 + 3, xb, hem, p.s); t.linea(xa + 1, y0 + 6, xb + 1, hem, k % 2 ? p.l : p.b); } });
    if (forma === 'campana' || forma === 'midi') L.encima(t => { for (let k = 1; k < 6; k++) { const xb = pc - hw + k / 6 * hw * 2; t.linea(G.cen(yCint) - C.cintura + k / 6 * C.cintura * 2, y0 + 8, xb, hem, k % 2 ? p.s : p.l); } });
    volumen(L, p, 2); tela(L, G, p, q, y0 + 2, hem, y => G.cen(Math.min(y, yEntre)));
    if (forma === 'holanes') L.encima(t => { const pasos = 3; for (let i = 1; i <= pasos; i++) { const y = r(y0 + 3 + (hem - y0 - 3) * i / pasos); for (let x = 0; x < W; x++) { const k = [0, 0, 1, 1][x & 3]; if (i < pasos) { t.px(x, y - 1 + k, p.d); t.px(x, y + k, p.l); } if (!(x & 3)) t.vl(x, y - 4, y - 2, p.s); } } });
    if (q.orilla) L.encima(t => { for (let x = 0; x < W; x++) { t.px(x, hem - 1, q.orilla); t.px(x, hem - 2, (x & 1) ? q.orilla : p.s); } });
    L.encima(t => { t.rect(0, y0, W, 2, p.b); t.hl(0, W, y0 + 2, p.s); if (q.botones) for (let y = y0 + 5; y < hem - 2; y += 5) t.px(r(G.cen(Math.min(y, yEntre))), y, q.botones); });
    if (forma === 'plisada' || forma === 'holanes') for (let k = 0; k < n; k++) { const xb = r(pc - hw + (k + .5) / n * hw * 2); if (k % 2) L.px(xb, r(hem) - 1, 0); }
    L.contorno(p.o);
    return { cuerpo: L, hem, cubre: { torso: [y0 + 1, yEntre - 1], piernas: [yEntre, Math.min(hem - 3, yRod + 10)] } };
  }
  // vestido: blusa y falda en una sola prenda
  function vestido(G, c, q) {
    const p = rampa(c), a = arriba(G, c, { ...q.arriba, largo: 'cintura' }), f = falda(G, c, q.falda), L = capa();
    L.sobre(a.cuerpo); L.sobre(f.cuerpo);
    const y = r(G.yCint - 1);
    L.encima(t => { for (let x = 0; x < W; x++) for (let yy = y - 1; yy <= y + 4; yy++) if (L.get(x, yy) === p.o && L.hay(x - 1, yy) && L.hay(x + 1, yy) && L.hay(x, yy - 1) && L.hay(x, yy + 1)) t.px(x, yy, p.s); if (q.cinta) { t.rect(0, y, W, 2, q.cinta); t.dibujo(r(G.cen(y)) - 3, y - 1, ['bb.bb', 'bbbbb', 'bb.bb', '.b.b.', 'b...b'], { b: q.cinta }); } });
    return { cuerpo: L, mangas: a.mangas, frente: a.frente, atras: a.atras, yCuello: G.yHom + 2, cubre: { torso: [a.cubre.torso[0], G.yEntre - 1], piernas: f.cubre.piernas, brazos: a.cubre.brazos } };
  }
  // pijama: camisa o cami con pantalón o short, en un conjunto
  function conjunto(G, c, q) {
    const a = arriba(G, c, q.arriba), b = (q.abajo.short ? corto : pantalon)(G, c, q.abajo), L = capa();
    L.sobre(b.cuerpo); L.sobreConSombra(a.cuerpo, 1, .16);
    return { cuerpo: L, mangas: a.mangas, frente: a.frente, atras: a.atras, yCuello: G.yHom + 2, cubre: { torso: [a.cubre.torso[0], G.yEntre - 1], piernas: b.cubre.piernas, brazos: a.cubre.brazos } };
  }

  /* ---------- piernas ---------- */
  function calceta(G, c, q) {
    const p = rampa(c), { yRod, yTob } = G, out = capa(), top = r({ tobillo: yTob - 5, media: yRod + 14, alta: yRod + 6, sobre: yRod - 9 }[q.altura || 'media']), e = q.e || .6;
    for (const l of ['D', 'I']) {
      const f = l === 'I' ? G.fI : G.fD, L = capa();
      L.perfil(top, yTob + 1, ex(f.i, -e), ex(f.d, e), p.b);
      (l === 'I' ? pieI : pieD)(L, G, p.b, .4);
      volumen(L, p, 1); tela(L, G, p, q, top, yTob, y => f.c(y));
      if (q.aguada) L.encima(t => { for (let y = top + 3; y < yTob; y += 3) { t.hl(0, W, y, p.s); t.hl(0, W, y + 1, p.l); } });
      if (q.holan) L.encima(t => { for (let x = 0; x < W; x++) { t.px(x, top, p.h); t.px(x, top + 1, (x & 1) ? p.s : p.l); t.px(x, top + 2, p.s); } });
      else { resorte(L, top, top + 2, p); L.encima(t => t.hl(0, W, top + 3, p.s)); }
      if (q.mono) L.encima(t => { const x = r(f.c(top)); t.dibujo(x - 2, top + 1, ['b...b', 'bbkbb', 'b...b'], { b: q.mono, k: '#ffffff' }); });
      L.contorno(p.o);
      if (q.holan) for (let x = 0; x < W; x++) if (L.hay(x, top - 1) && (x & 1)) L.px(x, top - 1, 0);
      out.sobre(L);
    }
    return { cuerpo: out, cubre: { piernas: [top + 1, yTob - 1] } };
  }
  // medias transparentes: se mezclan con su piel
  function medias(G, c, q, o) {
    const sk = BB.PIELES[o.piel], k = q.opaca || .7, t0 = { h: mix(sk.l, c, k * .8), l: mix(sk.l, c, k * .9), b: mix(sk.b, c, k), s: mix(sk.s, c, k + .08), d: mix(sk.d, c, k + .1), o: mix(sk.o, c, .6) }, { yEntre, yTob } = G, out = capa();
    for (const l of ['D', 'I']) {
      const f = l === 'I' ? G.fI : G.fD, L = capa();
      L.perfil(yEntre - 3, yTob + 1, ex(f.i, -.1), ex(f.d, .1), t0.b); (l === 'I' ? pieI : pieD)(L, G, t0.b);
      volumen(L, t0, G.C.rod >= 6 ? 2 : 1);
      if (q.patron === 'puntos') L.encima(t => { for (let y = yEntre + 2, i = 0; y < yTob; y += 4, i++) for (let x = (i & 1) * 2; x < W; x += 4) t.px(x, y, t0.d); });
      if (q.patron === 'encaje') L.encima(t => { for (let y = yEntre - 2; y < SUELO; y++) for (let x = 0; x < W; x++) { const a = (x + y) % 6, b = (x - y + 600) % 6; if (a === 0 || b === 0) t.px(x, y, t0.d); else if (a === 3 && b === 3) t.px(x, y, c); } });
      L.contorno(t0.o); out.sobre(L);
    }
    return { cuerpo: out, cubre: { piernas: [yEntre + 1, yTob] } };
  }
  function calentador(G, c, q) {
    const p = rampa(c), { yRod, yTob } = G, out = capa(), top = yRod + (q.alto || 8), y1 = yTob + 1;
    for (const l of ['D', 'I']) {
      const f = l === 'I' ? G.fI : G.fD, L = capa();
      L.perfil(top, y1, y => f.i(y) - 1.2 - Math.max(0, (y - y1 + 12) / 12) * 1.4, y => f.d(y) + 1.2 + Math.max(0, (y - y1 + 12) / 12) * 1.4, p.b);
      L.encima(t => { for (let x = 0; x < W; x += 2) t.vl(x, top, y1, p.s); for (let y = top + 6; y < y1 - 1; y += 5) { t.hl(0, W, y, p.d); t.hl(0, W, y + 1, p.l); } });
      L.sombrear(1, 0, 1, p.b, p.s); L.sombrear(-1, 0, 1, p.b, p.l); L.contorno(p.o); out.sobre(L);
    }
    return { cuerpo: out, cubre: { piernas: [top + 1, y1 - 1] } };
  }

  /* ---------- calzado ---------- */
  function zapato(G, c, q) {
    const p = rampa(c), out = capa(), k = G.C.tob / 4, sue = rampa(q.suela || mix(c, '#3d2a45', .25)), t2 = q.c2 && rampa(q.c2), { yTob, yRod } = G;
    for (const l of ['D', 'I']) {
      const f = l === 'I' ? G.fI : G.fD, L = capa(), e = q.e === undefined ? .6 : q.e, x0 = r(l === 'I' ? G.aI : G.aD + 4.4 * k), g = q.plataforma || 0;
      const caña = q.cana ? { tobillo: yTob - 5, media: yRod + 16, alta: yRod + 4 }[q.cana] : null;
      if (caña) L.perfil(caña, yTob + 1, ex(f.i, -(q.eCana || 1.1)), ex(f.d, q.eCana || 1.1), p.b);
      (l === 'I' ? pieI : pieD)(L, G, p.b, e);
      if (!caña && q.corte) L.cada((x, y) => y < SUELO - (l === 'I' ? q.corte : q.corte - 1) ? null : undefined);
      if (q.escotado) { if (l === 'I') { for (let x = -2; x <= 2; x++) L.px(r(G.aI) + x, SUELO - q.corte, 0); for (let x = -1; x <= 1; x++) L.px(r(G.aI) + x, SUELO - q.corte + 1, 0); } else for (let x = -1; x <= 2; x++) L.px(r(G.aD) + x, SUELO - q.corte + 1, 0); }
      volumen(L, p, 1);
      tela(L, G, p, q, caña || yTob - 3, SUELO - 1, y => f.c(Math.min(y, yTob)));
      L.encima(t => {
        t.hl(0, W, SUELO - 1, sue.b); for (let y = 0; y < g; y++) t.hl(0, W, SUELO - 1 - y, y === g - 1 ? sue.l : sue.b);
        if (q.franja && t2) { t.linea(x0 - 1, SUELO - 4, x0 + 1, SUELO - 2, t2.b); t.linea(x0 + 1, SUELO - 4, x0 + 3, SUELO - 2, t2.b); t.hl(x0 - 2, x0 + 1, SUELO - 5, '#ffffff'); }
        if (q.agujetas) for (let y = yTob - 2; y < SUELO - 3; y += 2) t.hl(r(l === 'I' ? G.aI - 1 : G.aD + 1), r(l === 'I' ? G.aI + 1 : G.aD + 3), y, q.agujetas);
        if (q.peludo && caña) for (let x = 0; x < W; x++) { t.px(x, caña, t2.b); t.px(x, caña + 1, (x & 1) ? t2.b : t2.s); }
        if (q.hebilla) { t.hl(0, W, yTob - 2, p.d); t.px(r(f.c(yTob - 2)) + 1, yTob - 2, ORO); }
        if (caña && q.cana === 'alta') { t.hl(0, W, caña + 1, p.s); for (let y = caña + 4; y < yTob - 5; y++) if (y % 11) t.px(r(f.i(y)), y, p.l); t.hl(0, W, yTob - 1, p.s); }
        if (q.puntera) { if (l === 'I') t.hl(x0 - 3, x0 + 3, SUELO - 2, t2 ? t2.b : p.l); else t.hl(x0 + 2, x0 + 8, SUELO - 2, t2 ? t2.b : p.l); }
      });
      L.contorno(p.o);
      if (q.tacon) { const a = l === 'I' ? G.aI : G.aD - 1.4; L.rect(r(a) - (l === 'I' ? 0 : 2), SUELO - 1, 2, 2, sue.o); }
      if (q.correa) { const xa = l === 'I' ? r(G.aI) : r(G.aD + 1); L.hl(xa - 3, xa + 2, SUELO - 5, p.o); L.hl(xa - 2, xa + 2, SUELO - 4, p.b); L.px(xa + 2, SUELO - 4, ORO); }
      if (q.mono) { const m = rampa(q.mono), x = l === 'I' ? r(G.aI) : r(G.aD + 5.4 * k); L.dibujo(x - 2, SUELO - 5, ['b...b', 'bbkbb', 'b...b'], { b: m.b, k: m.l }); }
      out.sobre(L);
    }
    return { cuerpo: out };
  }
  // sandalias: suela que asoma y tiras sobre el pie
  function sandalia(G, c, q) {
    const p = rampa(c), L = capa(), k = G.C.tob / 4, sue = rampa(q.suela || '#f3e3cf'), g = q.plataforma || 1, xi = G.aI, xd = G.aD + .2;
    for (let y = 0; y < g; y++) { L.tramo(SUELO - y, xi - 4.2 * k, xi + 4.4 * k, y === g - 1 && g > 1 ? sue.l : sue.b); L.tramo(SUELO - y, xd - G.C.tob / 2 - 1.6, xd + 9.6 * k, y === g - 1 && g > 1 ? sue.l : sue.b); }
    L.contorno(sue.o);
    const T = capa();
    if (q.tipo === 'ancha') { T.perfil(SUELO - 6, SUELO - 2, [[SUELO - 6, xi - 3.2 * k], [SUELO - 2, xi - 4.2 * k]], [[SUELO - 6, xi + 3.4 * k], [SUELO - 2, xi + 4.4 * k]], p.b); T.poli([[xd - .4, SUELO - 7], [xd + 4.4 * k, SUELO - 5.6], [xd + 6.4 * k, SUELO - 2], [xd + .4, SUELO - 2]], p.b); }
    else { T.perfil(SUELO - 4.6, SUELO - 2.6, [[SUELO - 4.6, xi - 3.4 * k], [SUELO - 2.6, xi - 3.9 * k]], [[SUELO - 4.6, xi + 3.4 * k], [SUELO - 2.6, xi + 4 * k]], p.b); T.perfil(G.yTob - 1, G.yTob + 1, ex(G.fI.i, -.4), ex(G.fI.d, .4), p.b); T.poli([[xd + 3.4 * k, SUELO - 5.2], [xd + 5 * k, SUELO - 4.6], [xd + 6 * k, SUELO - 2], [xd + 3.8 * k, SUELO - 2]], p.b); T.perfil(G.yTob - 1, G.yTob + 1, ex(G.fD.i, -.4), ex(G.fD.d, .4), p.b); }
    volumen(T, p, 1); if (q.tela) tela(T, G, p, q, SUELO - 8, SUELO, () => xi); T.contorno(p.o); L.sobre(T);
    if (q.mono) { const m = rampa(q.mono); L.dibujo(r(xi) - 2, SUELO - 6, ['b...b', 'bbkbb', 'b...b'], { b: m.b, k: m.l }); L.dibujo(r(xd + 3.4 * k) - 2, SUELO - 6, ['b...b', 'bbkbb', 'b...b'], { b: m.b, k: m.l }); }
    if (q.tacon) { L.rect(r(xd) - 2, SUELO - 1, 2, 2, p.o); L.rect(r(xi) + 1, SUELO - 1, 2, 2, p.o); }
    return { cuerpo: L };
  }

  /* ---------- accesorios ---------- */
  const solo = fn => (G, c, q, o) => { const L = capa(); fn(L, G, rampa(c), q, o || {}, c); return { cuerpo: L }; };
  const ACC = {
    pinza: solo((L, G, p) => { const x = G.cx + 5, y = G.y0 + 1; L.dibujo(x, y, ['bbbbb', 'blbbb', 'b.b.b'], { b: p.b, l: p.h }); L.contorno(p.o); }),
    monoPelo: solo((L, G, p, q, o, c) => E.mono(L, G.cx - 8, G.y0 - 6 - (['chongo', 'topknot'].includes(o.pelo) ? 1 : 0), c)),
    aretes: solo((L, G, p) => { const { cx, y0 } = G; for (const x of [cx - 13, cx + 11]) { L.px(x, y0 + 17, ORO); L.px(x, y0 + 18, p.b); L.px(x, y0 + 19, p.l); L.px(x + 1, y0 + 19, p.s); } }),
    cadenita: solo((L, G, p) => { const { cc, yHom } = G; L.pts([[cc - 4, yHom], [cc - 3, yHom + 1], [cc - 2, yHom + 2], [cc - 1, yHom + 3], [cc + 1, yHom + 3], [cc + 2, yHom + 2], [cc + 3, yHom + 1], [cc + 3, yHom]], p.b); L.px(cc, yHom + 3, p.s); L.px(cc, yHom + 4, p.h); }),
    perlas: solo((L, G, p) => { const { cc, yHom } = G; L.pts([[cc - 4, yHom - 1], [cc - 3, yHom + 1], [cc - 1, yHom + 2], [cc + 1, yHom + 2], [cc + 3, yHom], [cc + 3, yHom - 1]], p.h); L.pts([[cc - 4, yHom], [cc - 2, yHom + 1], [cc, yHom + 2], [cc + 2, yHom + 1]], p.s); }),
    pulsera: solo((L, G, p) => { for (const b of [G.bD, G.bI]) { const [x, y, d] = b[2], w = d / 2; L.hl(r(x - w), r(x + w - 1), r(y - 1), p.b); L.px(r(x), r(y), p.h); } }),
    anillos: solo((L, G, p) => { const [x, y] = G.bD[2]; L.px(r(x - 1), r(y + 5), p.b); L.px(r(x + 1), r(y + 5), p.h); const [a, b] = G.bI[2]; L.px(r(a + 2), r(b), p.b); }),
    tobillera: solo((L, G, p) => { for (const f of [G.fI]) { const y = r(G.yTob - 3); for (let x = Math.ceil(f.i(y) - .5); x <= Math.ceil(f.d(y) - .5) - 1; x++) L.px(x, y + ((x & 1) ? 0 : 0), (x & 1) ? p.b : p.s); L.px(r(f.c(y)), y + 1, p.h); } }),
    anilloPie: solo((L, G, p) => { const x = r(G.aI); L.px(x - 2, SUELO - 3, p.b); L.px(r(G.aD + 6 * G.C.tob / 4), SUELO - 3, p.b); }),
    bolsa: solo((L, G, p, q, o, c) => {
      const [mx, my] = G.bD[2], x = r(mx - 6), y = r(my + 8);
      L.rect(x + 1, y, 11, 9, p.b); L.rect(x, y + 1, 13, 7, p.b); L.sombrear(1, 0, 2, p.b, p.s); L.sombrear(0, 1, 1, p.b, p.s);
      L.encima(t => { t.rect(x, y, 13, 3, p.l); t.hl(x + 3, x + 9, y + 3, p.l); t.hl(x + 1, x + 3, y + 1, p.h); t.px(x + 6, y + 4, ORO); t.px(x + 6, y + 5, ORO); if (q.acolchada) for (let j = 4; j < 9; j++) for (let i = 0; i < 13; i++) if ((i + j) % 4 === 0 || (i - j + 40) % 4 === 0) t.px(x + i, y + j, p.s); });
      L.contorno(p.o);
      for (let i = 0; i < 4; i++) { L.px(x + 3, y - 1 - i, i & 1 ? ORO : p.o); L.px(x + 9, y - 1 - i, i & 1 ? ORO : p.o); } L.hl(x + 4, x + 8, y - 5, ORO);
      L.dibujo(x + 9, y + 2, ['m.m', '.m.', 'm.m'], { m: '#fffaf2' });
    }),
    lentes: solo((L, G, p, q) => { const { cx, y0 } = G, y = y0 + 12; for (const x of [cx - 8, cx + 1]) { L.hl(x + 1, x + 4, y, p.b); L.hl(x + 1, x + 4, y + 5, p.b); L.vl(x, y + 1, y + 4, p.b); L.vl(x + 5, y + 1, y + 4, p.b); L.px(x + 1, y + 1, '#ffffff'); if (q.sol) L.rect(x + 1, y + 1, 4, 4, mix(p.b, '#8f6a86', .4)); } L.hl(cx - 2, cx, y + 2, p.b); L.hl(cx - 10, cx - 9, y + 1, p.b); L.hl(cx + 7, cx + 9, y + 1, p.b); }),
    boina: solo((L, G, p) => { const { cx, y0 } = G; L.elipse(cx + 1.5, y0 + 1.4, 14.4, 5.6, p.b); L.elipse(cx + 3, y0 - 1.6, 11, 4.4, p.b); L.rect(cx - 9, y0 + 4, 19, 2, p.b); volumen(L, p, 2); L.encima(t => { for (let x = cx - 9; x < cx + 11; x += 2) t.vl(x, y0 + 5, y0 + 6, p.s); TEJIDOS.peludo(t, p, {}, { y0: y0 - 7, y1: y0 + 4 }); }); L.contorno(p.o); L.px(cx + 3, y0 - 7, p.b); L.px(cx + 3, y0 - 8, p.o); }),
  };

  const conCubre = (fn, cubre) => (G, c, q, o) => { const v = fn(G, c, o); v.cubre = cubre(G); v.yCuello = G.yHom + 2; return v; };
  BB.VESTIR = {
    arriba, pantalon, corto, falda, vestido, conjunto, calceta, medias, calentador, zapato, sandalia, ...ACC,
    // los dibujos aprobados en la prueba de arte, tal cual
    hoodie: conCubre(PRENDAS.hoodie, G => ({ torso: [G.yHom + 9, G.yEntre - 1], piernas: [G.yEntre, G.yEntre + 3], brazos: 1 })),
    sueterHombro: conCubre(PRENDAS.sueter, G => ({ torso: [G.yHom + 12, G.yCint], brazos: 0 })),
    vestidoPunto: conCubre(PRENDAS.vestido, G => ({ torso: [G.yHom + 9, G.yEntre - 1], piernas: [G.yEntre, G.yEntre + 11], brazos: 1 })),
    pants: conCubre(PRENDAS.pants, G => ({ torso: [G.yCint + 6, G.yEntre - 1], piernas: [G.yEntre, G.yTob - 2] })),
    faldaPlisada: conCubre(PRENDAS.falda, G => ({ torso: [G.yCint, G.yEntre - 1], piernas: [G.yEntre, G.yEntre + 10] })),
    calcetasAltas: conCubre(PRENDAS.calcetas, G => ({ piernas: [G.yRod + 8, G.yTob - 1] })),
    chanclas: conCubre(PRENDAS.chanclas, () => ({})), flats: conCubre(PRENDAS.flats, () => ({})), pantuflas: conCubre(PRENDAS.pantuflas, () => ({})),
    botasAltas: conCubre(PRENDAS.botas, G => ({ piernas: [G.yRod + 6, G.yTob - 1] })),
    pijamaSatin(G, c, q, o) { const a = PRENDAS.shortPijama(G, c, o), b = PRENDAS.pijama(G, c, o), L = capa(); L.sobre(a.cuerpo); L.sobreConSombra(b.cuerpo, 1, .16); return { cuerpo: L, mangas: b.mangas, frente: b.frente, yCuello: G.yHom + 2, cubre: { torso: [G.yHom + 9, G.yEntre - 1], piernas: [G.yEntre, G.yEntre + 6], brazos: .5 } }; },
  };
  // miniatura de un artículo: la prenda sola, recortada a su tamaño
  const Gm = () => E.rig('promedio', 'media');
  BB.miniatura = function (id, color) {
    const d = BB.CATALOGO[id];
    if (d.icono) { const p = rampa(color), L = new BB.Capa(16, 16), f = d.icono, m = Math.max(...f.map(s => s.length)); L.dibujo(Math.floor((16 - m) / 2), Math.floor((16 - f.length) / 2), f, { b: p.b, l: p.l, h: p.h, s: p.s, o: p.o, d: p.d, g: ORO, w: PERLA }); return L; }
    const v = BB.VESTIR[d.dibujo](Gm(), color, d.q || {}, { ...BB.APARIENCIA }), L = capa();
    for (const k of ['atras', 'cuerpo', 'mangas', 'frente']) if (v[k]) L.sobre(v[k]);
    let a = W, b = -1, y0 = L.h, y1 = -1;
    for (let y = 0; y < L.h; y++) for (let x = 0; x < W; x++) if (L.hay(x, y)) { a = Math.min(a, x); b = Math.max(b, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return L.recorte(a, y0, b - a + 1, y1 - y0 + 1);
  };
  BB.TEJIDOS = TEJIDOS;
})(typeof globalThis !== 'undefined' ? globalThis : this);
