// Todas las pruebas de la fase 1: node pruebas/t1.mjs       Solo algunas: node pruebas/t1.mjs 5 6
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ, cuenta, revisa } from './comun.mjs';
const pide = process.argv.slice(2).map(Number), t0 = Date.now();
for (const f of fs.readdirSync(path.join(RAIZ, 'pruebas')).filter(f => /^t1_\d\d_.*\.mjs$/.test(f)).sort()) {
  const n = +f.slice(3, 5); if (pide.length && !pide.includes(n)) continue;
  const m = await import(pathToFileURL(path.join(RAIZ, 'pruebas', f)).href); console.log(`\nt1 · ${n}. ${m.titulo}`);
  try { await m.default(); } catch (e) { revisa(false, 'la prueba se detuvo', e.stack); }
}
console.log(`\n${cuenta.ok} bien, ${cuenta.mal} mal · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(cuenta.mal ? 1 : 0);
