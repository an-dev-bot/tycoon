// Abre el juego en Edge o Chrome sin ventana (375 px, escala 2), servido desde esta computadora, y lo maneja.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { RAIZ } from '../herramientas/png.mjs';

const NAVEGADORES = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
export const espera = ms => new Promise(r => setTimeout(r, ms));
export async function abrir({ ancho = 375, alto = 667 } = {}) {
  const exe = NAVEGADORES.find(p => fs.existsSync(p)); if (!exe) throw new Error('No encontré Edge ni Chrome.');
  const conexiones = new Set(), srv = http.createServer((q, r) => { const f = path.join(RAIZ, decodeURIComponent(new URL(q.url, 'http://x').pathname)), a = f.endsWith(path.sep) ? path.join(f, 'index.html') : f; if (!a.startsWith(RAIZ) || !fs.existsSync(a) || fs.statSync(a).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': (TIPOS[path.extname(a)] || 'application/octet-stream') + '; charset=utf-8' }); fs.createReadStream(a).pipe(r); });
  srv.on('connection', c => { conexiones.add(c); c.on('close', () => conexiones.delete(c)); });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
  const puerto = 9300 + Math.floor(Math.random() * 600), perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-t1-'));
  const nav = spawn(exe, ['--headless=new', '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--hide-scrollbars', '--no-first-run', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
  let dir; for (let i = 0; i < 80 && !dir; i++) { try { dir = (await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch (e) { /* todavía no abre */ } if (!dir) await espera(150); }
  if (!dir) { nav.kill(); srv.close(); throw new Error('El navegador no abrió.'); }
  const ws = new WebSocket(dir); await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let n = 0; const pend = new Map(), errores = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const [ok, mal] = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); } else if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map(a => a.value || a.description).join(' ')); };
  const cdp = (method, params = {}) => new Promise((ok, mal) => { const id = ++n; pend.set(id, [ok, mal]); ws.send(JSON.stringify({ id, method, params })); });
  const js = async expr => { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const medida = (w, h) => cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  await cdp('Page.enable'); await cdp('Runtime.enable'); await medida(ancho, alto); await cdp('Emulation.setTouchEmulationEnabled', { enabled: true });
  const url = `http://127.0.0.1:${srv.address().port}/`;
  const listo = async () => { for (let i = 0; i < 200; i++) { if (await js('document.documentElement.dataset.listo==="1"').catch(() => false)) return; await espera(50); } throw new Error('No terminó de abrir. ' + errores.join(' | ')); };
  const ir = async (p = '') => { await cdp('Page.navigate', { url: url + p }); await espera(150); await listo(); };
  return {
    cdp, js, ir, listo, errores, url, medida, ancho,
    partes: () => js("BB.UI.parte('cerca','escenas').then(()=>BB.UI.parte('depa','ciudad')).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).then(()=>1)"),
    foto: async archivo => { const r = await cdp('Page.captureScreenshot', { format: 'png' }); fs.mkdirSync(path.dirname(archivo), { recursive: true }); fs.writeFileSync(archivo, Buffer.from(r.data, 'base64')); },
    apagaServidor: () => new Promise(ok => { for (const c of conexiones) c.destroy(); srv.close(ok); }),
    cierra: async () => { try { ws.close(); } catch (e) { /* ya */ } nav.kill(); for (const c of conexiones) c.destroy(); srv.close(); await espera(400); try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* luego se limpia */ } },
  };
}
// una partida avanzada y con de todo, para ver cada pantalla llena
export const PARTIDA = `(() => { const L = BB.L, s = L.nueva({ pelo: 'ondas', colorPelo: 'ceniza', iris: 'avellana', pecas: 'ligeras' }, 'Mía', 77); s.ajustes.idioma = BB.I.cual(); s.tutorial = 0; s.dia = 9; s.dinero = 1284.5; s.hora = 10; s.ofertasDia = 0; L.ofertas(s);
  for (const id of ['playera','sueterHombro','faldaPlisada','jeans','calcetasAltas','flats','vestidoPunto','botasAltas','pijamaSatin','pantuflas','mono','cadenita','bolsa','tenis']) L.pieza(s, id, BB.CATALOGO[id].colores[0], BB.CATALOGO[id].precio);
  const pon = id => L.ponerse(s, s.closet.find(p => p.id === id).uid); pon('sueterHombro'); delete s.ropa.encima; pon('sueterHombro'); pon('faldaPlisada'); pon('calcetasAltas'); pon('flats'); pon('cadenita');
  s.casa.pared = 'rosa'; s.casa.piso = 'claro'; s.casa.paredes.push('rosa'); s.casa.pisos.push('claro'); const v = {}; for (const id in BB.MUEBLES) { const l = BB.MUEBLES[id].lugar; if (v[l]) continue; v[l] = id; s.casa.tengo.push({ uid: s.uid++, id, pagado: BB.MUEBLES[id].precio }); s.casa.muebles[l] = id; }
  s.unas.manos = { color: 'rosa', forma: 'almendra', largo: 'media', acabado: 'jelly', diseno: 'corazones', dias: 3, rota: false }; s.ap.manos = s.unas.manos; s.unas.pies = { ...s.unas.manos, forma: 'squoval', largo: 'corta', diseno: 'ninguno' }; s.ap.pies = s.unas.pies;
  for (const [k, w] of [['delineado','fino'],['pestanas','wispy'],['rubor','frio'],['labios','rosado'],['brillo',true]]) { s.propio.mk.push(L.idMk(k, w)); s.ap.mk[k] = w; }
  s.paquetes.push({ n: s.uid++, tipo: 'ropa', id: 'abrigo', color: BB.CATALOGO.abrigo.colores[0], pagado: 260, llega: 9 }, { n: s.uid++, tipo: 'mueble', id: 'puff', pagado: 74, llega: 10 }); L.guardaLook(s, 'Otoño');
  L.publicar(s, 'ropa', s.closet.find(p => p.id === 'tenis').uid); s.ventas[0].oferta = 44; L.cuentasDelDia(s, false); L.foto(s); L.nota(s, 'Hoy estrené mis flats.'); L.trabajar(s, s.ofertas[0].n); L.mensaje(s, 'mentora', 'm_empresa'); s.cuentas[0].atraso = 0; return s; })()`;
