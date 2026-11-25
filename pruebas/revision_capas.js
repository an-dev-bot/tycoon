/* Revisión por pixeles de la ropa: corre igual en Node y dentro del navegador. Devuelve una lista de problemas. */
(function (root) {
  'use strict';
  const BB = root.BB, E = BB.ELLA;
  const CUERPOS = Object.keys(BB.CUERPOS), EST = [-5, 0, 5];
  const base = { ...BB.APARIENCIA, pelo: 'chongo' };
  function junta(v, partes) { const L = E.util.capa(); for (const k of partes) if (v[k]) L.sobre(v[k]); return L; }
  // ¿la piel asoma por donde la prenda debe tapar?
  function piel(prop) {
    const mal = [];
    for (const cuerpo of CUERPOS) for (const estatura of EST) {
      const o = { ...base, cuerpo, estatura, prop: prop || base.prop }, G = E.rig(cuerpo, estatura, o.prop), p = E.tonos(BB.PIELES.clara);
      const tr = E.torso(G, p, o), pi = E.piernas(G, p, o), br = E.brazos(G, p, o);
      for (const id in BB.CATALOGO) {
        const d = BB.CATALOGO[id], v = BB.VESTIR[d.dibujo](G, d.colores[0], d.q || {}, o), c = v.cubre;
        if (!c) continue;
        const M = junta(v, ['cuerpo', 'frente', 'mangas']), B = junta(v, ['mangas']);
        const zona = (L, z, n) => {
          if (!z) return; let k = 0, donde = null;
          for (let y = Math.ceil(z[0]); y <= z[1]; y++) for (let x = 0; x < E.W; x++) if (L.hay(x, y) && !M.hay(x, y)) { k++; donde = donde || [x, y]; }
          if (k) mal.push(`${id} ${cuerpo} ${estatura} ${n}: ${k} px (${donde})`);
        };
        zona(tr, c.torso, 'torso'); zona(pi, c.piernas, 'piernas');
        if (c.brazos === 1) {
          let k = 0, donde; const lejos = (x, y) => [G.bI, G.bD].every(b => Math.hypot(x - b[2][0], y - b[2][1]) > 5.5);
          for (let y = Math.ceil(G.yHom + 7); y < E.H; y++) for (let x = 0; x < E.W; x++) if (br.hay(x, y) && !B.hay(x, y) && lejos(x, y)) { k++; donde = [x, y]; }
          if (k) mal.push(`${id} ${cuerpo} ${estatura} brazos: ${k} px (${donde})`);
        }
      }
    }
    return mal;
  }
  // dueño de cada pixel visible
  function duenos(o) { const { G, capas, pr } = E.capasDe(o), D = new Array(E.W * E.H).fill(null); for (const c of capas) for (let i = 0; i < c.capa.d.length; i++) if (c.capa.d[i]) D[i] = c.id; return { G, D, pr, capas }; }
  const R = id => ({ id, color: BB.CATALOGO[id].colores[0] }), deCapa = k => Object.keys(BB.CATALOGO).filter(id => BB.CATALOGO[id].capa === k);
  // dos prendas puestas a la vez: la de abajo no debe asomar por encima de la que la tapa
  function cruces() {
    const mal = [];
    const prueba = (a, b, filas, quien) => {
      for (const cuerpo of CUERPOS) for (const estatura of [-5, 5]) {
        const o = { ...base, cuerpo, estatura, ropa: { [BB.CATALOGO[a].capa]: R(a), [BB.CATALOGO[b].capa]: R(b) } }, { G, D, pr } = duenos(o), z = filas(pr, G);
        if (!z) continue; let k = 0, donde;
        for (let y = Math.ceil(z[0]); y <= z[1]; y++) for (let x = 0; x < E.W; x++) if (D[y * E.W + x] === quien) { k++; donde = [x, y]; }
        if (k) mal.push(`${a} + ${b} ${cuerpo} ${estatura}: ${k} px de ${quien} (${donde})`);
      }
    };
    for (const e of deCapa('encima')) {
      if (BB.CATALOGO[e].q.abierto) continue;
      for (const b of ['base', 'abajo', 'vestido']) for (const x of deCapa(b)) prueba(x, e, pr => pr.encima.cubre.torso, b);
    }
    for (const a of deCapa('abajo')) {
      if (BB.CATALOGO[a].ajustado) continue;
      for (const c of [...deCapa('calcetas'), ...deCapa('medias')]) prueba(c, a, pr => pr.abajo.cubre.piernas, BB.CATALOGO[c].capa);
      for (const b of deCapa('base')) prueba(b, a, pr => [pr.abajo.cubre.torso[0] + 2, pr.abajo.cubre.torso[1]], 'base');
    }
    for (const a of deCapa('calcetas')) for (const m of deCapa('medias')) prueba(m, a, pr => pr.calcetas.cubre.piernas, 'medias');
    return mal;
  }
  // la capa básica está siempre, va sobre la piel y bajo todo lo demás
  function basica() {
    const mal = [];
    for (const cuerpo of CUERPOS) for (const estatura of EST) for (const id of [null, ...Object.keys(BB.CATALOGO)]) {
      const o = { ...base, cuerpo, estatura, ropa: id ? { [BB.CATALOGO[id].capa]: R(id) } : {} }, { capas } = E.capasDe(o), bs = capas.filter(c => c.id === 'basica');
      if (bs.length !== 2) { mal.push(id + ' sin capa básica'); continue; }
      const ib = capas.indexOf(bs[0]), it = capas.findIndex(c => c.id === 'cabeza'), medias = capas.findIndex(c => c.id === 'medias');
      if (medias > ib) mal.push(id + ' medias encima de la básica');
      if (capas.slice(0, ib).filter(c => c.id === 'piel').length !== 2 || it < ib) mal.push(id + ' orden');
      for (const b of bs) { let n = 0; for (const v of b.capa.d) if (v) n++; if (n < 150) mal.push(cuerpo + ' básica incompleta'); }
    }
    return mal;
  }
  function quitar() {
    const mal = [], con = { encima: R('hoodie'), base: R('playera'), abajo: R('pants'), pies: R('chanclas') };
    const a = duenos({ ...base, ropa: con }), sin = { ...con }; delete sin.encima; const b = duenos({ ...base, ropa: sin });
    const n = (d, k) => d.D.filter(v => v === k).length;
    if (!(n(a, 'encima') > 400 && n(b, 'encima') === 0 && n(b, 'base') > 300)) mal.push('quitar el hoodie no deja ver la base');
    const suelo = d => { const k = {}; for (let y = E.SUELO - 4; y <= E.SUELO; y++) for (let x = 0; x < E.W; x++) { const v = d.D[y * E.W + x]; if (v) k[v] = (k[v] || 0) + 1; } return k; };
    const descalza = suelo(duenos({ ...base, ropa: { abajo: R('pants') } })), calc = suelo(duenos({ ...base, ropa: { calcetas: R('calcetasPeludas') } }));
    if (!descalza.piel || descalza.pies) mal.push('no se puede ir descalza');
    if (!calc.calcetas || calc.pies) mal.push('no se puede ir solo con calcetas');
    return mal;
  }
  root.REVISION = { piel, cruces, basica, quitar, duenos };
})(typeof globalThis !== 'undefined' ? globalThis : this);
