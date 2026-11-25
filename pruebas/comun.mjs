// Utilidades de las pruebas: carga el juego sin navegador y lleva la cuenta de lo que pasa y lo que falla.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ } from '../herramientas/png.mjs';
export { RAIZ };
export const cuenta = { ok: 0, mal: 0 };
export function revisa(cond, texto, detalle) {
  if (cond) cuenta.ok++; else cuenta.mal++;
  console.log((cond ? '  OK     ' : '  FALLA  ') + texto + (!cond && detalle !== undefined ? ' → ' + (typeof detalle === 'string' ? detalle : JSON.stringify(detalle)).slice(0, 900) : ''));
  return cond;
}
// los archivos del juego, en orden, salen de index.html (así las pruebas y la página cargan lo mismo)
export function archivos() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
}
let listo = null;
export async function cargar() {
  if (listo) return listo;
  const porPartes = ['arte/cerca.js', 'arte/escenas.js', 'arte/depa.js', 'arte/ciudad.js'];
  for (const f of [...archivos().filter(f => !/app\/(ui|pantallas|inicio)/.test(f)), ...porPartes]) if (fs.existsSync(path.join(RAIZ, f))) await import(pathToFileURL(path.join(RAIZ, f)).href);
  return listo = globalThis.BB;
}
export const iguales = (a, b) => a.d.length === b.d.length && a.d.every((v, i) => v === b.d[i]);
