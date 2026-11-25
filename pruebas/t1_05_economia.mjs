import { cargar, revisa } from './comun.mjs';
import { simular } from './simulacion.mjs';
export const titulo = 'Economía: 60 días, 40 partidas por jugadora';
export default async function () {
  const BB = await cargar(), R = {}, med = (l, f) => l.reduce((t, x) => t + f(x), 0) / l.length;
  for (const t of ['aplicada', 'normal', 'floja']) { R[t] = [...Array(40).keys()].map(i => simular(BB, t, i + 101)); const l = R[t]; console.log(`         ${t}: gana $${med(l, x => x.ganado / 60 * 7).toFixed(0)} y gasta $${med(l, x => x.gastado / 60 * 7).toFixed(0)} por semana · ahorra ${(med(l, x => x.ahorro) * 100).toFixed(0)}% · desalojadas ${l.filter(x => x.desalojos).length}/40`); }
  const a = med(R.aplicada, x => x.ahorro), n = med(R.normal, x => x.ahorro), sem = med(R.aplicada, x => (x.ganado - x.gastado) / 60 * 7);
  revisa(a > .11 && a < .20, 'la aplicada ahorra cerca de un 15%', a); revisa(R.aplicada.every(x => !x.desalojos), 'la aplicada nunca pierde su depa');
  revisa(n > 0 && n < a - .04, 'la normal apenas sale (ahorra bastante menos)', n); revisa(R.normal.filter(x => x.desalojos).length <= 14, 'la normal casi siempre conserva su depa', R.normal.filter(x => x.desalojos).length);
  revisa(R.floja.every(x => x.desalojos >= 1), 'la floja termina desalojada'); revisa(R.floja.every(x => x.atraso1 <= 22), 'la floja se atrasa en dos o tres semanas', R.floja.map(x => x.atraso1));
  revisa(Object.values(R).flat().every(x => x.max < 10000), 'nadie llega a $10,000', Math.max(...Object.values(R).flat().map(x => x.max)));
  const j = BB.CATALOGO.jeans.precio; revisa(j > sem * .65 && j < sem * 1.35, `unos jeans ($${j}) son casi una semana de ahorro ($${sem.toFixed(0)})`);
  revisa(Object.values(R).flat().every(x => x.dinero >= 0), 'el saldo nunca queda en negativo');
  for (const x of Object.values(R).flat().slice(0, 40)) if (Math.abs(x.ganado - x.gastado - x.dinero) > .05) { revisa(false, 'ganado − gastado = saldo', x); return; }
  revisa(true, 'ganado − gastado = saldo');
  // nivel 5: llega el mensaje
  const s = BB.L.nueva({}, '', 9); s.rep = BB.ECO.trabajo.repNiveles[4]; s.ofertasDia = 0; BB.L.ofertas(s); BB.L.trabajar(s, s.ofertas[0].n); revisa(s.mensajes.some(m => m.llave === 'm_empresa'), 'con reputación nivel 5 llega «¿Y si pones tu propia empresa?»'); revisa(s.ofertas.length > 0 || s.hechos === 1, 'trabajar usa el encargo');
  const p = BB.L.nueva({}, '', 9), q = BB.L.nueva({}, '', 9); p.rep = q.rep = 300; q.cuentas[0].vence = 0; p.ofertasDia = q.ofertasDia = 0; BB.L.ofertas(p); BB.L.ofertas(q); const niv = z => Math.max(...z.ofertas.map(o => BB.TRABAJOS[o.id].nivel)); revisa(niv(q) < niv(p) && q.ofertas.length < p.ofertas.length, 'con deudas llegan menos y peores encargos');
}
