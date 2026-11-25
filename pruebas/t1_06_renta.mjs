import { cargar, revisa } from './comun.mjs';
const igual = (a, b) => Math.abs(a - b) < .01;
export const titulo = 'Renta y desalojo';
export default async function () {
  const BB = await cargar(), L = BB.L, E = BB.ECO, s = L.nueva({}, '', 21), msj = k => s.mensajes.filter(m => m.llave === k), dia = d => { while (s.dia < d) { s.raciones = 9; s.lugar = 'casa'; L.dormir(s); } };
  revisa(s.dinero === 0 && s.cuentas.find(c => c.tipo === 'renta').vence === 8 && s.raciones === 6, 'empieza con $0, la primera semana pagada y comida para 3 días');
  for (const id of ['tocador', 'camaCapitonada', 'lamparaMesa', 'espejoLuz']) { s.casa.tengo.push({ uid: s.uid++, id, pagado: BB.MUEBLES[id].precio }); s.casa.muebles[BB.MUEBLES[id].lugar] = id; }
  s.casa.pared = 'rosa'; const ropa = s.closet.length;
  dia(4); revisa(!msj('m_aviso_renta').length, 'antes no avisa'); dia(5); revisa(msj('m_aviso_renta').length === 1, 'avisa 3 días antes');
  dia(8); const r = s.cuentas.find(c => c.tipo === 'renta' && c.vence === 8); revisa(r.monto === E.renta.estudio, 'el día que vence no hay recargo'); dia(9); revisa(igual(r.monto, E.renta.estudio * 1.1) && msj('m_atraso_renta').length === 1, 'atraso: recargo del 10%', r.monto);
  dia(15); revisa(igual(r.monto, E.renta.estudio * 1.1), 'el recargo es por semana, no por día'); dia(16); revisa(igual(r.monto, E.renta.estudio * 1.2), 'segunda semana: otro 10%', r.monto);
  dia(19); revisa(msj('m_ultimatum').length === 1 && s.casa.tipo === 'estudio', 'hay un último aviso'); dia(21); revisa(s.casa.tipo === 'estudio', 'un día antes de las 2 semanas sigue en su estudio');
  dia(22); const d = s.ultimoDesalojo; revisa(s.casa.tipo === 'compartido' && s.desalojos === 1, 'a las 2 semanas: desalojo, sin prórroga');
  const remate = (BB.MUEBLES.espejoLuz.precio + BB.MUEBLES.lamparaMesa.precio) * .25; revisa(d.remate === remate && s.casa.tengo.map(t => t.id).sort().join() === 'camaCapitonada,tocador', 'se lleva 2 muebles y lo demás se remata al 25%', d);
  revisa(s.closet.length === ropa, 'conserva su ropa'); revisa(d.deposito === E.renta.depositoEstudio && s.casa.deposito === 0, 'pierde el depósito'); revisa(Math.abs(s.deudaVieja - (d.debe - remate)) < .01 && s.dinero === 0, 'lo del remate se va a la deuda; lo demás lo sigue debiendo', [s.deudaVieja, d]);
  revisa(!Object.values(s.casa.muebles).some(Boolean) && !L.ponerMueble(s, 'tocador').ok && !L.pintar(s, 'pared', 'lila').ok, 'el cuarto compartido no se decora'); revisa(s.animo <= 62 && L.topeAnimo(s) < 100, 'y el ánimo es más bajo');
  revisa(s.cuentas.find(c => c.tipo === 'renta').base === E.renta.compartido && E.renta.compartido < E.renta.estudio, 'paga una renta más barata'); revisa(L.atrasada(s), 'la deuda sigue bajando su reputación');
  dia(44); revisa(s.casa.tipo === 'sofa' && s.desalojos === 2, 'si tampoco paga, duerme en el sofá de la mentora'); revisa(s.animo <= 35, 'con el ánimo por los suelos', s.animo); revisa(!s.cuentas.some(c => c.tipo === 'renta' || c.tipo === 'luz'), 'en el sofá no hay renta');
  s.dinero = 1200; revisa(L.mudarse(s, 'estudio').error === 'e_deuda', 'para otro estudio primero hay que pagar la deuda'); L.pagaDeuda(s); const m = s.dinero; s.hora = 9; revisa(s.deudaVieja === 0 && L.mudarse(s, 'estudio').ok && m - s.dinero === E.renta.estudio + E.renta.depositoEstudio && s.casa.tipo === 'estudio', 'salir de ahí cuesta renta y depósito otra vez');
  // con la app cerrada no vence nada
  const t = L.nueva({}, '', 22); while (t.dia < 21) { t.lugar = 'casa'; t.raciones = 9; L.dormir(t); } t.dinero = 0; t.sabe = [];
  const antes = t.cuentas.filter(c => c.tipo === 'renta').map(c => [c.monto, t.dia - c.vence]); for (let i = 0; i < 6; i++) { t.ultimaVez = 0; L.ausente(t, 100 * 3600e3); }
  revisa(t.casa.tipo === 'estudio' && t.desalojos === 0, 'con la app cerrada (6 veces, 18 días) no hay desalojo'); const desp = t.cuentas.filter(c => c.tipo === 'renta').slice(0, antes.length).map(c => [c.monto, t.dia - c.vence]); revisa(JSON.stringify(antes.map(x => x[0])) === JSON.stringify(desp.map(x => x[0])) && desp[0][1] <= antes[0][1], 'ni recargos ni más días de atraso', [antes, desp]);
  L.dormir(t); revisa(t.casa.tipo === 'compartido', 'al volver a jugar, el plazo sigue donde se quedó');
  // cortes
  const c = L.nueva({}, '', 23); while (c.dia < 16) { c.lugar = 'casa'; c.raciones = 9; L.dormir(c); } c.energia = 100; c.hora = 9; revisa(L.trabajar(c, c.ofertas[0].n).error === 'e_sin_internet', 'sin pagar internet no se trabaja en casa'); c.dinero = 500; revisa(L.comprar(c, 'aretes', null, 'linea').error === 'e_sin_telefono', 'sin pagar el teléfono no hay tienda en línea');
  c.lugar = 'cafe'; L.comer(c, 'cafe'); revisa(L.trabajar(c, c.ofertas[0].n).ok, 'pero sí se puede trabajar en el café');
}
