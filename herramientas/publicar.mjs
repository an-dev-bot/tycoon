// Prepara lo que se publica: íconos PNG, manifest y la lista de archivos que se guardan para usarse sin internet (sw.js).
// Uso: node herramientas/publicar.mjs   (correr cada vez que cambie un archivo del juego)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { RAIZ, cargarArte, png } from './png.mjs';

const BB = await cargarArte(), en = f => path.join(RAIZ, f);
fs.mkdirSync(en('iconos'), { recursive: true });
for (const [n, navidad] of [['icono', false], ['navidad', true]]) {
  const c = BB.ESCENAS.icono({ navidad });
  fs.writeFileSync(en(`iconos/${n}-192.png`), png(c, 3)); fs.writeFileSync(en(`iconos/${n}-512.png`), png(c, 8));
  const m = { name: BB.JUEGO, short_name: BB.JUEGO, start_url: './index.html', scope: './', display: 'standalone', orientation: 'portrait', background_color: '#fdf1f5', theme_color: '#fdf1f5', icons: [{ src: `iconos/${n}-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: `iconos/${n}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] };
  fs.writeFileSync(en(n === 'icono' ? 'manifest.webmanifest' : 'manifest_navidad.webmanifest'), JSON.stringify(m, null, 2) + '\n');
}
export function archivosApp() {
  const html = fs.readFileSync(en('index.html'), 'utf8');
  return ['index.html', 'estilo.css', 'manifest.webmanifest', 'manifest_navidad.webmanifest', ...[...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]), 'arte/cerca.js', 'arte/escenas.js', 'arte/depa.js', 'arte/ciudad.js', ...['icono', 'navidad'].flatMap(n => [`iconos/${n}-192.png`, `iconos/${n}-512.png`])];
}
const lista = archivosApp(), v = crypto.createHash('sha1'); for (const f of lista) v.update(fs.readFileSync(en(f)));
fs.writeFileSync(en('sw.js'), `/* Hecho por herramientas/publicar.mjs: guarda el juego completo para abrirlo sin internet. */
const VERSION = 'bb-${v.digest('hex').slice(0, 10)}';
const ARCHIVOS = ${JSON.stringify(['./', ...lista])};
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(k => k.startsWith('bb-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return; e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true })).then(r => r || fetch(e.request))); });
`);
const peso = lista.reduce((t, f) => t + fs.statSync(en(f)).size, 0);
console.log(`Listo: ${lista.length} archivos, ${(peso / 1048576).toFixed(2)} MB`);
