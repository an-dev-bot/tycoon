/* Guardado: dos copias en el teléfono (la de ahora y la anterior), exportar e importar, y migraciones entre versiones. */
(function (root) {
  'use strict';
  const BB = root.BB, CLAVE = 'bb_partida', COPIA = 'bb_respaldo';
  const caja = () => { try { return root.localStorage || null; } catch (e) { return null; } };
  // cada migración deja la partida lista para la versión siguiente; nunca se borra una
  const MIGRACIONES = {
    // v1: la ropa puesta se guardaba por pieza del catálogo, sin closet con dueño; uñas como color suelto
    1(v) {
      const s = { ...v, closet: [], uid: v.uid || 1, ropa: {} };
      for (const p of v.closet || []) s.closet.push({ uid: s.uid++, id: p.id, color: p.color, pagado: p.pagado !== undefined ? p.pagado : BB.CATALOGO[p.id].precio, estrenada: true, dia: 1 });
      for (const c in v.ropa || {}) { const p = s.closet.find(x => x.id === v.ropa[c].id && x.color === v.ropa[c].color); if (p) s.ropa[c] = p.uid; }
      const u = k => v.unas && v.unas[k] ? { color: v.unas[k], forma: 'squoval', largo: 'corta', acabado: 'brillante', diseno: 'ninguno', dias: 0, rota: false } : null;
      s.unas = { manos: u('manos'), pies: u('pies') }; s.ap = { ...v.ap, manos: s.unas.manos, pies: s.unas.pies };
      s.version = 2; return s;
    },
  };
  // lo que falte (por venir de una versión anterior) toma su valor de una partida nueva
  function completa(s) {
    const base = BB.L.nueva({}, s.nombre, s.semilla, s.uid);
    const llena = (d, b) => { for (const k in b) if (d[k] === undefined) d[k] = b[k]; else if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && d[k] && typeof d[k] === 'object' && !['ropa', 'mk', 'mkLook', 'muebles', 'pos', 'usosHoy', 'unas'].includes(k)) llena(d[k], b[k]); return d; };
    llena(s, base); s.ap.manos = s.unas.manos; s.ap.pies = s.unas.pies;
    s.uid = Math.max(s.uid, 1 + Math.max(0, ...[s.closet, s.cuentas, s.paquetes, s.ventas, s.fotos, s.notas, s.ofertas, s.casa.tengo, s.bazar.piezas].flatMap(l => l.map(x => Math.max(x.uid || 0, x.n || 0)))));
    return s;
  }
  function abrir(txt) {
    let s; try { s = JSON.parse(txt); } catch (e) { return null; }
    if (!s || typeof s !== 'object' || !s.ap || typeof s.dia !== 'number' || !(s.version >= 1) || s.version > BB.L.VERSION) return null;
    try { while (s.version < BB.L.VERSION) s = MIGRACIONES[s.version](s); return completa(s); } catch (e) { return null; }
  }
  const texto = s => JSON.stringify(s);
  let previo = null;
  function guardar(s, ahora) {
    s.ultimaVez = ahora || Date.now(); const c = caja(); if (!c) return false;
    try { const t = texto(s); if (t === previo) return true; const viejo = c.getItem(CLAVE); if (viejo && abrirable(viejo)) c.setItem(COPIA, viejo); c.setItem(CLAVE, t); previo = t; return true; } catch (e) { return false; }
  }
  const abrirable = t => t.length > 50 && t[t.length - 1] === '}';
  function leer() { const c = caja(); if (!c) return null; for (const k of [CLAVE, COPIA]) { let t = null; try { t = c.getItem(k); } catch (e) { /* bloqueado */ } if (t) { const s = abrir(t); if (s) return s; } } return null; }
  function borrar() { const c = caja(); previo = null; if (c) { c.removeItem(CLAVE); c.removeItem(COPIA); } }
  function persistir() { try { if (root.navigator && navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* no hay */ } }
  BB.G = { guardar, leer, borrar, abrir, texto, persistir, MIGRACIONES };
})(typeof globalThis !== 'undefined' ? globalThis : this);
