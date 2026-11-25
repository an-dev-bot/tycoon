/* Datos de la prueba de arte: todo lo que se elige (pieles, cuerpos, caras, pelo, prendas, outfits) vive aquí.
   Agregar una opción nueva es agregar su dato; el dibujo se arma solo con estas medidas y colores. */
(function (root) {
  'use strict';
  const BB = root.BB = root.BB || {};

  BB.JUEGO = 'Bows & Billions';          // el nombre del juego vive solo aquí

  // piel: luz, base, sombra, sombra profunda, contorno, rubor y labios
  BB.PIELES = {
    clara:  { nombre: 'Clara',  l: '#fff0e4', b: '#fbdccb', s: '#f0bfae', d: '#dca394', o: '#a8726f', rubor: '#ff94a6', labio: '#e77f90' },
    miel:   { nombre: 'Miel',   l: '#f7d5b0', b: '#e9b88f', s: '#d59b77', d: '#ba7d60', o: '#875547', rubor: '#f57f7c', labio: '#cf676d' },
    morena: { nombre: 'Morena', l: '#bd8a66', b: '#a56f4e', s: '#8c573e', d: '#754534', o: '#522e28', rubor: '#e2685f', labio: '#a94c58' },
  };

  /* Complexiones, en pixeles de la cuadrícula 80×176 (medios anchos salvo brazo/pierna, que son anchos completos).
     hom: del centro al borde del hombro · busto, bajo (bajo el busto), cintura, cadera: medio ancho del torso. */
  BB.CUERPOS = {
    delgada:  { nombre: 'Delgada',  hom: 11.7, brazo: 3.6, ante: 3.1, muneca: 2.8, cuello: 2.8, busto: 7.0, bajo: 6.0, cintura: 5.2, cadera: 7.7,  muslo: 7.5,  rod: 4.9, pant: 5.5, tob: 3.4 },
    promedio: { nombre: 'Promedio', hom: 13.5, brazo: 4.9, ante: 4.1, muneca: 3.2, cuello: 3.2, busto: 8.6, bajo: 7.6, cintura: 6.9, cadera: 10.0, muslo: 10.0, rod: 6.4, pant: 7.2, tob: 4.0 },
    atletica: { nombre: 'Atlética', hom: 15.4, brazo: 6.0, ante: 4.9, muneca: 3.6, cuello: 3.7, busto: 9.6, bajo: 8.8, cintura: 8.1, cadera: 10.4, muslo: 11.0, rod: 7.3, pant: 8.6, tob: 4.5 },
    curvy:    { nombre: 'Curvy',    hom: 14.0, brazo: 6.1, ante: 4.7, muneca: 3.5, cuello: 3.4, busto: 10.4, bajo: 8.4, cintura: 7.6, cadera: 12.8, muslo: 12.7, rod: 7.5, pant: 8.3, tob: 4.5 },
  };
  // estaturas: filas de más o de menos en el torso y en cada tramo de pierna (14 pixeles entre una y otra; la cabeza no cambia)
  BB.ESTATURAS = {
    baja:  { nombre: 'Baja',  torso: -4, pierna: -5 },
    media: { nombre: 'Media', torso: 0,  pierna: 0 },
    alta:  { nombre: 'Alta',  torso: 4,  pierna: 5 },
  };

  // pelo: luz, base, sombra, contorno
  BB.PELOS_COLOR = {
    miel:      { nombre: 'Castaño miel', l: '#dcab7b', m: '#aa734c', d: '#875439', o: '#5a3629' },
    ceniza:    { nombre: 'Café cenizo',  l: '#c9b09c', m: '#93796a', d: '#735c51', o: '#4b3a36' },
    rubio:     { nombre: 'Rubio',        l: '#fdefc2', m: '#e8c682', d: '#c99c5b', o: '#93693d' },
    chocolate: { nombre: 'Chocolate',    l: '#a67963', m: '#704b3c', d: '#543529', o: '#35211c' },
    negro:     { nombre: 'Negro suave',  l: '#857686', m: '#4a3d48', d: '#352a34', o: '#221a23' },
  };
  BB.IRIS = {
    cafe:     { d: '#4b2c20', m: '#8a583a', l: '#c9905f' },
    avellana: { d: '#4a4a26', m: '#7d8544', l: '#bcc27a' },
    gris:     { d: '#3e4f6c', m: '#6e89aa', l: '#b5cbe0' },
    verde:    { d: '#2c5a44', m: '#56916e', l: '#a5d2a8' },
    azul:     { d: '#2f4f86', m: '#5b8fd0', l: '#aad2f4' },
  };

  /* Caras. En el cuerpo completo la cabeza mide 22×24 pixeles: la forma es el medio ancho por fila (y desde la
     coronilla) y los rasgos son dibujos de pocos pixeles. L pestaña, k pestaña de abajo, w blanco, h brillo, I iris, m reflejo, B ceja,
     u labio de arriba, o labio de abajo, g gloss. El ojo se dibuja del lado izquierdo y se refleja. */
  BB.CARAS = {
    dulce: {
      nombre: 'Dulce', iris: 'cafe',
      forma: [[0, 4], [1, 6.8], [2.6, 8.9], [5.2, 10.5], [8.4, 11], [14.5, 11], [17.7, 10.4], [19.8, 9.1], [21.9, 6.7], [23.3, 4.2], [24, 1.8]],
      ojo: ['.LLL.', 'LwhIw', '.wImw'], ojoY: 13, pecas: true,
      ceja: ['.BBB', 'B...'], cejaY: 9,
      nariz: [[0, 18]], boca: ['u..u', '.og.'], bocaY: 20,
      cerca: { ojo: { w: 11, hT: 3.9, hB: 2.5, tilt: .7, iris: 3.5, irisY: -.4 }, ceja: { largo: 11.5, grosor: 1.6, arco: 1.2, inclin: -.5, y: -8.6 }, labio: { w: 14, hU: 3.9, hL: 5, arco: 1.2, sonrisa: 1 } },
    },
    almendra: {
      nombre: 'Almendrada', iris: 'avellana',
      forma: [[0, 4], [1, 6.8], [2.6, 8.9], [5.2, 10.4], [8.4, 10.9], [14.5, 10.7], [17.7, 9.7], [19.8, 8.1], [21.9, 5.7], [23.4, 3.4], [24.4, 1.6]],
      ojo: ['.LLLL', 'LwhIw', '..Im.'], ojoY: 13,
      ceja: ['.BBB', 'B...'], cejaY: 9,
      nariz: [[0, 18]], boca: ['u..u', '.og.'], bocaY: 20,
      cerca: { ojo: { w: 12, hT: 3.4, hB: 2.2, tilt: 1.2, iris: 3.3, irisY: -.3 }, ceja: { largo: 12, grosor: 1.6, arco: 1, inclin: -1.2, y: -8 }, labio: { w: 14.5, hU: 3.6, hL: 4.7, arco: 1.1, sonrisa: 1.2 } },
    },
    tierna: {
      nombre: 'Redondita', iris: 'gris', pecas: true,
      forma: [[0, 4], [1, 6.8], [2.6, 8.9], [5.2, 10.5], [8.4, 11], [14.5, 11], [17.7, 10.9], [19.8, 10], [21.9, 7.9], [23.2, 5.3], [23.9, 2.4]],
      ojo: ['.LLL.', 'LwhIw', '.wImw', '..ww.'], ojoY: 13,
      ceja: ['.BB.', 'B...'], cejaY: 9,
      nariz: [[0, 18]], boca: ['u..u', '.gg.'], bocaY: 20,
      cerca: { ojo: { w: 10.5, hT: 4.2, hB: 2.8, tilt: .4, iris: 3.7, irisY: -.3 }, ceja: { largo: 10.5, grosor: 1.6, arco: 1.3, inclin: -.3, y: -9 }, labio: { w: 13, hU: 4.1, hL: 5.4, arco: 1.3, sonrisa: .8 } },
    },
  };

  BB.PEINADOS = {
    lacio:     { nombre: 'Largo lacio', corto: 'Lacio' },
    ondas:     { nombre: 'Ondas con fleco cortina', corto: 'Ondas' },
    chongo:    { nombre: 'Chongo desordenado', corto: 'Chongo' },
    mediacola: { nombre: 'Media cola con moño', corto: 'Media cola' },
  };

  BB.MAQUILLAJE = {
    natural: { nombre: 'Natural', rubor: .35, delineado: 0, pestanas: 1, sombra: null, labio: null, gloss: .2 },
    glam:    { nombre: 'Glam',    rubor: .6, delineado: 1, pestanas: 2, sombra: '#f0b4c4', labio: '#d9607e', gloss: .7 },
  };

  // uñas del cuerpo completo: color y detalle chiquito
  BB.UNAS = {
    natural: { nombre: 'Natural', color: null, toque: null },
    rosa:    { nombre: 'Rosa',    color: '#f58fb0', toque: '#ffffff' },
    vino:    { nombre: 'Vino',    color: '#9c2f4c', toque: '#f6d37a' },
    lila:    { nombre: 'Lila',    color: '#b9a3ea', toque: '#ffffff' },
  };

  // diseños de uñas para la vista de cerca: forma, largo, color, acabado y detalle
  BB.DISENOS_UNAS = {
    jelly:  { nombre: 'Rosa jelly con corazón', forma: 'almendra', largo: 'larga', color: '#e58a9c', acabado: 'jelly', toque: '#ffffff' },
    french: { nombre: 'French blanco', forma: 'squoval', largo: 'media', color: '#f6d6cf', acabado: 'brillante', french: '#ffffff', frenchLargo: 3.2 },
    lila:   { nombre: 'Lila con puntitos', forma: 'almendra', largo: 'media', color: '#b9a3ea', acabado: 'brillante', puntos: '#ffffff' },
    vino:   { nombre: 'Vino coffin', forma: 'coffin', largo: 'larga', color: '#9c2f4c', acabado: 'brillante' },
    rosa:   { nombre: 'Rosa', forma: 'squoval', largo: 'corta', color: '#f58fb0', acabado: 'brillante' },
  };

  BB.PRENDAS_NOMBRE = {
    cami: 'Top básico (siempre puesto)', shortBase: 'Short básico (siempre puesto)',
    hoodie: 'Hoodie oversized', sueter: 'Suéter de un hombro', pijama: 'Camisa de pijama de satín', vestido: 'Vestido de punto',
    pants: 'Pants', falda: 'Falda plisada', shortPijama: 'Short de pijama', calcetas: 'Calcetas altas',
    chanclas: 'Chanclas', flats: 'Flats con moñito', pantuflas: 'Pantuflas peludas', botas: 'Botas altas', bolsa: 'Bolsa de mano',
  };

  // outfits: qué prenda va en cada capa y con qué color (c = color elegido de la prenda principal)
  BB.OUTFITS = {
    inicio: {
      nombre: 'Inicio', desc: 'Hoodie, pants y chanclas', colores: ['#f6c3d2', '#cbb7ee', '#f5ead8'],
      capas: c => ({ abajo: ['pants', '#cfcbdb'], arriba: ['hoodie', c], pies: ['chanclas', '#fff4ea'] }),
    },
    sueter: {
      nombre: 'Suéter', desc: 'Suéter de un hombro, falda plisada, calcetas altas y flats', colores: ['#f7ecd9', '#f6c3d2', '#bdd5ee'],
      capas: c => ({ piernas: ['calcetas', '#fffaf3'], pies: ['flats', '#4a4257'], abajo: ['falda', '#4a4257'], arriba: ['sueter', c] }),
    },
    pijama: {
      nombre: 'Pijama', desc: 'Pijama de satín y pantuflas peludas', colores: ['#f7b9cd', '#cbb7ee', '#bdd5ee'],
      capas: c => ({ pies: ['pantuflas', '#fffaf5'], abajo: ['shortPijama', c], arriba: ['pijama', c] }),
    },
    vestido: {
      nombre: 'Vestido', desc: 'Vestido de punto y botas', colores: ['#9a3350', '#bba595', '#f4ead8'],
      capas: c => ({ pies: ['botas', c === '#f4ead8' ? '#8f5f48' : '#f5e8d8'], vestido: ['vestido', c] }),
    },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
