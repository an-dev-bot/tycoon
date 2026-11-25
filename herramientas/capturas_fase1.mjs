// Capturas de todas las pantallas de la fase 1 a 375 px. Uso: node herramientas/capturas_fase1.mjs [es|en]
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './png.mjs';
import { abrir, espera, PARTIDA } from '../pruebas/navegador.mjs';
const idioma = process.argv[2] || 'es', D = path.join(RAIZ, 'capturas', 'fase1'), N = await abrir({ alto: 812 });
try {
  if (idioma === 'es') { fs.rmSync(D, { recursive: true, force: true }); }
  await N.ir(); await N.js('window.BB_RAPIDO=1'); await N.partes(); await N.js(`BB.app.idioma('${idioma}')`); let i = 0;
  const f = async n => { await espera(350); await N.foto(path.join(D, (idioma === 'es' ? '' : 'en_') + String(++i).padStart(2, '0') + '_' + n + '.png')); };
  await f('crear_cara'); await N.js("BB.app.ui.crear.tab='cuerpo';BB.app.dibuja()"); await f('crear_cuerpo'); await N.js("BB.app.ui.crear.tab='pelo';BB.app.dibuja()"); await f('crear_pelo');
  await N.js(`BB.app.empieza(BB.L.nueva({},'Mía',5))`); await f('ella_inicio'); await N.js("BB.app.tab('casa')"); await f('casa_inicio');
  await N.js(`(BB.app.s=${PARTIDA},BB.app.cambio())`);
  for (const t of ['ropa', 'looks', 'cara', 'cuerpo', 'pelo', 'mk', 'unas']) { await N.js(`(BB.app.ui.ella='${t}',BB.app.tab('ella'))`); await f('ella_' + t); }
  for (const v of ['cuarto', 'cocina', 'entrada', 'bano']) { await N.js(`(BB.app.ui.vista='${v}',BB.app.tab('casa'))`); await f('casa_' + v); }
  await N.js("(BB.app.ui.vista='cuarto',BB.app.dibuja(),document.querySelector('[data-k=tcama]').click())"); await f('casa_tocar_cama'); await N.js("(BB.UI.cierraHoja(),document.querySelector('[data-k=decorar]').click())"); await f('decorar_muebles'); await N.js("document.querySelector('[data-k=dpared]').click()"); await f('decorar_paredes'); await N.js("document.querySelector('[data-k=dlisto]').click()");
  await N.js("(BB.app.s.hora=21,BB.app.ui.vista='cuarto',BB.app.s.casa.suciedad=80,BB.app.tab('casa'))"); await f('casa_noche_sucia'); await N.js("(BB.app.s.hora=10,BB.app.s.casa.suciedad=5)");
  await N.js("BB.app.tab('ciudad')"); await f('ciudad');
  for (const l of ['bazar', 'tienda', 'super', 'salon', 'cafe']) { await N.js(`(BB.app.s.lugar='${l}',BB.app.tab('ciudad'))`); await f('lugar_' + l); }
  await N.js("(BB.app.s.lugar='salon',BB.app.tab('ciudad'),document.querySelector('[data-k=spelo]').click())"); await f('salon_pelo'); await N.js("BB.UI.cierraHoja()");
  await N.js("(BB.app.s.lugar='tienda',BB.app.dibuja(),BB.P.ficha('chamarra',{donde:'tienda',precio:128}))"); await f('ficha'); await N.js("document.querySelector('[data-k=comprar]').click()"); await espera(1800); await f('estreno'); await N.js("(document.querySelector('.velo').remove(),BB.app.s.lugar='casa',BB.app.tab('telefono'))"); await f('telefono');
  for (const a of ['banco', 'mensajes', 'trabajos', 'tienda', 'ventas', 'calendario', 'fotos', 'notas', 'ajustes']) { await N.js(`(BB.app.ui.appTel='${a}',BB.app.dibuja(true))`); await f('tel_' + a); }
  await N.js("(BB.app.ui.appTel='tienda',BB.app.ui.tienda='muebles',BB.app.dibuja(true))"); await f('tel_muebles');
  await N.js("(BB.app.s.ultimaVez=Date.now()-9.5*3600e3,BB.app.regresa())"); await f('mientras'); await N.js("document.querySelector('.velo').remove()");
  for (const t of ['compartido', 'sofa']) { await N.js(`(BB.app.s.casa.tipo='${t}',BB.app.s.animo=20,BB.app.s.deudaVieja=180,BB.app.tab('casa'))`); await f(t); }
  await N.js(`(BB.app.s=${PARTIDA},BB.TEMA.pon('oscuro'),BB.app.ui.vista='cuarto',BB.app.tab('casa'))`); await f('oscuro_casa'); await N.js("BB.app.tab('ciudad')"); await f('oscuro_ciudad'); await N.js("(BB.app.ui.ella='cara',BB.app.tab('ella'))"); await f('oscuro_cara'); await N.js("BB.app.tab('telefono')"); await f('oscuro_telefono'); await N.js("BB.TEMA.pon('auto')");
  if (N.errores.length) console.log('ERRORES', N.errores); console.log(i + ' capturas');
} finally { await N.cierra(); }
