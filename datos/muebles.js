/* Muebles y adornos (30). Agregar uno = agregar su dato aquí y su dibujo en arte/depa.js con el mismo nombre.
   lugar: dónde va (uno por lugar) · vista: cuarto o cocina · bonito: cuánto sube el ánimo tenerlo puesto */
(function (root) {
  'use strict';
  const BB = root.BB, M = (lugar, vista, nombre, en, precio, bonito) => ({ lugar, vista, nombre, en, precio, bonito });
  BB.MUEBLES = {
    camaCapitonada: M('cama', 'cuarto', 'Cama capitonada rosa', 'Pink tufted bed', 320, 5),
    camaMadera: M('cama', 'cuarto', 'Cama de madera clara', 'Light wood bed', 190, 3),
    cobijaPuntos: M('cobija', 'cuarto', 'Cobija de puntitos', 'Dotted blanket', 32, 2),
    cobijaBurbuja: M('cobija', 'cuarto', 'Cobija de burbujas', 'Bubble blanket', 58, 3),
    cobijaTejida: M('cobija', 'cuarto', 'Manta tejida', 'Knit throw', 44, 2),
    cojinesCorazon: M('cojines', 'cuarto', 'Cojines de corazón', 'Heart pillows', 28, 2),
    cojinesMono: M('cojines', 'cuarto', 'Cojines con moñito', 'Bow pillows', 34, 2),
    buro: M('buro', 'cuarto', 'Buró blanco', 'White nightstand', 64, 2),
    lamparaMesa: M('lampara', 'cuarto', 'Lámpara de buró', 'Table lamp', 36, 2),
    lamparaHongo: M('lampara', 'cuarto', 'Lámpara hongo', 'Mushroom lamp', 52, 3),
    lucesCalidas: M('luces', 'todas', 'Lucecitas cálidas', 'Warm string lights', 16, 2),
    lucesPastel: M('luces', 'todas', 'Lucecitas pastel', 'Pastel string lights', 18, 2),
    espejoArco: M('espejo', 'cuarto', 'Espejo de pie dorado', 'Gold floor mirror', 88, 3),
    espejoLuz: M('espejo', 'cuarto', 'Espejo con luz', 'Lit mirror', 130, 4),
    tapetePeludo: M('tapete', 'cuarto', 'Tapete peludito', 'Fluffy rug', 62, 3),
    tapeteCorazon: M('tapete', 'cuarto', 'Tapete de corazón', 'Heart rug', 54, 3),
    plantaPiso: M('planta', 'cuarto', 'Planta grande', 'Big plant', 38, 2),
    plantaColgante: M('colgante', 'cocina', 'Planta colgante', 'Hanging plant', 24, 2),
    cuadroMono: M('cuadro', 'cuarto', 'Cuadrito de moño', 'Bow print', 22, 1),
    cuadroFrase: M('frase', 'cocina', 'Cuadro con frase', 'Quote print', 24, 1),
    fotosPared: M('fotos', 'cuarto', 'Pared de fotos', 'Photo wall', 20, 2),
    repisa: M('repisa', 'cuarto', 'Repisa con libros', 'Book shelf', 42, 2),
    velas: M('velas', 'cuarto', 'Velas', 'Candles', 18, 2),
    puff: M('puff', 'cuarto', 'Puff peludo', 'Fluffy pouf', 74, 3),
    escritorio: M('escritorio', 'cocina', 'Escritorio blanco', 'White desk', 120, 3),
    silla: M('silla', 'cocina', 'Silla de concha', 'Shell chair', 84, 3),
    tocador: M('tocador', 'cocina', 'Tocador con focos', 'Vanity with bulbs', 240, 5),
    cortinas: M('cortinas', 'cuarto', 'Cortinas rosas', 'Pink curtains', 40, 2),
    perfumes: M('perfumes', 'cocina', 'Charola de perfumes', 'Perfume tray', 66, 2),
    peluche: M('peluche', 'cuarto', 'Conejito de peluche', 'Bunny plush', 22, 2),
  };
  BB.LUGARES_MUEBLE = { cama: ['Cama', 'Bed'], cobija: ['Cobija', 'Blanket'], cojines: ['Cojines', 'Pillows'], buro: ['Buró', 'Nightstand'], lampara: ['Lámpara', 'Lamp'], luces: ['Lucecitas', 'String lights'], espejo: ['Espejo', 'Mirror'], tapete: ['Tapete', 'Rug'], planta: ['Planta', 'Plant'], colgante: ['Planta colgante', 'Hanging plant'], cuadro: ['Cuadro', 'Print'], frase: ['Frase', 'Quote'], fotos: ['Fotos', 'Photos'], repisa: ['Repisa', 'Shelf'], velas: ['Velas', 'Candles'], puff: ['Puff', 'Pouf'], escritorio: ['Escritorio', 'Desk'], silla: ['Silla', 'Chair'], tocador: ['Tocador', 'Vanity'], cortinas: ['Cortinas', 'Curtains'], perfumes: ['Perfumes', 'Perfumes'], peluche: ['Peluche', 'Plush'] };
  for (const k in BB.LUGARES_MUEBLE) BB.LUGARES_MUEBLE[k] = { nombre: BB.LUGARES_MUEBLE[k][0], en: BB.LUGARES_MUEBLE[k][1] };
  BB.PAREDES = {
    gris: { nombre: 'Gris de renta', en: 'Rental gray', c: '#e4e0e4', t: '#d8d2d9', precio: 0 }, rosa: { nombre: 'Rosa con puntitos', en: 'Dotted pink', c: '#f7e1e9', t: '#f0d0dd', precio: 34 },
    crema: { nombre: 'Crema', en: 'Cream', c: '#f8eedd', t: '#efe0c8', precio: 30 }, lila: { nombre: 'Lila', en: 'Lilac', c: '#e6dff5', t: '#d8cdee', precio: 34 }, salvia: { nombre: 'Salvia', en: 'Sage', c: '#dde8d8', t: '#cddcc7', precio: 34 }, azul: { nombre: 'Azul bebé', en: 'Baby blue', c: '#dfe9f6', t: '#cfdcee', precio: 34 },
  };
  BB.PISOS = {
    gastado: { nombre: 'Duela gastada', en: 'Worn boards', c: '#cdb9a6', t: '#b8a28d', precio: 0 }, claro: { nombre: 'Duela clara', en: 'Light wood', c: '#e6c5a6', t: '#d3ad8a', precio: 140 },
    miel: { nombre: 'Duela miel', en: 'Honey wood', c: '#d9a878', t: '#c08d5f', precio: 140 }, blanco: { nombre: 'Duela blanca', en: 'White wood', c: '#f1e9e4', t: '#ddd0ca', precio: 160 },
  };
  /* Acomodar: cuántos pixeles se puede mover cada mueble de su lugar ([menos, más] a lo ancho y a lo alto).
     Lo que va encima de otro (lámpara, cojines, peluche) se mueve con él y también un poquito por su cuenta. */
  BB.ACOMODO = {
    cama: { x: [-102, 0], y: [0, 24] }, buro: { x: [-42, 89], y: [0, 20] }, espejo: { x: [-3, 134], y: [0, 16] }, planta: { x: [-22, 112], y: [0, 40] }, puff: { x: [-1, 120], y: [-34, 12] }, tapete: { x: [-24, 8], y: [-22, 1] },
    cuadro: { x: [-124, 12], y: [-6, 56] }, fotos: { x: [-94, 39], y: [-8, 36] }, repisa: { x: [-116, 1], y: [-30, 44] }, lampara: { x: [-5, 4], y: [0, 0] }, cojines: { x: [-18, 4], y: [0, 0] }, peluche: { x: [-4, 24], y: [0, 0] },
    escritorio: { x: [-2, 40], y: [0, 16] }, silla: { x: [-14, 116], y: [-4, 34] }, tocador: { x: [-57, 4], y: [0, 16] }, frase: { x: [-12, 50], y: [-44, 26] }, colgante: { x: [-38, 96], y: [-14, 10] }, perfumes: { x: [-8, 10], y: [0, 0] },
  };
  // los cuartos, en el orden en que se deslizan
  BB.VISTAS = { cuarto: { nombre: 'Recámara', en: 'Bedroom' }, cocina: { nombre: 'Cocina y trabajo', en: 'Kitchen & desk' }, entrada: { nombre: 'Entrada', en: 'Entryway' }, bano: { nombre: 'Baño', en: 'Bathroom' } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
