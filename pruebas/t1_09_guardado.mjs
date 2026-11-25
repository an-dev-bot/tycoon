import fs from 'node:fs';
import path from 'node:path';
import { RAIZ, cargar, revisa } from './comun.mjs';
import { abrir, PARTIDA, espera } from './navegador.mjs';
export const titulo = 'Guardado';
export default async function () {
  const BB = await cargar(), L = BB.L, G = BB.G;
  const viejo = fs.readFileSync(path.join(RAIZ, 'pruebas', 'partida_v1.json'), 'utf8'), v = JSON.parse(viejo), s = G.abrir(viejo);
  revisa(v.version === 1 && s && s.version === L.VERSION, 'una partida de la versión 1 abre en la actual'); revisa(s.nombre === v.nombre && s.dinero === v.dinero && s.dia === v.dia && s.closet.length === v.closet.length && s.ap.pelo === v.ap.pelo, 'conserva nombre, dinero, día, ropa y apariencia');
  revisa(L.vista(s).ropa.encima.id === v.ropa.encima.id && s.unas.manos.color === v.unas.manos, 'trae puesta la misma ropa y las mismas uñas'); const uids = [...s.closet.map(p => p.uid), ...s.cuentas.map(c => c.n)]; revisa(new Set(uids).size === uids.length, 'nada quedó repetido');
  let ok = true; for (let i = 0; i < 12; i++) { s.lugar = 'casa'; ok = ok && L.dormir(s).ok; } L.foto(s); revisa(ok && s.dia === v.dia + 12, 'y se puede seguir jugando'); revisa(G.abrir('{"a":1}') === null && G.abrir('nada') === null && G.abrir('') === null && G.abrir(JSON.stringify({ ...s, version: 99 })) === null, 'un archivo que no es partida se rechaza');
  const t = G.texto(s); revisa(G.texto(G.abrir(t)) === t, 'exportar e importar deja todo igual');
  const N = await abrir();
  try {
    await N.ir(); await N.js('window.BB_RAPIDO=1'); await N.js(`BB.app.empieza(${PARTIDA})`); const guardada = () => N.js("JSON.parse(localStorage.getItem('bb_partida'))");
    await N.js("(BB.app.ui.tab='ella',BB.app.ui.ella='ropa',BB.app.dibuja(true),[...document.querySelectorAll('.mosaico')].find(b=>!b.classList.contains('on')).click())"); revisa(JSON.stringify((await guardada()).ropa) === await N.js('JSON.stringify(BB.app.s.ropa)'), 'guarda al cambiar algo');
    await N.js("(BB.app.s.nombre='Otra',Object.defineProperty(document,'hidden',{value:true,configurable:true}),document.dispatchEvent(new Event('visibilitychange')))"); revisa((await guardada()).nombre === 'Otra', 'guarda al ocultar la página'); await N.js("(delete document.hidden,BB.app.s.nombre='Cierre',document.dispatchEvent(new Event('visibilitychange')),window.dispatchEvent(new Event('pagehide')))"); revisa((await guardada()).nombre === 'Cierre', 'guarda al cerrar');
    const igual = await N.js("(()=>{const t=BB.G.texto(BB.app.s);BB.app.importarTexto(t);const a=JSON.parse(t),b=JSON.parse(BB.G.texto(BB.app.s));delete a.ultimaVez;delete b.ultimaVez;return JSON.stringify(a)===JSON.stringify(b)})()"); revisa(igual, 'importar en el juego deja todo igual');
    await N.js("localStorage.setItem('bb_partida','{\"roto')"); const dia = await N.js('BB.app.s.dia'); await N.js("(window.__x=1,BB.app.s=null)"); await N.ir('?r=1'); revisa(await N.js('BB.app.s && BB.app.s.dia') === dia, 'si la partida se daña, abre la copia de respaldo');
    await N.js(`BB.app.importarTexto(${JSON.stringify(viejo)})`); revisa(await N.js('BB.app.s.nombre') === v.nombre, 'la partida vieja abre también en la página');
    await N.js("(BB.app.ui.tab='telefono',BB.app.ui.appTel='ajustes',BB.app.dibuja(),document.querySelector('[data-k=borrar]').click())"); const toca = () => N.js("[...document.querySelectorAll('.velo .bt')].pop().click()"); await toca(); revisa(await N.js('!!BB.app.s'), 'una confirmación no borra'); await toca(); await espera(50); revisa(await N.js("!BB.app.s && !localStorage.getItem('bb_partida')"), 'borrar pide dos confirmaciones');
    revisa(!N.errores.length, 'sin errores', N.errores);
  } finally { await N.cierra(); }
}
