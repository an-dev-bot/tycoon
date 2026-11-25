/* Las pantallas: crear y Ella, y lo que comparten todas. Leen el estado, dibujan, y cada botón llama a una regla de BB.L.
   Casa está en pantallas_casa.js, Ciudad en pantallas_ciudad.js y el teléfono en pantallas_telefono.js. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, N, $$ } = BB.I, U = BB.UI, { el, boton, botonI, h, nota, fila, chips, panel } = U, E = BB.ECO, L = BB.L;
  const A = BB.app, P = BB.P = {};
  const hay = { cerca: () => !!BB.CERCA, depa: () => !!BB.DEPA, ciudad: () => !!BB.CIUDAD }, PARTES = { cerca: ['cerca'], depa: ['escenas', 'depa'], ciudad: ['escenas', 'ciudad'] };
  // escenas necesita cargarse antes que depa y ciudad
  function con(k, w, al, fn) { if (hay[k]()) return fn(); const d = el('div', 'hueco'); d.style.width = w + 'px'; d.style.height = al + 'px'; (k === 'cerca' ? U.parte('cerca') : U.parte('escenas').then(() => U.parte(k))).then(() => { if (d.isConnected) d.replaceWith(fn()); }).catch(() => {}); return d; }
  P.con = con;
  // hace algo: si sale mal avisa por qué; si sale bien guarda y vuelve a dibujar
  const hace = P.hace = (r, bien) => { if (!r.ok) { U.aviso(T(r.error)); return false; } if (bien) bien(r); A.cambio(); return true; };
  // una actividad con reloj: primero la animación, luego el resultado
  const actua = P.actua = (texto, ico, fn, bien) => {
    if (U.ocupada) return; const prueba = L.copia(A.s), r = fn(prueba); if (!r.ok) { U.aviso(T(r.error)); return; }
    U.haciendo(texto, r.horas, () => hace(fn(A.s), bien), ico);
  };
  // ¿le alcanza el tiempo, la energía y el dinero? (se prueba en una copia)
  P.puedeHacer = fn => fn(L.copia(A.s)).ok;
  const colorChip = (c, nombre, on, fn, k) => { const b = boton('', fn, 'chip color', { on, nombre, k }); const i = el('i'); i.style.background = c; b.append(i); return b; };
  const chip = (txt, on, fn, k, sub) => { const b = boton(txt, fn, 'chip', { on, k }); if (sub) b.append(el('small', '', sub)); return b; };
  const grupo = (titulo, ...c) => [el('h3', '', titulo), chips(...c)];
  const subtabs = P.subtabs = (lista, actual, fn, k) => { const d = el('div', 'subtabs', lista.map(([id, t, ico]) => boton(ico ? [U.icono(ico, 2), el('span', '', t)] : t, () => { fn(id); A.dibuja(); }, ico ? 'sub ci' : 'sub', { on: id === actual, k: 'sub' + id }))); d.dataset.sx = k; return d; };
  const ui = A.ui;

  /* ---------- miniaturas: cada opción se elige viéndola en ella ---------- */
  // de qué parte del dibujo sale cada miniatura: x, y, ancho, alto y escala
  const CORTE = {
    piel: [20, 20, 56, 60, 1], forma: [18, 18, 60, 64, 1], ojos_: [26, 36, 26, 24, 2.5], iris: [29, 40, 18, 18, 3.5], cejas: [26, 32, 26, 24, 2.5], pestanas: [26, 36, 26, 24, 2.5], nariz: [36, 44, 24, 22, 2.5], labios: [34, 57, 28, 20, 2.5], pecas: [12, 36, 72, 60, 1], lunar: [26, 42, 44, 40, 1.5], piercing: [36, 44, 24, 22, 2.5],
    mkdelineado: [24, 36, 28, 24, 2.5], mkpestanas: [24, 36, 28, 24, 2.5], mkrubor: [20, 42, 36, 28, 2], mklabios: [34, 57, 28, 20, 2.5], mkacabado: [34, 57, 28, 20, 2.5], mkbrillo: [24, 38, 28, 24, 2.5], mkglow: [20, 40, 36, 30, 2],
    manos: [74, 4, 32, 30, 2], pies: [72, 8, 36, 28, 2],
  };
  const sinRopa = ap => ({ ...ap, ropa: {}, animo: 'normal', manos: null, pies: null });
  const deCerca = (tipo, corte, o) => { const [x, y, w, al, e] = CORTE[corte]; return con('cerca', w * e, al * e, () => U.miniatura(tipo + corte + JSON.stringify(o), w, al, e, () => BB.CERCA[tipo](o).recorte(x, y, w, al))); };
  const deLejos = (o, x, y, w, al, e) => U.miniatura('f' + [x, y, w, al] + JSON.stringify(o), w, al, e, () => BB.ELLA.figura(o).recorte(x, y, w, al));
  // una opción: su miniatura y, si hace falta, unas palabras abajo
  const opcion = (nombre, dib, on, fn, k, sub) => { const b = boton('', fn, 'opc', { on, nombre, k }); b.append(el('span', 'marco', dib)); if (sub) b.append(el('small', '', sub)); return b; };
  const opciones = (titulo, sel, ...l) => [el('h3', '', titulo, sel ? el('b', '', ' · ' + sel) : null), el('div', 'opciones', ...l)];
  // los grupos de una pantalla: se ve uno a la vez, así no hay que bajar
  function grupos(cual, lista) { const ids = lista.map(x => x[0]); if (!ids.includes(ui.grupo[cual])) ui.grupo[cual] = ids[0]; const g = ui.grupo[cual]; return [P.subtabs(lista.map(([id, t]) => ['g' + id, t]), 'g' + g, x => { ui.grupo[cual] = x.slice(1); }, 'gr' + cual), lista.find(x => x[0] === g)[2]()]; }
  P.grupos = grupos; P.opcion = opcion; P.opciones = opciones; P.deCerca = deCerca;

  /* ---------- cara y cuerpo (también al crearla) ---------- */
  const CARA = [['piel', 'g_piel', () => BB.PIELES], ['forma', 'g_forma', () => BB.FORMAS], ['ojos_', 'g_ojos', () => BB.OJOS], ['iris', 'g_iris', () => BB.IRIS], ['cejas', 'g_cejas', () => BB.CEJAS], ['pestanas', 'g_pestanas', () => BB.PESTANAS], ['nariz', 'g_nariz', () => BB.NARICES], ['labios', 'g_labios', () => BB.LABIOS], ['pecas', 'g_pecas', () => BB.PECAS], ['lunar', 'g_lunar', () => BB.LUNARES]];
  const ctlCara = (ap, pon) => grupos('cara', [...CARA.map(([k, t, d]) => [k, T(t), () => { const D = d(); return opciones(T(t), N(D[ap[k]]), Object.keys(D).map(id => opcion(T(t) + ': ' + N(D[id]), deCerca('cara', k, { ...sinRopa(ap), [k]: id }), ap[k] === id, () => pon(k, id), k + id))); }]),
    ['piercing', T('g_piercing'), () => opciones(T('g_piercing'), ap.piercing ? T('si') : T('ninguno'), [true, false].map(v => opcion(T('g_piercing') + ': ' + (v ? T('si') : T('ninguno')), deCerca('cara', 'piercing', { ...sinRopa(ap), piercing: v }), !!ap.piercing === v, () => pon('piercing', v), 'pi' + (v ? 1 : 0))))]]);
  function ctlCuerpo(ap, pon) {
    const r = el('input', 'desliza'); r.type = 'range'; r.min = -5; r.max = 5; r.step = 1; r.value = ap.estatura; r.dataset.k = 'estatura'; r.setAttribute('aria-label', T('g_estatura')); r.addEventListener('input', () => pon('estatura', +r.value));
    const base = { ...sinRopa(ap), mk: {}, sinSombra: true }, G0 = BB.ELLA.rig(ap.cuerpo, 0, ap.prop);
    const CP = { hombros: [22, G0.yHom - 8, 40, 34, 1.5], cintura: [22, G0.yCint - 18, 40, 34, 1.5], cadera: [22, G0.yCint - 4, 40, 34, 1.5], piernas: [20, G0.yEntre - 6, 44, 70, 1] }, paso = v => v < 0 ? T('menos') : v > 0 ? T('mas') : '0';
    return grupos('cuerpo', [
      ['cuerpo', T('g_cuerpo'), () => opciones(T('g_cuerpo'), N(BB.CUERPOS[ap.cuerpo]), Object.keys(BB.CUERPOS).map(id => opcion(N(BB.CUERPOS[id]), deLejos({ ...base, cuerpo: id, estatura: 0 }, 16, G0.y0 - 6, 52, BB.ELLA.SUELO - G0.y0 + 12, 1), ap.cuerpo === id, () => pon('cuerpo', id), 'cu' + id)))],
      ['estatura', T('g_estatura'), () => [el('h3', '', T('g_estatura')), r, fila(el('small', '', T('chaparrita')), el('small', 'der', T('alta')))]],
      ...Object.keys(BB.PROPORCIONES).map(k => [k, N(BB.PROPORCIONES[k]), () => opciones(N(BB.PROPORCIONES[k]), paso(ap.prop[k] || 0), [-1, 0, 1].map(v => opcion(N(BB.PROPORCIONES[k]) + ' ' + paso(v), deLejos({ ...base, estatura: 0, prop: { ...ap.prop, [k]: v } }, ...CP[k]), (ap.prop[k] || 0) === v, () => pon('prop', { [k]: v }), k + v, v ? paso(v) : '·')))]),
      ['pielc', T('g_piel'), () => opciones(T('g_piel'), N(BB.PIELES[ap.piel]), Object.keys(BB.PIELES).map(id => opcion(N(BB.PIELES[id]), deLejos({ ...base, piel: id, estatura: 0 }, 20, G0.y0 - 2, 44, 60, 1), ap.piel === id, () => pon('piel', id), 'p' + id)))],
    ]);
  }
  // peinado, color y luces: sel(k) = lo que se ve elegido; toca(k, id) = qué pasa al tocarlo; sub(k, id) = lo de abajo
  function ctlPelo(v, cuales, sel, toca, sub) {
    const D = { pelo: BB.PEINADOS, colorPelo: BB.PELOS_COLOR, luces: BB.LUCES }, t = { pelo: 'g_peinado', colorPelo: 'g_color', luces: 'g_luces' }, b = { ...v, estatura: 0, sinSombra: true, animo: 'normal', manos: null, pies: null }, y = BB.ELLA.rig(v.cuerpo, 0, v.prop).y0;
    const cor = { pelo: [22, y - 8, 40, 70, 1.5], colorPelo: [22, y - 5, 40, 46, 1.5], luces: [22, y - 5, 40, 46, 1.5] };
    return grupos('pelo', cuales.map(k => [k, T(t[k]), () => opciones(T(t[k]), N(D[k][sel(k)]), Object.keys(D[k]).map(id => opcion(N(D[k][id]), deLejos({ ...b, [k]: id }, ...cor[k]), sel(k) === id, toca(k, id), k + id, sub ? sub(k, id) : null)))]));
  }
  const conFig = (v, ...der) => el('div', 'dos', el('div', 'izq', U.figura(v, 2)), el('div', 'der', ...der));
  const tarima = (tipo, v) => el('div', 'tarima', con('cerca', tipo === 'cara' ? 192 : 256, tipo === 'cara' ? 192 : 160, () => U.cerca(tipo, v, 2)));
  P.conFig = conFig; P.tarima = tarima; P.grupo = grupo; P.chip = chip; P.colorChip = colorChip;

  /* ---------- crear ---------- */
  P.crear = () => {
    const d = ui.crear, v = { ...d.ap, ropa: { encima: { id: 'hoodie', color: BB.INICIO_ROPA[0][1] }, abajo: { id: 'pants', color: BB.INICIO_ROPA[1][1] }, pies: { id: 'chanclas', color: BB.INICIO_ROPA[2][1] } } };
    const pon = (k, x) => { if (k === 'prop') d.ap.prop = { ...d.ap.prop, ...x }; else d.ap[k] = x; A.dibuja(); };
    const inp = el('input', 'texto'); inp.maxLength = 16; inp.value = d.nombre; inp.placeholder = T('crear_nombre'); inp.dataset.k = 'nombre'; inp.setAttribute('aria-label', T('crear_nombre')); inp.autocomplete = 'off'; inp.addEventListener('input', () => { d.nombre = inp.value; });
    const cab = [fila(el('h1', 'crece', BB.JUEGO), ['es', 'en'].map(i => boton(i.toUpperCase(), () => A.idioma(i), 'chip', { on: BB.I.cual() === i, k: 'id' + i, nombre: T('idioma_' + i) }))), inp, subtabs([['cara', T('s_cara'), 'cara'], ['cuerpo', T('s_cuerpo'), 'cuerpo'], ['pelo', T('s_pelo'), 'pelo']], d.tab, x => { d.tab = x; }, 'crear')];
    const pelo = () => ctlPelo(v, ['pelo', 'colorPelo'], k => d.ap[k], (k, id) => () => pon(k, id));
    const empieza = botonI('listo', T('crear_empezar'), () => { const n = d.nombre.trim(); if (!n) { U.aviso(T('crear_nombre_falta')); return; } A.empieza(L.nueva(d.ap, n)); }, 'bt fuerte ancho', { k: 'empezar' });
    return el('div', 'hoja', cab, d.tab === 'cara' ? [tarima('cara', v), ctlCara(d.ap, pon)] : conFig(v, d.tab === 'cuerpo' ? ctlCuerpo(d.ap, pon) : pelo()), empieza, botonI('importar', T('crear_importar'), () => A.importar(), 'bt ancho'));
  };

  /* ---------- Ella ---------- */
  P.ella = () => {
    const s = A.s, t = ui.ella, v = L.vista(s), tabs = ['ropa', 'looks', 'cara', 'cuerpo', 'pelo', 'mk', 'unas'].map(k => [k, T('s_' + k), k]);
    const cuerpo = { ropa: ropa, looks, cara: () => [tarima('cara', v), nota(T('cara_gratis')), ctlCara(s.ap, (k, x) => hace(L.cara(s, k, x)))], cuerpo: () => conFig(v, nota(T('cara_gratis')), ctlCuerpo(s.ap, (k, x) => hace(L.cara(s, k, x)))), pelo, mk, unas }[t]();
    return el('div', 'hoja', subtabs(tabs, t, x => { ui.ella = x; ui.prev = null; }, 'ella'), cuerpo);
  };
  function mosaico(tipo, id, color, o) { const b = boton('', o.fn, 'mosaico', { on: o.on, k: o.k }); b.append(el('span', 'mini', tipo === 'mueble' ? con('depa', 60, 60, () => U.mini(tipo, id, color, 66)) : U.mini(tipo, id, color, 66)), el('span', 'nom', N(tipo === 'ropa' ? BB.CATALOGO[id] : BB.MUEBLES[id])), o.sub ? el('small', '', o.sub) : ''); return b; }
  P.mosaico = mosaico;
  function ropa() {
    const s = A.s, cat = ui.cat, cats = [['todo', T('ropa_todo')], ...Object.keys(BB.CATEGORIAS).filter(c => s.closet.some(p => BB.CATALOGO[p.id].cat === c)).map(c => [c, N(BB.CATEGORIAS[c])])];
    const l = s.closet.filter(p => cat === 'todo' || BB.CATALOGO[p.id].cat === cat);
    return conFig(L.vista(s), el('div', 'chips', cats.map(([id, n]) => chip(n, cat === id, () => { ui.cat = id; A.dibuja(); }, 'cat' + id))), l.length ? el('div', 'rejilla', l.map(p => {
      const c = BB.CATALOGO[p.id].capa, on = s.ropa[c] === p.uid;
      return mosaico('ropa', p.id, p.color, { on, k: 'r' + p.uid, sub: on ? T('puesto') : null, fn: () => hace(on ? L.quitarse(s, c) : L.ponerse(s, p.uid), r => { if (r.estreno) U.aviso(T('bo_estreno')); }) });
    })) : nota(T('ropa_vacia')), nota(T('ropa_capa')));
  }
  function looks() {
    const s = A.s;
    const nuevo = botonI('guardar', T('look_nuevo'), () => { const inp = el('input', 'texto'); inp.maxLength = 20; inp.value = T('look_default', { n: s.looks.length + 1 }); inp.setAttribute('aria-label', T('look_nombre')); const v = U.ventana(T('look_nombre'), inp, boton(T('guardar'), () => { v.cerrar(); hace(L.guardaLook(s, inp.value.trim() || T('look_default', { n: s.looks.length + 1 }))); }, 'bt fuerte ancho'), { opciones: 1 }); }, 'bt fuerte ancho');
    return conFig(L.vista(s), nuevo, s.looks.length ? s.looks.map((k, i) => fila(botonI('look', k.nombre, () => hace(L.poneLook(s, i)), 'bt crece', { k: 'lk' + i }), boton(U.icono('quitar', 2), () => U.confirma(T('borrar') + ': ' + k.nombre, T('borrar'), () => { s.looks.splice(i, 1); A.cambio(); }), 'bt', { nombre: T('borrar') + ' ' + k.nombre }))) : nota(T('look_vacio')));
  }
  function reveal(titulo, sub, bolsa) { U.momento(titulo, sub, U.figura(L.vista(A.s), 2), bolsa); }
  function revealCerca(tipo) { U.momento(T('bo_hecho'), null, con('cerca', tipo === 'cara' ? 192 : 256, 160, () => U.cerca(tipo, L.vista(A.s), 2))); }
  P.reveal = reveal;
  function pelo() {
    const s = A.s, pr = ui.prev, v = { ...L.vista(s), ...(pr ? { [pr.k]: pr.v } : {}) }, D = { pelo: BB.PEINADOS, colorPelo: BB.PELOS_COLOR, luces: BB.LUCES };
    const toca = (k, x) => () => { ui.prev = s.ap[k] === x ? null : { k, v: x }; A.dibuja(); }, sel = k => pr && pr.k === k ? pr.v : s.ap[k], suyo = (k, x) => L.precioPelo(s, k, x, 'salon') === 0;
    const haz = donde => () => { const { k, v: x } = pr, p = L.precioPelo(s, k, x, donde), fin = r => { ui.prev = null; if (r.nuevo) setTimeout(() => reveal(T('bo_hecho'), null, false)); }; if (p > 0) actua(T('act_pelo'), 'ella', q => L.pelo(q, k, x, donde), fin); else hace(L.pelo(s, k, x, donde), fin); };
    let acc = [nota(T('pelo_como'))];
    if (pr) { const pc = L.precioPelo(s, pr.k, pr.v, 'casa'), ps = L.precioPelo(s, pr.k, pr.v, 'salon'); acc = [el('b', '', N(D[pr.k][pr.v])), ps === 0 ? botonI('listo', T('pelo_usar'), haz('casa'), 'bt fuerte ancho', { k: 'usar' }) : [pc === null ? nota(T('solo_salon')) : botonI('casa', T('pelo_casa') + ' · ' + $$(pc), haz('casa'), 'bt ancho', { no: s.lugar !== 'casa' || !L.puede(s, pc), k: 'pcasa' }), botonI('pelo', T('pelo_salon') + ' · ' + $$(ps), haz('salon'), 'bt ancho', { no: s.lugar !== 'salon' || !L.puede(s, ps), k: 'psalon' }), s.lugar !== 'salon' ? nota(T('ir_salon')) : null]]; }
    return conFig(v, el('div', 'panel', acc), ctlPelo(L.vista(s), ['pelo', 'colorPelo', 'luces'], sel, toca, (k, id) => suyo(k, id) ? '✓' : null));
  }
  function mk() {
    const s = A.s, m = s.ap.mk, D = { delineado: BB.DELINEADOS, pestanas: BB.PESTANAS_MK, rubor: BB.RUBORES, labios: BB.LABIALES };
    const toca = (k, v) => () => { if (L.tieneMk(s, k, v)) { hace(L.ponerMk(s, k, v)); return; } const p = L.precioMk(k, v), nom = D[k] ? N(D[k][v]) : T('g_' + k); U.confirma(nom + ' · ' + $$(p), T('comprar'), () => hace(L.comprarMk(s, k, v), () => setTimeout(() => revealCerca('cara')))); };
    const limpia = { ...sinRopa(s.ap), mk: {} }, con1 = (k, v) => ({ ...limpia, mk: k === 'brillo' || k === 'glow' ? { [k]: true } : k === 'acabado' ? { labios: m.labios || 'rosado', acabado: v } : k === 'labios' ? { labios: v, acabado: m.acabado || 'gloss' } : { [k]: v } });
    const uno = (k, v, nombre) => { const on = D[k] ? m[k] === v : !!m[k], suyo = L.tieneMk(s, k, v); return opcion(nombre + ' · ' + (suyo ? T('tienes') : $$(L.precioMk(k, v))), deCerca('cara', 'mk' + k, con1(k, v)), on, toca(k, v), 'mk' + k + v, suyo ? '✓' : $$(L.precioMk(k, v))); };
    const g = (k, t) => [k, T(t), () => opciones(T(t), m[k] ? N(D[k][m[k]]) : null, Object.keys(D[k]).map(v => uno(k, v, N(D[k][v]))))];
    const p = E.maquillaje.kitSkincare;
    return [tarima('cara', L.vista(s)), fila(botonI('guardar', T('mk_guardar_c'), () => hace(L.guardaMk(s), () => U.aviso(T('ok'))), 'bt crece', { nombre: T('mk_guardar') }), botonI('mk', T('mk_poner_c'), () => hace(L.poneMkLook(s)), 'bt crece', { k: 'mkp', nombre: T('mk_poner') }), botonI('skincare', T('mk_quitar_c'), () => { s.ap.mk = {}; A.cambio(); }, 'bt crece', { k: 'mkq', nombre: T('mk_quitar') })),
      grupos('mk', [g('delineado', 'g_delineado'), g('pestanas', 'g_pestanas'), g('rubor', 'g_rubor'), g('labios', 'g_labial'), ['acabado', T('g_acabado'), () => opciones(T('g_acabado'), N(BB.ACABADOS_LABIO[m.acabado || 'gloss']), Object.keys(BB.ACABADOS_LABIO).map(a => opcion(N(BB.ACABADOS_LABIO[a]), deCerca('cara', 'mkacabado', con1('acabado', a)), (m.acabado || 'gloss') === a, () => hace(L.ponerMk(s, 'acabado', a)), 'ac' + a)))],
        ['brillos', T('g_brillos'), () => opciones(T('g_brillos'), null, uno('brillo', true, T('g_brillo')), uno('glow', true, T('g_glow')))],
        ['sk', T('sk_titulo'), () => el('div', 'panel', nota(T('sk_quedan', { n: s.skincare.usos })), botonI('skincare', T('sk_comprar') + ' · ' + $$(p), () => hace(L.comprarSkincare(s)), 'bt ancho', { no: !L.puede(s, p), k: 'sk' }))]]), nota(T('mk_como'))];
  }
  function unas() {
    const s = A.s, z = ui.zona, u = ui.unas = ui.unas || { color: 'rosa', forma: 'squoval', largo: 'corta', acabado: 'brillante', diseno: 'ninguno' }, zonas = ui.iguales ? ['manos', 'pies'] : [z], v = { ...L.vista(s), ...(ui.pruebaUnas ? { [z]: u } : {}) };
    const pon = (k, x) => () => { u[k] = x; ui.pruebaUnas = true; A.dibuja(); }, D = [['color', 'g_color', BB.UNAS_COLOR], ['forma', 'g_forma_unas', BB.UNAS_FORMA], ['largo', 'g_largo', BB.UNAS_LARGO], ['acabado', 'g_acabado', BB.UNAS_ACABADO], ['diseno', 'g_diseno', BB.UNAS_DISENO]];
    const pc = L.costoUnas(s, zonas, u, 'casa'), ps = L.costoUnas(s, zonas, u, 'salon'), haz = d => () => actua(T('act_unas'), 'animo', q => L.unas(q, zonas, { ...u }, d), () => { ui.pruebaUnas = false; setTimeout(() => revealCerca(z)); });
    const tiene = s.unas[z];
    const limpia = { ...sinRopa(s.ap), mk: {} };
    return [el('div', 'tarima', con('cerca', 256, 160, () => U.cerca(z, v, 2))), fila(['manos', 'pies'].map(k => chip(T('unas_' + k), z === k, () => { ui.zona = k; A.dibuja(); }, 'z' + k)), chip(T('unas_iguales'), ui.iguales, () => { ui.iguales = !ui.iguales; A.dibuja(); }, 'ig')),
      grupos('unas', D.map(([k, t, d]) => [k, T(t), () => opciones(T(t), N(d[u[k]]), Object.keys(d).map(id => opcion(N(d[id]), deCerca(z, z, { ...limpia, [z]: { ...u, [k]: id, rota: false } }), u[k] === id, pon(k, id), 'u' + k + id)))])),
      el('div', 'panel', botonI('casa', T('unas_casa') + ' · ' + (pc === null ? T('solo_salon') : pc ? $$(pc) : T('gratis')), haz('casa'), 'bt ancho', { no: pc === null || s.lugar !== 'casa' || !L.puede(s, pc), k: 'ucasa' }), botonI('unas', T('unas_salon') + ' · ' + $$(ps), haz('salon'), 'bt ancho', { no: s.lugar !== 'salon' || !L.puede(s, ps), k: 'usalon' }), s.lugar !== 'salon' ? nota(T('ir_salon')) : null),
      tiene ? fila(el('span', 'crece', tiene.rota ? T('unas_rotas') : T('unas_dias', { n: Math.max(0, E.unasDias - tiene.dias) })), botonI('quitar', T('unas_quitar'), () => hace(L.quitarUnas(s, z)), 'bt')) : nota(T('unas_como'))];
  }
  P.pelo = pelo; P.unas = unas;

  /* ---------- catálogo y ficha de una pieza ---------- */
  P.catalogo = donde => {
    const cats = Object.keys(BB.CATEGORIAS).filter(c => Object.values(BB.CATALOGO).some(d => d.cat === c && d.tiendas.includes(donde))), cat = cats.includes(ui.catT) ? ui.catT : cats[0];
    return [chips(cats.map(c => chip(N(BB.CATEGORIAS[c]), c === cat, () => { ui.catT = c; A.dibuja(); }, 'ct' + c))), el('div', 'rejilla tres', Object.keys(BB.CATALOGO).filter(k => BB.CATALOGO[k].cat === cat && BB.CATALOGO[k].tiendas.includes(donde)).map(k => mosaico('ropa', k, BB.CATALOGO[k].colores[0], { sub: $$(BB.CATALOGO[k].precio), k: 'c' + k, fn: () => P.ficha(k, { donde, precio: BB.CATALOGO[k].precio }) })))];
  };
  P.ficha = (id, o) => {
    const s = A.s, d = BB.CATALOGO[id]; let color = o.color || d.colores[0]; const izq = el('div', 'izq'), der = el('div', 'der');
    const prueba = () => { const v = L.vista(s), ropa = { ...v.ropa }; for (const x of BB.CHOCA[d.capa] || []) delete ropa[x]; ropa[d.capa] = { id, color }; if (d.capa === 'base') delete ropa.encima; return { ...v, ropa }; };
    const pinta = () => {
      izq.replaceChildren(['manos', 'munecas'].includes(d.capa) ? con('cerca', 96, 60, () => { const c = U.cerca('manos', prueba(), 1); return c; }) : U.figura(prueba(), 2, false, true));
      der.replaceChildren(el('b', 'grande', N(d)), el('p', 'precio', $$(o.precio)), o.color ? '' : chips(d.colores.map(c => colorChip(c, c, c === color, () => { color = c; pinta(); }))), o.donde === 'linea' ? nota(T('ti_envio', { monto: E.linea.envio })) : '', botonI('tienda', T('comprar'), compra, 'bt fuerte ancho', { no: !L.puede(s, o.precio + (o.donde === 'linea' ? E.linea.envio : 0)), k: 'comprar' }));
    };
    const compra = () => { const r = L.comprar(s, id, color, o.donde, o.n); if (!r.ok) { U.aviso(T(r.error)); return; } v.cerrar(); if (r.pieza) { L.ponerse(s, r.pieza.uid); A.cambio(); reveal(T('bo_nuevo'), N(d) + ' · ' + T('bo_estreno'), true); } else { A.cambio(); U.aviso(T('ti_pedido') + ' · ' + T('ti_llega', { n: r.paquete.llega })); } };
    pinta(); const v = U.ventana(null, el('div', 'dos', izq, der));
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
