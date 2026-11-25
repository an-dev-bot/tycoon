/* Piezas de la pantalla: elementos, botones, dibujos, ventanas, avisos y la animación en reposo. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, N, $$ } = BB.I, doc = root.document;
  function el(tag, cls, ...hijos) { const e = doc.createElement(tag); if (cls) e.className = cls; for (const h of hijos.flat(Infinity)) if (h !== null && h !== undefined && h !== false) e.append(h); return e; }
  function boton(txt, fn, cls, o) {
    const b = el('button', cls || 'bt', txt); b.type = 'button'; b.addEventListener('click', fn);
    if (o) { if (o.on !== undefined) b.setAttribute('aria-pressed', String(!!o.on)); if (o.on) b.classList.add('on'); if (o.nombre) b.setAttribute('aria-label', o.nombre); if (o.no) b.classList.add('no'); if (o.k) b.dataset.k = o.k; }
    return b;
  }
  const h = t => el('h2', '', t), nota = t => el('p', 'nota', t), fila = (...x) => el('div', 'fila', ...x), chips = (...x) => el('div', 'chips', ...x), panel = (...x) => el('section', 'panel', ...x);

  /* ---------- dibujos ---------- */
  function lienzo(capa, esc) { const cv = doc.createElement('canvas'); capa.alCanvas(cv); cv.className = 'px'; cv.style.width = capa.w * esc + 'px'; cv.style.height = capa.h * esc + 'px'; cv.setAttribute('aria-hidden', 'true'); return cv; }
  // guarda dibujos ya hechos para no repetirlos
  function memoria(max) { const m = new Map(); const g = (k, fn) => { if (m.has(k)) { const v = m.get(k); m.delete(k); m.set(k, v); return v; } const v = fn(); m.set(k, v); if (m.size > max) m.delete(m.keys().next().value); return v; }; g.olvida = k => m.delete(k); return g; }
  const memFig = memoria(60), memEsc = memoria(24), memMini = memoria(400), memCerca = memoria(30);
  const aLienzo = capa => capa.alCanvas(doc.createElement('canvas'));
  // los dibujos de la pantalla anterior se vuelven a usar en la nueva (no se copian otra vez)
  let vuelta = 0; const nuevaVuelta = () => { vuelta++; };
  const reusa = (cv, esc) => { const d = cv._dom; if (d && d._v !== vuelta && d._e === esc && !d.closest('.velo')) { d._v = vuelta; return d; } const n = copiaDe(cv, esc); n._v = vuelta; n._e = esc; if (!d || !d.isConnected) cv._dom = n; return n; };
  const copiaDe = (cv, esc) => { const c = doc.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); c.className = 'px'; c.style.width = cv.width * esc + 'px'; c.style.height = cv.height * esc + 'px'; c.setAttribute('aria-hidden', 'true'); return c; };
  const CORTE = [16, 50];      // columnas de la figura que se enseñan
  function cuadro(v, i, noche) {
    return memFig(JSON.stringify(v) + i + (noche ? 'n' : ''), () => { const o = { ...v, sinSombra: !!noche || v.sinSombra }; if (i & 1) { o.respira = 1; o.mecer = 1; } if (i & 2) o.ojos = 'cerrados'; let f = BB.ELLA.figura(o); if (noche) f = BB.ESCENAS.util.iluminada(f); return aLienzo(f.recorte(CORTE[0], 0, CORTE[1], BB.ELLA.H)); });
  }
  // figura viva: un canvas que respira y parpadea
  const vivas = new Set(); let reloj = null, paso = 0;
  function figura(v, esc, noche, quieta) {
    if (!v.sinSombra && !v.colorSombra && BB.TEMA.oscuro()) v = { ...v, colorSombra: '#57466b' };      // sombra que se ve bien sobre lila oscuro
    const c = doc.createElement('canvas'); c.width = CORTE[1]; c.height = BB.ELLA.H; c.className = 'px fig'; c.style.width = c.width * esc + 'px'; c.style.height = c.height * esc + 'px'; c.setAttribute('role', 'img'); c.setAttribute('aria-label', BB.app && BB.app.s ? BB.app.s.nombre : BB.JUEGO);
    const pinta = i => { const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(cuadro(v, i, noche), 0, 0); }; pinta(0);
    if (!quieta) { c._pinta = pinta; c._i = 0; vivas.add(c); anima(); }
    return c;
  }
  const menosMov = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };
  const puedeAnimar = () => !menosMov.matches && (!BB.app.s || BB.app.s.ajustes.animacion) && !doc.hidden;
  function anima() {
    if (reloj || !puedeAnimar()) return;
    reloj = setInterval(() => {
      if (!puedeAnimar()) { clearInterval(reloj); reloj = null; for (const c of vivas) if (c.isConnected && c._i) { c._i = 0; c._pinta(0); } return; }
      paso++; const i = ((paso / 10) & 1) + (paso % 26 === 0 ? 2 : 0);
      for (const c of vivas) { if (!c.isConnected) { vivas.delete(c); continue; } if (c._i !== i) { c._i = i; c._pinta(i); } }
      if (!vivas.size) { clearInterval(reloj); reloj = null; }
    }, 160);
  }
  if (menosMov.addEventListener) menosMov.addEventListener('change', () => anima());
  if (doc) doc.addEventListener('visibilitychange', () => anima());
  function escena(clave, fn, esc) { return reusa(memEsc(clave, () => aLienzo(fn())), esc); }
  const olvida = k => memEsc.olvida(k);
  function cerca(tipo, v, esc) { return copiaDe(memCerca(tipo + JSON.stringify(v), () => aLienzo(BB.CERCA[tipo](v))), esc); }
  function mini(tipo, id, color, caja) {
    const cv = memMini(tipo + id + color, () => aLienzo(tipo === 'ropa' ? BB.miniatura(id, color) : BB.DEPA.mini(id)));
    const e = Math.min((caja || 68) / cv.width, (caja || 68) / cv.height); return reusa(cv, e < 1 ? .5 : Math.min(3, Math.floor(e)));      // medio pixel = 1 pixel real en un teléfono
  }
  // íconos chiquitos en pixeles (los dibujos viven en datos/iconos.js)
  function icono(k, esc, cs) { return reusa(memMini('i' + k + (cs || ''), () => { const f = BB.ICONOS[k], L = new BB.Capa(Math.max(...f.map(x => x.length)), f.length), q = { ...BB.ICONO_COLOR }; if (cs) [q.o, q.b, q.a] = cs.split(','); L.dibujo(0, 0, f, q); return aLienzo(L); }), esc); }
  // botón con su iconito
  const botonI = (ico, txt, fn, cls, o) => boton([icono(ico, 2), el('span', '', txt)], fn, (cls || 'bt') + ' ci', o);

  /* ---------- ventanas y avisos ---------- */
  function ventana(titulo, ...cont) {
    const opc = cont.length && cont[cont.length - 1] && cont[cont.length - 1].opciones ? cont.pop() : {};
    const caja = el('div', 'ventana', titulo ? h(titulo) : null, el('div', 'cuerpo', ...cont)), velo = el('div', 'velo', caja); caja.setAttribute('role', 'dialog'); caja.setAttribute('aria-modal', 'true'); if (titulo) caja.setAttribute('aria-label', titulo);
    const antes = doc.activeElement;
    const cerrar = () => { velo.remove(); doc.removeEventListener('keydown', tecla); if (antes && antes.isConnected) antes.focus({ preventScroll: true }); if (opc.alCerrar) opc.alCerrar(); };
    const tecla = e => { if (e.key === 'Escape' && !opc.fija) cerrar(); };
    doc.addEventListener('keydown', tecla);
    if (!opc.fija) velo.addEventListener('click', e => { if (e.target === velo) cerrar(); });
    if (!opc.sinBoton) caja.append(el('div', 'pie', boton(opc.boton || T('cerrar'), cerrar, 'bt ancho')));
    doc.body.append(velo); const b = caja.querySelector('button'); if (b) b.focus({ preventScroll: true });
    return { cerrar, caja };
  }
  const confirma = (txt, si, fn) => { const v = ventana(null, el('p', 'grande', txt), fila(boton(T('cancelar'), () => v.cerrar()), boton(si, () => { v.cerrar(); fn(); }, 'bt fuerte')), { opciones: 1, sinBoton: 1 }); return v; };
  let tAviso = null;
  function aviso(txt) { let a = doc.getElementById('aviso'); a.textContent = txt; a.classList.add('ver'); clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.remove('ver'), 2600); }
  // una actividad: 1 a 2 segundos de animación y sigue
  // si hay una escena a la vista, pasa ahí mismo, en un globito sobre ella; si no, en una ventanita
  let ocupada = false;
  function haciendo(txt, horas, luego, ico, cls) {
    if (ocupada) return; ocupada = true; BB.UI.cierraHoja();
    const ms = menosMov.matches ? 1000 : 1300, i = el('i'), esc = doc.querySelector('#main .escena.libre .encima'), caja = el('div', 'ventana mini', el('div', 'salta', icono(ico || 'energia', 4)), el('p', 'grande', txt, horas ? el('small', '', ' · ' + T('horas', { n: horas })) : null), el('div', 'avance', i));
    const v = el('div', esc ? 'freno' : 'velo haciendo', esc ? null : caja), g = esc ? el('div', 'hace' + (cls ? ' ' + cls : ''), caja) : null;
    v.setAttribute('role', 'status'); doc.body.append(v); if (g) { v.setAttribute('aria-label', txt); esc.append(g); } i.style.transition = `width ${ms - 80}ms linear`; requestAnimationFrame(() => requestAnimationFrame(() => { i.style.width = '100%'; }));
    setTimeout(() => { ocupada = false; v.remove(); if (g) g.remove(); luego && luego(); }, root.BB_RAPIDO ? 10 : ms);
  }
  // el momento de estrenar: la bolsa se abre y aparece puesta
  function momento(titulo, sub, dibujo, bolsa) {
    const b = new BB.Capa(48, 52); b.perfil(14, 48, () => 6, () => 42, '#f9b9cb'); b.sombrear(1, 0, 3, BB.col('#f9b9cb'), BB.col('#f58fb0')); b.sombrear(-1, 0, 2, BB.col('#f9b9cb'), BB.col('#ffdde7')); b.linea(16, 13, 18, 5, '#b98aa4'); b.linea(18, 5, 30, 5, '#b98aa4'); b.linea(30, 5, 32, 13, '#b98aa4'); b.dibujo(18, 26, ['.bb.....bb.', 'bbbb.k.bbbb', 'bbbbkkkbbbb', 'bbbb.k.bbbb', '.bb.k.k.bb.', '...k...k...'], { b: '#fffaf5', k: '#efdccb' }); b.contorno('#a85b78');
    const caja = el('div', 'momento' + (bolsa ? ' conbolsa' : ''), bolsa ? el('div', 'bolsa', lienzo(b, 3)) : null, el('div', 'ella', dibujo)); for (let i = 0; i < 8; i++) { const d = el('b', 'brillo'); d.style.left = 8 + i * 11 + '%'; d.style.animationDelay = (.5 + (i * 37 % 10) / 16) + 's'; d.style.top = 10 + (i * 53 % 70) + '%'; caja.append(d); }
    return ventana(titulo, caja, sub ? el('p', 'grande', sub) : null, { opciones: 1, boton: T('ok') });
  }
  const PARTES = {}; // el arte grande se carga por partes, solo cuando hace falta
  function parte(...fs) { return Promise.all(fs.map(f => PARTES[f] = PARTES[f] || new Promise((ok, mal) => { const s = doc.createElement('script'); s.src = 'arte/' + f + '.js'; s.onload = ok; s.onerror = () => { delete PARTES[f]; mal(new Error(f)); }; doc.head.append(s); }))); }
  // ponle un hueco del tamaño justo mientras carga: así la página no brinca
  function cuando(listo, partes, w, al, fn, alListo) { if (listo()) return fn(); const d = el('div', 'hueco'); d.style.width = w + 'px'; d.style.height = al + 'px'; parte(...partes).then(() => { if (d.isConnected) d.replaceWith(fn()); if (alListo) alListo(); }).catch(() => {}); return d; }
  BB.UI = { el, boton, botonI, h, nota, fila, chips, panel, lienzo, figura, escena, olvida, cerca, mini, icono, ventana, confirma, aviso, haciendo, momento, cuando, parte, aLienzo, copiaDe, nuevaVuelta, cuadro, CORTE, anima, menosMov, puedeAnimar, get ocupada() { return ocupada; }, set ocupada(v) { ocupada = v; } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
