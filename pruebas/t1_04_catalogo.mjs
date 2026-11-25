import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, archivos, cargar, iguales, revisa } from './comun.mjs';
export const titulo = 'Catálogo';
const MARCAS = 'nike,adidas,gucci,prada,chanel,dior,zara,shein,h&m,uniqlo,levis,ugg,crocs,converse,vans,puma,supreme,lululemon,skims,brandy,aritzia,hermes,hermès,louis vuitton,balenciaga,versace,fendi,burberry,tiffany,cartier,rolex,sephora,ulta,rhode,fenty,maybelline,mac cosmetics,nars,glossier,rare beauty,ikea,target,walmart,costco,amazon,etsy,depop,starbucks,instagram,tiktok,facebook,whatsapp,iphone,apple,google,disney,hello kitty,sanrio,miffy,jellycat,barbie,pokemon,uber,airbnb,doordash,mcdonald,oreo,coca'.split(',');
export default async function () {
  const BB = await cargar(), mal = [], cats = {}, C = BB.CATALOGO;
  for (const id in C) { const d = C[id]; cats[d.cat] = (cats[d.cat] || 0) + 1; if (!d.nombre || !d.en) mal.push(id + ' nombre'); if (!(d.precio > 0)) mal.push(id + ' precio'); if (!d.capa) mal.push(id + ' capa'); if (!BB.VESTIR[d.dibujo]) mal.push(id + ' dibujo'); if (d.colores.length < 3 || d.colores.length > 6 || new Set(d.colores).size !== d.colores.length) mal.push(id + ' colores ' + d.colores.length); if (!d.tiendas.length) mal.push(id + ' tienda'); if (!BB.CATEGORIAS[d.cat]) mal.push(id + ' cat'); }
  revisa(!mal.length, 'cada pieza tiene nombre (es/en), precio, capa, dibujo, tienda y 3 a 6 colores', mal);
  revisa(Object.keys(C).length === 70 && JSON.stringify(cats) === JSON.stringify({ base: 8, encima: 12, abajo: 10, vestido: 4, pijama: 4, piernas: 8, calzado: 12, accesorio: 12 }), '70 piezas: 8, 12, 10, 4, 4, 8, 12 y 12', cats);
  const base = { ...BB.APARIENCIA, pelo: 'chongo', ropa: {} }, ref = BB.ELLA.figura(base), refC = BB.CERCA.cara(base), refM = BB.CERCA.manos(base), refP = BB.CERCA.pies(base), no = [], col = [];
  for (const id in C) { const con = c => ({ ...base, ropa: { [C[id].capa]: { id, color: c } } }), dib = o => [BB.ELLA.figura(o), BB.CERCA.cara(o), BB.CERCA.manos(o), BB.CERCA.pies(o)], a = dib(con(C[id].colores[0])); if ([ref, refC, refM, refP].every((r, i) => iguales(r, a[i]))) no.push(id); const b = dib(con(C[id].colores[1])); if (a.every((r, i) => iguales(r, b[i]))) col.push(id); const m = BB.miniatura(id, C[id].colores[0]); if (!(m.w > 3 && m.h > 2)) no.push(id + ' miniatura'); }
  revisa(!no.length, 'cada pieza se ve puesta y tiene miniatura', no); revisa(!col.length, 'cada color cambia el dibujo', col);
  revisa(Object.values(C).some(d => d.precio <= 10) && Object.values(C).some(d => d.precio >= 150), 'hay cosas baratas y algunas caras');
  for (const t of ['bazar', 'tienda', 'linea']) revisa(Object.values(C).filter(d => d.tiendas.includes(t)).length >= 15, 'hay surtido en: ' + t);
  const M = BB.MUEBLES, mm = []; for (const id in M) { const d = M[id]; if (!d.nombre || !d.en || !(d.precio > 0) || !BB.LUGARES_MUEBLE[d.lugar]) mm.push(id); const b = BB.DEPA.mini(id); if (b.w < 4) mm.push(id + ' mini'); const vis = ['cuarto', 'cocina'].some(vista => { const o = { tipo: 'estudio', vista, pared: 'gris', piso: 'gastado', muebles: {} }; return !iguales(BB.DEPA.casa(o), BB.DEPA.casa({ ...o, muebles: { [d.lugar]: id } })); }); if (!vis) mm.push(id + ' no se ve'); }
  revisa(Object.keys(M).length === 30 && !mm.length, '30 muebles con nombre, precio y dibujo que se ve en su depa', mm);
  const c0 = { tipo: 'estudio', vista: 'cuarto', pared: 'gris', piso: 'gastado', muebles: {} }; revisa(!iguales(BB.DEPA.casa(c0), BB.DEPA.casa({ ...c0, noche: true })) && !iguales(BB.DEPA.casa(c0), BB.DEPA.casa({ ...c0, suciedad: 80 })), 'el depa cambia de día a noche y se ve cuando está sucio');
  revisa(!iguales(BB.DEPA.casa({ ...c0, tipo: 'compartido' }), BB.DEPA.casa({ ...c0, tipo: 'sofa' })), 'el cuarto compartido y el sofá tienen su dibujo');
  const txt = archivos().filter(f => f.startsWith('datos/')).map(f => fs.readFileSync(path.join(RAIZ, f), 'utf8')).join('\n').toLowerCase() + JSON.stringify([BB.PEINADOS, BB.UNAS_COLOR, BB.LABIALES, BB.RUBORES]).toLowerCase();
  const usadas = MARCAS.filter(m => new RegExp('(^|[^a-záéíóúñ])' + m.replace(/[&.]/g, '\\$&') + '([^a-záéíóúñ]|$)').test(txt)); revisa(!usadas.length, 'ninguna marca real', usadas);
}
