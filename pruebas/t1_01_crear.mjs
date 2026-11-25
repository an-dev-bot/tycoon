import { cargar, iguales, revisa } from './comun.mjs';
export const titulo = 'Crear a la chica';
export default async function () {
  const BB = await cargar(), L = BB.L, base = { ...BB.APARIENCIA, pelo: 'chongo', piercing: false, ropa: {} };
  const dib = o => [BB.ELLA.figura(o), BB.CERCA.cara(o)], distinto = (a, b) => !iguales(a[0], b[0]) || !iguales(a[1], b[1]);
  // cada opción se ve distinta de todas las demás de su grupo
  const grupo = (nombre, ids, con, dibuja = dib) => { const r = ids.map(id => dibuja(con(id))), mal = []; for (let i = 0; i < r.length; i++) for (let j = 0; j < i; j++) if (!distinto(r[i], r[j])) mal.push(ids[i] + '=' + ids[j]); revisa(!mal.length, `${nombre}: ${ids.length} opciones, todas distintas`, mal); };
  const cs = { piel: ['PIELES', 10], forma: ['FORMAS', 5], ojos_: ['OJOS', 6], iris: ['IRIS', 8], cejas: ['CEJAS', 5], pestanas: ['PESTANAS', 4], nariz: ['NARICES', 5], labios: ['LABIOS', 5], lunar: ['LUNARES', 5], cuerpo: ['CUERPOS', 4], pelo: ['PEINADOS', 12], colorPelo: ['PELOS_COLOR', 12], luces: ['LUCES', 5] };
  for (const k in cs) { const ids = Object.keys(BB[cs[k][0]]); revisa(ids.length === cs[k][1], `${k}: hay ${cs[k][1]}`, ids.length); grupo(k, ids, id => ({ ...base, [k]: id })); }
  grupo('pecas', Object.keys(BB.PECAS), id => ({ ...base, pecas: id }));
  grupo('piercing', [false, true], v => ({ ...base, piercing: v }));
  grupo('estatura', [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], v => ({ ...base, estatura: v }));
  for (const p in BB.PROPORCIONES) grupo('proporción ' + p, [-1, 0, 1], v => ({ ...base, prop: { ...base.prop, [p]: v } }));
  for (const [k, d, n] of [['delineado', 'DELINEADOS', 3], ['pestanas', 'PESTANAS_MK', 4], ['rubor', 'RUBORES', 4], ['labios', 'LABIALES', 6]]) { const ids = Object.keys(BB[d]); revisa(ids.length === n, `maquillaje ${k}: hay ${n}`); grupo('maquillaje ' + k, [null, ...ids], id => ({ ...base, mk: id ? { [k]: id } : {} })); }
  grupo('gloss y mate', ['gloss', 'mate'], a => ({ ...base, mk: { labios: 'rosado', acabado: a } })); for (const k of ['brillo', 'glow']) grupo(k, [false, true], v => ({ ...base, mk: { [k]: v } }));
  const u0 = { color: 'rosa', forma: 'squoval', largo: 'media', acabado: 'brillante', diseno: 'ninguno' };
  for (const z of ['manos', 'pies']) for (const [k, d, n] of [['color', 'UNAS_COLOR', 16], ['forma', 'UNAS_FORMA', 4], ['largo', 'UNAS_LARGO', 3], ['acabado', 'UNAS_ACABADO', 4], ['diseno', 'UNAS_DISENO', 9]]) { const ids = Object.keys(BB[d]); revisa(ids.length === n, `uñas ${k}: ${n}`); grupo(`uñas de ${z}, ${k}`, ids, id => ({ ...base, [z]: { ...u0, [k]: id } }), o => [BB.CERCA[z](o), BB.CERCA[z](o)]); }
  grupo('expresión', ['contenta', 'normal', 'cansada', 'triste'], a => ({ ...base, animo: a })); grupo('granitos', [false, true], v => ({ ...base, granitos: v }));
  grupo('uñas despostilladas', [false, true], v => ({ ...base, manos: { ...u0, rota: v } }), o => [BB.CERCA.manos(o), BB.CERCA.manos(o)]);
  // gratis y de paga
  const s = L.nueva({}, 'Prueba', 3); s.dinero = 1000;
  for (const [k, v] of [['piel', 'miel'], ['forma', 'redonda'], ['cuerpo', 'curvy'], ['estatura', 4], ['lunar', 'ojo'], ['piercing', true], ['prop', { cadera: 1 }]]) L.cara(s, k, v);
  revisa(s.dinero === 1000 && s.ap.piel === 'miel' && s.ap.cuerpo === 'curvy' && s.ap.prop.cadera === 1, 'cara y cuerpo se cambian gratis');
  revisa(!L.cara(s, 'pelo', 'rizos').ok && s.ap.pelo === 'lacio', 'el pelo no se cambia por la vía gratis');
  let m = s.dinero; s.lugar = 'salon'; L.pelo(s, 'pelo', 'rizos', 'salon'); revisa(m - s.dinero === BB.ECO.salon.peinado && s.ap.pelo === 'rizos', 'el salón cobra el peinado');
  s.lugar = 'casa'; m = s.dinero; L.pelo(s, 'pelo', 'lacio', 'casa'); L.pelo(s, 'pelo', 'rizos', 'casa'); revisa(m === s.dinero, 'lo ya comprado se queda: cambiar entre los suyos es gratis');
  m = s.dinero; L.pelo(s, 'colorPelo', 'negro', 'casa'); revisa(m - s.dinero === BB.ECO.casa.color && BB.ECO.casa.color < BB.ECO.salon.color, 'teñirse en casa cuesta menos que en el salón');
  revisa(L.pelo(s, 'colorPelo', 'rosa', 'casa').error === 'e_solo_salon', 'en casa hay menos opciones');
  m = s.dinero; L.unas(s, ['manos'], { ...u0, largo: 'corta' }, 'casa'); revisa(m - s.dinero === BB.ECO.casa.esmalte && s.ap.manos.color === 'rosa' && !s.ap.pies, 'uñas en casa cobran; manos y pies van por separado');
  s.lugar = 'salon'; s.hora = 10; m = s.dinero; L.unas(s, ['manos', 'pies'], { ...u0, diseno: 'corazones' }, 'salon'); revisa(m - s.dinero > 80 && s.ap.pies.diseno === 'corazones', 'manos y pies iguales en el salón cobran las dos', m - s.dinero);
  m = s.dinero; revisa(!L.ponerMk(s, 'rubor', 'frio').ok, 'no se pone maquillaje que no tiene'); L.comprarMk(s, 'rubor', 'frio'); revisa(m - s.dinero === BB.ECO.maquillaje.rubor.frio && s.ap.mk.rubor === 'frio', 'el maquillaje cobra y se pone'); m = s.dinero; L.ponerMk(s, 'rubor', 'frio'); L.ponerMk(s, 'rubor', 'frio'); revisa(m === s.dinero && s.ap.mk.rubor === 'frio', 'ponérselo otra vez es gratis');
}
