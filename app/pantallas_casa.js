/* Su casa: la escena que se toca, la barra de acciones del cuarto, deslizar entre cuartos y el modo Decorar. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, N, $$ } = BB.I, U = BB.UI, { el, boton, botonI, nota, fila, panel } = U, E = BB.ECO, L = BB.L, P = BB.P, A = BB.app, ui = A.ui;
  const W = 160, H = 192, CASA = ['cocinar', 'domicilio'];
  const llegaron = s => s.paquetes.filter(p => p.llega <= s.dia);
  const vistaDe = s => s.casa.tipo === 'estudio' ? ui.vista : s.casa.tipo;
  const sucio = s => { const v = s.casa.suciedad; return v > 70 ? 3 : v > 45 ? 2 : v > 20 ? 1 : 0; };
  const datos = s => ({ vista: s.casa.tipo === 'estudio' ? ui.vista : 'cuarto', tipo: s.casa.tipo, pared: s.casa.pared, piso: s.casa.piso, muebles: s.casa.muebles, pos: s.casa.pos, suciedad: Math.floor(s.casa.suciedad / 5) * 5 });

  /* ---------- lo que hace en casa ---------- */
  const regla = k => q => CASA.includes(k) ? L.comer(q, k) : L.actividad(q, k);
  function haz(k) {
    const s = A.s;
    if (k === 'dormir') return duerme();
    if (k === 'trabajar') return trabajos();
    if (k === 'salir') { if (s.lugar !== 'casa') { P.viaja('casa'); return; } A.tab('ciudad'); return; }
    if (k === 'paquete') { const p = llegaron(s)[0]; if (p) abre(p); return; }
    if (k === 'mas') return U.hoja(T('z_mas'), () => opcionesDe(['dormir', 'siesta', 'descansar', 'cocinar', 'domicilio', 'banarse', 'skincare', 'limpiar', 'trabajar', 'salir']));
    P.actua(T('act_' + k), k, regla(k));
  }
  const trabajos = P.hojaTrabajos = () => U.hoja(T('app_trabajos'), () => P.trabajos(A.s), { alta: true });
  const sub = (k, s) => { const ac = E.actividades; return { dormir: () => T('b_dormir_d'), cocinar: () => T('b_usos', { n: s.raciones }), domicilio: () => $$(E.comida.domicilio.precio), skincare: () => T('b_usos', { n: s.skincare.usos }), limpiar: () => T('b_sucia_' + sucio(s)), trabajar: () => T('b_encargos', { n: s.ofertas.length }), salir: () => T('b_salir_d'), paquete: () => '', mas: () => '' }[k]?.() ?? T('horas', { n: ac[k].horas }); };
  const puede = (k, s) => s.lugar === 'casa' && (['dormir', 'salir', 'paquete', 'mas', 'trabajar'].includes(k) || P.puedeHacer(regla(k)));
  // botones grandes con iconito, para las hojas
  const opcionesDe = l => el('div', 'acciones', l.map(k => { const s = A.s, b = boton('', () => { U.cierraHoja(); haz(k); }, 'bt grandota', { k: 'a' + k, no: !puede(k, s) }); b.append(U.icono(k === 'mas' ? 'mas' : k, 3), el('span', 'crece', el('b', '', T('act_' + k) === 'act_' + k ? T('b_' + k) : T('act_' + k)), el('small', '', k === 'cocinar' ? T('raciones', { n: s.raciones }) : k === 'skincare' ? T('sk_quedan', { n: s.skincare.usos }) : sub(k, s)))); return b; }));
  const BARRA = { cuarto: ['dormir', 'siesta', 'descansar', 'limpiar'], cocina: ['cocinar', 'domicilio', 'trabajar', 'limpiar'], entrada: ['salir', 'paquete', 'limpiar'], bano: ['banarse', 'skincare', 'limpiar'], compartido: ['dormir', 'cocinar', 'trabajar', 'banarse', 'mas'], sofa: ['dormir', 'cocinar', 'trabajar', 'banarse', 'mas'] };
  function barra(s) {
    if (s.lugar !== 'casa') return U.barraAcc(U.accion('casa', T('ir_casa'), T('aqui') + ': ' + T('l_' + s.lugar), () => P.viaja('casa'), { k: 'avolver', cls: 'larga fuerte' }));
    const pk = llegaron(s).length;
    return U.barraAcc(BARRA[vistaDe(s)].filter(k => k !== 'paquete' || pk).map(k => U.accion(k, T('b_' + k), sub(k, s), () => haz(k), { k: 'a' + k, no: !puede(k, s), num: k === 'paquete' ? pk : 0, cls: k === 'dormir' && (s.hora >= 21 || s.energia < 25) ? 'fuerte' : '' })));
  }

  /* ---------- la escena ---------- */
  const TOCA = {
    cama: ['dormir', () => U.hoja(T('z_cama'), () => opcionesDe(['dormir', 'siesta', 'descansar']))],
    cocina: ['cocinar', () => U.hoja(T('z_cocina'), () => opcionesDe(['cocinar', 'domicilio']))],
    regadera: ['banarse', () => U.hoja(T('z_regadera'), () => opcionesDe(['banarse', 'skincare']))],
    laptop: ['trabajar', () => haz('trabajar')], tiradero: ['limpiar', () => haz('limpiar')], puerta: ['salir', () => haz('salir')], paquete: [null, () => haz('paquete')], ella: ['ropa', () => verla()],
  };
  const verla = P.verla = () => { ui.ella = 'ropa'; A.tab('ella'); };
  const cosa = (k, s) => k === 'ella' ? T('z_ella', { nombre: s.nombre }) : T('z_' + k);
  function escena(s) {
    const noche = L.esNoche(s), o = datos(s), aqui = s.lugar === 'casa', pk = llegaron(s), varios = s.casa.tipo === 'estudio', entra = ui.desliza; ui.desliza = 0;
    const pinta = e => {
      const c = { ...o, noche, ella: aqui, sinElla: true }, r = [U.escena('casa' + JSON.stringify(c), () => BB.DEPA.casa(c), e)];
      if (aqui) {
        const f = U.figura({ ...L.vista(s), sinSombra: true }, e, noche); f.style.left = (50 + (BB.DEPA.DX[o.tipo === 'estudio' ? o.vista : ''] || 0) + U.CORTE[0]) * e + 'px'; f.style.top = (183 - BB.ELLA.SUELO) * e + 'px';
        const zonas = BB.DEPA.toca({ ...o, ella: true, paquete: pk.length > 0 }), caja = zonas.find(z => z.k === 'paquete'); r.push(f);
        if (caja) { const x = U.escena('paquete', () => BB.DEPA.paquete(), e); x.classList.add('cosa'); x.style.left = caja.x * e + 'px'; x.style.top = caja.y * e + 'px'; r.push(x); }
        for (const z of zonas) r.push(U.toca(z, e, W, H, { ico: TOCA[z.k][0], nombre: cosa(z.k, s), fn: TOCA[z.k][1], cls: z.k === 'ella' ? 'sobre-ella' : '' }));
      }
      return r;
    };
    return BB.DEPA ? U.escena2(W, H, pinta, { pasa: varios ? pasa : null, entra }) : P.con('depa', 320, 384, () => { setTimeout(() => A.dibuja()); return el('div', 'hueco'); });
  }
  // cambiar de cuarto: al final vuelve a empezar
  const pasa = P.pasaCuarto = d => { const l = Object.keys(BB.VISTAS), i = (l.indexOf(ui.vista) + d + l.length) % l.length; ui.vista = l[i]; ui.desliza = d; ui.decoSel = null; A.dibuja(); };
  // linea: lo que va debajo del nombre (si no hay, los puntitos); mas: botones; al final la flecha siguiente
  function cuartos(nombre, linea, ...mas) {
    const l = Object.keys(BB.VISTAS), i = l.indexOf(ui.vista), n = N(BB.VISTAS[ui.vista]), c = el('div', 'cuarto-nom crece', el('b', '', nombre || n), linea ? el('small', '', linea) : el('span', 'puntos', l.map((k, j) => el('i', j === i ? 'on' : '')))); c.setAttribute('role', 'status'); c.setAttribute('aria-label', T('cuarto_n', { cuarto: n, n: i + 1, t: l.length }));
    return el('div', 'fila nav', boton(U.icono('flechaI', 3), () => pasa(-1), 'redondo', { nombre: T('cuarto_antes'), k: 'antes' }), c, boton(U.icono('flechaD', 3), () => pasa(1), 'redondo', { nombre: T('cuarto_sig'), k: 'sig' }), ...mas);
  }
  P.casa = () => {
    const s = A.s, c = s.casa, est = c.tipo === 'estudio'; if (!est) ui.decorar = false;
    if (ui.decorar) return decorar(s);
    const deuda = s.deudaVieja > 0 ? botonI('moneda', $$(s.deudaVieja), () => U.hoja(T('deuda_titulo'), () => panel(fila(el('b', 'crece saldo', $$(A.s.deudaVieja)), botonI('moneda', T('deuda_pagar'), () => { if (P.hace(L.pagaDeuda(A.s)) && A.s.deudaVieja <= 0) U.cierraHoja(); }, 'bt fuerte', { no: A.s.dinero <= 0 })))), 'bt peligro', { nombre: T('deuda_titulo'), k: 'deuda' }) : null;
    const nav = est ? cuartos(null, null, deuda, botonI('decorar', T('deco_boton'), () => { ui.decorar = true; ui.decoSel = null; A.dibuja(true); }, 'bt', { k: 'decorar' }))
      : el('div', 'fila nav', el('b', 'crece', T('tipo_' + c.tipo)), deuda, botonI('mudar', T('mud_boton'), () => U.hoja(T('mud_titulo'), () => ['estudio', 'compartido'].filter(k => k !== A.s.casa.tipo).map(k => panel(botonI('mudar', T('mud_' + k), () => P.actua(T('act_mudarse'), 'mudar', q => L.mudarse(q, k)), 'bt ancho', { k: 'mud' + k }), nota(T('mud_costo', { monto: L.costoMudanza(A.s, k) }))))), 'bt', { k: 'mudarse' }));
    return el('div', 'hoja cuadro', barra(s), escena(s), nav);
  };

  /* ---------- decorar ---------- */
  function decorar(s) {
    const o = { ...datos(s), suciedad: 0, noche: false }, tab = ui.decoTab, acc = (k, t) => U.accion(k, T(t), '', () => { ui.decoTab = k; A.dibuja(); }, { on: tab === k, k: 'd' + k });
    const cab = U.barraAcc(acc('muebles', 'deco_muebles'), acc('pared', 'deco_pared'), acc('piso', 'deco_piso'), U.accion('listo', T('ok'), '', () => { ui.decorar = false; ui.decoSel = null; A.dibuja(true); }, { k: 'dlisto', cls: 'fuerte' }));
    const ent = ui.desliza; ui.desliza = 0;
    const cuadro = BB.DEPA ? U.escena2(W, H, e => [U.escena('casa' + JSON.stringify(o), () => BB.DEPA.casa(o), e), ...(tab === 'muebles' ? BB.DEPA.movibles(o).map(k => agarra(k, o, e, s)) : [])], { entra: ent }) : P.con('depa', 320, 384, () => { setTimeout(() => A.dibuja()); return el('div', 'hueco'); });
    return el('div', 'hoja cuadro decorando', cab, cuadro, ...(tab === 'muebles' ? charola(s, o) : pinturas(s, tab)));
  }
  const nombreDe = (k, s) => s.casa.muebles[k] ? N(BB.MUEBLES[s.casa.muebles[k]]) : N(BB.LUGARES_MUEBLE[k]);
  const suPos = (s, k) => s.casa.pos[k] || [0, 0];
  // un mueble que se agarra: se arrastra con el dedo, o se mueve con las flechas del teclado
  function agarra(k, o, e, s) {
    const q = BB.DEPA.pieza(k, o), b = U.toca({ ...q, k: 'm' + k }, e, W, H, { nombre: T('deco_mover', { cosa: nombreDe(k, s) }), fn: () => { if (ui.decoSel !== k) { ui.decoSel = k; A.dibuja(); } }, cls: 'agarra' + (ui.decoSel === k ? ' on' : '') }), a = BB.ACOMODO[k];
    b.dataset.k = 'mv' + k; let id = null, x0, y0, p0, flota = null, mov = false, fin = null;
    const corta = (v, r) => Math.max(r[0], Math.min(r[1], v));
    b.addEventListener('pointerdown', ev => { if (!ev.isPrimary || U.ocupada) return; id = ev.pointerId; x0 = ev.clientX; y0 = ev.clientY; p0 = suPos(s, k); mov = false; fin = p0; try { b.setPointerCapture(id); } catch (x) { /* ya se fue el dedo */ } });
    b.addEventListener('pointermove', ev => {
      if (ev.pointerId !== id) return; const dx = (ev.clientX - x0) / e, dy = (ev.clientY - y0) / e;
      if (!mov) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return; mov = true; const caja = b.parentElement, fondo = caja.querySelector('canvas.px'), sin = BB.DEPA.casa({ ...o, sin: k }); sin.alCanvas(fondo); flota = U.lienzo(q.capa, e); flota.classList.add('cosa', 'flota'); flota.style.left = q.x * e + 'px'; flota.style.top = q.y * e + 'px'; fondo.after(flota); caja.classList.add('moviendo'); }
      fin = [corta(Math.round(p0[0] + dx), a.x), corta(Math.round(p0[1] + dy), a.y)]; const tx = (fin[0] - p0[0]) * e, ty = (fin[1] - p0[1]) * e; flota.style.transform = b.style.transform = `translate(${tx}px,${ty}px)`;
    });
    const suelta = ev => { if (ev.pointerId !== id) return; id = null; if (!mov) return; ui.decoSel = k; U.olvida('casa' + JSON.stringify(o)); P.hace(L.acomodar(s, k, fin[0], fin[1])); };
    b.addEventListener('pointerup', suelta); b.addEventListener('pointercancel', suelta);
    b.addEventListener('keydown', ev => { const d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[ev.key]; if (!d) return; ev.preventDefault(); const p = suPos(s, k); ui.decoSel = k; P.hace(L.acomodar(s, k, p[0] + d[0], p[1] + d[1])); });
    return b;
  }
  const irTienda = () => { ui.decorar = false; A.tab('telefono'); ui.appTel = 'tienda'; ui.tienda = 'muebles'; A.dibuja(true); };
  function charola(s, o) {
    const k = ui.decoSel, mov = BB.DEPA ? BB.DEPA.movibles(o) : [], sel = mov.includes(k) ? k : null, mios = s.casa.tengo.filter(t => [ui.vista, 'todas'].includes(BB.MUEBLES[t.id].vista));
    const nav = sel ? cuartos(nombreDe(sel, s), s.casa.muebles[sel] ? null : T('deco_base'), suPos(s, sel).some(v => v) ? botonI('regresar', T('deco_lugar'), () => P.hace(L.acomodar(s, sel, 0, 0)), 'bt chico', { k: 'dlugar' }) : null, s.casa.muebles[sel] ? botonI('quitar', T('deco_guardar'), () => { const id = s.casa.muebles[sel]; ui.decoSel = null; P.hace(L.ponerMueble(s, id)); }, 'bt chico', { k: 'dguardar' }) : null) : cuartos(null, T(mov.length ? 'deco_hint' : 'deco_nada'));
    const comprar = boton('', irTienda, 'mosaico', { k: 'dcomprar' }); comprar.append(el('span', 'mini', U.icono('tienda', 4)), el('span', 'nom', T('deco_comprar')));
    const tira = el('div', 'charola', mios.map(t => { const m = BB.MUEBLES[t.id], on = s.casa.muebles[m.lugar] === t.id; return P.mosaico('mueble', t.id, '', { on, k: 'm' + t.uid, sub: on ? '✓' : N(BB.LUGARES_MUEBLE[m.lugar]), fn: () => { ui.decoSel = on ? null : m.lugar; P.hace(L.ponerMueble(s, t.id)); } }); }), comprar); tira.dataset.sx = 'charola';
    return [nav, tira];
  }
  function pinturas(s, que) {
    const c = s.casa, D = que === 'pared' ? BB.PAREDES : BB.PISOS, lista = que === 'pared' ? c.paredes : c.pisos;
    const dib = id => P.con('depa', 60, 48, () => U.miniatura(que + id, 30, 24, 2, () => BB.DEPA.casa({ tipo: 'estudio', vista: 'cocina', pared: que === 'pared' ? id : 'gris', piso: que === 'piso' ? id : 'claro', muebles: {} }).recorte(62, que === 'pared' ? 84 : 142, 30, 24)));
    const t = el('div', 'charola', Object.keys(D).map(id => P.opcion(N(D[id]), dib(id), c[que] === id, () => lista.includes(id) ? P.hace(L.pintar(s, que, id)) : U.confirma(N(D[id]) + ' · ' + $$(D[id].precio), T('comprar'), () => P.actua(T('act_pintar'), 'decorar', q => L.pintar(q, que, id))), que + id, lista.includes(id) ? '✓' : $$(D[id].precio)))); t.dataset.sx = 'pint' + que;
    return [cuartos(null, N(D[c[que]])), t];
  }

  /* ---------- paquetes, dormir y desalojo ---------- */
  function abre(p) {
    P.hace(L.abrirPaquete(A.s, p.n), r => { if (r.pieza) { L.ponerse(A.s, r.pieza.uid); setTimeout(() => P.reveal(T('bo_nuevo'), N(BB.CATALOGO[p.id]) + ' · ' + T('bo_estreno'), true)); } else setTimeout(() => U.parte('escenas').then(() => U.parte('depa')).then(() => U.momento(T('bo_nuevo'), N(BB.MUEBLES[p.id]), U.mini('mueble', p.id, '', 200), true))); });
  }
  function duerme() {
    const s = A.s, veces = s.desalojos; if (s.lugar !== 'casa') { U.aviso(T('e_en_casa')); return; }
    U.haciendo(T('act_dormir'), null, () => P.hace(L.dormir(s), () => { U.aviso(T('du_buenos') + ' · ' + T('du_dia', { n: s.dia })); if (s.desalojos > veces) avisaDesalojo(); }), 'dormir', 'noche');
  }
  function avisaDesalojo() { const s = A.s, d = s.ultimoDesalojo; setTimeout(() => U.ventana(T('de_titulo'), el('p', 'grande', T('m_desalojo_' + d.a, d)), el('p', '', T('m_animo_' + d.a)), { opciones: 1, boton: T('ok') })); }
})(typeof globalThis !== 'undefined' ? globalThis : this);
