import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, cargar, revisa } from './comun.mjs';
import { abrir } from './navegador.mjs';
export const titulo = 'Capas de ropa (por pixeles, en el navegador) y capa básica';
export default async function () {
  const BB = await cargar();
  const N = await abrir();
  try {
    await N.ir(); await N.js(fs.readFileSync(path.join(RAIZ, 'pruebas', 'revision_capas.js'), 'utf8') + ';1');
    const r = k => N.js(`REVISION.${k}()`);
    const p = await r('piel'); revisa(!p.length, '70 piezas × 4 complexiones × 3 estaturas: la piel no atraviesa la tela', p.slice(0, 5));
    const px = await N.js("REVISION.piel({hombros:1,cintura:1,cadera:1,piernas:1}).concat(REVISION.piel({hombros:-1,cintura:-1,cadera:-1,piernas:-1}))"); revisa(!px.length, 'tampoco con las proporciones al límite', px.slice(0, 5));
    const c = await r('cruces'); revisa(!c.length, 'ninguna capa tapa mal a otra', c.slice(0, 5));
    const b = await r('basica'); revisa(!b.length, 'la capa básica está en todos los dibujos, sobre la piel y bajo la ropa', b.slice(0, 5));
    const q = await r('quitar'); revisa(!q.length, 'quitar el hoodie deja la base; se puede ir descalza o solo con calcetas', q);
    revisa(!N.errores.length, 'sin errores en la página', N.errores);
  } finally { await N.cierra(); }
  const L = BB.L, s = L.nueva({}, '', 4); for (const c of Object.keys(s.ropa)) L.quitarse(s, c);
  revisa(!Object.keys(s.ropa).length && !L.quitarse(s, 'basica').ok && !L.quitarse(s, 'piel').ok, 'se puede quitar toda la ropa, pero la capa básica no es una prenda que se pueda quitar');
  const caps = BB.ELLA.capasDe(L.vista(s)).capas.filter(c => c.id === 'basica'); revisa(caps.length === 2, 'sin ropa, la capa básica sigue puesta');
  const z = L.nueva({}, '', 5); revisa(z.closet.map(p => p.id).join() === 'hoodie,pants,chanclas', 'empieza solo con hoodie, pants y chanclas');
  L.pieza(z, 'playera', null, 14); L.pieza(z, 'vestidoFloral', null, 58); L.ponerse(z, z.closet[3].uid); L.ponerse(z, z.closet[4].uid); revisa(z.ropa.vestido && !z.ropa.base && !z.ropa.abajo && z.ropa.encima, 'el vestido cambia base y pantalón, y deja lo de encima');
  for (let i = 0; i < 14; i++) L.guardaLook(z, 'L' + i); revisa(z.looks.length === 12, 'hasta 12 looks'); L.quitarse(z, 'vestido'); L.poneLook(z, 3); revisa(!!z.ropa.vestido, 'un look guardado se vuelve a poner');
}
