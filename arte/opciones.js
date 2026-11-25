/* Todo lo que se puede elegir de ella: cara por rasgos, piel, pelo, maquillaje y uñas.
   Cada opción trae su nombre en español (nombre) y en inglés (en). Agregar una opción es agregar su dato aquí. */
(function (root) {
  'use strict';
  const BB = root.BB;

  /* ---------- piel (10) ---------- */
  Object.assign(BB.PIELES.clara, { nombre: 'Clara', en: 'Fair' });
  Object.assign(BB.PIELES.miel, { nombre: 'Miel', en: 'Honey' });
  Object.assign(BB.PIELES.morena, { nombre: 'Morena', en: 'Brown' });
  const P = BB.PIELES;
  BB.PIELES = {
    porcelana: { nombre: 'Porcelana', en: 'Porcelain', l: '#fff8f2', b: '#fdeae0', s: '#f3cfc3', d: '#dfb2a6', o: '#ab7c7a', rubor: '#ff9db0', labio: '#e88595' },
    rosada: { nombre: 'Rosada', en: 'Rosy', l: '#ffece8', b: '#fcd5cf', s: '#f0b6b2', d: '#da9a98', o: '#a56a70', rubor: '#ff8ba2', labio: '#e0718a' },
    clara: P.clara,
    beige: { nombre: 'Beige', en: 'Beige', l: '#fde6cf', b: '#f4cfb2', s: '#e3b096', d: '#cb9179', o: '#96645a', rubor: '#fb8a8e', labio: '#da7480' },
    miel: P.miel,
    dorada: { nombre: 'Dorada', en: 'Golden', l: '#eec592', b: '#d9a472', s: '#c2875c', d: '#a66c48', o: '#75483a', rubor: '#ec7666', labio: '#c25c60' },
    canela: { nombre: 'Canela', en: 'Cinnamon', l: '#d9a57c', b: '#c08860', s: '#a66e4c', d: '#8c563c', o: '#633a30', rubor: '#e76f62', labio: '#b5545c' },
    morena: P.morena,
    cacao: { nombre: 'Cacao', en: 'Cocoa', l: '#9c6a4c', b: '#845238', s: '#6d402d', d: '#593225', o: '#3d221e', rubor: '#cf5850', labio: '#943e4c' },
    ebano: { nombre: 'Ébano', en: 'Ebony', l: '#7c5240', b: '#643c2e', s: '#512e25', d: '#41241f', o: '#2c1817', rubor: '#b84a4a', labio: '#80323f' },
  };

  /* ---------- cara: formas, ojos, cejas, pestañas, narices, labios ---------- */
  const A = [[0, 4], [1, 6.8], [2.6, 8.9]];
  BB.FORMAS = {
    ovalada: { nombre: 'Ovalada', en: 'Oval', forma: BB.CARAS.dulce.forma },
    alargada: { nombre: 'Alargada', en: 'Long', forma: BB.CARAS.almendra.forma },
    redonda: { nombre: 'Redonda', en: 'Round', forma: BB.CARAS.tierna.forma },
    corazon: { nombre: 'Corazón', en: 'Heart', forma: [...A, [5.2, 10.7], [8.4, 11.2], [13, 10.9], [16.5, 9.7], [19.4, 7.7], [21.6, 5.2], [23.2, 2.9], [24, 1.2]] },
    cuadrada: { nombre: 'Cuadrada suave', en: 'Soft square', forma: [...A, [5.2, 10.5], [8.4, 11], [14.5, 11], [17.7, 10.8], [20.2, 10], [22.1, 7.8], [23.3, 5.4], [24, 3]] },
  };
  BB.OJOS = {
    redondos: { nombre: 'Redondos', en: 'Round', ojo: ['.LLL.', 'LwhIw', '.wImw'], ojoY: 13, cerca: { w: 11, hT: 3.9, hB: 2.5, tilt: .7, iris: 3.5, irisY: -.4 } },
    almendrados: { nombre: 'Almendrados', en: 'Almond', ojo: ['.LLLL', 'LwhIw', '..Im.'], ojoY: 13, cerca: { w: 12, hT: 3.4, hB: 2.2, tilt: 1.2, iris: 3.3, irisY: -.3 } },
    grandes: { nombre: 'Grandes', en: 'Big', ojo: ['.LLL.', 'LwhIw', '.wImw', '..ww.'], ojoY: 13, cerca: { w: 11.4, hT: 4.4, hB: 3, tilt: .4, iris: 3.9, irisY: -.3 } },
    gatunos: { nombre: 'Gatunos', en: 'Cat', ojo: ['L....', '.LLLL', '.whIw', '..Im.'], ojoY: 12, cerca: { w: 12.4, hT: 3.5, hB: 2, tilt: 2.2, iris: 3.3, irisY: -.2 } },
    dormilones: { nombre: 'Dormilones', en: 'Sleepy', ojo: ['..LLL', 'LLhIw', '.wImw'], ojoY: 13, cerca: { w: 11.6, hT: 3, hB: 2.6, tilt: -.6, iris: 3.4, irisY: -.1 } },
    rasgados: { nombre: 'Rasgados', en: 'Monolid', ojo: ['.....', 'LLLLL', '.hIm.'], ojoY: 13, cerca: { w: 12.2, hT: 2.6, hB: 1.8, tilt: 1, iris: 3.1, irisY: 0 } },
  };
  Object.assign(BB.IRIS, { miel: { d: '#6a421c', m: '#b5782f', l: '#e9bd6a' }, azulgris: { d: '#465a70', m: '#87a5b8', l: '#cfe2e8' }, oscuro: { d: '#2b1a17', m: '#4f3026', l: '#82553f' } });
  const nomIris = { cafe: ['Café', 'Brown'], miel: ['Miel', 'Honey'], avellana: ['Avellana', 'Hazel'], verde: ['Verde', 'Green'], gris: ['Gris', 'Gray'], azul: ['Azul', 'Blue'], azulgris: ['Gris azulado', 'Blue gray'], oscuro: ['Café oscuro', 'Dark brown'] };
  BB.IRIS = Object.fromEntries(Object.keys(nomIris).map(k => [k, { ...BB.IRIS[k], nombre: nomIris[k][0], en: nomIris[k][1] }]));
  BB.CEJAS = {
    suaves: { nombre: 'Suaves', en: 'Soft', ceja: ['.BBB', 'B...'], cerca: { largo: 11.5, grosor: 1.6, arco: 1.2, inclin: -.5, y: -8.6 } },
    arqueadas: { nombre: 'Arqueadas', en: 'Arched', ceja: ['.BB.', 'B..B'], cerca: { largo: 12, grosor: 1.7, arco: 2.4, inclin: -.6, y: -8.2 } },
    rectas: { nombre: 'Rectas', en: 'Straight', ceja: ['....', 'BBBB'], cerca: { largo: 11.5, grosor: 1.8, arco: .1, inclin: .1, y: -8 } },
    delgadas: { nombre: 'Delgadas', en: 'Thin', ceja: ['.BB.', 'B...'], cerca: { largo: 10.5, grosor: 1.1, arco: 1.6, inclin: -.4, y: -9 } },
    tupidas: { nombre: 'Tupidas', en: 'Full', ceja: ['.BBB', 'BBBB'], cerca: { largo: 12, grosor: 2.5, arco: 1, inclin: -.6, y: -8.6 } },
  };
  // pestañas: f = dónde va cada pico (0 centro, 1 rabillo), alto en pixeles, abajo = picos de abajo
  BB.PESTANAS = {
    cortas: { nombre: 'Cortas', en: 'Short', f: [], alto: 0, abajo: [], cuerpo: 0 },
    medianas: { nombre: 'Medianas', en: 'Medium', f: [.45, .85], alto: 1, abajo: [], suave: 1, cuerpo: 1 },
    largas: { nombre: 'Largas', en: 'Long', f: [.1, .45, .8, 1], alto: 1, abajo: [.85], cuerpo: 2 },
    picos: { nombre: 'En picos', en: 'Spiky', f: [-.1, .4, .85], alto: 2, abajo: [.2, .75], suave: 1, cuerpo: 3 },
  };
  // pestañas de maquillaje
  BB.PESTANAS_MK = {
    natural: { nombre: 'Natural', en: 'Natural', f: [.15, .5, .85], alto: 2, abajo: [.5, .85], cuerpo: 2 },
    wispy: { nombre: 'Wispy', en: 'Wispy', f: [-.2, .15, .5, .85], alto: 2, abajo: [.7], suave: 1, cuerpo: 2 },
    manga: { nombre: 'Manga', en: 'Manga', f: [-.3, .25, .8], alto: 3, abajo: [-.2, .3, .8], cuerpo: 3 },
    dramaticas: { nombre: 'Dramáticas', en: 'Dramatic', f: [-.4, -.1, .2, .5, .8, 1], alto: 2, abajo: [.5, .85], cuerpo: 3 },
  };
  // nariz: cuerpo = pixeles de lejos; an = ancho, largo = puente, sube = qué tan arriba queda, punta = brillo
  BB.NARICES = {
    boton: { nombre: 'De botón', en: 'Button', nariz: [[0, 18]], cerca: { an: 3, largo: 4, sube: 0, punta: 2 } },
    recta: { nombre: 'Recta', en: 'Straight', nariz: [[0, 16], [0, 18]], cerca: { an: 3, largo: 9, sube: 0, punta: 1 } },
    fina: { nombre: 'Fina', en: 'Slim', nariz: [[0, 17]], cerca: { an: 2, largo: 6, sube: 0, punta: 1 } },
    ancha: { nombre: 'Ancha', en: 'Wide', nariz: [[-1, 18], [1, 18]], cerca: { an: 4, largo: 5, sube: 0, punta: 2 } },
    respingada: { nombre: 'Respingada', en: 'Upturned', nariz: [[-1, 17], [0, 17]], cerca: { an: 3, largo: 5, sube: 1, punta: 3 } },
  };
  BB.LABIOS = {
    suaves: { nombre: 'Suaves', en: 'Soft', boca: ['u..u', '.og.'], cerca: { w: 14, hU: 3.9, hL: 5, arco: 1.2, sonrisa: 1 } },
    llenos: { nombre: 'Llenitos', en: 'Full', boca: ['uuuu', '.og.'], cerca: { w: 14.5, hU: 4.8, hL: 6, arco: 1.4, sonrisa: .8 } },
    corazon: { nombre: 'Corazón', en: 'Heart', boca: ['.uu.', '.og.'], cerca: { w: 11.5, hU: 4.6, hL: 5.4, arco: 2, sonrisa: .7 } },
    finos: { nombre: 'Finos', en: 'Thin', boca: ['u..u', '.oo.'], cerca: { w: 14, hU: 2.6, hL: 3.4, arco: .7, sonrisa: 1.2 } },
    anchos: { nombre: 'Anchos', en: 'Wide', boca: ['u...u', '.oog.'], cerca: { w: 17, hU: 3.6, hL: 4.8, arco: 1, sonrisa: 1.6 } },
  };
  // pecas: lejos y cerca (pixeles desde el centro de la cara); hombros = también en hombros
  const pecasNariz = [[-6, 18], [-4, 17], [3, 17], [5, 18]], cercaNariz = [[-14, -2], [-11, -4], [-8, -2], [-5, -5], [-2, -7], [2, -7], [5, -5], [8, -3], [11, -4], [14, -2]];
  BB.PECAS = {
    ninguna: { nombre: 'Sin pecas', en: 'None', lejos: [], cerca: [] },
    ligeras: { nombre: 'Ligeras', en: 'Light', lejos: [[-5, 17], [4, 17]], cerca: [[-11, -4], [-6, -5], [-2, -7], [3, -6], [7, -4], [12, -3]] },
    nariz: { nombre: 'Nariz y mejillas', en: 'Nose & cheeks', lejos: pecasNariz, cerca: cercaNariz },
    cara: { nombre: 'Toda la cara', en: 'All over', lejos: [...pecasNariz, [-7, 20], [7, 20], [-3, 11], [4, 10], [-8, 16]], cerca: [...cercaNariz, [-18, -1], [18, -1], [-12, 4], [13, 5], [-8, 8], [9, 9], [-6, -34], [2, -37], [9, -34], [-14, -32], [-16, 3], [16, 3]] },
    hombros: { nombre: 'Cara y hombros', en: 'Face & shoulders', lejos: pecasNariz, cerca: cercaNariz, hombros: true },
  };
  BB.LUNARES = {
    ninguno: { nombre: 'Sin lunar', en: 'None' },
    mejilla: { nombre: 'Mejilla', en: 'Cheek', lejos: [6, 19], cerca: [15, 5] },
    labio: { nombre: 'Junto al labio', en: 'By the lip', lejos: [4, 20], cerca: [10, 5] },
    ojo: { nombre: 'Bajo el ojo', en: 'Under the eye', lejos: [-7, 18], cerca: [-9, -6] },
    barbilla: { nombre: 'Barbilla', en: 'Chin', lejos: [-2, 22], cerca: [-5, 13] },
  };

  /* ---------- pelo ---------- */
  BB.PEINADOS = {
    lacio: { nombre: 'Largo lacio', en: 'Long straight', corto: 'Lacio', casa: true },
    ondas: { nombre: 'Ondas con fleco cortina', en: 'Waves, curtain bangs', corto: 'Ondas' },
    chongo: { nombre: 'Chongo desordenado', en: 'Messy bun', corto: 'Chongo', casa: true },
    mediacola: { nombre: 'Media cola con moño', en: 'Half-up with bow', corto: 'Media cola', casa: true },
    fleco: { nombre: 'Lacio con fleco', en: 'Straight with bangs', corto: 'Fleco' },
    capas: { nombre: 'Capas con volumen', en: 'Blowout layers', corto: 'Capas' },
    rizos: { nombre: 'Rizos grandes', en: 'Big curls', corto: 'Rizos' },
    coleta: { nombre: 'Coleta alta', en: 'High ponytail', corto: 'Coleta', casa: true },
    trenza: { nombre: 'Trenza de lado', en: 'Side braid', corto: 'Trenza', casa: true },
    trenzas: { nombre: 'Dos trenzas con moñitos', en: 'Two braids with bows', corto: 'Trenzas' },
    espacio: { nombre: 'Dos chonguitos', en: 'Space buns', corto: 'Chonguitos' },
    topknot: { nombre: 'Media cola con chongo', en: 'Half-up top knot', corto: 'Top knot' },
  };
  Object.assign(BB.PELOS_COLOR, {
    platino: { nombre: 'Rubio platino', l: '#fffdf0', m: '#f1e2bd', d: '#d5bd90', o: '#a08560' },
    cafe: { nombre: 'Café oscuro', l: '#8d6450', m: '#5a3b2f', d: '#432b24', o: '#2b1b18' },
    hongo: { nombre: 'Café hongo', l: '#b5a598', m: '#80706a', d: '#655653', o: '#423738' },
    rosado: { nombre: 'Café rosado', l: '#e0b0a4', m: '#b07a72', d: '#8f5c5a', o: '#5f3b40' },
    dorado: { nombre: 'Rubio dorado', l: '#f4d596', m: '#cfa05c', d: '#ad7c41', o: '#78522c' },
    cobrizo: { nombre: 'Cobrizo', l: '#eca877', m: '#bf6a41', d: '#9b4f33', o: '#682f26' },
    rosa: { nombre: 'Rosa pastel', l: '#ffe3ea', m: '#f4b6c8', d: '#d98fa8', o: '#a05f7c' },
  });
  const enPelo = { miel: 'Honey chestnut', ceniza: 'Ash brown', rubio: 'Blonde', chocolate: 'Chocolate', negro: 'Soft black', platino: 'Platinum', cafe: 'Dark brown', hongo: 'Mushroom brown', rosado: 'Rosy brown', dorado: 'Golden blonde', cobrizo: 'Copper', rosa: 'Pastel pink' };
  for (const k in enPelo) BB.PELOS_COLOR[k].en = enPelo[k];
  for (const k of ['miel', 'chocolate', 'negro', 'rubio', 'cafe']) BB.PELOS_COLOR[k].casa = true;      // tintes que se consiguen para hacerlo en casa
  BB.LUCES = {
    ninguna: { nombre: 'Sin luces', en: 'None' },
    rubias: { nombre: 'Rubias', en: 'Blonde', c: '#f0d9a2' },
    miel: { nombre: 'Miel', en: 'Honey', c: '#d9a468' },
    rosas: { nombre: 'Rosadas', en: 'Rosy', c: '#e9a9b4' },
    puntas: { nombre: 'Puntas claras', en: 'Light ends', c: '#eed6a6', ombre: true },
  };

  /* ---------- maquillaje ---------- */
  BB.DELINEADOS = { suave: { nombre: 'Suave', en: 'Soft' }, fino: { nombre: 'Fino', en: 'Fine' }, alado: { nombre: 'Alado', en: 'Winged' } };
  BB.RUBORES = {
    rosa: { nombre: 'Rosa', en: 'Pink', c: '#ff8fa8', f: .65 },
    coral: { nombre: 'Coral', en: 'Coral', c: '#ff8a6e', f: .65 },
    malva: { nombre: 'Malva', en: 'Mauve', c: '#c97a9e', f: .7 },
    frio: { nombre: 'Carita fría', en: 'Cold girl', c: '#ff6f8f', f: .85, nariz: true },
  };
  BB.LABIALES = {
    rosado: { nombre: 'Rosado', en: 'Rosy', c: '#e8788f' }, nude: { nombre: 'Nude', en: 'Nude', c: '#cf8d7f' }, cereza: { nombre: 'Cereza', en: 'Cherry', c: '#bb3148' },
    coral: { nombre: 'Coral', en: 'Coral', c: '#f07a66' }, vino: { nombre: 'Vino', en: 'Wine', c: '#8a2b45' }, malva: { nombre: 'Malva', en: 'Mauve', c: '#b86a8c' },
  };
  BB.ACABADOS_LABIO = { gloss: { nombre: 'Gloss', en: 'Gloss' }, mate: { nombre: 'Mate', en: 'Matte' } };

  /* ---------- uñas ---------- */
  BB.UNAS_FORMA = { cuadrada: { nombre: 'Cuadrada', en: 'Square', casa: true }, squoval: { nombre: 'Squoval', en: 'Squoval', casa: true }, almendra: { nombre: 'Almendra', en: 'Almond' }, coffin: { nombre: 'Coffin', en: 'Coffin' } };
  BB.UNAS_LARGO = { corta: { nombre: 'Cortas', en: 'Short', casa: true }, media: { nombre: 'Medianas', en: 'Medium' }, larga: { nombre: 'Largas', en: 'Long' } };
  const uc = (nombre, en, c, casa) => ({ nombre, en, c, casa: !!casa });
  BB.UNAS_COLOR = {
    nude: uc('Nude', 'Nude', '#ecc3b4', 1), lechoso: uc('Blanco lechoso', 'Milky white', '#fbf1ec', 1), rosaLechoso: uc('Rosa lechoso', 'Milky pink', '#f9d3d8', 1), rosa: uc('Rosa', 'Pink', '#f58fb0', 1),
    malva: uc('Malva rosado', 'Rosy mauve', '#c48a9c', 1), vino: uc('Vino', 'Wine', '#8c2740', 1), rojo: uc('Rojo', 'Red', '#d23a4e', 1), negro: uc('Negro suave', 'Soft black', '#3a2f3f', 1),
    cereza: uc('Cereza', 'Cherry', '#a8283f'), lila: uc('Lila', 'Lilac', '#b9a3ea'), lilaGris: uc('Lila grisáceo', 'Gray lilac', '#a9a0bd'), azulBebe: uc('Azul bebé', 'Baby blue', '#a9cdf0'),
    chocolate: uc('Chocolate', 'Chocolate', '#6b4136'), salvia: uc('Verde salvia', 'Sage', '#a9c5a4'), coral: uc('Coral', 'Coral', '#f58a74'), champana: uc('Champaña', 'Champagne', '#e6cfa0'),
  };
  BB.UNAS_ACABADO = { brillante: { nombre: 'Brillante', en: 'Glossy', casa: true }, jelly: { nombre: 'Jelly', en: 'Jelly' }, mate: { nombre: 'Mate', en: 'Matte' }, glitter: { nombre: 'Glitter', en: 'Glitter' } };
  BB.UNAS_DISENO = {
    ninguno: { nombre: 'Liso', en: 'Plain', casa: true }, frenchBlanco: { nombre: 'French blanco', en: 'White French', french: '#ffffff' }, frenchNegro: { nombre: 'French negro', en: 'Black French', french: '#3a2f3f' },
    frenchColor: { nombre: 'French de color', en: 'Color French', french: 'color' }, corazones: { nombre: 'Corazones', en: 'Hearts', dib: ['h.h', 'hhh', '.h.'] }, mariposas: { nombre: 'Mariposas', en: 'Butterflies', dib: ['h.h', '.h.', 'h.h'] },
    monito: { nombre: 'Moñito', en: 'Bow', dib: ['h.h', 'hhh', 'h.h'] }, puntitos: { nombre: 'Puntitos', en: 'Dots', puntos: true }, glaseado: { nombre: 'Glaseado', en: 'Glazed', glaseado: true },
  };

  /* ---------- cuerpo ---------- */
  BB.PROPORCIONES = {      // rangos naturales, en pixeles por paso (-1, 0, +1)
    hombros: { nombre: 'Hombros', en: 'Shoulders', d: { hom: .7, busto: .3 } },
    cintura: { nombre: 'Cintura', en: 'Waist', d: { cintura: .7, bajo: .4 } },
    cadera: { nombre: 'Cadera', en: 'Hips', d: { cadera: .7, muslo: .5 } },
    piernas: { nombre: 'Piernas', en: 'Legs', d: { muslo: .5, rod: .3, pant: .5 } },
  };
  Object.assign(BB.CUERPOS.delgada, { en: 'Slim' });
  Object.assign(BB.CUERPOS.promedio, { en: 'Average', hom: 13.9, brazo: 5.1, ante: 4.2, cuello: 3.2, busto: 9, bajo: 8, cintura: 7.3, cadera: 10.5, muslo: 10.6, rod: 6.7, pant: 7.6 });      // más separada de la delgada
  Object.assign(BB.CUERPOS.atletica, { en: 'Athletic' });
  Object.assign(BB.CUERPOS.curvy, { en: 'Curvy', cadera: 13.1, muslo: 12.9 });

  // Una apariencia completa, la que usa el juego.
  BB.APARIENCIA = {
    piel: 'clara', cuerpo: 'promedio', estatura: 0, prop: { hombros: 0, cintura: 0, cadera: 0, piernas: 0 },
    forma: 'ovalada', ojos_: 'redondos', iris: 'cafe', cejas: 'suaves', pestanas: 'medianas', nariz: 'boton', labios: 'suaves', pecas: 'ninguna', lunar: 'ninguno', piercing: false,
    pelo: 'lacio', colorPelo: 'miel', luces: 'ninguna', mk: {}, manos: null, pies: null,
  };
  // rasgos: junta las piezas de la cara (o usa una cara completa de la prueba de arte)
  BB.rasgos = o => {
    if (!o.forma) { const F = BB.CARAS[o.cara]; return { ...F, pest: BB.PESTANAS.medianas, pecasD: (o.pecas !== undefined ? o.pecas : F.pecas) ? BB.PECAS.nariz : BB.PECAS.ninguna, cerca: { ...F.cerca, nariz: BB.NARICES.boton.cerca } }; }
    const f = BB.FORMAS[o.forma], e = BB.OJOS[o.ojos_], c = BB.CEJAS[o.cejas], n = BB.NARICES[o.nariz], l = BB.LABIOS[o.labios];
    return { forma: f.forma, ojo: e.ojo, ojoY: e.ojoY, ceja: c.ceja, cejaY: 9, nariz: n.nariz, boca: l.boca, bocaY: 20, iris: o.iris, pest: BB.PESTANAS[o.pestanas], pecasD: BB.PECAS[o.pecas] || BB.PECAS.ninguna, lunar: BB.LUNARES[o.lunar], cerca: { ojo: e.cerca, ceja: c.cerca, labio: l.cerca, nariz: n.cerca } };
  };
  // maquillaje puesto, en números que entienden los dibujos
  BB.maq = o => {
    if (!o.mk) { const m = BB.MAQUILLAJE[o.maquillaje || 'natural'], g = m.delineado > 0; return { ...m, delin: g ? 'fino' : null, pest: g ? BB.PESTANAS_MK.natural : null, glow: true }; }
    const m = o.mk, rb = BB.RUBORES[m.rubor], lb = m.labios && BB.LABIALES[m.labios];
    return { rubor: rb ? rb.f : .18, ruborC: rb && rb.c, ruborNariz: !!(rb && rb.nariz), delin: m.delineado || null, pest: BB.PESTANAS_MK[m.pestanas] || null, sombra: null, labio: lb ? lb.c : null, mate: m.acabado === 'mate', gloss: lb ? (m.acabado === 'mate' ? 0 : .7) : .2, brillo: !!m.brillo, glow: !!(m.glow || o.glowPiel), glowFuerte: !!m.glow };
  };
  // uñas puestas -> color y detalle para el cuerpo completo
  BB.unasLejos = u => {
    if (!u) return { color: null, toque: null };
    const c = BB.UNAS_COLOR[u.color].c, d = BB.UNAS_DISENO[u.diseno] || {};
    return { color: c, rota: u.rota, toque: d.french ? (d.french === 'color' ? c : d.french) : d.dib || d.puntos ? '#ffffff' : u.acabado === 'glitter' ? '#fff4c8' : null };
  };
  // uñas puestas -> datos para la vista de cerca
  BB.unasCerca = u => {
    if (!u) return { forma: 'squoval', largo: 'corta', color: null, acabado: 'natural' };
    const c = BB.UNAS_COLOR[u.color].c, d = BB.UNAS_DISENO[u.diseno] || {}, n = { forma: u.forma, largo: u.largo, color: c, acabado: u.acabado, rota: !!u.rota };
    if (d.french) { n.french = d.french === 'color' ? c : d.french; n.frenchLargo = 3.2; if (d.french === 'color' || BB.lum(d.french) < 120 || BB.lum(c) > 235) n.color = '#f6d6cf'; if (d.french !== 'color') n.color = BB.lum(c) > 235 ? '#f6d6cf' : c; }
    if (d.dib) n.dib = { filas: d.dib, c: BB.lum(c) > 200 ? '#f58fb0' : '#ffffff' };
    if (d.puntos) n.puntos = BB.lum(c) > 200 ? '#f58fb0' : '#ffffff';
    if (d.glaseado) n.glaseado = true;
    return n;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
