// Escribe una Capa del motor como PNG (sin dependencias: solo zlib de Node). Escala entera, pixeles nítidos.
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// carga el motor y los dibujos (los mismos archivos que usa la página) y devuelve BB
export async function cargarArte() {
  for (const f of ['arte/motor', 'arte/datos', 'arte/opciones', 'arte/ella', 'arte/prendas', 'datos/prendas', 'datos/muebles', 'arte/cerca', 'arte/escenas', 'arte/depa', 'arte/ciudad']) {
    const p = path.join(RAIZ, f + '.js');
    if (fs.existsSync(p)) await import(pathToFileURL(p).href);
  }
  return globalThis.BB;
}

function trozo(tipo, datos) {
  const len = Buffer.alloc(4); len.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(cuerpo) >>> 0);
  return Buffer.concat([len, cuerpo, crc]);
}

export function png(capa, escala = 1, fondo = null) {
  const w = capa.w * escala, h = capa.h * escala, src = capa.rgba(), fila = w * 4 + 1, raw = Buffer.alloc(fila * h);
  for (let y = 0; y < h; y++) {
    const sy = Math.floor(y / escala);
    for (let x = 0; x < w; x++) {
      const i = (sy * capa.w + Math.floor(x / escala)) * 4, o = y * fila + 1 + x * 4;
      if (src[i + 3] === 0 && fondo) { raw[o] = fondo[0]; raw[o + 1] = fondo[1]; raw[o + 2] = fondo[2]; raw[o + 3] = 255; }
      else { raw[o] = src[i]; raw[o + 1] = src[i + 1]; raw[o + 2] = src[i + 2]; raw[o + 3] = src[i + 3]; }
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ihdr), trozo('IDAT', zlib.deflateSync(raw, { level: 9 })), trozo('IEND', Buffer.alloc(0))]);
}

export function guardar(archivo, capa, escala = 1, fondo = null) {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, png(capa, escala, fondo));
}
