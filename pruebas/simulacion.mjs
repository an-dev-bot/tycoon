// Jugadoras automáticas: aplicada, normal y floja. Usan las mismas reglas que el juego.
export const JUGADORAS = {
  aplicada: { prob: 1, reserva: 6, horas: 12, limpia: 30, siesta: true, cafe: 0, gusto: 0, domicilio: 0, skincare: true },
  normal: { prob: 1, reserva: 12, horas: 7, limpia: 40, siesta: true, cafe: .15, gusto: 5, domicilio: .04, skincare: true },
  floja: { prob: .62, reserva: 30, horas: 4, limpia: 75, siesta: false, cafe: .3, gusto: 14, domicilio: .4, skincare: false },
};
export function simular(BB, tipo, semilla, dias = 60) {
  const L = BB.L, J = JUGADORAS[tipo], s = L.nueva({}, '', semilla); let r = semilla * 7 + 13;
  const az = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
  const dato = { atraso1: null, desalojo: null, max: 0, animo: 0, rep: 0 }, gustos = [0];
  while (s.dia <= dias) {
    const hoy = s.dia;
    if (J.skincare) { if (s.skincare.usos < 2 && s.dinero > 90) L.comprarSkincare(s); L.actividad(s, 'skincare'); }
    if (s.hambre < 70) L.comer(s, 'cocinar');
    if (J.limpia < s.casa.suciedad) L.actividad(s, 'limpiar');
    if (az() < J.cafe && s.dinero > 60 && L.ir(s, 'cafe').ok) { L.comer(s, 'cafe'); L.ir(s, 'casa'); }
    let trabajadas = 0; const ganas = az() < J.prob;
    for (let i = 0; ganas && i < 8; i++) {
      if (s.hambre < 45) { if (az() < J.domicilio && s.dinero > 30) L.comer(s, 'domicilio'); else L.comer(s, 'cocinar'); }
      const o = s.ofertas.filter(x => L.energiaTrabajo(s, x) <= s.energia - J.reserva && s.hora + x.horas <= 22 && trabajadas + x.horas <= J.horas + 1).sort((a, b) => (L.calidad(s, b) >= 4) - (L.calidad(s, a) >= 4) || b.paga / b.horas - a.paga / a.horas)[0];
      if (o) { const q = L.trabajar(s, o.n); if (q.ok) trabajadas += o.horas; continue; }
      if (J.siesta && L.actividad(s, 'siesta').ok) continue;
      if (J.siesta && s.hora < 19 && L.actividad(s, 'descansar').ok) continue;
      break;
    }
    L.actividad(s, 'banarse');
    if (s.raciones < 3 && s.dinero >= 30) { if (L.ir(s, 'super').ok) { L.surtir(s, 'super'); if (s.raciones < 3) L.surtir(s, 'super'); } L.ir(s, 'casa'); }
    if (s.lugar !== 'casa') L.ir(s, 'casa');
    if (s.hambre < 60) { if (az() < J.domicilio && s.dinero > 30) L.comer(s, 'domicilio'); else L.comer(s, 'cocinar'); }
    if (J.skincare) { while (s.hora < 18 && L.actividad(s, 'descansar').ok); if (s.hora < 18) s.hora = 18; L.actividad(s, 'skincare'); }
    for (const c of s.cuentas.slice().sort((a, b) => a.vence - b.vence)) if (c.vence - s.dia <= 1) L.paga(s, c.n);
    if (s.deudaVieja) L.pagaDeuda(s, Math.max(0, s.dinero - 60));
    if (s.casa.tipo === 'sofa') L.mudarse(s, 'compartido');
    if (J.gusto && s.dinero > (tipo === 'floja' ? 40 : 150) + J.gusto) { L.mueve(s, -J.gusto, 'mov_ropa'); gustos[0] += J.gusto; }
    if (s.lugar !== 'casa') L.ir(s, 'casa');
    const q = L.dormir(s); if (!q.ok) throw new Error('no pudo dormir ' + q.error + s.lugar);
    if (s.dia !== hoy + 1) throw new Error('día');
    dato.max = Math.max(dato.max, s.dinero); dato.animo += s.animo / dias;
    if (!dato.atraso1 && s.cuentas.some(c => c.tipo === 'renta' && s.dia > c.vence)) dato.atraso1 = s.dia;
    if (!dato.desalojo && s.desalojos) dato.desalojo = s.dia;
  }
  const { ganado, gastado } = s.estadisticas;
  return { ...dato, ganado, gastado, ahorro: (ganado - gastado) / ganado, dinero: s.dinero, rep: L.nivelRep(s), hechos: s.hechos, desalojos: s.desalojos, casa: s.casa.tipo, gustos: gustos[0], s };
}
