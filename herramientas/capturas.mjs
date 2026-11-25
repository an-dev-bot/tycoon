// Capturas de prueba_arte.html a 375 px de ancho (escala 2, como en teléfono), sin dependencias:
// abre Edge sin ventana y lo maneja por su puerto de depuración. También revisa que la página no se desborde,
// que no haya errores y que los botones midan 44 px o más.
// Uso: node herramientas/capturas.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RAIZ } from './png.mjs';

const NAVEGADORES = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'];
const ANCHO = 375, ESCALA = 2, DESTINO = path.join(RAIZ, 'capturas', 'paso0_pixel');
const SECCIONES = ['pruebala', 'complexiones', 'cuerpos', 'piel', 'caras', 'peinados', 'outfits', 'cerca', 'manos', 'pies', 'depa-dia', 'depa-noche', 'iconos', 'ficha'];
const OTRA = { piel: 'morena', cuerpo: 'curvy', estatura: 'alta', cara: 'almendra', pelo: 'chongo', colorPelo: 'negro', outfit: 'vestido', color: null, maquillaje: 'glam', unas: 'vino', bolsa: true };

const exe = NAVEGADORES.find(p => fs.existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(1); }
const puerto = 9300 + Math.floor(Math.random() * 500), perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-capturas-'));
const nav = spawn(exe, ['--headless=new', '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, '--hide-scrollbars', '--no-first-run', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
const espera = ms => new Promise(r => setTimeout(r, ms));

async function conectar() {
  for (let i = 0; i < 80; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json(), p = l.find(t => t.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch (e) { /* todavía no abre */ }
    await espera(150);
  }
  throw new Error('El navegador no abrió el puerto de depuración.');
}

let fallo = 0;
try {
  const ws = new WebSocket(await conectar());
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = () => mal(new Error('No pude conectar con el navegador.')); });
  let n = 0; const pendientes = new Map(), errores = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) { const [ok, mal] = pendientes.get(m.id); pendientes.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map(a => a.value || a.description).join(' '));
  };
  const cdp = (method, params = {}) => new Promise((ok, mal) => { const id = ++n; pendientes.set(id, [ok, mal]); ws.send(JSON.stringify({ id, method, params })); });
  const js = async expr => { const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: 800, deviceScaleFactor: ESCALA, mobile: true });
  await cdp('Page.navigate', { url: pathToFileURL(path.join(RAIZ, 'prueba_arte.html')).href });
  for (let i = 0; ; i++) { if (await js('document.documentElement.dataset.listo === "1"').catch(() => false)) break; if (i > 100 || errores.length) throw new Error('La página no terminó de dibujar. ' + errores.join(' | ')); await espera(100); }

  // la ventana mide lo que mide la página: así todo queda dibujado antes de la foto
  const ajusta = async () => { await cdp('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: await js('document.documentElement.scrollHeight'), deviceScaleFactor: ESCALA, mobile: true }); await js('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 250))))'); };
  await js('BBP.pausa()');                 // la animación se detiene en el primer cuadro para que las fotos salgan iguales
  await ajusta(); await ajusta();
  fs.mkdirSync(DESTINO, { recursive: true });
  for (const f of fs.readdirSync(DESTINO)) if (f.endsWith('.png')) fs.unlinkSync(path.join(DESTINO, f));
  const foto = async (nombre, clip) => {
    const r = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } });
    fs.writeFileSync(path.join(DESTINO, nombre + '.png'), Buffer.from(r.data, 'base64'));
    console.log(nombre + '.png', Math.round(clip.width) + '×' + Math.round(clip.height));
  };
  const caja = id => js(`(() => { const r = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return { x: 0, y: Math.max(0, Math.floor(r.top + scrollY) - 8), width: ${ANCHO}, height: Math.ceil(r.height) + 16 }; })()`);
  const dos = i => String(i).padStart(2, '0');

  await foto('00_pagina_completa', { x: 0, y: 0, width: ANCHO, height: await js('document.documentElement.scrollHeight') });
  for (let i = 0; i < SECCIONES.length; i++) await foto(dos(i + 1) + '_' + SECCIONES[i].replace(/-/g, '_'), await caja(SECCIONES[i]));
  await js(`BBP.pon(${JSON.stringify(OTRA)})`); await ajusta();
  await foto(dos(SECCIONES.length + 1) + '_pruebala_otra_combinacion', await caja('pruebala'));
  await foto(dos(SECCIONES.length + 2) + '_otra_de_cerca_y_depa', await js(`(() => { const a = document.getElementById('t-cerca').lastElementChild.getBoundingClientRect(); return { x: 0, y: Math.floor(a.top + scrollY) - 8, width: ${ANCHO}, height: Math.ceil(a.height) + 16 }; })()`));
  await foto(dos(SECCIONES.length + 3) + '_otra_depa_dia', await caja('depa-dia'));
  await foto(dos(SECCIONES.length + 4) + '_otra_depa_noche', await caja('depa-noche'));
  await foto(dos(SECCIONES.length + 5) + '_animacion_3_cuadros', await caja('animacion'));

  // revisiones
  const rev = await js(`(() => {
    const chicos = [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length;
    const borrosos = [...document.querySelectorAll('canvas')].filter(c => { const r = c.getBoundingClientRect(); return r.width % c.width || r.height % c.height || getComputedStyle(c).imageRendering !== 'pixelated'; }).length;
    return { ancho: document.documentElement.scrollWidth, chicos, borrosos, lienzos: document.querySelectorAll('canvas').length, botones: document.querySelectorAll('button').length };
  })()`);
  const revisa = (ok, texto) => { console.log((ok ? 'OK    ' : 'FALLA ') + texto); if (!ok) fallo = 1; };
  revisa(rev.ancho <= ANCHO, `sin desborde horizontal (ancho de la página: ${rev.ancho} px)`);
  revisa(rev.chicos === 0, `${rev.botones} botones de 44 px o más (${rev.chicos} más chicos)`);
  revisa(rev.borrosos === 0, `${rev.lienzos} dibujos a escala entera y con pixeles nítidos (${rev.borrosos} mal)`);
  revisa(errores.length === 0, 'sin errores en la página' + (errores.length ? ': ' + errores.join(' | ') : ''));
  ws.close();
} catch (e) { console.error('FALLA ' + e.message); fallo = 1; } finally {
  nav.kill(); await espera(400);
  try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* el perfil temporal se limpia solo después */ }
}
process.exit(fallo);
