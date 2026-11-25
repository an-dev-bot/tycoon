// Exporta los íconos en pixel art a PNG (64×64 ampliado ×8 = 512 px, pixeles nítidos).
// Uso: node herramientas/iconos.mjs
import path from 'node:path';
import fs from 'node:fs';
import { RAIZ, cargarArte, guardar } from './png.mjs';

const BB = await cargarArte();
for (const [archivo, navidad] of [['icono_oficial_pixel.png', false], ['icono_navidad_pixel.png', true]]) {
  const destino = path.join(RAIZ, 'logo', archivo), capa = BB.ESCENAS.icono({ navidad });
  guardar(destino, capa, 8);
  console.log(archivo, capa.w * 8 + ' px,', capa.colores(), 'colores,', (fs.statSync(destino).size / 1024).toFixed(1), 'KB');
}
