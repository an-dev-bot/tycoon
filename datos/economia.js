/* Todos los números del juego: precios en dólares, tiempos, barras y reglas de la renta. */
(function (root) {
  'use strict';
  const BB = root.BB;
  BB.ECO = {
    inicio: { dinero: 0, raciones: 6, hora: 8 },
    // semana de renta y cuentas (en días del juego)
    renta: { estudio: 225, compartido: 95, depositoEstudio: 225, depositoCompartido: 60 },
    cuentas: { luz: 24, telefono: 10 },
    semana: 7, aviso: 3, recargo: .10, diasDesalojo: 14, diasCorte: 7, remate: .25, mueblesQueSeLleva: 2,
    // comida
    comida: {
      super: { raciones: 6, precio: 30 }, superRico: { raciones: 6, precio: 48 }, cocinar: { sacia: 46, horas: 1, energia: -3, animo: 2, animoRico: 6 },
      domicilio: { precio: 19, sacia: 55, horas: .5, animo: 6 }, cafe: { precio: 5, sacia: 8, horas: .5, energia: 10, animo: 5 }, desayunoCafe: { precio: 12, sacia: 34, horas: 1, energia: 8, animo: 8 },
    },
    // por hora despierta
    porHora: { hambre: 3.6, energia: 1.2, animo: .6 },
    dormir: { hambre: 14, tarde: 24, limite: 26, energiaBien: 100, energiaTarde: 78, despierta: 7.5 },
    actividades: {
      descansar: { horas: 2, energia: 8, animo: 7, dia: 2 }, siesta: { horas: 1.5, energia: 20, animo: 1, dia: 1 }, banarse: { horas: .5, energia: 4, animo: 5, dia: 1 }, skincare: { horas: .5, energia: 0, animo: 3 }, limpiar: { horas: 1.5, energia: -14, animo: 4 },
    },
    viaje: { horas: .5, energia: -2 },
    suciedadDia: 9, unasDias: 21, skincareGlow: 3, skincareGranitos: 4,
    // tiendas
    bazar: { descuento: .55, piezas: 10, dias: 3 }, linea: { envio: 6, min: 1, max: 2 },
    ventaRapida: .40, oferta: [.50, .80], ofertaDias: [1, 3],
    // belleza
    salon: { peinado: 48, color: 92, luces: 74, manos: 42, pies: 46, diseno: 8, acabado: 5, largo: 6, horas: 2, horasUnas: 1.5 },
    casa: { peinado: 16, color: 15, esmalte: 8, horas: 1 },
    maquillaje: { delineado: { suave: 9, fino: 11, alado: 13 }, pestanas: { natural: 10, wispy: 14, manga: 16, dramaticas: 18 }, rubor: { rosa: 12, coral: 12, malva: 14, frio: 18 }, labios: 11, brillo: 13, glow: 19, kitSkincare: 28, usosSkincare: 28 },
    // trabajo: lo que paga cada hora según el nivel del encargo, y lo que cansa
    trabajo: { porHora: [7.1, 7.3, 7.5, 7.8, 8.3], energiaHora: 13.5, animoHora: 1.6, porNivel: .015, xpNivel: [0, 40, 110, 220, 380, 600, 900], ofertas: 5, repNiveles: [0, 50, 130, 250, 420], maxNivelHab: 7 },
    ausente: { horasPorDia: 3, maxDias: 3 },
    looksMax: 12, fotosMax: 80, movimientosMax: 150,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
