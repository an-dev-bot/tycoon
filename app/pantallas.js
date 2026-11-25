/* Las pantallas: Ella, Casa y Ciudad. Leen el estado, dibujan, y cada botón llama a una regla de BB.L. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, N, $$ } = BB.I, U = BB.UI, { el, boton, h, nota, fila, chips, panel } = U, E = BB.ECO, L = BB.L;
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
  const colorChip = (c, nombre, on, fn, k) => { const b = boton('', fn, 'chip color', { on, nombre, k }); const i = el('i'); i.style.background = c; b.append(i); return b; };
  const chip = (txt, on, fn, k, sub) => { const b = boton(txt, fn, 'chip', { on, k }); if (sub) b.append(el('small', '', sub)); return b; };
  const grupo = (titulo, ...c) => [el('h3', '', titulo), chips(...c)];
  const subtabs = P.subtabs = (lista, actual, fn, k) => { const d = el('div', 'subtabs', lista.map(([id, t]) => boton(t, () => { fn(id); A.dibuja(); }, 'sub', { on: id === actual, k: 'sub' + id }))); d.dataset.sx = k; return d; };
  const ui = A.ui;

  /* ---------- cara y cuerpo (también al crearla) ---------- */
  const CARA = [['piel', 'g_piel', () => BB.PIELES, v => v.b], ['forma', 'g_forma', () => BB.FORMAS], ['ojos_', 'g_ojos', () => BB.OJOS], ['iris', 'g_iris', () => BB.IRIS, v => v.m], ['cejas', 'g_cejas', () => BB.CEJAS], ['pestanas', 'g_pestanas', () => BB.PESTANAS], ['nariz', 'g_nariz', () => BB.NARICES], ['labios', 'g_labios', () => BB.LABIOS], ['pecas', 'g_pecas', () => BB.PECAS], ['lunar', 'g_lunar', () => BB.LUNARES]];
  const ctlCara = (ap, pon) => [CARA.map(([k, t, d, c]) => { const D = d(); return grupo(T(t), Object.keys(D).map(id => c ? colorChip(c(D[id]), T(t) + ': ' + N(D[id]), ap[k] === id, () => pon(k, id), k + id) : chip(N(D[id]), ap[k] === id, () => pon(k, id), k + id))); }), grupo(T('g_piercing'), chip(T('si'), ap.piercing, () => pon('piercing', true), 'pi1'), chip(T('ninguno'), !ap.piercing, () => pon('piercing', false), 'pi0'))];
  function ctlCuerpo(ap, pon) {
    const r = el('input', 'desliza'); r.type = 'range'; r.min = -5; r.max = 5; r.step = 1; r.value = ap.estatura; r.dataset.k = 'estatura'; r.setAttribute('aria-label', T('g_estatura')); r.addEventListener('input', () => pon('estatura', +r.value));
    const pasos = k => fila(el('span', 'crece', N(BB.PROPORCIONES[k])), boton('−', () => pon('prop', { [k]: Math.max(-1, (ap.prop[k] || 0) - 1) }), 'chip', { nombre: N(BB.PROPORCIONES[k]) + ' ' + T('menos'), k: k + '-' }), el('b', 'num', String(ap.prop[k] || 0)), boton('+', () => pon('prop', { [k]: Math.min(1, (ap.prop[k] || 0) + 1) }), 'chip', { nombre: N(BB.PROPORCIONES[k]) + ' ' + T('mas'), k: k + '+' }));
    return [grupo(T('g_cuerpo'), Object.keys(BB.CUERPOS).map(id => chip(N(BB.CUERPOS[id]), ap.cuerpo === id, () => pon('cuerpo', id), 'cu' + id))), el('h3', '', T('g_estatura')), r, fila(el('small', '', T('chaparrita')), el('small', 'der', T('alta'))), el('h3', '', T('g_prop')), Object.keys(BB.PROPORCIONES).map(pasos), grupo(T('g_piel'), Object.keys(BB.PIELES).map(id => colorChip(BB.PIELES[id].b, N(BB.PIELES[id]), ap.piel === id, () => pon('piel', id), 'p' + id)))];
  }
  const conFig = (v, ...der) => el('div', 'dos', el('div', 'izq', U.figura(v, 2)), el('div', 'der', ...der));
  const tarima = (tipo, v) => el('div', 'tarima', con('cerca', tipo === 'cara' ? 192 : 256, tipo === 'cara' ? 192 : 160, () => U.cerca(tipo, v, 2)));
  P.ctlCara = ctlCara; P.ctlCuerpo = ctlCuerpo; P.conFig = conFig; P.tarima = tarima; P.grupo = grupo; P.chip = chip; P.colorChip = colorChip;

  /* ---------- crear ---------- */
  P.crear = () => {
    const d = ui.crear, v = { ...d.ap, ropa: { encima: { id: 'hoodie', color: BB.INICIO_ROPA[0][1] }, abajo: { id: 'pants', color: BB.INICIO_ROPA[1][1] }, pies: { id: 'chanclas', color: BB.INICIO_ROPA[2][1] } } };
    const pon = (k, x) => { if (k === 'prop') d.ap.prop = { ...d.ap.prop, ...x }; else d.ap[k] = x; A.dibuja(); };
    const inp = el('input', 'texto'); inp.maxLength = 16; inp.value = d.nombre; inp.placeholder = T('crear_nombre'); inp.dataset.k = 'nombre'; inp.setAttribute('aria-label', T('crear_nombre')); inp.autocomplete = 'off'; inp.addEventListener('input', () => { d.nombre = inp.value; });
    const cab = [el('h1', '', BB.JUEGO), el('p', 'grande', T('crear_titulo')), fila(['es', 'en'].map(i => chip(T('idioma_' + i), BB.I.cual() === i, () => A.idioma(i), 'id' + i))), inp, subtabs([['cara', T('s_cara')], ['cuerpo', T('s_cuerpo')], ['pelo', T('s_pelo')]], d.tab, x => { d.tab = x; }, 'crear')];
    const pelo = [grupo(T('g_peinado'), Object.keys(BB.PEINADOS).map(id => chip(N(BB.PEINADOS[id]), d.ap.pelo === id, () => pon('pelo', id), 'pe' + id))), grupo(T('g_color'), Object.keys(BB.PELOS_COLOR).map(id => colorChip(BB.PELOS_COLOR[id].m, N(BB.PELOS_COLOR[id]), d.ap.colorPelo === id, () => pon('colorPelo', id), 'co' + id)))];
    const empieza = boton(T('crear_empezar'), () => { const n = d.nombre.trim(); if (!n) { U.aviso(T('crear_nombre_falta')); return; } A.empieza(L.nueva(d.ap, n)); }, 'bt fuerte ancho', { k: 'empezar' });
    return el('div', 'hoja', cab, d.tab === 'cara' ? [tarima('cara', v), ctlCara(d.ap, pon)] : conFig(v, d.tab === 'cuerpo' ? ctlCuerpo(d.ap, pon) : pelo), empieza, boton(T('crear_importar'), () => A.importar(), 'bt ancho'));
  };

  /* ---------- Ella ---------- */
  P.ella = () => {
    const s = A.s, t = ui.ella, v = L.vista(s), tabs = ['ropa', 'looks', 'cara', 'cuerpo', 'pelo', 'mk', 'unas'].map(k => [k, T('s_' + k)]);
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
    const nuevo = boton(T('look_nuevo'), () => { const inp = el('input', 'texto'); inp.maxLength = 20; inp.value = T('look_default', { n: s.looks.length + 1 }); inp.setAttribute('aria-label', T('look_nombre')); const v = U.ventana(T('look_nombre'), inp, boton(T('guardar'), () => { v.cerrar(); hace(L.guardaLook(s, inp.value.trim() || T('look_default', { n: s.looks.length + 1 }))); }, 'bt fuerte ancho'), { opciones: 1 }); }, 'bt fuerte ancho');
    return conFig(L.vista(s), nuevo, s.looks.length ? s.looks.map((k, i) => fila(boton(k.nombre, () => hace(L.poneLook(s, i)), 'bt crece', { k: 'lk' + i }), boton('✕', () => U.confirma(T('borrar') + ': ' + k.nombre, T('borrar'), () => { s.looks.splice(i, 1); A.cambio(); }), 'bt', { nombre: T('borrar') + ' ' + k.nombre }))) : nota(T('look_vacio')));
  }
  function reveal(titulo, sub, bolsa) { U.momento(titulo, sub, U.figura(L.vista(A.s), 2), bolsa); }
  function revealCerca(tipo) { U.momento(T('bo_hecho'), null, con('cerca', tipo === 'cara' ? 192 : 256, 160, () => U.cerca(tipo, L.vista(A.s), 2))); }
  P.reveal = reveal;
  function pelo() {
    const s = A.s, pr = ui.prev, v = { ...L.vista(s), ...(pr ? { [pr.k]: pr.v } : {}) }, D = { pelo: BB.PEINADOS, colorPelo: BB.PELOS_COLOR, luces: BB.LUCES };
    const toca = (k, x) => () => { ui.prev = s.ap[k] === x ? null : { k, v: x }; A.dibuja(); }, sel = k => pr && pr.k === k ? pr.v : s.ap[k], suyo = (k, x) => L.precioPelo(s, k, x, 'salon') === 0;
    const haz = donde => () => { const { k, v: x } = pr, p = L.precioPelo(s, k, x, donde), fin = r => { ui.prev = null; if (r.nuevo) setTimeout(() => reveal(T('bo_hecho'), null, false)); }; if (p > 0) actua(T('act_pelo'), 'ella', q => L.pelo(q, k, x, donde), fin); else hace(L.pelo(s, k, x, donde), fin); };
    let acc = [nota(T('pelo_como'))];
    if (pr) { const pc = L.precioPelo(s, pr.k, pr.v, 'casa'), ps = L.precioPelo(s, pr.k, pr.v, 'salon'); acc = [el('b', '', N(D[pr.k][pr.v])), ps === 0 ? boton(T('pelo_usar'), haz('casa'), 'bt fuerte ancho', { k: 'usar' }) : [pc === null ? nota(T('solo_salon')) : boton(T('pelo_casa') + ' · ' + $$(pc), haz('casa'), 'bt ancho', { no: !L.puede(s, pc) }), boton(T('pelo_salon') + ' · ' + $$(ps), haz('salon'), 'bt ancho', { no: s.lugar !== 'salon' || !L.puede(s, ps) }), s.lugar !== 'salon' ? nota(T('ir_salon')) : null]]; }
    const g = (k, t, c) => grupo(T(t), Object.keys(D[k]).map(id => c && D[k][id][c] ? colorChip(D[k][id][c], N(D[k][id]), sel(k) === id, toca(k, id), k + id) : chip((suyo(k, id) ? '✓ ' : '') + N(D[k][id]), sel(k) === id, toca(k, id), k + id)));
    return conFig(v, el('div', 'panel', acc), g('pelo', 'g_peinado'), g('colorPelo', 'g_color', 'm'), g('luces', 'g_luces'));
  }
  function mk() {
    const s = A.s, m = s.ap.mk, D = { delineado: BB.DELINEADOS, pestanas: BB.PESTANAS_MK, rubor: BB.RUBORES, labios: BB.LABIALES };
    const toca = (k, v) => () => { if (L.tieneMk(s, k, v)) { hace(L.ponerMk(s, k, v)); return; } const p = L.precioMk(k, v), nom = D[k] ? N(D[k][v]) : T('g_' + k); U.confirma(nom + ' · ' + $$(p), T('comprar'), () => hace(L.comprarMk(s, k, v), () => setTimeout(() => revealCerca('cara')))); };
    const uno = (k, v, nombre, c) => { const on = D[k] ? m[k] === v : !!m[k], b = chip(nombre, on, toca(k, v), 'mk' + k + v, L.tieneMk(s, k, v) ? T('tienes') : $$(L.precioMk(k, v))); if (c) { const i = el('i', 'gota'); i.style.background = c; b.prepend(i); } return b; };
    const g = (k, t) => grupo(T(t), Object.keys(D[k]).map(v => uno(k, v, N(D[k][v]), D[k][v].c)));
    const p = E.maquillaje.kitSkincare;
    return [tarima('cara', L.vista(s)), nota(T('mk_como')), fila(boton(T('mk_guardar'), () => hace(L.guardaMk(s), () => U.aviso(T('ok'))), 'bt crece'), boton(T('mk_poner'), () => hace(L.poneMkLook(s)), 'bt crece', { k: 'mkp' })), boton(T('mk_quitar'), () => { s.ap.mk = {}; A.cambio(); }, 'bt ancho', { k: 'mkq' }), g('delineado', 'g_delineado'), g('pestanas', 'g_pestanas'), g('rubor', 'g_rubor'), g('labios', 'g_labial'), grupo(T('g_acabado'), Object.keys(BB.ACABADOS_LABIO).map(a => chip(N(BB.ACABADOS_LABIO[a]), (m.acabado || 'gloss') === a, () => hace(L.ponerMk(s, 'acabado', a)), 'ac' + a))), grupo(T('g_brillo'), uno('brillo', true, T('g_brillo'))), grupo(T('g_glow'), uno('glow', true, T('g_glow'))),
      el('h3', '', T('sk_titulo')), el('div', 'panel', nota(T('sk_quedan', { n: s.skincare.usos })), boton(T('sk_comprar') + ' · ' + $$(p), () => hace(L.comprarSkincare(s)), 'bt ancho', { no: !L.puede(s, p), k: 'sk' }))];
  }
  function unas() {
    const s = A.s, z = ui.zona, u = ui.unas = ui.unas || { color: 'rosa', forma: 'squoval', largo: 'corta', acabado: 'brillante', diseno: 'ninguno' }, zonas = ui.iguales ? ['manos', 'pies'] : [z], v = { ...L.vista(s), ...(ui.pruebaUnas ? { [z]: u } : {}) };
    const pon = (k, x) => () => { u[k] = x; ui.pruebaUnas = true; A.dibuja(); }, D = [['color', 'g_color', BB.UNAS_COLOR, 'c'], ['forma', 'g_forma_unas', BB.UNAS_FORMA], ['largo', 'g_largo', BB.UNAS_LARGO], ['acabado', 'g_acabado', BB.UNAS_ACABADO], ['diseno', 'g_diseno', BB.UNAS_DISENO]];
    const pc = L.costoUnas(s, zonas, u, 'casa'), ps = L.costoUnas(s, zonas, u, 'salon'), haz = d => () => actua(T('act_unas'), 'animo', q => L.unas(q, zonas, { ...u }, d), () => { ui.pruebaUnas = false; setTimeout(() => revealCerca(z)); });
    const tiene = s.unas[z];
    return [el('div', 'tarima', con('cerca', 256, 160, () => U.cerca(z, v, 2))), fila(['manos', 'pies'].map(k => chip(T('unas_' + k), z === k, () => { ui.zona = k; A.dibuja(); }, 'z' + k)), chip(T('unas_iguales'), ui.iguales, () => { ui.iguales = !ui.iguales; A.dibuja(); }, 'ig')),
      tiene ? fila(el('span', 'crece', tiene.rota ? T('unas_rotas') : T('unas_dias', { n: Math.max(0, E.unasDias - tiene.dias) })), boton(T('unas_quitar'), () => hace(L.quitarUnas(s, z)), 'bt')) : nota(T('unas_como')),
      el('div', 'panel', boton(T('unas_casa') + ' · ' + (pc === null ? T('solo_salon') : pc ? $$(pc) : T('gratis')), haz('casa'), 'bt ancho', { no: pc === null || !L.puede(s, pc) }), boton(T('unas_salon') + ' · ' + $$(ps), haz('salon'), 'bt ancho', { no: s.lugar !== 'salon' || !L.puede(s, ps) }), s.lugar !== 'salon' ? nota(T('ir_salon')) : null),
      D.map(([k, t, d, c]) => grupo(T(t), Object.keys(d).map(id => c ? colorChip(d[id][c], N(d[id]), u[k] === id, pon(k, id), 'u' + k + id) : chip(N(d[id]), u[k] === id, pon(k, id), 'u' + k + id))))];
  }

  /* ---------- Casa ---------- */
  const dx = { cocina: 30, bano: -22 };
  function sala(s) {
    const noche = L.esNoche(s), c = s.casa, vista = c.tipo === 'estudio' ? ui.vista : 'cuarto', o = { noche, vista, tipo: c.tipo, pared: c.pared, piso: c.piso, muebles: c.muebles, suciedad: Math.floor(c.suciedad / 5) * 5, ella: s.lugar === 'casa', sinElla: true };
    return el('div', 'escena', con('depa', 320, 384, () => { const d = el('div', 'encima', U.escena('casa' + JSON.stringify(o), () => BB.DEPA.casa(o), 2)); if (s.lugar === 'casa') { const f = U.figura({ ...L.vista(s), sinSombra: true }, 2, noche); f.style.left = (50 + (dx[vista] || 0) + U.CORTE[0]) * 2 + 'px'; f.style.top = (183 - BB.ELLA.SUELO) * 2 + 'px'; d.append(f); } return d; }));
  }
  P.casa = () => {
    const s = A.s, c = s.casa, enCasa = s.lugar === 'casa', suc = c.suciedad > 70 ? 3 : c.suciedad > 45 ? 2 : c.suciedad > 20 ? 1 : 0;
    const act = (k, ico, sub) => { const b = boton(T('act_' + k), () => actua(T('act_' + k), ico, q => k === 'cocinar' || k === 'domicilio' ? L.comer(q, k) : L.actividad(q, k)), 'bt accion', { k: 'a' + k, no: !enCasa }); b.append(el('small', '', sub)); return b; };
    const ac = E.actividades, hs = k => T('horas', { n: ac[k].horas }), pk = s.paquetes.filter(p => p.llega <= s.dia);
    const r = [sala(s), c.tipo === 'estudio' ? fila(Object.keys(BB.VISTAS).map(k => chip(N(BB.VISTAS[k]), ui.vista === k, () => { ui.vista = k; A.dibuja(); }, 'v' + k))) : null, fila(el('b', 'crece', T('tipo_' + c.tipo)), el('span', '', T('sucia_' + suc)))];
    if (!enCasa) r.push(panel(fila(el('span', 'crece', T('aqui') + ': ' + T('l_' + s.lugar)), boton(T('ir_casa'), () => P.viaja('casa'), 'bt'))));
    for (const p of pk) r.push(panel(fila(el('span', 'crece', T('paq_llego')), boton(T('paq_abrir'), () => abre(p), 'bt fuerte', { k: 'pq' + p.n }))));
    r.push(h(T('act_titulo')), el('div', 'acciones', act('cocinar', 'hambre', T('raciones', { n: s.raciones })), act('domicilio', 'hambre', $$(E.comida.domicilio.precio)), act('descansar', 'animo', hs('descansar')), act('siesta', 'energia', hs('siesta')), act('banarse', 'animo', hs('banarse')), act('skincare', 'animo', T('sk_quedan', { n: s.skincare.usos })), act('limpiar', 'casa', hs('limpiar')), (() => { const b = boton(T('act_dormir'), duerme, 'bt accion fuerte', { k: 'dormir', no: !enCasa }); b.append(el('small', '', T('act_dormir_d'))); return b; })()));
    if (s.deudaVieja > 0) r.push(h(T('deuda_titulo')), panel(fila(el('b', 'crece', $$(s.deudaVieja)), boton(T('deuda_pagar'), () => hace(L.pagaDeuda(s)), 'bt'))));
    if (c.tipo !== 'estudio') r.push(h(T('mud_titulo')), panel(['estudio', 'compartido'].filter(k => k !== c.tipo).map(k => [boton(T('mud_' + k), () => actua(T('act_mudarse'), 'casa', q => L.mudarse(q, k)), 'bt ancho'), nota(T('mud_costo', { monto: L.costoMudanza(s, k) }))])));
    else r.push(decorar(s));
    return el('div', 'hoja', r);
  };
  function decorar(s) {
    const c = s.casa, pinta = (que, D, lista, campo) => Object.keys(D).map(id => { const b = colorChip(D[id].c, N(D[id]), c[campo] === id, () => lista.includes(id) ? hace(L.pintar(s, que, id)) : U.confirma(N(D[id]) + ' · ' + $$(D[id].precio), T('comprar'), () => actua(T('act_pintar'), 'casa', q => L.pintar(q, que, id))), campo + id); if (!lista.includes(id)) b.append(el('small', '', $$(D[id].precio))); return b; });
    return [h(T('deco_titulo')), grupo(T('deco_pared'), pinta('pared', BB.PAREDES, c.paredes, 'pared')), grupo(T('deco_piso'), pinta('piso', BB.PISOS, c.pisos, 'piso')), el('h3', '', T('deco_muebles')), c.tengo.length ? el('div', 'rejilla', c.tengo.map(t => { const on = c.muebles[BB.MUEBLES[t.id].lugar] === t.id; return mosaico('mueble', t.id, '', { on, k: 'm' + t.uid, sub: on ? T('puesto') : N(BB.LUGARES_MUEBLE[BB.MUEBLES[t.id].lugar]), fn: () => hace(L.ponerMueble(s, t.id)) }); })) : nota(T('deco_vacio'))];
  }
  function abre(p) {
    hace(L.abrirPaquete(A.s, p.n), r => { if (r.pieza) { L.ponerse(A.s, r.pieza.uid); setTimeout(() => reveal(T('bo_nuevo'), N(BB.CATALOGO[p.id]) + ' · ' + T('bo_estreno'), true)); } else setTimeout(() => U.parte('escenas').then(() => U.parte('depa')).then(() => U.momento(T('bo_nuevo'), N(BB.MUEBLES[p.id]), U.mini('mueble', p.id, '', 200), true))); });
  }
  function duerme() {
    const s = A.s, veces = s.desalojos; if (s.lugar !== 'casa') { U.aviso(T('e_en_casa')); return; }
    U.haciendo(T('act_dormir'), null, () => hace(L.dormir(s), () => { U.aviso(T('du_buenos') + ' · ' + T('du_dia', { n: s.dia })); if (s.desalojos > veces) avisaDesalojo(); }), 'energia');
  }
  function avisaDesalojo() { const s = A.s, d = s.ultimoDesalojo; setTimeout(() => U.ventana(T('de_titulo'), el('p', 'grande', T('m_desalojo_' + d.a, d)), el('p', '', T('m_animo_' + d.a)), { opciones: 1, boton: T('ok') })); }

  /* ---------- Ciudad ---------- */
  P.viaja = lugar => actua(T('act_viaje'), 'ciudad', q => L.ir(q, lugar), () => { ui.mapa = false; if (lugar === 'casa') A.tab('casa'); });
  P.ciudad = () => {
    const s = A.s, noche = L.esNoche(s);
    if (s.lugar !== 'casa' && !ui.mapa) return el('div', 'hoja', lugar(s, noche));
    const mapa = el('div', 'escena', con('ciudad', 320, 400, () => { const d = el('div', 'encima', U.escena('mapa' + noche, () => BB.CIUDAD.mapa({ noche }), 2)); for (const id in BB.CIUDAD.LUGARES) { const q = BB.CIUDAD.LUGARES[id], b = boton('', () => s.lugar === id ? U.aviso(T('e_ya_ahi')) : P.viaja(id), 'lugar' + (s.lugar === id ? ' on' : ''), { nombre: T('l_' + id), k: 'l' + id }); b.style.cssText = `left:${q.x * 2 - 4}px;top:${q.y * 2 - 8}px;width:${q.w * 2 + 8}px;height:${q.h * 2 + 16}px`; b.append(el('span', '', T('l_' + id))); d.append(b); } return d; }));
    return el('div', 'hoja', mapa, fila(el('b', 'crece', T('aqui') + ': ' + T('l_' + s.lugar)), s.lugar !== 'casa' ? boton(T('ver_lugar'), () => { ui.mapa = false; A.dibuja(); }) : null), nota(T('viaje_tarda')));
  };
  function lugar(s, noche) {
    const id = s.lugar, r = [el('div', 'escena', con('ciudad', 320, 368, () => { const d = el('div', 'encima', U.escena('lugar' + id + noche, () => BB.CIUDAD.lugar(id, { noche }), 2)), f = U.figura({ ...L.vista(s), colorSombra: '#c9a98f' }, 2); f.style.left = (40 + U.CORTE[0]) * 2 + 'px'; f.style.top = (179 - BB.ELLA.SUELO) * 2 + 'px'; d.append(f); return d; })), fila(el('b', 'crece', T('l_' + id)), boton(T('ver_mapa'), () => { ui.mapa = true; A.dibuja(); }), boton(T('ir_casa'), () => P.viaja('casa')))];
    if (id === 'bazar') r.push(nota(T('bazar_cambia', { n: Math.max(1, E.bazar.dias - (s.dia - s.bazar.dia)) })), s.bazar.piezas.length ? el('div', 'rejilla tres', s.bazar.piezas.map(p => mosaico('ropa', p.id, p.color, { sub: $$(p.precio), k: 'b' + p.n, fn: () => P.ficha(p.id, { donde: 'bazar', n: p.n, color: p.color, precio: p.precio }) }))) : nota(T('bazar_vacio')));
    if (id === 'tienda') r.push(P.catalogo('tienda'));
    if (id === 'super') r.push(el('div', 'acciones', ['super', 'superRico'].map(k => { const b = boton(T('sup_' + k) + ' · ' + $$(E.comida[k].precio), () => actua(T('act_super'), 'hambre', q => L.surtir(q, k)), 'bt accion', { no: !L.puede(s, E.comida[k].precio), k }); b.append(el('small', '', T('sup_d', { n: E.comida[k].raciones }))); return b; })), nota(T('raciones', { n: s.raciones })));
    if (id === 'salon') r.push(el('div', 'acciones', ['pelo', 'unas'].map(k => boton(T('salon_' + k), () => { ui.ella = k; ui.prev = null; A.tab('ella'); }, 'bt accion'))));
    if (id === 'cafe') r.push(el('div', 'acciones', ['cafe', 'desayunoCafe'].map(k => boton(T('act_' + k) + ' · ' + $$(E.comida[k].precio), () => actua(T('act_' + k), 'hambre', q => L.comer(q, k)), 'bt accion', { no: !L.puede(s, E.comida[k].precio), k }))), nota(T('cafe_trabajar')), P.trabajos(s));
    return r;
  }
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
      der.replaceChildren(el('b', 'grande', N(d)), el('p', 'precio', $$(o.precio)), o.color ? '' : chips(d.colores.map(c => colorChip(c, c, c === color, () => { color = c; pinta(); }))), o.donde === 'linea' ? nota(T('ti_envio', { monto: E.linea.envio })) : '', boton(T('comprar'), compra, 'bt fuerte ancho', { no: !L.puede(s, o.precio + (o.donde === 'linea' ? E.linea.envio : 0)), k: 'comprar' }));
    };
    const compra = () => { const r = L.comprar(s, id, color, o.donde, o.n); if (!r.ok) { U.aviso(T(r.error)); return; } v.cerrar(); if (r.pieza) { L.ponerse(s, r.pieza.uid); A.cambio(); reveal(T('bo_nuevo'), N(d) + ' · ' + T('bo_estreno'), true); } else { A.cambio(); U.aviso(T('ti_pedido') + ' · ' + T('ti_llega', { n: r.paquete.llega })); } };
    pinta(); const v = U.ventana(null, el('div', 'dos', izq, der));
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
