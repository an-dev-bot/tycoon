/* Arranque: abre la partida, arma el marco (barra de arriba y pestañas) y conecta el guardado. */
(function (root) {
  'use strict';
  const BB = root.BB, { T, $$ } = BB.I, U = BB.UI, { el, boton, nota, fila } = U, L = BB.L, G = BB.G, A = BB.app, P = BB.P, ui = A.ui, doc = root.document;
  const cab = doc.getElementById('cab'), main = doc.getElementById('main'), tabs = doc.getElementById('tabs'); let avisado = false;
  A.guarda = () => { if (!A.s) return; if (!G.guardar(A.s) && !avisado) { avisado = true; U.aviso(T('aj_sin_guardar')); } };
  A.cambio = () => { if (L.avanzaTutorial(A.s)) { /* la mentora escribió */ } A.guarda(); A.dibuja(); };
  A.tab = t => { ui.tab = t; ui.prev = null; ui.pruebaUnas = false; if (t === 'telefono') ui.appTel = null; A.dibuja(true); };
  A.idioma = i => { BB.I.pon(i); doc.documentElement.lang = i; if (A.s) { A.s.ajustes.idioma = i; A.guarda(); } A.dibuja(); };
  A.letra = () => { doc.documentElement.dataset.letra = A.s ? A.s.ajustes.letra : 1; };
  A.dibuja = arriba => {
    const y = arriba ? 0 : main.scrollTop, lados = {}, k = doc.activeElement && doc.activeElement.dataset ? doc.activeElement.dataset.k : null, sel = doc.activeElement && doc.activeElement.selectionStart;
    main.querySelectorAll('[data-sx]').forEach(e => { lados[e.dataset.sx] = e.scrollLeft; });
    U.nuevaVuelta();
    if (!A.s) { cab.replaceChildren(); tabs.replaceChildren(); doc.body.classList.add('creando'); main.replaceChildren(P.crear()); }
    else { doc.body.classList.remove('creando'); cabecera(); barra(); main.replaceChildren(tutorial() || '', P[ui.tab]()); }
    main.querySelectorAll('[data-sx]').forEach(e => { if (lados[e.dataset.sx]) e.scrollLeft = lados[e.dataset.sx]; });
    main.querySelectorAll('[data-sx] .on').forEach(b => { const c = b.parentElement, d = b.offsetLeft - c.offsetLeft; if (d < c.scrollLeft || d + b.offsetWidth > c.scrollLeft + c.clientWidth) c.scrollLeft = d - 60; });
    main.scrollTop = y;
    if (k && doc.activeElement === doc.body) { const b = main.querySelector('[data-k="' + CSS.escape(k) + '"]') || tabs.querySelector('[data-k="' + CSS.escape(k) + '"]'); if (b) { b.focus({ preventScroll: true }); if (sel !== undefined && sel !== null && b.setSelectionRange && b.type === 'text') b.setSelectionRange(sel, sel); } }
  };
  function cabecera() {
    const s = A.s, barraDe = k => { const v = Math.round(s[k]), i = el('i'); i.style.width = v + '%'; const d = el('div', 'barra b-' + k + (v < 25 ? ' baja' : ''), U.icono(k, 2, k === 'energia' ? '#e0a23c,#ffe2a0,#ffffff' : k === 'hambre' ? '#6aa884,#cfe9d6,#ffffff' : undefined), el('div', 'avance', i)); d.setAttribute('role', 'img'); d.setAttribute('aria-label', T(k) + ' ' + v); return d; };
    cab.replaceChildren(el('div', 'arriba', el('div', 'crece', el('b', 'dinero', $$(s.dinero)), el('span', 'fecha', BB.I.diaSem(s.dia) + ' · ' + T('dia', { n: s.dia }) + ' · ' + BB.I.hora(s.hora))), boton('?', () => U.ventana(T('ayuda'), el('p', 'grande', T('ay_' + ui.tab))), 'redondo', { nombre: T('ayuda') })), el('div', 'barras', ['energia', 'animo', 'hambre'].map(barraDe)));
  }
  function barra() {
    const s = A.s, n = { telefono: s.mensajes.filter(m => !m.leido).length, casa: s.paquetes.filter(p => p.llega <= s.dia).length };
    tabs.replaceChildren(...['ella', 'casa', 'ciudad', 'telefono'].map(t => { const b = boton('', () => A.tab(t), 'tab', { on: ui.tab === t, k: 't' + t }); b.append(U.icono(t, 3, ui.tab === t ? undefined : '#b9a3b4,#e6d9e6,#ffffff'), el('span', '', T('tab_' + t))); if (n[t]) b.append(el('em', '', String(Math.min(99, n[t])))); return b; }));
  }
  const tutorial = () => A.s.tutorial ? el('div', 'tutorial', el('b', '', T('tu_titulo', { n: A.s.tutorial })), el('span', '', T('tu_' + A.s.tutorial))) : null;
  A.empieza = s => { A.s = s; s.ajustes.idioma = BB.I.cual(); ui.tab = 'ella'; ui.ella = 'ropa'; G.persistir(); A.letra(); A.cambio(); main.scrollTop = 0; };
  A.descarga = (blob, nombre, foto) => {
    const f = foto && root.File ? new File([blob], nombre, { type: blob.type }) : null;
    const baja = () => { const a = el('a'); a.href = URL.createObjectURL(blob); a.download = nombre; doc.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
    if (f && navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f] }).catch(e => { if (e.name !== 'AbortError') baja(); }); else baja();
  };
  A.exportar = () => A.descarga(new Blob([G.texto(A.s)], { type: 'application/json' }), 'partida-' + A.s.dia + '.json');
  A.importarTexto = t => { const s = G.abrir(t); if (!s) { U.aviso(T('aj_mala')); return false; } s.ultimaVez = Date.now(); A.s = s; if (s.ajustes.idioma) BB.I.pon(s.ajustes.idioma); ui.tab = 'ella'; A.letra(); A.guarda(); A.dibuja(true); U.aviso(T('aj_importada')); return true; };
  A.importar = () => { const i = el('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.addEventListener('change', () => { const f = i.files[0]; if (f) f.text().then(A.importarTexto); }); i.click(); };
  A.borrar = () => { G.borrar(); A.s = null; nuevaChica(); A.dibuja(true); };
  function nuevaChica() { ui.crear = { tab: 'cara', nombre: '', ap: L.copia(BB.APARIENCIA) }; }
  A.regresa = () => {
    if (!A.s) return; const r = L.ausente(A.s, Date.now()); if (!r.dias) return; A.guarda(); A.dibuja();
    U.ventana(T('au_titulo'), el('p', 'grande', r.dias === 1 ? T('au_dia1') : T('au_dias', { n: r.dias })), el('ul', 'resumen', r.trabajos.map(t => el('li', '', el('span', 'crece', T('au_trabajo', { id: t.id })), el('b', 'bien', '+' + $$(t.monto)))), r.pagos.map(p => el('li', '', el('span', 'crece', T('au_pago', { cuenta: T('c_' + p.tipo) })), el('b', '', $$(-p.monto)))), r.comio ? el('li', '', T('au_comio', { n: r.comio })) : null, r.paquetes ? el('li', '', T('au_paquetes', { n: r.paquetes })) : null, r.ofertas ? el('li', '', T('au_ofertas', { n: r.ofertas })) : null), el('p', 'grande', T('au_saldo', { a: BB.I.exacto(r.antes), b: BB.I.exacto(r.despues) })), { opciones: 1, boton: T('ok') });
  };
  // guardar al esconder o cerrar; al volver, ver cuánto tiempo pasó
  let oculta = false;
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) { oculta = true; A.guarda(); } else if (oculta) { oculta = false; A.regresa(); } });
  root.addEventListener('pagehide', () => { if (!oculta) A.guarda(); });

  doc.title = BB.JUEGO;
  const s = G.leer(); BB.I.pon((s && s.ajustes.idioma) || BB.I.delSistema()); doc.documentElement.lang = BB.I.cual();
  if (s) A.s = s; else nuevaChica();
  A.letra(); A.dibuja(true); A.regresa();
  if (new Date().getMonth() === 11) for (const l of doc.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')) l.href = l.rel === 'manifest' ? 'manifest_navidad.webmanifest' : l.href.replace('icono', 'navidad');
  doc.documentElement.dataset.listo = '1';
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  // después de abrir, se trae lo demás con calma
  setTimeout(() => U.parte('cerca', 'escenas').then(() => U.parte('depa', 'ciudad')).catch(() => {}), 1500);
})(typeof globalThis !== 'undefined' ? globalThis : this);
