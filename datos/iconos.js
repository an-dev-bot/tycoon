/* Iconitos en pixeles de los botones. Agregar uno = agregar su dibujo aquí. Cada letra es un color de BB.ICONO_COLOR. */
(function (root) {
  'use strict';
  const BB = root.BB = root.BB || {};
  BB.ICONO_COLOR = { o: '#f58fb0', b: '#ffd9e4', a: '#ffffff', r: '#d96f93', y: '#f2c057', g: '#7cbf95', c: '#8fbdf0', p: '#b9a3ea', m: '#b98a68', k: '#8d7394' };
  BB.ICONOS = {
    /* pestañas, barras y teléfono */
    ella: ['...ooo...', '..ooooo..', '.ooaaaoo.', '.oaaaaao.', '.ooaaaoo.', '.oo.a.oo.', '..bbbbb..', '.bbbbbbb.'],
    casa: ['....o....', '...ooo...', '..ooooo..', '.ooooooo.', '..bbbbb..', '..bbabb..', '..bbabb..', '..bbabb..'],
    ciudad: ['...oo....', '...oo.bb.', '.b.oo.bb.', '.b.oo.bb.', '.boooobb.', '.boaoabb.', '.booooab.', '.boaoabb.'],
    telefono: ['..ooooo..', '..obbbo..', '..obabo..', '..obbbo..', '..obabo..', '..obbbo..', '..ooaoo..', '..ooooo..'],
    energia: ['....oo...', '...oo....', '..oooo...', '....oo...', '...oo....', '...o.....'],
    animo: ['.oo.oo.', 'ooooooo', 'oaooooo', '.ooooo.', '..ooo..', '...o...'],
    hambre: ['o.o.o.o', 'o.o.o.o', 'ooo..o.', '.o...o.', '.o...o.', '.o...o.'],
    banco: ['....o....', '..ooooo..', 'ooooooooo', '.b.b.b.b.', '.b.b.b.b.', '.b.b.b.b.', 'ooooooooo'],
    mensajes: ['.ooooooo.', 'ooooooooo', 'oaoaoaoao', 'ooooooooo', '.ooooooo.', '..oo.....', '..o......'],
    trabajos: ['...ooo...', '...o.o...', 'ooooooooo', 'obbbabbbo', 'obbbbbbbo', 'obbbbbbbo', 'ooooooooo'],
    tienda: ['...ooo...', '..o...o..', '.ooooooo.', '.obbbbbo.', '.obaaabo.', '.obbabbo.', '.ooooooo.'],
    ventas: ['oooo.....', 'oaooo....', 'ooooooo..', '.ooooooo.', '..ooooooo', '...ooooo.', '....ooo..'],
    calendario: ['.o.....o.', 'ooooooooo', 'obbbbbbbo', 'obabababo', 'obbbbbbbo', 'obabababo', 'ooooooooo'],
    fotos: ['..ooo....', 'ooooooooo', 'ooobbbooo', 'oobaaaboo', 'oobaaaboo', 'ooobbbooo', 'ooooooooo'],
    notas: ['.ooooooo.', '.obbbbbo.', '.obaaabo.', '.obbbbbo.', '.obaaabo.', '.obbbbbo.', '.ooooooo.'],
    ajustes: ['...o.o...', '.ooooooo.', '.oobbboo.', 'oobb.bboo', '.oobbboo.', '.ooooooo.', '...o.o...'],
    /* lo que hace en casa */
    dormir: ['..yyy....', '.yyy...p.', 'yyy......', 'yyy.....p', 'yyy......', 'yyyy...y.', '.yyyyyyy.', '..yyyyy..'],
    siesta: ['ppppp....', '...p.....', '..p......', '.ppppp...', '.....oooo', '.......o.', '......o..', '.....oooo'],
    descansar: ['..ooooo..', '.ooooooo.', 'rrobbborr', 'rrobbborr', 'rrrrrrrrr', 'rrrrrrrrr', '.m.....m.'],
    cocinar: ['...b..b..', '..b..b...', '....r....', '.ooooooo.', 'rrrrrrrrr', '.ooooooo.', '.ooooooo.', '..ooooo..'],
    domicilio: ['..m...m..', '..mmmmm..', '.yyyyyyy.', '.yyryryy.', '.yyrrryy.', '.yyyryyy.', '.yyyyyyy.', '.yyyyyyy.'],
    banarse: ['...kkk...', '..kkkkk..', '.kkkkkkk.', '.........', '.c..c..c.', '...c..c..', '.c..c..c.', '...c..c..'],
    skincare: ['...yyy...', '...yyy...', '..bbbbb..', '.bboobbb.', '.boooobb.', '.bboobbb.', '.bbbbbbb.', '..bbbbb..'],
    limpiar: ['.......m.', '......m..', '.....m...', '....m....', '..ooo....', '.yyyyy...', 'yyyyyyy..', 'y.y.y.y..'],
    trabajar: ['.ppppppp.', '.pcccccp.', '.pcaaccp.', '.pcccocp.', '.ppppppp.', 'kkkkkkkkk'],
    salir: ['.ooooooo.', '.obbbbbo.', '.obbbbbo.', '.obbbbbo.', '.obbbybo.', '.obbbbbo.', '.obbbbbo.', '.obbbbbo.'],
    paquete: ['..rr.rr..', '...ror...', 'yyyyoyyyy', 'yyyyoyyyy', '.mmmommm.', '.mmmommm.', '.mmmommm.'],
    ropa: ['.oo...oo.', 'ooobbbooo', 'ooooooooo', 'b.ooooo.b', '..ooooo..', '..ooooo..', '..rrrrr..'],
    mudar: ['.yyy.....', 'y...y....', 'y...yyyyy', 'y...y.y.y', '.yyy..y.y'],
    /* decorar */
    decorar: ['ooooooo..', 'ooooooooo', 'ooooooo.o', '........o', '....ooooo', '....o....', '....m....', '....m....'],
    muebles: ['..ooooo..', '..obbbo..', '..obbbo..', '..ooooo..', '..rrrrr..', '..m...m..', '..m...m..'],
    pared: ['ooooooooo', 'obobobobo', 'ooooooooo', 'bobobobob', 'ooooooooo', 'obobobobo', 'ooooooooo'],
    piso: ['mmmmmmmmm', 'myyyymyyy', 'mmmmmmmmm', 'yymyyyymy', 'mmmmmmmmm', 'myyyymyyy', 'mmmmmmmmm'],
    regresar: ['..o......', '.oo......', 'ooooooo..', '.oo....o.', '..o....o.', '.......o.', '...oooo..'],
    quitar: ['oo...oo', 'ooo.ooo', '.ooooo.', '..ooo..', '.ooooo.', 'ooo.ooo', 'oo...oo'],
    listo: ['.......gg', '......ggg', 'gg...ggg.', 'ggg.ggg..', '.ggggg...', '..ggg....', '...g.....'],
    /* ella */
    looks: ['....o....', '....o....', '...ooo...', 'ooooooooo', '.ooooooo.', '..ooooo..', '..oo.oo..', '.oo...oo.'],
    cara: ['.mmmmmmm.', 'mmbbbbbmm', 'mbbbbbbbm', 'mbkbbbkbm', 'mbbbbbbbm', 'm.brrrb.m', '...bbb...'],
    cuerpo: ['...bb...', '...bb...', '..oooo..', '.oooooo.', '.b.oo.b.', '..oooo..', '..b..b..', '..b..b..', '..r..r..'],
    pelo: ['ppppppppp', 'ppppppppp', 'p.p.p.p.p', 'p.p.p.p.p', 'p.p.p.p.p', 'p.p.p.p.p'],
    mk: ['....r..', '...rr..', '...rr..', '...rr..', '..yyyy.', '..pppp.', '..pppp.', '..pppp.'],
    unas: ['...pp...', '...pp...', '...pp...', '..oooo..', '.oaoooo.', '.oaoooo.', '.oooooo.', '.oooooo.'],
    /* ciudad */
    mapa: ['..ooooo..', '.ooaaaoo.', '.oaaaaao.', '.ooaaaoo.', '..ooooo..', '...ooo...', '....o....'],
    super: ['oo.......', '.ooooooo.', '.oobobo..', '..ooooo..', '..o......', '..oooooo.', '..k...k..'],
    superRico: ['...g.....', '..gg.....', '.rrrrrr..', 'rrarrrrr.', 'rarrrrrr.', 'rrrrrrrr.', '.rrrrrr..', '..rr.r...'],
    cafe: ['..b..b...', '...b..b..', 'ooooooo..', 'oooooooo.', 'ooooooo.o', 'oooooooo.', '.ooooo...'],
    desayunoCafe: ['..mmmmm..', '.mmyyymm.', 'mmy...ymm', 'my.....ym', 'mm.....mm', '.m.....m.'],
    bazar: ['....y....', '.....y...', '....y....', '..ooooo..', 'oo.....oo', 'ooooooooo'],
    /* varios */
    moneda: ['..yyyyy..', '.yyaaayy.', '.yaayyyy.', '.yyaaayy.', '.yyyyaay.', '.yyaaayy.', '..yyyyy..'],
    mas: ['...oo...', '...oo...', '...oo...', 'oooooooo', 'oooooooo', '...oo...', '...oo...', '...oo...'],
    flechaI: ['....oo', '...oo.', '..oo..', '.oo...', '..oo..', '...oo.', '....oo'],
    flechaD: ['oo....', '.oo...', '..oo..', '...oo.', '..oo..', '.oo...', 'oo....'],
    claro: ['....y....', '.y.....y.', '...yyy...', '..yyyyy..', 'y.yyyyy.y', '..yyyyy..', '...yyy...', '.y.....y.', '....y....'],
    oscuro: ['...ppp...', '..ppp....', '.ppp.....', '.ppp...b.', '.ppp.....', '.pppp...p', '..pppppp.', '...pppp..'],
    auto: ['..yyyppp.', '.yyyypppp', 'yyyyyppp.', 'yyyyypp..', 'yyyyypp..', 'yyyyyppp.', '.yyyypppp', '..yyyppp.'],
    exportar: ['....g....', '...ggg...', '..ggggg..', '....g....', '....g....', 'k.......k', 'kkkkkkkkk'],
    importar: ['....c....', '....c....', '..ccccc..', '...ccc...', '....c....', 'k.......k', 'kkkkkkkkk'],
    look: ['.oo.oo.', 'ooooooo', 'ooooooo', '.ooooo.', '..ooo..', '...o...'],
    guardar: ['ooooooo', 'oobbboo', 'oobbboo', 'ooooooo', 'obbbbbo', 'obaaabo', 'obbbbbo'],
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
