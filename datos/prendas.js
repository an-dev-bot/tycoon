/* Catálogo de ropa y accesorios (70 piezas). Agregar una pieza = agregar su dato aquí.
   capa: base, encima, abajo, vestido, medias, calcetas, calentadores, pies, pelo, orejas, cuello, munecas, manos, tobillos, piesAcc, bolsa, lentes, gorro
   cat: grupo del catálogo · tienda: bazar, tienda (centro), linea · q: detalles que entiende el dibujo · alto: calzado que va sobre calentadores */
(function (root) {
  'use strict';
  const BB = root.BB;
  const CREMA = '#f7ecd9', BLANCO = '#fffaf5', ROSA = '#f6c3d2', ROSAF = '#f58fb0', LILA = '#cbb7ee', AZUL = '#bdd5ee', NEGRO = '#4a4257', VINO = '#9a3350', GRIS = '#b9b6c4', GRISO = '#7d7a8c', BEIGE = '#d9c0a3', CAFE = '#8f5f48', SALVIA = '#b4cba9', ROJO = '#d2485a', MARINO = '#4d5a86', TAUPE = '#bba595', DURAZNO = '#f7c4a8', JEAN = '#8fadd0', JEANO = '#54699a', JEANC = '#c6d8ea', DORADO = '#e9bd62', PLATA = '#dfe3ea';
  const P = (capa, cat, nombre, en, precio, colores, dibujo, q, x) => ({ capa, cat, nombre, en, precio, colores, dibujo, q, tiendas: ['tienda', 'linea'], ...(x || {}) });
  const B = { tiendas: ['bazar', 'tienda', 'linea'] }, L = { tiendas: ['linea'] };
  BB.CATALOGO = {
    /* bases (8) */
    playera: P('base', 'base', 'Playera básica', 'Basic tee', 14, [BLANCO, NEGRO, ROSA, GRIS, AZUL], 'arriba', { escote: 'redondo', manga: 'corta', largo: 'cadera', e: 1 }, B),
    topCanale: P('base', 'base', 'Top canalé de tirantes', 'Ribbed tank', 16, [BLANCO, NEGRO, BEIGE, ROSA, SALVIA], 'arriba', { escote: 'tirantes', largo: 'cintura', e: .7, tela: 'canale' }, B),
    camiEncaje: P('base', 'base', 'Cami con encaje', 'Lace cami', 28, [BLANCO, ROSA, NEGRO, LILA], 'arriba', { escote: 'tirantes', largo: 'cintura', e: .9, tela: 'satin', orilla: '#ffffff' }),
    topCuello: P('base', 'base', 'Top de cuello alto', 'Mock neck top', 26, [NEGRO, BLANCO, TAUPE, VINO], 'arriba', { largo: 'cintura', e: .8, cuello: 'alto' }),
    blusaAcanalada: P('base', 'base', 'Manga larga acanalada', 'Ribbed long sleeve', 24, [BLANCO, NEGRO, ROSA, BEIGE], 'arriba', { escote: 'cuadrado', manga: 'larga', largo: 'cintura', e: .8, eManga: 1.3, tela: 'canale' }, B),
    playeraRayas: P('base', 'base', 'Playera de rayas', 'Striped tee', 22, [BLANCO, CREMA, AZUL], 'arriba', { escote: 'redondo', manga: 'larga', largo: 'cadera', e: 1, eManga: 1.4, tela: 'rayas', c2: '#54699a' }, B),
    playeraRetro: P('base', 'base', 'Playera oversized retro', 'Retro oversized tee', 32, [CREMA, BLANCO, GRIS, ROSA], 'arriba', { escote: 'redondo', manga: 'corta', largo: 'largo', e: 1.8, eManga: 3, caja: 1, adorno: 'sol' }, B),
    blusaSatin: P('base', 'base', 'Blusa de satín con moño', 'Satin bow blouse', 68, [NEGRO, CREMA, ROSA, VINO], 'arriba', { escote: 'redondo', manga: 'larga', largo: 'cadera', e: 1.3, eManga: 2.2, puno: 2, tela: 'satin', cuello: 'mono' }),
    /* encima (12) */
    hoodie: P('encima', 'encima', 'Hoodie oversized', 'Oversized hoodie', 38, [ROSA, LILA, CREMA, GRIS, NEGRO], 'hoodie', {}, B),
    sueterHombro: P('encima', 'encima', 'Suéter de un hombro', 'Off-shoulder sweater', 46, [CREMA, ROSA, AZUL, NEGRO], 'sueterHombro', {}),
    sueterTrenzas: P('encima', 'encima', 'Suéter de trenzas', 'Cable-knit sweater', 54, [CREMA, ROJO, CAFE, ROSA], 'arriba', { escote: 'v', manga: 'larga', largo: 'cadera', e: 1.6, eManga: 2.8, caja: .8, resorte: 2, puno: 2, tela: 'trenzas' }, B),
    cardiganCorazon: P('encima', 'encima', 'Cárdigan de corazones', 'Heart cardigan', 58, [CREMA, ROSA, LILA], 'arriba', { escote: 'v', abierto: 1, manga: 'larga', largo: 'cadera', e: 1.6, eManga: 2.8, caja: .6, resorte: 2, puno: 2, tela: 'corazones', c2: '#d2485a', boton: '#fffaf2' }),
    hoodieCerezas: P('encima', 'encima', 'Hoodie de cerezas', 'Cherry hoodie', 52, [BLANCO, ROSA, CREMA], 'arriba', { manga: 'larga', largo: 'largo', e: 2, eManga: 3.2, caja: 1, resorte: 3, puno: 2, cuello: 'capucha', adorno: 'cerezas', c3: '#d2485a' }),
    sudadera: P('encima', 'encima', 'Sudadera con número', 'Varsity sweatshirt', 42, [GRISO, CREMA, MARINO, VINO], 'arriba', { escote: 'redondo', manga: 'larga', largo: 'cadera', e: 2, eManga: 3, caja: 1.1, resorte: 3, puno: 2, adorno: 'numero', c3: '#fff6ea' }, B),
    sueterPeludo: P('encima', 'encima', 'Suéter peludito', 'Fuzzy off-shoulders knit', 56, [BEIGE, ROSA, BLANCO, LILA], 'arriba', { escote: 'caido', manga: 'larga', largo: 'cadera', e: 1.8, eManga: 3.2, caja: .8, tela: 'peludo' }),
    sueterNordico: P('encima', 'encima', 'Suéter nórdico', 'Nordic sweater', 64, [CREMA, ROJO, MARINO], 'arriba', { escote: 'redondo', manga: 'larga', largo: 'cadera', e: 1.7, eManga: 2.8, caja: .9, resorte: 2, puno: 2, tela: 'grecas', c2: '#b98a68', cuello: 'alto' }),
    sueterMono: P('encima', 'encima', 'Suéter con moño', 'Bow sweater', 60, [GRIS, BLANCO, ROSA, NEGRO], 'arriba', { escote: 'amplio', manga: 'larga', largo: 'cintura', e: 1.4, eManga: 2.6, resorte: 2, puno: 2, adorno: 'monoNegro', c3: '#4a3148' }),
    halfzip: P('encima', 'encima', 'Half-zip de borrega', 'Sherpa half-zip', 66, [BLANCO, BEIGE, ROSA, SALVIA], 'arriba', { manga: 'larga', largo: 'cadera', e: 2, eManga: 3, caja: 1, tela: 'borrega', cuello: 'doblado', adorno: 'cierre', resorte: 2 }),
    chamarra: P('encima', 'encima', 'Chamarra de borrega', 'Shearling jacket', 128, [CAFE, NEGRO, ROSA], 'arriba', { escote: 'v', abierto: 1, manga: 'larga', largo: 'cadera', e: 2.2, eManga: 3.4, caja: .9, resorte: 2, puno: 2, cuello: 'peludo', solapa: '#fff6ea', bolsillos: 1 }),
    abrigo: P('encima', 'encima', 'Abrigo largo', 'Long coat', 260, [TAUPE, NEGRO, CREMA, VINO], 'arriba', { escote: 'v', abierto: 1, manga: 'larga', largo: 'abrigo', e: 2.4, eManga: 3.2, caja: .6, vuelo: 1.4, puno: 1, cuello: 'camisa', bolsillos: 1, boton: '#e9bd62' }, L),
    /* abajo (10) */
    pants: P('abajo', 'abajo', 'Pants', 'Joggers', 30, ['#cfcbdb', NEGRO, ROSA, CREMA], 'pants', {}, B),
    jeans: P('abajo', 'abajo', 'Jeans rectos', 'Straight jeans', 48, [JEAN, JEANO, JEANC, NEGRO], 'pantalon', { corte: 'recto', jeans: 1, tela: 'mezclilla' }, B),
    jeansAnchos: P('abajo', 'abajo', 'Jeans anchos', 'Wide-leg jeans', 56, [JEANC, JEAN, JEANO], 'pantalon', { corte: 'ancho', jeans: 1, tela: 'mezclilla' }),
    leggings: P('abajo', 'abajo', 'Leggings', 'Leggings', 26, [NEGRO, GRISO, TAUPE, VINO], 'pantalon', { corte: 'ajustado', resorteCintura: 1 }, { ...B, ajustado: true }),
    pantalonAncho: P('abajo', 'abajo', 'Pantalón acampanado', 'Flared trousers', 62, [CREMA, NEGRO, BEIGE, ROSA], 'pantalon', { corte: 'campana', cinturon: '#8f5f48' }),
    faldaPlisada: P('abajo', 'abajo', 'Falda plisada', 'Pleated skirt', 38, [NEGRO, BLANCO, ROSA, MARINO], 'faldaPlisada', {}),
    faldaHolanes: P('abajo', 'abajo', 'Falda de holanes', 'Ruffle skirt', 42, [BLANCO, ROSA, LILA, NEGRO], 'falda', { forma: 'holanes', alto: 13, orilla: '#ffffff' }),
    miniPana: P('abajo', 'abajo', 'Mini de pana', 'Corduroy mini', 36, [CAFE, VINO, BEIGE, SALVIA], 'falda', { forma: 'recta', alto: 10, tela: 'pana', botones: '#e9bd62' }, B),
    midiSatin: P('abajo', 'abajo', 'Midi de satín', 'Satin midi skirt', 72, ['#e9d6b4', ROSA, NEGRO, SALVIA], 'falda', { forma: 'midi', largo: 'midi', tela: 'satin' }),
    shortMezclilla: P('abajo', 'abajo', 'Short de mezclilla', 'Denim shorts', 30, [JEAN, JEANC, NEGRO], 'corto', { alto: 8, jeans: 1, tela: 'mezclilla' }, B),
    /* vestidos (4) */
    vestidoPunto: P('vestido', 'vestido', 'Vestido de punto', 'Knit dress', 68, [VINO, TAUPE, CREMA, NEGRO], 'vestidoPunto', {}),
    vestidoFloral: P('vestido', 'vestido', 'Vestido floral', 'Floral dress', 58, [BLANCO, AZUL, ROSA], 'vestido', { arriba: { escote: 'cuadrado', manga: 'corta', e: .9, eManga: 2, tela: 'floral', c2: '#e57f9a' }, falda: { forma: 'campana', alto: 14, tela: 'floral', c2: '#e57f9a' }, cinta: '#e57f9a' }, B),
    vestidoNegro: P('vestido', 'vestido', 'Mini negro con encaje', 'Lace-trim mini dress', 84, [NEGRO, VINO, CREMA], 'vestido', { arriba: { escote: 'redondo', manga: 'larga', e: .9, eManga: 1.6, adorno: 'botones', c3: '#fffaf2' }, falda: { forma: 'plisada', alto: 12, orilla: '#f7ecd9' } }),
    vestidoSatin: P('vestido', 'vestido', 'Slip de satín', 'Satin slip dress', 140, ['#e9d6b4', ROSA, SALVIA, NEGRO], 'vestido', { arriba: { escote: 'tirantes', e: .9, tela: 'satin' }, falda: { forma: 'midi', largo: 'midi', tela: 'satin' } }, L),
    /* pijamas (4) */
    pijamaSatin: P('vestido', 'pijama', 'Pijama de satín', 'Satin pajamas', 48, ['#f7b9cd', LILA, AZUL, CREMA], 'pijamaSatin', {}),
    pijamaCuadros: P('vestido', 'pijama', 'Pijama de cuadros', 'Plaid pajamas', 36, [ROJO, ROSA, MARINO], 'conjunto', { arriba: { escote: 'camisa', manga: 'larga', largo: 'largo', e: 1.8, eManga: 2.8, caja: .8, tela: 'cuadros', c2: '#4a3148', cuello: 'camisa', adorno: 'botones', c3: '#fffaf2' }, abajo: { corte: 'recto', tela: 'cuadros', c2: '#4a3148', resorteCintura: 1 } }, B),
    pijamaOsitos: P('vestido', 'pijama', 'Pijama de ositos', 'Teddy pajamas', 42, [CREMA, ROSA, AZUL], 'conjunto', { arriba: { escote: 'redondo', manga: 'larga', largo: 'cadera', e: 1.8, eManga: 2.8, caja: .8, resorte: 2, puno: 2, adorno: 'corazon', c3: '#b98a68' }, abajo: { corte: 'jogger', tela: 'ositos', resorteCintura: 1, puno: 1 } }),
    pijamaMonitos: P('vestido', 'pijama', 'Pijama de moñitos', 'Bow pajamas', 40, [BLANCO, ROSA, LILA], 'conjunto', { arriba: { escote: 'tirantes', largo: 'cadera', e: 1, vuelo: 1, tela: 'monitos', c2: '#4a3148', orilla: '#fffaf5' }, abajo: { short: 1, alto: 8, tela: 'monitos', c2: '#4a3148', orilla: '#fffaf5', resorteCintura: 1 } }),
    /* piernas (8) */
    calcetasAltas: P('calcetas', 'piernas', 'Calcetas altas', 'Knee socks', 10, [BLANCO, NEGRO, GRIS, CREMA], 'calcetasAltas', {}, B),
    calcetasAguadas: P('calcetas', 'piernas', 'Calcetas aguadas', 'Slouch socks', 12, [BLANCO, GRIS, CREMA, ROSA], 'calceta', { altura: 'media', e: 1, aguada: 1 }, B),
    calcetasPeludas: P('calcetas', 'piernas', 'Calcetas peluditas', 'Fuzzy socks', 9, [ROSA, BLANCO, LILA, AZUL], 'calceta', { altura: 'tobillo', e: 1.2, tela: 'peludo' }, B),
    calcetasEncaje: P('calcetas', 'piernas', 'Calcetas con holán', 'Frilly socks', 11, [BLANCO, ROSA, NEGRO], 'calceta', { altura: 'tobillo', e: .6, holan: 1 }),
    sobreRodilla: P('calcetas', 'piernas', 'Calcetas sobre la rodilla', 'Over-the-knee socks', 18, [BLANCO, NEGRO, GRIS, CREMA], 'calceta', { altura: 'sobre', e: .7, tela: 'canale', mono: '#f58fb0' }),
    mediasNegras: P('medias', 'piernas', 'Medias', 'Tights', 14, [NEGRO, '#6b4a3c', BLANCO], 'medias', { opaca: .72 }, { ...B, piel: true }),
    mediasPuntos: P('medias', 'piernas', 'Medias de puntitos', 'Dotted tights', 18, [NEGRO, BLANCO, VINO], 'medias', { opaca: .4, patron: 'puntos' }, { piel: true }),
    calentadores: P('calentadores', 'piernas', 'Calentadores', 'Leg warmers', 20, [CREMA, ROSA, GRIS, NEGRO], 'calentador', {}),
    /* calzado (12) */
    chanclas: P('pies', 'calzado', 'Chanclas', 'Flip-flops', 12, ['#fff4ea', NEGRO, LILA], 'chanclas', {}, B),
    flats: P('pies', 'calzado', 'Flats con moñito', 'Bow flats', 34, [NEGRO, ROSA, CREMA, VINO], 'flats', {}),
    pantuflas: P('pies', 'calzado', 'Pantuflas peludas', 'Fluffy slippers', 22, ['#fffaf5', ROSA, LILA], 'pantuflas', {}, B),
    tenis: P('pies', 'calzado', 'Tenis retro', 'Retro sneakers', 64, ['#fffaf5', CREMA, ROSA], 'zapato', { suela: '#c9a67c', c2: '#9a3350', franja: 1, corte: 6, agujetas: '#ffffff', e: .9, plataforma: 2 }, B),
    botasAltas: P('pies', 'calzado', 'Botas altas', 'Tall boots', 118, ['#f5e8d8', CAFE, NEGRO, VINO], 'botasAltas', {}, { alto: true }),
    botasBorrega: P('pies', 'calzado', 'Botas de borrega', 'Sherpa boots', 78, [BEIGE, CAFE, ROSA, NEGRO], 'zapato', { cana: 'tobillo', eCana: 2, e: 1.2, plataforma: 2, suela: '#e9d9c4', peludo: 1, c2: '#fffaf2' }),
    botines: P('pies', 'calzado', 'Botines de hebilla', 'Buckle ankle boots', 92, [NEGRO, CAFE, BLANCO], 'zapato', { cana: 'media', eCana: 1.1, e: .8, hebilla: 1, tacon: 1 }, { alto: true }),
    maryjanes: P('pies', 'calzado', 'Mary Janes de plataforma', 'Platform Mary Janes', 72, [NEGRO, VINO, CREMA], 'zapato', { corte: 4, escotado: 1, plataforma: 3, correa: 1, e: .8 }),
    mules: P('pies', 'calzado', 'Mules con moño', 'Bow mules', 58, [ROSAF, BLANCO, NEGRO], 'sandalia', { tipo: 'ancha', tacon: 1, mono: '#fffaf5', suela: '#f3d9d0' }),
    tacones: P('pies', 'calzado', 'Tacones de charol', 'Patent heels', 110, [NEGRO, ROJO, ROSAF], 'zapato', { corte: 4, escotado: 1, tacon: 1, e: .5, puntera: 1 }, L),
    sandalias: P('pies', 'calzado', 'Sandalias de plataforma', 'Platform sandals', 44, [BLANCO, NEGRO, CAFE], 'sandalia', { tipo: 'tiras', plataforma: 3, suela: '#e0bf96' }),
    slides: P('pies', 'calzado', 'Slides acolchadas', 'Puffy slides', 24, [ROSA, CREMA, LILA, NEGRO], 'sandalia', { tipo: 'ancha', plataforma: 2, suela: '#fff4ea' }, B),
    /* accesorios (12) */
    pinza: P('pelo', 'accesorio', 'Pinza de pelo', 'Claw clip', 7, [ROSAF, NEGRO, CAFE, BLANCO], 'pinza', {}, { ...B, icono: ['.o......o.', 'obo....obo', 'obbooooblo', 'obllllllbo', '.obbbbbbo.', '.obobobbo.', '.o.o.oo.o.'] }),
    mono: P('pelo', 'accesorio', 'Moño grande', 'Big hair bow', 12, [CREMA, ROSAF, NEGRO, ROJO], 'monoPelo', {}, B),
    aretes: P('orejas', 'accesorio', 'Aretes de perla', 'Pearl earrings', 18, [BLANCO, ROSAF, LILA], 'aretes', {}, { icono: ['.gg....gg.', '.g......g.', '.g......g.', '.oo....oo.', 'obho..obho', 'obbo..obbo', '.oo....oo.'] }),
    cadenita: P('cuello', 'accesorio', 'Collar de cadenita', 'Dainty necklace', 24, [DORADO, PLATA, '#e8b4a6'], 'cadenita', {}, { icono: ['b........b', 'b........b', '.b......b.', '.b......b.', '..b....b..', '...bbbb...', '....hs....', '....sh....'] }),
    perlas: P('cuello', 'accesorio', 'Collar de perlas', 'Pearl necklace', 46, [BLANCO, ROSA, CREMA], 'perlas', {}, { icono: ['ob......ob', 'bo......bo', '.ob....ob.', '.bo....bo.', '..obobob..', '..bohobo..'] }),
    pulsera: P('munecas', 'accesorio', 'Pulsera fina', 'Thin bracelet', 20, [DORADO, PLATA, '#e8b4a6'], 'pulsera', {}, { icono: ['..bbbbbb..', '.b......b.', 'b........b', 'b........b', '.s......s.', '..ssshss..', '.....h....'] }),
    anillos: P('manos', 'accesorio', 'Anillos finos', 'Stacking rings', 16, [DORADO, PLATA, '#e8b4a6'], 'anillos', {}, { icono: ['....hh....', '....hh....', '..bbbbbb..', '.b......b.', '.b......b.', '.s......s.', '..ssssss..'] }),
    tobillera: P('tobillos', 'accesorio', 'Tobillera', 'Anklet', 14, [DORADO, PLATA, ROSAF], 'tobillera', {}, { ...B, icono: ['b..........b', 'b..........b', '.b........b.', '..bbb..bbb..', '.....bb.....', '....h..h....', '....hhhh....', '.....hh.....'] }),
    anilloPie: P('piesAcc', 'accesorio', 'Anillo de pie', 'Toe ring', 9, [PLATA, DORADO, '#e8b4a6'], 'anilloPie', {}, { ...B, icono: ['..bbbbb..', '.b.....b.', '.b.....b.', '.s.....s.', '..sshss..'] }),
    bolsa: P('bolsa', 'accesorio', 'Bolsa acolchada con cadena', 'Quilted chain bag', 180, [ROSA, NEGRO, CREMA, VINO], 'bolsa', { acolchada: 1 }, L),
    lentes: P('lentes', 'accesorio', 'Lentes redondos', 'Round glasses', 26, ['#8f5f48', NEGRO, DORADO], 'lentes', {}),
    boina: P('gorro', 'accesorio', 'Boina peluda', 'Fuzzy beret', 24, [BLANCO, GRIS, ROSA, VINO], 'boina', {}, B),
  };
  BB.CATEGORIAS = { base: ['Bases', 'Basics'], encima: ['Encima', 'Layers'], abajo: ['Abajo', 'Bottoms'], vestido: ['Vestidos', 'Dresses'], pijama: ['Pijamas', 'Pajamas'], piernas: ['Piernas', 'Legwear'], calzado: ['Calzado', 'Shoes'], accesorio: ['Accesorios', 'Accessories'] };
  for (const k in BB.CATEGORIAS) BB.CATEGORIAS[k] = { nombre: BB.CATEGORIAS[k][0], en: BB.CATEGORIAS[k][1] };
  // lo que se quita al ponerse algo (un vestido tapa base y abajo)
  BB.CHOCA = { vestido: ['base', 'abajo'], base: ['vestido'], abajo: ['vestido'] };
  BB.INICIO_ROPA = [['hoodie', ROSA], ['pants', '#cfcbdb'], ['chanclas', '#fff4ea']];
})(typeof globalThis !== 'undefined' ? globalThis : this);
