/* El teléfono de ella y sus 9 apps. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, N, $$ } = BB.I, U = BB.UI, { el, boton, h, nota, fila, chips, panel } = U, E = BB.ECO, L = BB.L, P = BB.P, A = BB.app, ui = A.ui;
  const APPS = ['banco', 'mensajes', 'trabajos', 'tienda', 'ventas', 'calendario', 'fotos', 'notas', 'ajustes'];
  P.telefono = () => {
    const s = A.s;
    if (ui.appTel) return el('div', 'hoja', fila(boton('‹ ' + T('tab_telefono'), () => { ui.appTel = null; A.dibuja(true); }, 'bt', { k: 'volver' }), el('h1', 'crece', T('app_' + ui.appTel))), X[ui.appTel](s));
    const n = { mensajes: s.mensajes.filter(m => !m.leido).length, banco: s.cuentas.filter(c => c.vence - s.dia <= 3).length, ventas: s.ventas.filter(v => v.oferta).length };
    return el('div', 'hoja', el('div', 'telefono', APPS.map(k => { const b = boton('', () => { ui.appTel = k; A.dibuja(true); if (k === 'mensajes') { for (const m of s.mensajes) m.leido = true; A.guarda(); } }, 'app', { k: 'app' + k }); b.append(el('span', 'ico', U.icono(k, 4)), el('span', '', T('app_' + k))); if (n[k]) b.append(el('em', '', String(n[k]))); return b; })));
  };
  const linea = (izq, der, cls) => el('div', 'linea ' + (cls || ''), el('span', 'crece', izq), der);
  const X = {
    banco(s) {
      return [panel(el('span', '', T('ban_saldo')), el('p', 'saldo', BB.I.exacto(s.dinero))), h(T('ban_cuentas')),
        s.deudaVieja > 0 ? linea([T('deuda_titulo'), el('small', 'mal', T('ban_atrasada'))], boton(T('ban_pagar') + ' ' + $$(Math.min(s.dinero, s.deudaVieja)), () => P.hace(L.pagaDeuda(s)), 'bt', { no: s.dinero <= 0 })) : null,
        s.cuentas.length ? s.cuentas.slice().sort((a, b) => a.vence - b.vence).map(c => linea([T('c_' + c.tipo), el('small', s.dia > c.vence ? 'mal' : '', s.dia > c.vence ? T('ban_atrasada') : T('ban_vence', { n: c.vence }))], boton(T('ban_pagar') + ' ' + $$(c.monto), () => P.hace(L.paga(s, c.n)), 'bt', { no: !L.puede(s, c.monto), k: 'pg' + c.n }))) : nota(T('ban_nada')),
        h(T('ban_movs')), s.movs.length ? s.movs.slice(0, 60).map(m => linea([T(m.llave, m.datos), el('small', '', T('dia', { n: m.dia }))], el('b', m.monto > 0 ? 'bien' : '', (m.monto > 0 ? '+' : '') + $$(m.monto)))) : nota(T('ban_sin_movs'))];
    },
    mensajes(s) { return s.mensajes.length ? s.mensajes.map(m => el('div', 'globo de-' + m.de, el('small', '', (m.de === 'cliente' ? m.datos.cliente : T('de_' + m.de)) + ' · ' + T('dia', { n: m.dia })), el('p', '', T(m.llave, m.datos)))) : nota(T('msj_vacio')); },
    trabajos(s) { return P.trabajos(s); },
    tienda(s) {
      const cam = s.paquetes.filter(p => p.llega > s.dia), muebles = ui.tienda === 'muebles', lug = Object.keys(BB.LUGARES_MUEBLE);
      return [chips(['ropa', 'muebles'].map(k => P.chip(T('ti_' + k), ui.tienda === k, () => { ui.tienda = k; A.dibuja(); }, 'ti' + k))), nota(T('ti_envio', { monto: E.linea.envio })), cam.length ? [el('h3', '', T('ti_camino')), cam.map(p => linea(N(p.tipo === 'ropa' ? BB.CATALOGO[p.id] : BB.MUEBLES[p.id]), el('small', '', T('ti_llega', { n: p.llega }))))] : null,
        muebles ? el('div', 'rejilla tres', Object.keys(BB.MUEBLES).sort((a, b) => lug.indexOf(BB.MUEBLES[a].lugar) - lug.indexOf(BB.MUEBLES[b].lugar)).map(id => P.mosaico('mueble', id, '', { on: s.casa.tengo.some(t => t.id === id), sub: $$(BB.MUEBLES[id].precio), k: 'mu' + id, fn: () => U.confirma(N(BB.MUEBLES[id]) + ' · ' + $$(BB.MUEBLES[id].precio + E.linea.envio), T('comprar'), () => P.hace(L.comprarMueble(s, id), r => U.aviso(T('ti_pedido') + ' · ' + T('ti_llega', { n: r.paquete.llega })))) }))) : P.catalogo('linea')];
    },
    ventas(s) {
      const todo = [...s.closet.map(p => ['ropa', p]), ...s.casa.tengo.map(p => ['mueble', p])].filter(([, p]) => !s.ventas.some(v => v.uid === p.uid)), nom = (t, id) => N(t === 'ropa' ? BB.CATALOGO[id] : BB.MUEBLES[id]);
      const abre = (t, p) => { const r = Math.round(p.pagado * E.ventaRapida * 100) / 100, v = U.ventana(nom(t, p.id), boton(T('ve_rapida', { monto: $$(r) }), () => { v.cerrar(); U.confirma(T('ve_seguro', { monto: r }), T('vender'), () => P.hace(L.ventaRapida(s, t, p.uid))); }, 'bt ancho'), boton(T('ve_publicar'), () => { v.cerrar(); P.hace(L.publicar(s, t, p.uid)); }, 'bt fuerte ancho'), nota(T('ve_rango', { a: Math.round(p.pagado * E.oferta[0]), b: Math.round(p.pagado * E.oferta[1]) }))); };
      return [s.ventas.length ? [h(T('ve_publicadas')), s.ventas.map(v => linea([nom(v.tipo, v.id), v.oferta ? null : el('small', '', T('ve_esperando'))], fila(v.oferta ? boton(T('ve_aceptar', { monto: $$(v.oferta) }), () => P.hace(L.aceptar(s, v.n)), 'bt fuerte') : null, boton(T('ve_retirar'), () => P.hace(L.retirar(s, v.n)), 'bt'))))] : null, h(T('ve_mias')), todo.length ? el('div', 'rejilla tres', todo.map(([t, p]) => P.mosaico(t, p.id, p.color || '', { sub: $$(p.pagado), k: 'ven' + p.uid, fn: () => abre(t, p) }))) : nota(T('ve_vacio'))];
    },
    calendario(s) {
      const dias = []; for (let d = s.dia; d < s.dia + 14; d++) {
        const c = s.cuentas.filter(q => q.vence === d || (d === s.dia && q.vence < d)).map(q => [T('c_' + q.tipo) + ' ' + $$(q.monto), q.vence < s.dia]);
        for (const p of s.paquetes) if (p.llega === d) c.push([T('cal_paquete', { cosa: N(p.tipo === 'ropa' ? BB.CATALOGO[p.id] : BB.MUEBLES[p.id]) })]);
        for (const z of ['manos', 'pies']) if (s.unas[z] && s.dia + E.unasDias - s.unas[z].dias === d) c.push([T('cal_unas_' + z)]);
        if (s.bazar.dia + E.bazar.dias === d) c.push([T('cal_bazar')]);
        dias.push(el('div', 'linea' + (d === s.dia ? ' hoy' : ''), el('b', 'fecha', BB.I.diaSem(d), el('small', '', d === s.dia ? T('cal_hoy') : String(d))), el('span', 'crece', c.length ? c.map(([t, m]) => el('div', m ? 'mal' : '', t)) : el('small', '', T('cal_nada')))));
      }
      return dias;
    },
    fotos(s) { return [boton(T('fo_tomar'), () => P.hace(L.foto(s), r => setTimeout(() => verFoto(r.foto))), 'bt fuerte ancho', { k: 'foto' }), s.fotos.length ? el('div', 'album', s.fotos.map(f => { const b = boton('', () => verFoto(f), 'polaroid', { nombre: T('dia', { n: f.dia }) }); b.append(P.con('depa', 128, 170, () => polaroid(f, 1)), el('small', '', T('dia', { n: f.dia }))); return b; })) : nota(T('fo_vacio'))]; },
    notas(s) {
      const abre = n => { const t = el('textarea', 'texto'); t.rows = 8; t.maxLength = 2000; t.value = n ? n.texto : ''; t.placeholder = T('no_escribe'); t.setAttribute('aria-label', T('app_notas')); const v = U.ventana(T('app_notas'), t, fila(n ? boton(T('borrar'), () => { v.cerrar(); s.notas = s.notas.filter(x => x !== n); A.cambio(); }) : null, boton(T('guardar'), () => { v.cerrar(); if (t.value.trim()) P.hace(L.nota(s, t.value.trim(), n && n.n)); }, 'bt fuerte crece')), { opciones: 1 }); };
      return [boton(T('no_nueva'), () => abre(null), 'bt fuerte ancho'), s.notas.length ? s.notas.map(n => { const b = boton('', () => abre(n), 'nota-diario'); b.append(el('small', '', T('dia', { n: n.dia })), el('span', '', n.texto.slice(0, 140))); return b; }) : nota(T('no_vacio'))];
    },
    ajustes(s) {
      const a = s.ajustes, opc = (t, l, act, fn, d) => [el('h3', '', t), chips(l.map(([v, n]) => P.chip(n, v === act, () => { fn(v); A.cambio(); }, t + v))), d ? nota(d) : null];
      return [opc(T('aj_idioma'), [['es', T('idioma_es')], ['en', T('idioma_en')]], BB.I.cual(), v => A.idioma(v)), opc(T('aj_letra'), [0, 1, 2].map(i => [i, T('aj_letra_' + i)]), a.letra, v => { a.letra = v; A.letra(); }), opc(T('aj_ausente'), [['auto', T('aj_auto')], ['pausa', T('aj_pausa')]], a.ausente, v => { a.ausente = v; }, T('aj_auto_d')), opc(T('aj_anim'), [[true, T('aj_anim_si')], [false, T('aj_anim_no')]], a.animacion, v => { a.animacion = v; }, T('aj_anim_d')),
        el('h3', '', T('aj_partida')), fila(boton(T('aj_exportar'), () => A.exportar(), 'bt crece'), boton(T('aj_importar'), () => U.confirma(T('aj_importar_seguro'), T('aj_importar'), () => A.importar()), 'bt crece')), boton(T('aj_borrar'), () => U.confirma(T('aj_borrar1'), T('borrar'), () => U.confirma(T('aj_borrar2'), T('aj_borrar_si'), () => A.borrar())), 'bt ancho peligro', { k: 'borrar' })];
    },
  };
  P.trabajos = s => {
    const R = L.repVisible(s), hab = Object.keys(BB.HABILIDADES);
    return [L.atrasada(s) ? el('p', 'mal', T('tr_atrasada')) : null, panel(fila(el('b', 'crece', T('tr_rep')), el('span', 'estrellas', '★'.repeat(R) + '☆'.repeat(5 - R))), hab.map(k => { const n = L.nivelHab(s, k), t = E.trabajo.xpNivel, a = t[n - 1], b = t[n], i = el('i'); i.style.width = (b ? Math.min(100, (s.hab[k] - a) / (b - a) * 100) : 100) + '%'; return el('div', 'hab', el('span', '', N(BB.HABILIDADES[k])), el('div', 'avance', i), el('small', '', T('tr_nivel', { n }))); })),
      h(T('tr_ofertas')), s.ofertas.length ? s.ofertas.map(o => { const t = BB.TRABAJOS[o.id], e = L.calidad(s, o); return panel(el('b', '', N(t)), el('div', 'datos', el('span', '', o.cliente), el('span', '', N(BB.HABILIDADES[t.hab])), el('span', '', T('horas', { n: o.horas })), el('span', '', T('tr_cansa', { n: L.energiaTrabajo(s, o) }))), fila(el('span', 'crece estrellas', '★'.repeat(e) + '☆'.repeat(5 - e)), el('b', '', $$(L.pagaPrevista(s, o))), boton(T('tr_hacer'), () => P.actua(N(t), 'trabajos', q => L.trabajar(q, o.n), r => { U.aviso('★'.repeat(r.estrellas) + ' ' + T('tr_gano', { monto: $$(r.paga) }) + (r.sube ? ' · ' + T('tr_sube', { hab: N(BB.HABILIDADES[r.sube]) }) : '')); }), 'bt fuerte', { k: 'tr' + o.n, no: s.energia < L.energiaTrabajo(s, o) }))); }) : nota(T('tr_vacio'))];
  };
  // polaroid: ella en su lugar, recortada
  function capaFoto(f) {
    const W = 108, H = 132, cv = document.createElement('canvas'); cv.width = 128; cv.height = 170; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#fffaf5'; x.fillRect(0, 0, 128, 170);
    let esc, ox = 26, oy = 50;
    if (f.lugar === 'casa' || !BB.CIUDAD) { esc = U.aLienzo(BB.DEPA.casa({ ...(f.casa || { tipo: 'estudio', pared: 'gris', piso: 'gastado', muebles: {} }), noche: f.noche, ella: f.vista })); oy = 48; }
    else { esc = U.aLienzo(BB.CIUDAD.lugar(f.lugar, { noche: f.noche, ella: f.vista })); oy = 8; ox = 26; }
    if (f.lugar === 'casa') oy = 20; x.drawImage(esc, ox, oy, W, H, 10, 10, W, H); x.strokeStyle = '#e6d6ea'; x.strokeRect(.5, .5, 127, 169); x.fillStyle = '#86698c'; x.font = '10px system-ui'; x.textAlign = 'center'; x.fillText(A.s.nombre + ' · ' + T('dia', { n: f.dia }), 64, 160);
    return cv;
  }
  const memo = new Map();
  function polaroid(f, esc) { const k = f.n + BB.I.cual() + !!BB.CIUDAD; if (!memo.has(k)) memo.set(k, capaFoto(f)); return U.copiaDe(memo.get(k), esc); }
  function verFoto(f) {
    U.parte('escenas').then(() => U.parte('depa', 'ciudad')).then(() => {
      const v = U.ventana(null, el('div', 'centro', polaroid(f, 2)), fila(boton(T('borrar'), () => { v.cerrar(); P.hace(L.borraFoto(A.s, f.n)); }), boton(T('fo_guardar'), () => { const c = capaFoto(f), g = document.createElement('canvas'); g.width = c.width * 6; g.height = c.height * 6; const x = g.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, g.width, g.height); g.toBlob(b => A.descarga(b, T('fo_nombre') + '-' + f.n + '.png', true), 'image/png'); }, 'bt fuerte crece')), { opciones: 1 });
    }).catch(() => {});
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
