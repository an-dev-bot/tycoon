/* Su ciudad: el mapa (se toca un lugar y ella camina directo adentro) y cada lugar por dentro, que también se toca. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, $$ } = BB.I, U = BB.UI, { el, boton, botonI, nota } = U, E = BB.ECO, L = BB.L, P = BB.P, A = BB.app, ui = A.ui, doc = root.document;
  const MW = 160, MH = 200, LW = 160, LH = 184;
  const cargando = (w, h) => P.con('ciudad', w, h, () => { setTimeout(() => A.dibuja()); return el('div', 'hueco'); });
  const sitio = (p, c, e) => { c.style.left = Math.round(p[0] - 7.5) * e + 'px'; c.style.top = Math.round(p[1] - 32) * e + 'px'; };
  const pasos = v => [0, 1, 2, 3].map(i => U.aLienzo(BB.CIUDAD.caminante(v, i)));

  /* ---------- caminar ---------- */
  function camina(de, a, luego) {
    const caja = doc.querySelector('.escena.mapa .encima'); if (!caja || U.ocupada) return luego();
    U.ocupada = true; U.cierraHoja();
    const e = caja._e, s = A.s, cuadros = pasos(L.vista(s)), c = caja.querySelector('.camina'), freno = el('div', 'freno'), pts = BB.CIUDAD.camino(de, a), lar = []; let total = 0;
    freno.setAttribute('role', 'status'); freno.setAttribute('aria-label', T('camina')); doc.body.append(freno); caja.classList.add('andando');
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lar.push(d); total += d; }
    const ms = root.BB_RAPIDO ? 10 : U.menosMov.matches ? 600 : Math.max(900, Math.min(1700, total * 9)), x = c.getContext('2d'), t0 = performance.now();
    const fin = () => { U.ocupada = false; freno.remove(); caja.classList.remove('andando'); luego(); };
    const cuadro = t => {
      const f = Math.min(1, (t - t0) / ms); let r = f * total, i = 0; while (i < lar.length - 1 && r > lar[i]) { r -= lar[i]; i++; } const k = lar[i] ? Math.min(1, r / lar[i]) : 1, A0 = pts[i], B0 = pts[i + 1];
      if (U.menosMov.matches) { sitio(f < .5 ? pts[0] : pts[pts.length - 1], c, e); } else { x.clearRect(0, 0, c.width, c.height); x.drawImage(cuadros[Math.floor(f * total / 5) & 3], 0, 0); sitio([A0[0] + (B0[0] - A0[0]) * k, A0[1] + (B0[1] - A0[1]) * k], c, e); }
      if (f < 1 && c.isConnected) requestAnimationFrame(cuadro); else fin();
    };
    requestAnimationFrame(cuadro);
  }
  // ir a un lugar: se revisa que se pueda, se ve el mapa, camina y entra
  P.viaja = lugar => {
    const s = A.s, de = s.lugar; if (U.ocupada) return; const r = L.ir(L.copia(s), lugar); if (!r.ok) { U.aviso(T(r.error)); return; }
    const llega = () => P.hace(L.ir(A.s, lugar), () => { ui.mapa = false; if (lugar === 'casa') { ui.tab = 'casa'; ui.decorar = false; } else ui.tab = 'ciudad'; });
    if (!BB.CIUDAD) { P.actua(T('act_viaje'), 'ciudad', q => L.ir(q, lugar), () => { ui.mapa = false; ui.tab = lugar === 'casa' ? 'casa' : 'ciudad'; }); return; }
    if (!doc.querySelector('.escena.mapa .encima')) { ui.tab = 'ciudad'; ui.mapa = true; A.dibuja(true); }
    camina(de, lugar, llega);
  };
  P.ciudad = () => {
    const s = A.s, noche = L.esNoche(s);
    if (s.lugar !== 'casa' && !ui.mapa) return lugar(s, noche);
    const entra = id => { if (s.lugar !== id) return P.viaja(id); if (id === 'casa') A.tab('casa'); else { ui.mapa = false; A.dibuja(true); } };
    const mapa = BB.CIUDAD ? U.escena2(MW, MH, e => {
      const r = [U.escena('mapa' + noche, () => BB.CIUDAD.mapa({ noche }), e)];
      for (const id in BB.CIUDAD.LUGARES) { const q = BB.CIUDAD.LUGARES[id], b = U.toca({ k: id, x: q.x - 2, y: q.y - 4, w: q.w + 4, h: q.h + 10 }, e, MW, MH, { nombre: T('l_' + id), fn: () => entra(id), cls: 'lugar' + (s.lugar === id ? ' on' : '') }); b.dataset.k = 'l' + id; b.append(el('span', '', T('l_' + id))); r.push(b); }
      const c = doc.createElement('canvas'); c.width = 15; c.height = 34; c.className = 'px cosa camina'; c.style.width = 15 * e + 'px'; c.style.height = 34 * e + 'px'; c.setAttribute('aria-hidden', 'true'); c.getContext('2d').drawImage(pasos(L.vista(s))[0], 0, 0); const p = BB.CIUDAD.camino(s.lugar, s.lugar)[0]; sitio(p, c, e); r.push(c);
      return r;
    }) : cargando(320, 400);
    if (BB.CIUDAD) { mapa.classList.add('mapa'); const m = mapa._mide; mapa._mide = () => { m(); const c = mapa.firstElementChild; if (c) c._e = parseFloat(c.style.width) / MW; }; }
    return el('div', 'hoja cuadro', el('div', 'fila nav', el('b', 'crece', T('aqui') + ': ' + T('l_' + s.lugar)), s.lugar !== 'casa' ? botonI('regresar', T('ver_lugar'), () => { ui.mapa = false; A.dibuja(true); }, 'bt', { k: 'verlugar' }) : el('small', '', T('viaje_h'))), mapa);
  };

  /* ---------- adentro de cada lugar ---------- */
  const compra = k => P.actua(T('act_super'), k, q => L.surtir(q, k)), pide = k => P.actua(T('act_' + k), k, q => L.comer(q, k));
  const salon = k => { ui.prev = null; ui.pruebaUnas = false; U.hoja(T('salon_' + k), () => P[k](), { alta: true }); };
  const catalogo = () => U.hoja(T('l_tienda'), () => P.catalogo('tienda'), { alta: true });
  const bazar = () => U.hoja(T('l_bazar'), () => { const s = A.s; return [nota(T('bazar_cambia', { n: Math.max(1, E.bazar.dias - (s.dia - s.bazar.dia)) })), s.bazar.piezas.length ? el('div', 'rejilla tres', s.bazar.piezas.map(p => P.mosaico('ropa', p.id, p.color, { sub: $$(p.precio), k: 'b' + p.n, fn: () => P.ficha(p.id, { donde: 'bazar', n: p.n, color: p.color, precio: p.precio }) }))) : nota(T('bazar_vacio'))]; }, { alta: true });
  const trabaja = () => U.hoja(T('app_trabajos'), () => [nota(T('cafe_trabajar')), P.trabajos(A.s)], { alta: true });
  const grandota = (ico, t, sub, fn, o) => { const b = boton('', () => { U.cierraHoja(); fn(); }, 'bt grandota', o); b.append(U.icono(ico, 3), el('span', 'crece', el('b', '', t), el('small', '', sub))); return b; };
  const menu = () => U.hoja(T('z_menu'), () => el('div', 'acciones', ['cafe', 'desayunoCafe'].map(k => grandota(k, T('act_' + k), $$(E.comida[k].precio), () => pide(k), { k: 'm' + k, no: !L.puede(A.s, E.comida[k].precio) }))));
  const despensa = () => U.hoja(T('l_super'), () => [nota(T('raciones', { n: A.s.raciones })), el('div', 'acciones', ['super', 'superRico'].map(k => grandota(k, T('sup_' + k), $$(E.comida[k].precio) + ' · ' + T('sup_d', { n: E.comida[k].raciones }), () => compra(k), { k: 'm' + k, no: !L.puede(A.s, E.comida[k].precio) })))]);
  const TOCA = { ropa: ['ropa', catalogo], bazar: ['bazar', bazar], super: ['super', () => despensa()], superRico: ['superRico', () => despensa()], pelo: ['pelo', () => salon('pelo')], unas: ['unas', () => salon('unas')], menu: ['cafe', menu], laptop: ['trabajar', trabaja], ella: ['ropa', () => P.verla()] };
  function barra(s, id) {
    const ac = (ico, t, sub, fn, k, no) => U.accion(ico, t, sub, fn, { k, no });
    if (id === 'tienda') return U.barraAcc(ac('ropa', T('z_ropa'), '', catalogo, 'verropa'));
    if (id === 'bazar') return U.barraAcc(ac('bazar', T('z_bazar'), '', bazar, 'verbazar'));
    if (id === 'super') return U.barraAcc(['super', 'superRico'].map(k => ac(k, T('sup_' + k), $$(E.comida[k].precio) + ' · ' + T('sup_d', { n: E.comida[k].raciones }), () => compra(k), k, !L.puede(s, E.comida[k].precio))));
    if (id === 'salon') return U.barraAcc(['pelo', 'unas'].map(k => ac(k, T('salon_' + k), '', () => salon(k), 's' + k)));
    return U.barraAcc(['cafe', 'desayunoCafe'].map(k => ac(k, T('act_' + k), $$(E.comida[k].precio), () => pide(k), k, !L.puede(s, E.comida[k].precio))), ac('trabajar', T('b_trabajar'), T('b_encargos', { n: s.ofertas.length }), trabaja, 'atrabajar'));
  }
  function lugar(s, noche) {
    const id = s.lugar, esc = BB.CIUDAD ? U.escena2(LW, LH, e => {
      const r = [U.escena('lugar' + id + noche, () => BB.CIUDAD.lugar(id, { noche }), e)], f = U.figura({ ...L.vista(s), colorSombra: '#c9a98f' }, e); f.style.left = (40 + U.CORTE[0]) * e + 'px'; f.style.top = (179 - BB.ELLA.SUELO) * e + 'px'; r.push(f);
      for (const z of BB.CIUDAD.toca(id)) r.push(U.toca(z, e, LW, LH, { ico: TOCA[z.k][0], nombre: z.k === 'ella' ? T('z_ella', { nombre: s.nombre }) : z.k === 'laptop' ? T('z_laptop') : T('z_' + z.k), fn: TOCA[z.k][1], cls: z.k === 'ella' ? 'sobre-ella' : '' }));
      return r;
    }) : cargando(320, 368);
    return el('div', 'hoja cuadro', barra(s, id), esc, el('div', 'fila nav', el('b', 'crece', T('l_' + id), id === 'super' ? el('small', '', ' · ' + T('raciones', { n: s.raciones })) : null), botonI('mapa', T('ver_mapa_c'), () => { ui.mapa = true; A.dibuja(true); }, 'bt', { nombre: T('ver_mapa'), k: 'vermapa' }), botonI('casa', T('ir_casa_c'), () => P.viaja('casa'), 'bt', { nombre: T('ir_casa'), k: 'ircasa' })));
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
