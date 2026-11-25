/* La escena que se toca: se ajusta al espacio que hay, se desliza con el dedo y cada cosa es un botón con su iconito.
   También las miniaturas: se dibujan de a poquitas para que la pantalla nunca se trabe. */
(function (root) {
  'use strict';
  const BB = root.BB, doc = root.document, U = BB.UI, { el, boton } = U;

  /* ---------- escena ---------- */
  // la escala más grande que cabe y deja cada pixel del dibujo en pixeles enteros del teléfono
  function escala(w, h, cw, ch, min) { const d = Math.max(2, root.devicePixelRatio || 1), e = Math.floor(Math.min(cw / w, ch / h) * d + 1e-6) / d; return Math.max(min || 1.5, e); }
  // caja que mide el espacio libre después de entrar a la página y entonces se dibuja
  // o.crece: el dibujo puede ser más alto (hasta h × crece) para llenar el espacio; pinta recibe la escala y el alto
  function escena(w, h, pinta, o) {
    const d = el('div', 'escena libre'); d.dataset.mide = '1'; let e0 = 0, h0 = 0;
    d._mide = () => {
      const e = escala(w, h, d.clientWidth, d.clientHeight, o && o.min), hh = o && o.crece ? Math.max(h, Math.min(Math.round(h * o.crece), Math.floor(d.clientHeight / e + 1e-6))) : h;
      const nueva = e !== e0 || hh !== h0;
      if (nueva) { e0 = e; h0 = hh; const c = el('div', 'encima', pinta(e, hh)); c.style.width = w * e + 'px'; c.style.height = hh * e + 'px'; d.replaceChildren(c); }
      // queda centrada, pero empezando en un pixel entero del teléfono: así ningún pixel del dibujo sale partido
      // (el navegador acomoda en 64avos de pixel, por eso el ajuste se redondea igual)
      const c = d.firstElementChild, q = root.devicePixelRatio || 1, entero = v => Math.round((Math.round(v * q) / q - v) * 64) / 64 + 'px';
      c.style.left = c.style.top = '0px'; const r = c.getBoundingClientRect(); c.style.left = entero(r.left); c.style.top = entero(r.top);
      if (nueva && o && o.entra) c.classList.add(o.entra > 0 ? 'entra-d' : 'entra-i');
    };
    if (o && o.pasa) desliza(d, o.pasa);
    return d;
  }
  const mide = () => { for (const e of doc.querySelectorAll('[data-mide]')) e._mide(); };
  let tMide = null; root.addEventListener('resize', () => { clearTimeout(tMide); tMide = setTimeout(mide, 80); });

  // deslizar a los lados; lo que se toca dentro no se dispara si hubo deslizamiento
  function desliza(d, pasa) {
    let id = null, x0 = 0, y0 = 0, mueve = false, quita = false;
    const dentro = () => d.firstElementChild, fin = () => { id = null; mueve = false; };
    d.addEventListener('pointerdown', e => { if (U.ocupada || !e.isPrimary) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; mueve = false; quita = false; });
    d.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return; const dx = e.clientX - x0, dy = e.clientY - y0;
      if (!mueve && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) { mueve = true; quita = true; try { d.setPointerCapture(id); } catch (x) { /* ya se fue el dedo */ } }
      if (mueve && dentro()) dentro().style.transform = `translateX(${Math.round(dx * .7)}px)`;
    });
    d.addEventListener('pointerup', e => { if (e.pointerId !== id) return; const dx = e.clientX - x0, pasaYa = mueve && Math.abs(dx) > 44; fin(); if (dentro()) dentro().style.transform = ''; if (pasaYa) pasa(dx < 0 ? 1 : -1); });
    d.addEventListener('pointercancel', e => { if (e.pointerId !== id) return; fin(); if (dentro()) dentro().style.transform = ''; });
    d.addEventListener('click', e => { if (quita) { quita = false; e.preventDefault(); e.stopPropagation(); } }, true);
  }
  // un lugar que se toca: nunca mide menos de 44 px, aunque el dibujo sea chico
  function toca(q, e, ancho, alto, o) {
    const b = boton('', o.fn, 'toca' + (o.cls ? ' ' + o.cls : ''), { nombre: o.nombre, k: 't' + q.k }), w = Math.max(44, q.w * e), h = Math.max(44, q.h * e), W = ancho * e, H = alto * e;
    const x = Math.max(0, Math.min(W - w, (q.x + q.w / 2) * e - w / 2)), y = Math.max(0, Math.min(H - h, (q.y + q.h / 2) * e - h / 2));
    b.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    if (o.ico) b.append(el('span', 'marca', U.icono(o.ico, 2)));
    return b;
  }

  /* ---------- hoja que sube desde abajo: la escena se sigue viendo arriba ---------- */
  let abierta = null;
  function hoja(titulo, contenido, o) {
    cierraHoja(); const cuerpo = el('div', 'cuerpo'), caja = el('div', 'hojita' + (o && o.alta ? ' alta' : '')), velo = el('div', 'velo bajo', caja), antes = doc.activeElement;
    caja.setAttribute('role', 'dialog'); caja.setAttribute('aria-modal', 'true'); caja.setAttribute('aria-label', titulo);
    caja.append(el('div', 'tira', el('h2', 'crece', titulo), boton(U.icono('quitar', 2), () => cierraHoja(), 'redondo', { nombre: BB.I.T('cerrar'), k: 'cierraHoja' })), cuerpo);
    const pinta = () => { const y = cuerpo.scrollTop, act = cuerpo.contains(doc.activeElement) ? doc.activeElement.dataset.k : null, lados = {}; cuerpo.querySelectorAll('[data-sx]').forEach(e => { lados[e.dataset.sx] = e.scrollLeft; }); cuerpo.replaceChildren(...[contenido()].flat(Infinity).filter(x => x !== null && x !== undefined && x !== false && x !== '')); cuerpo.scrollTop = y; cuerpo.querySelectorAll('[data-sx]').forEach(e => { if (lados[e.dataset.sx]) e.scrollLeft = lados[e.dataset.sx]; }); if (act) { const b = cuerpo.querySelector('[data-k="' + CSS.escape(act) + '"]'); if (b) b.focus({ preventScroll: true }); } };
    const tecla = e => { if (e.key === 'Escape' && !doc.querySelector('.velo:not(.bajo)')) cierraHoja(); };
    doc.addEventListener('keydown', tecla); velo.addEventListener('click', e => { if (e.target === velo) cierraHoja(); });
    abierta = { velo, pinta, cierra() { velo.remove(); doc.removeEventListener('keydown', tecla); if (antes && antes.isConnected) antes.focus({ preventScroll: true }); } };
    pinta(); doc.body.append(velo); const b = cuerpo.querySelector('button') || caja.querySelector('button'); if (b) b.focus({ preventScroll: true });
    return abierta;
  }
  function cierraHoja() { if (abierta) { const a = abierta; abierta = null; a.cierra(); } }
  const refrescaHoja = () => { if (abierta && abierta.velo.isConnected) abierta.pinta(); };

  /* ---------- barra de acciones ---------- */
  function accion(ico, txt, sub, fn, o) { const b = boton('', fn, 'acc' + (o && o.cls ? ' ' + o.cls : ''), o); b.append(U.icono(ico, 3), el('span', '', txt)); if (sub) b.append(el('small', '', sub)); if (o && o.num) b.append(el('em', '', String(o.num))); return b; }
  const barra = (...x) => el('div', 'barra-acc', ...x);

  /* ---------- miniaturas ---------- */
  const guarda = new Map(), fila = []; let corre = false;
  function trabaja() {
    const t = performance.now(); corre = false;
    while (fila.length && performance.now() - t < 9) { const q = fila.shift(); if (q.sirve()) q.haz(); }
    if (fila.length) { corre = true; requestAnimationFrame(trabaja); }
  }
  // clave: lo que define el dibujo; fn devuelve una Capa ya recortada
  function miniatura(clave, w, h, esc, fn) {
    const c = doc.createElement('canvas'), d = Math.max(2, root.devicePixelRatio || 1), e = Math.max(1 / d, Math.round(esc * d) / d); c.width = w; c.height = h; c.className = 'px'; c.style.width = w * e + 'px'; c.style.height = h * e + 'px'; c.setAttribute('aria-hidden', 'true'); c.dataset.mini = '0';
    const pon = cv => { c.getContext('2d').drawImage(cv, 0, 0); c.dataset.mini = '1'; }, ya = guarda.get(clave);
    if (ya) { pon(ya); return c; }
    const t = vuelta; fila.push({ sirve: () => t === vuelta || c.isConnected, haz() { let cv = guarda.get(clave); if (!cv) { cv = U.aLienzo(fn()); guarda.set(clave, cv); if (guarda.size > 500) guarda.delete(guarda.keys().next().value); } pon(cv); } });
    if (!corre) { corre = true; requestAnimationFrame(trabaja); }
    return c;
  }
  let vuelta = 0; const otraVuelta = () => { vuelta++; for (let i = fila.length - 1; i >= 0; i--) if (!fila[i].sirve()) fila.splice(i, 1); };

  Object.assign(U, { escena2: escena, escala, mide, toca, hoja, cierraHoja, refrescaHoja, hayHoja: () => !!abierta, accion, barraAcc: barra, miniatura, otraVuelta });
})(typeof globalThis !== 'undefined' ? globalThis : this);
