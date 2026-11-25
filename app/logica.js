/* Reglas del juego, sin pantalla: todo cambia el estado `s` y devuelve { ok, ... } o { ok: false, error: 'llave' }.
   Los textos no viven aquí: los mensajes guardan su llave y sus datos, y la pantalla los escribe en el idioma elegido. */
(function (root) {
  'use strict';
  const BB = root.BB, E = BB.ECO;
  const VERSION = 2;
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v)), cent = v => Math.round(v * 100) / 100, copia = x => JSON.parse(JSON.stringify(x));
  const no = error => ({ ok: false, error });

  /* ---------- estado ---------- */
  function nueva(ap, nombre, semilla, uid) {
    const s = {
      version: VERSION, nombre: nombre || '', semilla: (semilla || Math.floor(Math.random() * 2 ** 31)) >>> 0, uid: uid || 1,
      dia: 1, hora: E.inicio.hora, lugar: 'casa', dinero: E.inicio.dinero, energia: 100, animo: 70, hambre: 80,
      ap: { ...copia(BB.APARIENCIA), ...copia(ap || {}) }, ropa: {}, closet: [], looks: [],
      propio: { peinados: [], colores: [], luces: ['ninguna'], esmaltes: [], mk: [] },
      unas: { manos: null, pies: null }, mkLook: {}, skincare: { racha: 0, sin: 0, hoy: [], usos: 6 },
      casa: { tipo: 'estudio', deposito: E.renta.depositoEstudio, pared: 'gris', piso: 'gastado', paredes: ['gris'], pisos: ['gastado'], muebles: {}, pos: {}, tengo: [], suciedad: 10 },
      raciones: E.inicio.raciones, rico: 0, cuentas: [], deudaVieja: 0, desalojos: 0,
      hab: { diseno: 0, marketing: 0, finanzas: 0, negociacion: 0 }, rep: 0, hechos: 0, sabe: [], ofertas: [], ofertasDia: 0,
      bazar: { dia: 0, piezas: [] }, paquetes: [], ventas: [], mensajes: [], movs: [], fotos: [], notas: [], usosHoy: {},
      tutorial: 1, empresaAvisada: false, ayudaVista: {}, estadisticas: { ganado: 0, gastado: 0, perdido: 0 },
      ajustes: { idioma: null, tema: 'auto', letra: 1, ausente: 'auto', animacion: true, reducir: null }, ultimaVez: Date.now(),
    };
    s.propio.peinados.push(s.ap.pelo); s.propio.colores.push(s.ap.colorPelo); if (!s.propio.luces.includes(s.ap.luces)) s.propio.luces.push(s.ap.luces);
    s.ap.mk = {}; s.ap.manos = s.ap.pies = null;
    for (const [id, color] of BB.INICIO_ROPA) { const p = pieza(s, id, color, BB.CATALOGO[id].precio); p.estrenada = true; s.ropa[BB.CATALOGO[id].capa] = p.uid; }
    nuevaCuenta(s, 'luz', E.cuentas.luz, 7); nuevaCuenta(s, 'telefono', E.cuentas.telefono, 7); nuevaCuenta(s, 'renta', E.renta.estudio, 8);
    mensaje(s, 'mentora', 'm_bienvenida'); ofertas(s); bazar(s);
    return s;
  }
  // números al azar propios de la partida: la misma partida da lo mismo (no se puede «volver a tirar»)
  function azar(s) { let t = s.semilla = (s.semilla + 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  const entero = (s, a, b) => a + Math.floor(azar(s) * (b - a + 1)), elige = (s, l) => l[Math.floor(azar(s) * l.length)];
  function mensaje(s, de, llave, datos) { s.mensajes.unshift({ de, llave, datos: datos || {}, dia: s.dia, leido: false }); if (s.mensajes.length > 120) s.mensajes.length = 120; }
  function mueve(s, monto, llave, datos) {
    monto = cent(monto); if (!monto) return; s.dinero = cent(s.dinero + monto);
    s.movs.unshift({ dia: s.dia, monto, llave, datos: datos || {} }); if (s.movs.length > E.movimientosMax) s.movs.length = E.movimientosMax;
    if (monto > 0) s.estadisticas.ganado = cent(s.estadisticas.ganado + monto); else s.estadisticas.gastado = cent(s.estadisticas.gastado - monto);
  }
  const puede = (s, p) => s.dinero >= p - 1e-9;
  function pieza(s, id, color, pagado) { const p = { uid: s.uid++, id, color: color || BB.CATALOGO[id].colores[0], pagado, estrenada: false, dia: s.dia }; s.closet.push(p); return p; }
  const de = (s, uid) => s.closet.find(p => p.uid === uid);

  /* ---------- barras y tiempo ---------- */
  const topeAnimo = s => s.casa.tipo === 'sofa' ? 35 : s.casa.tipo === 'compartido' ? 62 : 100;
  function animo(s, d) { s.animo = clamp(s.animo + d, 0, Math.max(topeAnimo(s), Math.min(s.animo, topeAnimo(s)))); }
  function energia(s, d) { s.energia = clamp(s.energia + d); }
  function reloj(s, h) {
    s.hora = Math.round((s.hora + h) * 4) / 4; s.hambre = clamp(s.hambre - h * E.porHora.hambre); energia(s, -h * E.porHora.energia * (s.hambre < 20 ? 2 : 1)); animo(s, -h * E.porHora.animo * (s.hambre < 20 ? 5 : 1));
  }
  const cabe = (s, h) => s.hora + h <= E.dormir.limite;
  const usos = (s, k) => s.usosHoy[k] || 0, usa = (s, k) => { s.usosHoy[k] = usos(s, k) + 1; };
  const humor = s => s.energia < 22 || s.hambre < 12 ? 'cansada' : s.animo < 32 ? 'triste' : s.animo >= 72 ? 'contenta' : 'normal';
  const semana = dia => (dia - 1) % 7;      // 0 = lunes
  const esNoche = s => s.hora >= 19 || s.hora < 6;

  function actividad(s, k) {
    const a = E.actividades[k]; if (!a) return no('e_nada'); if (s.lugar !== 'casa') return no('e_en_casa');
    if (!cabe(s, a.horas)) return no('e_tarde'); if (a.energia < 0 && s.energia < -a.energia) return no('e_energia');
    if (a.dia && usos(s, k) >= a.dia) return no('e_ya_hoy');
    if (k === 'skincare') return skincare(s);
    if (k === 'limpiar') { if (s.casa.tipo === 'sofa') return no('e_no_aqui'); if (s.casa.suciedad < 8) return no('e_ya_limpio'); s.casa.suciedad = 0; }
    usa(s, k); reloj(s, a.horas); energia(s, a.energia); animo(s, a.animo);
    return { ok: true, horas: a.horas };
  }
  function skincare(s) {
    const a = E.actividades.skincare, turno = s.hora < 14 ? 'manana' : s.hora >= 18 ? 'noche' : null;
    if (!turno) return no('e_skincare_hora'); if (s.skincare.hoy.includes(turno)) return no('e_ya_hoy'); if (s.skincare.usos <= 0) return no('e_sin_skincare'); if (!cabe(s, a.horas)) return no('e_tarde');
    s.skincare.usos--; s.skincare.hoy.push(turno); reloj(s, a.horas); animo(s, a.animo);
    if (turno === 'noche') desmaquillar(s);
    return { ok: true, horas: a.horas };
  }
  function comer(s, k) {
    const c = E.comida[k]; if (s.hambre > 92 && k !== 'cafe') return no('e_llena');
    if (k === 'cocinar') {
      if (s.lugar !== 'casa') return no('e_en_casa'); if (s.raciones < 1) return no('e_sin_comida'); if (!cabe(s, c.horas)) return no('e_tarde');
      const rico = s.rico > 0; s.raciones--; if (rico) s.rico--; reloj(s, c.horas); energia(s, c.energia); s.hambre = clamp(s.hambre + c.sacia); animo(s, rico ? c.animoRico : c.animo); s.pasoComer = true; s.casa.suciedad = clamp(s.casa.suciedad + 1.5);
      return { ok: true, horas: c.horas };
    }
    if (k === 'domicilio' && s.lugar !== 'casa') return no('e_en_casa');
    if ((k === 'cafe' || k === 'desayunoCafe') && s.lugar !== 'cafe') return no('e_en_cafe');
    if (k === 'domicilio' && cortado(s, 'telefono')) return no('e_sin_telefono');
    if (k === 'cafe' && usos(s, 'cafe') >= 2) return no('e_mucho_cafe');
    if (!puede(s, c.precio)) return no('e_dinero'); if (!cabe(s, c.horas)) return no('e_tarde');
    usa(s, k); s.pasoComer = true; mueve(s, -c.precio, 'mov_' + k); reloj(s, c.horas); s.hambre = clamp(s.hambre + c.sacia); energia(s, c.energia || 0); animo(s, c.animo);
    return { ok: true, horas: c.horas };
  }
  function surtir(s, k) {
    if (s.lugar !== 'super') return no('e_no_aqui'); const c = E.comida[k]; if (!puede(s, c.precio)) return no('e_dinero'); if (!cabe(s, .5)) return no('e_tarde');
    mueve(s, -c.precio, 'mov_super'); s.raciones += c.raciones; if (k === 'superRico') s.rico += c.raciones; reloj(s, .5); return { ok: true, horas: .5 };
  }
  function ir(s, lugar) {
    if (lugar === s.lugar) return no('e_ya_ahi'); if (!cabe(s, E.viaje.horas) && lugar !== 'casa') return no('e_tarde');
    if (lugar !== 'casa' && s.hora >= 22) return no('e_cerrado');
    if (lugar !== 'casa') s.pasoCiudad = true;
    reloj(s, E.viaje.horas); energia(s, E.viaje.energia); s.lugar = lugar; if (lugar === 'bazar') bazar(s); return { ok: true, horas: E.viaje.horas };
  }
  // dormir: termina el día
  function dormir(s) {
    if (s.lugar !== 'casa') return no('e_en_casa');
    const antes = { dinero: s.dinero, dia: s.dia }, tarde = s.hora > E.dormir.tarde;
    s.hambre = clamp(s.hambre - E.dormir.hambre);
    const base = tarde ? E.dormir.energiaTarde : E.dormir.energiaBien;
    s.energia = clamp(base - (s.hambre < 15 ? 25 : s.hambre < 30 ? 12 : 0) - (s.casa.tipo === 'sofa' ? 15 : s.casa.tipo === 'compartido' ? 8 : 0), 25, 100);
    cierraDia(s, false);
    s.hora = tarde ? 9 : E.dormir.despierta;
    return { ok: true, antes };
  }
  function desmaquillar(s) { s.ap.mk = {}; }
  const bonito = s => { let t = 0; for (const l in s.casa.muebles) if (s.casa.muebles[l]) t += BB.MUEBLES[s.casa.muebles[l]].bonito; return t + (s.casa.pared !== 'gris' ? 2 : 0) + (s.casa.piso !== 'gastado' ? 3 : 0); };
  function cierraDia(s, auto) {
    desmaquillar(s);
    // arreglo
    const k = s.skincare;
    if (!auto) { if (k.hoy.length === 2) { k.racha++; k.sin = 0; } else if (k.hoy.length === 0) { k.sin++; k.racha = 0; } else { k.racha = Math.max(0, k.racha - 1); } }
    k.hoy = []; s.ap.granitos = k.sin >= E.skincareGranitos; s.ap.glowPiel = k.racha >= E.skincareGlow;
    if (!auto) for (const z of ['manos', 'pies']) if (s.unas[z]) { s.unas[z].dias++; if (s.unas[z].dias >= E.unasDias && !s.unas[z].rota) { s.unas[z].rota = true; animo(s, -4); mensaje(s, 'sistema', 'm_unas_' + z); } s.ap[z] = s.unas[z]; }
    // casa y ánimo
    if (!auto) s.casa.suciedad = clamp(s.casa.suciedad + E.suciedadDia);
    const suc = s.casa.suciedad, lindo = s.casa.tipo === 'estudio' ? bonito(s) : 0;
    let a = -1 + Math.min(8, lindo / 6);
    if (suc > 70) a -= 12; else if (suc > 45) a -= 7; else if (suc > 25) a -= 2; else a += 2;
    if (s.energia < 60) a -= 3; if (s.hambre < 20) a -= 8; if (atrasada(s)) a -= 9; if (k.racha >= E.skincareGlow) a += 2; if (s.ap.granitos) a -= 4;
    if (s.casa.tipo !== 'estudio') a -= 4;
    a += (55 - s.animo) * .18;      // con el tiempo el ánimo tiende al centro
    if (!auto || a > 0) animo(s, a);
    s.dia++; s.usosHoy = {};
    for (const p of s.paquetes) if (p.llega <= s.dia && !p.avisado) { p.avisado = true; mensaje(s, 'tienda', 'm_paquete', { id: p.id, tipo: p.tipo }); }
    for (const v of s.ventas) if (!v.oferta && v.llega <= s.dia) { v.oferta = cent(Math.round(v.pagado * (E.oferta[0] + v.suerte * (E.oferta[1] - E.oferta[0])))); mensaje(s, 'compraventa', 'm_oferta', { id: v.id, tipo: v.tipo, monto: v.oferta }); }
    ofertas(s); bazar(s); cuentasDelDia(s, auto);
  }

  /* ---------- cuentas, renta y desalojo ---------- */
  function nuevaCuenta(s, tipo, monto, vence) { s.cuentas.push({ n: s.uid++, tipo, base: monto, monto, vence, avisada: false, atraso: 0 }); }
  const atrasada = s => s.deudaVieja > 0 || s.cuentas.some(c => s.dia > c.vence);
  const cortado = (s, tipo) => s.cuentas.some(c => c.tipo === tipo && s.dia - c.vence > E.diasCorte);
  function cuentasDelDia(s, auto) {
    if (auto) {                                        // con la app cerrada: paga si le alcanza; si no, el plazo se recorre (no vence nada)
      for (const c of s.cuentas) if (s.dia >= c.vence) { if (puede(s, c.monto)) paga(s, c.n); else { c.vence++; c.pausa = true; } }
      return;
    }
    for (const c of s.cuentas.slice()) {
      if (!c.avisada && c.vence - s.dia <= E.aviso) { c.avisada = true; mensaje(s, c.tipo === 'renta' ? 'casero' : 'banco', 'm_aviso_' + c.tipo, { monto: c.monto, vence: c.vence, dias: c.vence - s.dia }); }
      const t = s.dia - c.vence;
      if (t > 0 && (t - 1) % E.semana === 0 && c.atraso < Math.floor((t - 1) / E.semana) + 1) {
        c.atraso++; const r = cent(c.base * E.recargo); c.monto = cent(c.monto + r);
        mensaje(s, c.tipo === 'renta' ? 'casero' : 'banco', 'm_atraso_' + c.tipo, { recargo: r, monto: c.monto, quedan: E.diasDesalojo - t });
      }
      if (c.tipo === 'renta' && t === E.diasDesalojo - 3) mensaje(s, 'casero', 'm_ultimatum', { monto: c.monto, quedan: 3 });
      if (c.tipo !== 'renta' && t === E.diasCorte + 1) mensaje(s, 'banco', 'm_corte_' + c.tipo, { monto: c.monto });
      if (c.tipo === 'renta' && t >= E.diasDesalojo) { desalojo(s); break; }
    }
    // cada cuenta nace una semana después de la anterior, se haya pagado o no
    for (const tipo of ['renta', 'luz', 'telefono']) { if (tipo !== 'telefono' && s.casa.tipo === 'sofa') continue; siguiente(s, tipo); }
  }
  function siguiente(s, tipo) {
    const ult = s.ultVence || (s.ultVence = {}); const u = Math.max(ult[tipo] || 0, ...s.cuentas.filter(c => c.tipo === tipo).map(c => c.vence), 0);
    if (u && s.dia >= u - 1 && s.dia >= u) { const v = u + E.semana; const monto = tipo === 'renta' ? E.renta[s.casa.tipo] : tipo === 'luz' && s.casa.tipo === 'compartido' ? Math.round(E.cuentas.luz / 2) : E.cuentas[tipo]; nuevaCuenta(s, tipo, monto, v); ult[tipo] = v; }
    else if (u) ult[tipo] = u;
  }
  function paga(s, n) {
    const c = s.cuentas.find(x => x.n === n); if (!c) return no('e_nada'); if (!puede(s, c.monto)) return no('e_dinero');
    mueve(s, -c.monto, 'mov_' + c.tipo); s.ultVence = s.ultVence || {}; s.ultVence[c.tipo] = Math.max(s.ultVence[c.tipo] || 0, c.vence);
    if (s.dia > c.vence) animo(s, 5);
    s.cuentas = s.cuentas.filter(x => x !== c); return { ok: true };
  }
  function pagaDeuda(s, monto) { const m = Math.min(s.deudaVieja, monto === undefined ? s.dinero : monto, s.dinero); if (m <= 0) return no('e_dinero'); mueve(s, -m, 'mov_deuda'); s.deudaVieja = cent(s.deudaVieja - m); return { ok: true, pagado: m }; }
  function desalojo(s) {
    const rentas = s.cuentas.filter(c => c.tipo === 'renta' && s.dia > c.vence), debe = cent(rentas.reduce((t, c) => t + c.monto, 0)), venia = s.casa.tipo;
    s.desalojos++; s.cuentas = s.cuentas.filter(c => c.tipo === 'telefono'); s.ultVence = { telefono: s.ultVence && s.ultVence.telefono };
    let remate = 0; const deposito = s.casa.deposito;
    if (venia === 'estudio') {
      const orden = s.casa.tengo.slice().sort((a, b) => BB.MUEBLES[b.id].precio - BB.MUEBLES[a.id].precio), guarda = orden.slice(0, E.mueblesQueSeLleva);
      for (const m of orden.slice(E.mueblesQueSeLleva)) remate += m.pagado * E.remate;
      s.ventas = s.ventas.filter(v => v.tipo !== 'mueble'); s.casa.tengo = guarda;
      s.casa.pared = 'gris'; s.casa.piso = 'gastado'; s.casa.paredes = ['gris']; s.casa.pisos = ['gastado'];
    }
    s.casa.muebles = {}; s.casa.deposito = 0; s.estadisticas.perdido = cent(s.estadisticas.perdido + deposito);
    remate = cent(remate); const aDeuda = Math.min(remate, debe); if (remate) mueve(s, remate, 'mov_remate'); if (aDeuda) mueve(s, -aDeuda, 'mov_deuda');
    s.deudaVieja = cent(s.deudaVieja + debe - aDeuda);
    s.casa.suciedad = 20; s.lugar = 'casa';
    if (venia === 'estudio') { s.casa.tipo = 'compartido'; nuevaCuenta(s, 'renta', E.renta.compartido, s.dia + E.semana); nuevaCuenta(s, 'luz', Math.round(E.cuentas.luz / 2), s.dia + E.semana); }
    else s.casa.tipo = 'sofa';
    s.animo = Math.min(s.animo, venia === 'estudio' ? 30 : 12);
    s.ultimoDesalojo = { dia: s.dia, de: venia, a: s.casa.tipo, debe, deposito, remate, queda: s.deudaVieja };
    mensaje(s, 'casero', 'm_desalojo_' + s.casa.tipo, { debe, deposito, remate, queda: s.deudaVieja }); mensaje(s, 'mentora', 'm_animo_' + s.casa.tipo);
  }
  const costoMudanza = (s, tipo) => tipo === 'estudio' ? E.renta.estudio + E.renta.depositoEstudio : E.renta.compartido + E.renta.depositoCompartido;
  function mudarse(s, tipo) {
    if (s.casa.tipo === tipo || (tipo !== 'estudio' && s.casa.tipo === 'estudio')) return no('e_nada'); if (s.deudaVieja > 0 && tipo === 'estudio') return no('e_deuda');
    if (s.cuentas.some(c => c.tipo === 'renta' && s.dia > c.vence)) return no('e_deuda');
    const c = costoMudanza(s, tipo); if (!puede(s, c)) return no('e_dinero'); if (!cabe(s, 3)) return no('e_tarde');
    mueve(s, -c, 'mov_mudanza'); s.cuentas = s.cuentas.filter(x => x.tipo === 'telefono'); s.casa.tipo = tipo; s.casa.deposito = tipo === 'estudio' ? E.renta.depositoEstudio : E.renta.depositoCompartido; s.casa.suciedad = 10; s.ultVence = { telefono: s.ultVence && s.ultVence.telefono };
    nuevaCuenta(s, 'renta', E.renta[tipo], s.dia + E.semana); nuevaCuenta(s, 'luz', tipo === 'estudio' ? E.cuentas.luz : Math.round(E.cuentas.luz / 2), s.dia + E.semana);
    reloj(s, 3); energia(s, -15); animo(s, 15); return { ok: true, horas: 3 };
  }

  /* ---------- trabajos ---------- */
  const nivelDe = (v, t) => { let n = 0; while (n < t.length && v >= t[n]) n++; return n; };
  const nivelHab = (s, h) => Math.min(E.trabajo.maxNivelHab, nivelDe(s.hab[h], E.trabajo.xpNivel));
  const nivelRep = s => nivelDe(s.rep, E.trabajo.repNiveles);
  const repVisible = s => Math.max(1, nivelRep(s) - (atrasada(s) ? 2 : 0));
  function ofertas(s) {
    if (s.ofertasDia === s.dia) return; s.ofertasDia = s.dia;
    const tope = repVisible(s), ids = Object.keys(BB.TRABAJOS).filter(k => BB.TRABAJOS[k].nivel <= tope), l = [], n = Math.max(3, E.trabajo.ofertas - (atrasada(s) ? 2 : 0));
    while (l.length < n && ids.length) {
      const i = Math.floor(azar(s) * ids.length), k = ids.splice(i, 1)[0], t = BB.TRABAJOS[k];
      const paga = cent(Math.round(t.horas * E.trabajo.porHora[t.nivel - 1] * (.92 + azar(s) * .16) * (atrasada(s) ? .85 : 1)));
      l.push({ n: s.uid++, id: k, horas: t.horas, paga, cliente: elige(s, BB.CLIENTES) });
    }
    s.ofertas = l;
  }
  const energiaTrabajo = (s, o) => Math.round(o.horas * E.trabajo.energiaHora * (1 - (nivelHab(s, BB.TRABAJOS[o.id].hab) - 1) * .02));
  // calidad del trabajo: habilidad contra dificultad, ánimo, energía y hambre -> estrellas
  function calidad(s, o) {
    const t = BB.TRABAJOS[o.id], h = nivelHab(s, t.hab);
    const p = 3.1 + (h - t.nivel) * .45 + (s.animo - 55) / 45 + (s.energia - energiaTrabajo(s, o) - 20) / 60 - (s.hambre < 20 ? 1 : 0) + (s.lugar === 'cafe' ? .25 : 0) + (s.casa.muebles.escritorio && s.lugar === 'casa' && s.casa.tipo === 'estudio' ? .15 : 0);
    return clamp(Math.round(p), 1, 5);
  }
  const pagaPrevista = (s, o) => cent(o.paga * (1 + (nivelHab(s, BB.TRABAJOS[o.id].hab) - 1) * E.trabajo.porNivel));
  function trabajar(s, n) {
    const o = s.ofertas.find(x => x.n === n); if (!o) return no('e_nada'); if (s.lugar !== 'casa' && s.lugar !== 'cafe') return no('e_donde_trabajar');
    if (s.lugar === 'casa' && cortado(s, 'luz')) return no('e_sin_internet'); if (s.lugar === 'cafe' && !usos(s, 'cafe') && !usos(s, 'desayunoCafe')) return no('e_pide_algo');
    const en = energiaTrabajo(s, o); if (s.energia < en) return no('e_energia'); if (!cabe(s, o.horas)) return no('e_tarde');
    const est = calidad(s, o), t = BB.TRABAJOS[o.id], pct = [0, .4, .65, .9, 1, 1.05][est], paga = cent(Math.round(pagaPrevista(s, o) * pct * 100) / 100), antes = nivelHab(s, t.hab);
    s.ofertas = s.ofertas.filter(x => x !== o); reloj(s, o.horas); energia(s, -en + o.horas * E.porHora.energia);
    animo(s, -o.horas * E.trabajo.animoHora + (est >= 4 ? 4 : est <= 2 ? -6 : 1));
    mueve(s, paga, 'mov_trabajo', { id: o.id }); s.hab[t.hab] += o.horas * (1 + est * .12); s.rep = Math.max(0, s.rep + [0, -5, -2, 1.2, 2.2, 3][est] * (atrasada(s) ? .5 : 1)); s.hechos++; if (!s.sabe.includes(o.id)) s.sabe.push(o.id);
    mensaje(s, 'cliente', 'm_calif_' + est, { cliente: o.cliente, id: o.id, monto: paga });
    if (nivelRep(s) >= 5 && !s.empresaAvisada) { s.empresaAvisada = true; mensaje(s, 'mentora', 'm_empresa'); }
    return { ok: true, horas: o.horas, estrellas: est, paga, sube: nivelHab(s, t.hab) > antes ? t.hab : null };
  }

  /* ---------- ropa ---------- */
  function ponerse(s, uid) {
    const p = de(s, uid); if (!p) return no('e_nada'); const c = BB.CATALOGO[p.id].capa;
    for (const x of BB.CHOCA[c] || []) delete s.ropa[x];
    s.ropa[c] = uid; s.pasoRopa = true; let estreno = false;
    if (!p.estrenada) { p.estrenada = true; estreno = true; animo(s, 5 + Math.min(7, BB.CATALOGO[p.id].precio / 22)); }
    return { ok: true, estreno };
  }
  function quitarse(s, capa) { if (!s.ropa[capa]) return no('e_nada'); delete s.ropa[capa]; s.pasoRopa = true; return { ok: true }; }
  function guardaLook(s, nombre, i) { const look = { nombre, ropa: { ...s.ropa } }; if (i !== undefined && s.looks[i]) s.looks[i] = look; else { if (s.looks.length >= E.looksMax) return no('e_looks'); s.looks.push(look); } return { ok: true }; }
  function poneLook(s, i) { const l = s.looks[i]; if (!l) return no('e_nada'); const r = {}; for (const c in l.ropa) if (de(s, l.ropa[c]) && !s.ventas.some(v => v.uid === l.ropa[c])) r[c] = l.ropa[c]; s.ropa = r; for (const c in r) { const p = de(s, r[c]); p.estrenada = true; } return { ok: true }; }
  // lo que entienden los dibujos
  function vista(s) { const ropa = {}; for (const c in s.ropa) { const p = de(s, s.ropa[c]); if (p) ropa[c] = { id: p.id, color: p.color }; } return { ...s.ap, ropa, animo: humor(s) }; }

  /* ---------- tiendas ---------- */
  function bazar(s) {
    if (s.bazar.dia && s.dia - s.bazar.dia < E.bazar.dias) return; s.bazar.dia = s.dia;
    const ids = Object.keys(BB.CATALOGO).filter(k => BB.CATALOGO[k].tiendas.includes('bazar')), l = [];
    while (l.length < E.bazar.piezas && ids.length) { const k = ids.splice(Math.floor(azar(s) * ids.length), 1)[0], d = BB.CATALOGO[k]; l.push({ n: s.uid++, id: k, color: elige(s, d.colores), precio: Math.max(2, Math.round(d.precio * (E.bazar.descuento - .1 + azar(s) * .2))) }); }
    s.bazar.piezas = l;
  }
  function comprar(s, id, color, donde, n) {
    const d = BB.CATALOGO[id]; if (!d) return no('e_nada'); let precio = d.precio;
    if (donde === 'bazar') { const b = s.bazar.piezas.find(x => x.n === n); if (!b) return no('e_nada'); if (s.lugar !== 'bazar') return no('e_no_aqui'); precio = b.precio; color = b.color; if (!puede(s, precio)) return no('e_dinero'); s.bazar.piezas = s.bazar.piezas.filter(x => x !== b); }
    else if (donde === 'tienda') { if (s.lugar !== 'tienda') return no('e_no_aqui'); if (!d.tiendas.includes('tienda')) return no('e_nada'); if (!puede(s, precio)) return no('e_dinero'); }
    else { if (cortado(s, 'telefono')) return no('e_sin_telefono'); const total = precio + E.linea.envio; if (!puede(s, total)) return no('e_dinero'); mueve(s, -total, 'mov_linea', { id }); const p = { n: s.uid++, tipo: 'ropa', id, color, pagado: precio, llega: s.dia + entero(s, E.linea.min, E.linea.max) }; s.paquetes.push(p); return { ok: true, paquete: p }; }
    mueve(s, -precio, 'mov_ropa', { id }); const p = pieza(s, id, color, precio); reloj(s, .25);
    return { ok: true, pieza: p };
  }
  function comprarMueble(s, id) {
    const m = BB.MUEBLES[id]; if (!m) return no('e_nada'); if (cortado(s, 'telefono')) return no('e_sin_telefono'); const total = m.precio + E.linea.envio; if (!puede(s, total)) return no('e_dinero');
    mueve(s, -total, 'mov_mueble', { mueble: id }); const p = { n: s.uid++, tipo: 'mueble', id, pagado: m.precio, llega: s.dia + entero(s, E.linea.min, E.linea.max) }; s.paquetes.push(p); return { ok: true, paquete: p };
  }
  function abrirPaquete(s, n) {
    const p = s.paquetes.find(x => x.n === n); if (!p || p.llega > s.dia) return no('e_no_llega'); if (s.lugar !== 'casa') return no('e_en_casa');
    s.paquetes = s.paquetes.filter(x => x !== p);
    if (p.tipo === 'ropa') return { ok: true, pieza: pieza(s, p.id, p.color, p.pagado) };
    const t = { uid: s.uid++, id: p.id, pagado: p.pagado }; s.casa.tengo.push(t); animo(s, 3 + BB.MUEBLES[p.id].bonito); if (s.casa.tipo === 'estudio') ponerMueble(s, p.id); return { ok: true, mueble: t };
  }
  function ponerMueble(s, id) { const m = BB.MUEBLES[id]; if (s.casa.tipo !== 'estudio') return no('e_no_decorar'); if (!s.casa.tengo.some(t => t.id === id && !s.ventas.some(v => v.uid === t.uid))) return no('e_nada'); s.casa.muebles[m.lugar] = s.casa.muebles[m.lugar] === id ? null : id; return { ok: true, puesto: !!s.casa.muebles[m.lugar] }; }
  // acomodar: cuánto se movió de su lugar (no cuesta, no gasta tiempo y no cambia el ánimo)
  function acomodar(s, k, x, y) {
    const a = BB.ACOMODO[k]; if (!a) return no('e_nada'); if (s.casa.tipo !== 'estudio') return no('e_no_decorar');
    const p = [clamp(Math.round(x), a.x[0], a.x[1]), clamp(Math.round(y), a.y[0], a.y[1])], pos = { ...s.casa.pos }; if (p[0] || p[1]) pos[k] = p; else delete pos[k];
    s.casa.pos = pos; return { ok: true, pos: p };
  }
  function pintar(s, que, id) {
    const d = (que === 'pared' ? BB.PAREDES : BB.PISOS)[id], lista = que === 'pared' ? s.casa.paredes : s.casa.pisos; if (!d) return no('e_nada'); if (s.casa.tipo !== 'estudio') return no('e_no_decorar');
    if (!lista.includes(id)) { if (!puede(s, d.precio)) return no('e_dinero'); if (!cabe(s, 2)) return no('e_tarde'); mueve(s, -d.precio, 'mov_' + que); lista.push(id); reloj(s, 2); animo(s, 5); }
    s.casa[que] = id; return { ok: true };
  }

  /* ---------- belleza ---------- */
  function cara(s, k, v) { if (['pelo', 'colorPelo', 'luces', 'mk', 'manos', 'pies'].includes(k)) return no('e_nada'); if (k === 'prop') s.ap.prop = { ...s.ap.prop, ...v }; else s.ap[k] = v; return { ok: true }; }      // gratis siempre
  const listaPelo = { pelo: 'peinados', colorPelo: 'colores', luces: 'luces' }, datosPelo = k => ({ pelo: BB.PEINADOS, colorPelo: BB.PELOS_COLOR, luces: BB.LUCES })[k];
  function precioPelo(s, k, v, donde) {
    if (s.propio[listaPelo[k]].includes(v)) return 0;
    if (donde === 'casa') { if (k === 'luces' || !datosPelo(k)[v].casa) return null; return k === 'pelo' ? E.casa.peinado : E.casa.color; }
    return { pelo: E.salon.peinado, colorPelo: E.salon.color, luces: E.salon.luces }[k];
  }
  function pelo(s, k, v, donde) {
    const p = precioPelo(s, k, v, donde); if (p === null) return no('e_solo_salon'); if (p > 0 && donde === 'salon' && s.lugar !== 'salon') return no('e_en_salon'); if (p > 0 && donde === 'casa' && s.lugar !== 'casa') return no('e_en_casa');
    if (!puede(s, p)) return no('e_dinero'); const h = p > 0 ? (donde === 'casa' ? E.casa.horas : E.salon.horas) : 0; if (!cabe(s, h)) return no('e_tarde');
    const nuevo = p > 0; if (nuevo) { mueve(s, -p, 'mov_pelo'); s.propio[listaPelo[k]].push(v); reloj(s, h); animo(s, donde === 'salon' ? 12 : 8); }
    s.ap[k] = v; return { ok: true, nuevo, horas: h };
  }
  function precioUnas(s, u, donde) {
    if (donde === 'casa') { for (const [k, d] of [['forma', BB.UNAS_FORMA], ['largo', BB.UNAS_LARGO], ['color', BB.UNAS_COLOR], ['acabado', BB.UNAS_ACABADO], ['diseno', BB.UNAS_DISENO]]) if (!d[u[k]].casa) return null; return s.propio.esmaltes.includes(u.color) ? 0 : E.casa.esmalte; }
    return (z => E.salon[z] + (u.diseno !== 'ninguno' ? E.salon.diseno : 0) + (u.acabado !== 'brillante' ? E.salon.acabado : 0) + (u.largo === 'media' ? E.salon.largo : u.largo === 'larga' ? E.salon.largo * 2 : 0));
  }
  function costoUnas(s, zonas, u, donde) { const p = precioUnas(s, u, donde); if (p === null) return null; return typeof p === 'number' ? p : zonas.reduce((t, z) => t + p(z), 0); }
  function unas(s, zonas, u, donde) {
    const p = costoUnas(s, zonas, u, donde); if (p === null) return no('e_solo_salon'); if (donde === 'salon' && s.lugar !== 'salon') return no('e_en_salon'); if (donde === 'casa' && s.lugar !== 'casa') return no('e_en_casa');
    if (!puede(s, p)) return no('e_dinero'); const h = (donde === 'casa' ? E.casa.horas : E.salon.horasUnas) * (zonas.length > 1 ? 1.5 : 1); if (!cabe(s, h)) return no('e_tarde');
    if (p) mueve(s, -p, 'mov_unas'); if (donde === 'casa' && !s.propio.esmaltes.includes(u.color)) s.propio.esmaltes.push(u.color);
    for (const z of zonas) { s.unas[z] = { color: u.color, forma: u.forma, largo: u.largo, acabado: u.acabado, diseno: u.diseno, dias: 0, rota: false }; s.ap[z] = s.unas[z]; }
    reloj(s, h); animo(s, donde === 'salon' ? 12 : 6); return { ok: true, horas: h };
  }
  function quitarUnas(s, z) { if (!s.unas[z]) return no('e_nada'); s.unas[z] = null; s.ap[z] = null; return { ok: true }; }
  // maquillaje: los productos se compran una vez; ponérselo es gratis y se quita en la noche
  const idMk = (k, v) => k === 'labios' ? 'labios_' + v : k === 'brillo' || k === 'glow' ? k : k + '_' + v;
  function precioMk(k, v) { const m = E.maquillaje; return k === 'labios' ? m.labios : k === 'brillo' || k === 'glow' ? m[k] : m[k][v]; }
  const tieneMk = (s, k, v) => s.propio.mk.includes(idMk(k, v));
  function comprarMk(s, k, v) { if (tieneMk(s, k, v)) return no('e_ya_tienes'); const p = precioMk(k, v); if (!puede(s, p)) return no('e_dinero'); mueve(s, -p, 'mov_maquillaje'); s.propio.mk.push(idMk(k, v)); animo(s, 5); ponerMk(s, k, v); return { ok: true, nuevo: true }; }
  function ponerMk(s, k, v) {
    if (k === 'acabado') { s.ap.mk = { ...s.ap.mk, acabado: v }; return { ok: true }; }
    if (!tieneMk(s, k, v)) return no('e_no_tienes'); const m = { ...s.ap.mk }, val = k === 'brillo' || k === 'glow' ? true : v;
    if (m[k] === val) delete m[k]; else m[k] = val; if (k === 'labios' && m.labios && !m.acabado) m.acabado = v.split('_')[1] || 'gloss';
    s.ap.mk = m; return { ok: true };
  }
  function guardaMk(s) { s.mkLook = { ...s.ap.mk }; return { ok: true }; }
  function poneMkLook(s) { s.ap.mk = { ...s.mkLook }; return { ok: true }; }
  function comprarSkincare(s) { const p = E.maquillaje.kitSkincare; if (!puede(s, p)) return no('e_dinero'); mueve(s, -p, 'mov_skincare'); s.skincare.usos += E.maquillaje.usosSkincare; return { ok: true }; }

  /* ---------- vender ---------- */
  function buscarVenta(s, tipo, uid) { return tipo === 'ropa' ? de(s, uid) : s.casa.tengo.find(t => t.uid === uid); }
  function quitaDe(s, tipo, uid) {
    if (tipo === 'ropa') { for (const c in s.ropa) if (s.ropa[c] === uid) delete s.ropa[c]; s.closet = s.closet.filter(p => p.uid !== uid); }
    else { const t = s.casa.tengo.find(x => x.uid === uid); s.casa.tengo = s.casa.tengo.filter(x => x.uid !== uid); if (t && !s.casa.tengo.some(x => x.id === t.id)) { const l = BB.MUEBLES[t.id].lugar; if (s.casa.muebles[l] === t.id) s.casa.muebles[l] = null; } }
    s.ventas = s.ventas.filter(v => v.uid !== uid);
  }
  function ventaRapida(s, tipo, uid) { if (cortado(s, 'telefono')) return no('e_sin_telefono'); const p = buscarVenta(s, tipo, uid); if (!p) return no('e_nada'); const m = cent(p.pagado * E.ventaRapida); quitaDe(s, tipo, uid); mueve(s, m, 'mov_venta', { id: tipo === 'ropa' ? p.id : undefined, mueble: tipo === 'mueble' ? p.id : undefined }); return { ok: true, monto: m }; }
  function publicar(s, tipo, uid) {
    if (cortado(s, 'telefono')) return no('e_sin_telefono'); const p = buscarVenta(s, tipo, uid); if (!p || s.ventas.some(v => v.uid === uid)) return no('e_nada');
    s.ventas.push({ n: s.uid++, tipo, uid, id: p.id, color: p.color, pagado: p.pagado, llega: s.dia + entero(s, E.ofertaDias[0], E.ofertaDias[1]), suerte: azar(s), oferta: 0 }); return { ok: true };
  }
  function aceptar(s, n) { const v = s.ventas.find(x => x.n === n); if (!v || !v.oferta) return no('e_nada'); const m = v.oferta; quitaDe(s, v.tipo, v.uid); mueve(s, m, 'mov_venta', { id: v.tipo === 'ropa' ? v.id : undefined, mueble: v.tipo === 'mueble' ? v.id : undefined }); return { ok: true, monto: m }; }
  function retirar(s, n) { if (!s.ventas.some(x => x.n === n)) return no('e_nada'); s.ventas = s.ventas.filter(x => x.n !== n); return { ok: true }; }

  /* ---------- fotos y notas ---------- */
  function foto(s) { const f = { n: s.uid++, dia: s.dia, hora: s.hora, lugar: s.lugar, noche: esNoche(s), vista: vista(s), casa: { tipo: s.casa.tipo, pared: s.casa.pared, piso: s.casa.piso, muebles: { ...s.casa.muebles }, pos: copia(s.casa.pos || {}) } }; s.fotos.unshift(f); if (s.fotos.length > E.fotosMax) s.fotos.length = E.fotosMax; return { ok: true, foto: f }; }
  function borraFoto(s, n) { s.fotos = s.fotos.filter(f => f.n !== n); return { ok: true }; }
  function nota(s, texto, n) { const x = s.notas.find(q => q.n === n); if (x) x.texto = texto; else s.notas.unshift({ n: s.uid++, dia: s.dia, texto }); if (!x && !usos(s, 'nota')) { usa(s, 'nota'); animo(s, 3); } return { ok: true }; }

  /* ---------- con la app cerrada ---------- */
  function ausente(s, ahora) {
    const horas = (ahora - s.ultimaVez) / 3600000, dias = Math.max(0, Math.min(E.ausente.maxDias, Math.floor(horas / E.ausente.horasPorDia)));
    s.ultimaVez = ahora; if (s.ajustes.ausente !== 'auto' || dias < 1) return { dias: 0 };
    const antes = s.dinero, r = { dias, trabajos: [], comio: 0, pagos: [], paquetes: 0, antes };
    s.lugar = 'casa';
    const msg = s.mensajes.length;
    for (let d = 0; d < dias; d++) {
      for (let c = 0; c < 2; c++) if (s.raciones > 0 && s.hambre < 75) { s.raciones--; if (s.rico > 0) s.rico--; s.hambre = clamp(s.hambre + E.comida.cocinar.sacia); r.comio++; }
      const o = s.ofertas.filter(x => s.sabe.includes(x.id)).sort((a, b) => b.paga - a.paga)[0];
      if (o && s.hambre > 25 && !cortado(s, 'luz')) { const p = cent(Math.round(pagaPrevista(s, o) * .75)); mueve(s, p, 'mov_trabajo', { id: o.id }); r.trabajos.push({ id: o.id, monto: p }); s.ofertas = s.ofertas.filter(x => x !== o); }
      const pagables = s.cuentas.filter(c => c.vence <= s.dia + 1 && puede(s, c.monto)); for (const c of pagables) if (puede(s, c.monto)) { r.pagos.push({ tipo: c.tipo, monto: c.monto }); paga(s, c.n); }
      s.hambre = Math.max(25, clamp(s.hambre - 45));
      cierraDia(s, true);
      for (const tipo of ['renta', 'luz', 'telefono']) if (!(tipo !== 'telefono' && s.casa.tipo === 'sofa')) siguiente(s, tipo);
    }
    s.energia = Math.max(s.energia, 80); s.hora = E.dormir.despierta; s.animo = Math.max(s.animo, 35 < topeAnimo(s) ? Math.min(35, topeAnimo(s)) : s.animo);
    r.paquetes = s.paquetes.filter(p => p.llega <= s.dia).length; r.ofertas = s.ventas.filter(v => v.oferta).length; r.despues = s.dinero; r.mensajes = Math.max(0, s.mensajes.length - msg);
    return r;
  }

  /* ---------- tutorial ---------- */
  const PASOS = { 1: s => Object.keys(s.ropa).length > 0 && !!s.pasoRopa, 2: s => s.hechos >= 1, 3: s => !!s.pasoComer, 4: s => !!s.pasoCiudad, 5: s => s.dia >= 2 };
  function avanzaTutorial(s) { let n = 0; while (s.tutorial && s.tutorial <= 5 && PASOS[s.tutorial](s)) { s.tutorial++; n++; mensaje(s, 'mentora', 'm_tuto_' + s.tutorial); } if (s.tutorial > 5) s.tutorial = 0; return n; }

  // números cortos
  function corto(n) { const g = n < 0 ? '-' : '', a = Math.abs(n); if (a < 1000) return g + (a % 1 && a < 100 ? a.toFixed(2) : String(Math.round(a))); const u = ['K', 'M', 'B', 'T']; let i = -1, v = a; while (v >= (i < 0 ? 1000 : 999.5) && i < 3) { v /= 1000; i++; } if (i < 0) { v = a / 1000; i = 0; } return g + (v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')) + u[i]; }

  BB.L = { VERSION, nueva, copia, azar, mensaje, mueve, puede, pieza, de, actividad, skincare, comer, surtir, ir, dormir, cierraDia, atrasada, cortado, cuentasDelDia, paga, pagaDeuda, desalojo, costoMudanza, mudarse, nivelHab, nivelRep, repVisible, ofertas, energiaTrabajo, calidad, pagaPrevista, trabajar, ponerse, quitarse, guardaLook, poneLook, vista, humor, bazar, comprar, comprarMueble, abrirPaquete, ponerMueble, acomodar, pintar, bonito, cara, precioPelo, pelo, costoUnas, unas, quitarUnas, idMk, precioMk, tieneMk, comprarMk, ponerMk, guardaMk, poneMkLook, comprarSkincare, ventaRapida, publicar, aceptar, retirar, foto, borraFoto, nota, ausente, avanzaTutorial, corto, semana, esNoche, usos, cabe, topeAnimo, buscarVenta };
})(typeof globalThis !== 'undefined' ? globalThis : this);
