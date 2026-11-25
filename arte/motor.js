/* Motor de pixel art de Bows & Billions.
   Una Capa es una cuadrícula de pixeles (sin canvas), así el mismo dibujo sale igual en el navegador y en Node.
   Las formas (poli, elipse, perfil, tubo) usan coordenadas continuas y pintan los pixeles cuyo centro cae dentro;
   los detalles (px, rect, linea, dibujo) usan pixeles enteros. Nunca hay difuminado ni transparencias a medias. */
(function (root) {
  'use strict';
  const BB = root.BB = root.BB || {};

  /* ---------- color ---------- */
  const cache = new Map();
  function col(c) {
    if (typeof c === 'number') return c >>> 0;
    if (!c) return 0;
    let v = cache.get(c);
    if (v === undefined) {
      let h = c.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      v = (0xff000000 | parseInt(h, 16)) >>> 0;
      cache.set(c, v);
    }
    return v;
  }
  const R = c => (c >>> 16) & 255, G = c => (c >>> 8) & 255, B = c => c & 255;
  const pack = (r, g, b) => (0xff000000 | (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)))) >>> 0;
  function mix(a, b, t) { a = col(a); b = col(b); return pack(R(a) + (R(b) - R(a)) * t, G(a) + (G(b) - G(a)) * t, B(a) + (B(b) - B(a)) * t); }
  function mult(a, m) { a = col(a); return pack(R(a) * m[0], G(a) * m[1], B(a) * m[2]); }
  const TINTA = '#3d2a45';                      // el «negro» del juego: ciruela oscuro, nunca negro puro
  const osc = (c, t) => mix(c, TINTA, t);
  const acl = (c, t) => mix(c, '#ffffff', t);
  const lum = c => { c = col(c); return .3 * R(c) + .59 * G(c) + .11 * B(c); };
  const hex = c => '#' + (col(c) & 0xffffff).toString(16).padStart(6, '0');
  /* Rampa de 5 tonos a partir de un color: luz, base, sombra, sombra profunda y contorno.
     Las sombras se van hacia el ciruela (más frías), las luces hacia el crema (más cálidas). */
  const rampas = new Map();
  function rampa(c) {
    const k = col(c);
    let r = rampas.get(k);
    if (!r) {
      const L = lum(k), oscuro = L < 90;
      r = {
        l: mix(k, oscuro ? '#b9a8d8' : '#fffaf0', oscuro ? .28 : .5),
        b: k,
        s: mix(k, oscuro ? '#1f1428' : '#8a6a9a', oscuro ? .3 : .22),
        d: mix(k, oscuro ? '#1f1428' : '#6a4a7a', oscuro ? .5 : .42),
        o: mix(k, oscuro ? '#1c1224' : TINTA, oscuro ? .55 : .62),
      };
      rampas.set(k, r);
    }
    return r;
  }

  /* ---------- curvas ---------- */
  // Interpolación cúbica monótona (no se pasa de los puntos): xs creciente
  function curva(xs, ys) {
    const n = xs.length;
    if (n === 1) return () => ys[0];
    const h = [], d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) m[i] = 0;
      else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
    }
    return x => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (x > xs[i + 1]) i++;
      const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
    };
  }
  // curva a partir de pares [[y, x], ...]
  const borde = pares => curva(pares.map(p => p[0]), pares.map(p => p[1]));

  /* ---------- capa ---------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const trama = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16;   // umbral 0..1 para tramas ordenadas

  class Capa {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
    copia() { const c = new Capa(this.w, this.h); c.d.set(this.d); return c; }
    get(x, y) { return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.d[y * this.w + x] : 0; }
    hay(x, y) { return this.get(x, y) !== 0; }
    px(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = col(c); return this; }
    pts(lista, c) { for (const [x, y] of lista) this.px(x, y, c); return this; }
    rect(x, y, w, h, c) { c = col(c); for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c); return this; }
    hl(x0, x1, y, c) { if (x0 > x1) [x0, x1] = [x1, x0]; return this.rect(x0, y, x1 - x0 + 1, 1, c); }
    vl(x, y0, y1, c) { if (y0 > y1) [y0, y1] = [y1, y0]; return this.rect(x, y0, 1, y1 - y0 + 1, c); }
    linea(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) { this.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      return this;
    }
    trazo(puntos, c) { for (let i = 0; i < puntos.length - 1; i++) this.linea(puntos[i][0], puntos[i][1], puntos[i + 1][0], puntos[i + 1][1], c); return this; }
    // tramo horizontal continuo [xl, xr) en la fila y
    tramo(y, xl, xr, c) { const a = Math.ceil(xl - .5), b = Math.ceil(xr - .5) - 1; if (b >= a) this.rect(a, y, b - a + 1, 1, c); return this; }
    poli(p, c) {
      c = col(c);
      let y0 = Infinity, y1 = -Infinity;
      for (const q of p) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
        const yc = y + .5, xs = [];
        for (let i = 0; i < p.length; i++) {
          const a = p[i], b = p[(i + 1) % p.length];
          if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
        xs.sort((u, v) => u - v);
        for (let i = 0; i + 1 < xs.length; i += 2) this.tramo(y, xs[i], xs[i + 1], c);
      }
      return this;
    }
    elipse(cx, cy, rx, ry, c) {
      c = col(c);
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        const t = (y + .5 - cy) / ry; if (Math.abs(t) >= 1) continue;
        const dx = rx * Math.sqrt(1 - t * t); this.tramo(y, cx - dx, cx + dx, c);
      }
      return this;
    }
    // silueta por filas: izq y der son funciones y -> x (o listas [[y,x],...])
    perfil(y0, y1, izq, der, c) {
      const fi = typeof izq === 'function' ? izq : borde(izq), fd = typeof der === 'function' ? der : borde(der);
      for (let y = Math.ceil(y0 - .5); y <= Math.ceil(y1 - .5) - 1; y++) this.tramo(y, fi(y + .5), fd(y + .5), c);
      return this;
    }
    // miembro con tramos horizontales: claves [[y, centro, ancho], ...]
    columna(claves, c) {
      const ys = claves.map(k => k[0]), fc = curva(ys, claves.map(k => k[1])), fw = curva(ys, claves.map(k => k[2]));
      return this.perfil(ys[0], ys[ys.length - 1], y => fc(y) - fw(y) / 2, y => fc(y) + fw(y) / 2, c);
    }
    // miembro redondo en cualquier dirección: puntos [[x, y, diámetro], ...]
    tubo(p, c) {
      c = col(c);
      for (let i = 0; i < p.length - 1; i++) {
        const [ax, ay, ad] = p[i], [bx, by, bd] = p[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9, rm = Math.max(ad, bd) / 2;
        for (let y = Math.floor(Math.min(ay, by) - rm); y <= Math.ceil(Math.max(ay, by) + rm); y++)
          for (let x = Math.floor(Math.min(ax, bx) - rm); x <= Math.ceil(Math.max(ax, bx) + rm); x++) {
            const qx = x + .5 - ax, qy = y + .5 - ay, t = Math.max(0, Math.min(1, (qx * dx + qy * dy) / L2));
            const ex = qx - t * dx, ey = qy - t * dy, r = (ad + (bd - ad) * t) / 2;
            if (ex * ex + ey * ey <= r * r) this.px(x, y, c);
          }
      }
      return this;
    }
    // dibujo a mano: filas de texto, cada letra es un color de la paleta ('.' o ' ' = nada)
    dibujo(x, y, filas, paleta, espejo) {
      filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) { const k = f[i]; if (k !== '.' && k !== ' ' && paleta[k] !== undefined) this.px(x + (espejo ? f.length - 1 - i : i), y + j, paleta[k]); } });
      return this;
    }
    cada(fn) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.d[y * this.w + x]; if (c) { const n = fn(x, y, c); if (n !== undefined) this.d[y * this.w + x] = n === null ? 0 : col(n); } } return this; }
    // contorno por fuera (pixeles vacíos pegados a pixeles llenos); solo: lista de colores a contornear
    contorno(c, o = {}) {
      c = col(c); const src = this.d.slice(), w = this.w, h = this.h, at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? src[y * w + x] : 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (src[y * w + x]) continue;
        if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1) || (o.diag && (at(x - 1, y - 1) || at(x + 1, y - 1) || at(x - 1, y + 1) || at(x + 1, y + 1)))) this.d[y * w + x] = c;
      }
      return this;
    }
    // contorno por dentro: los pixeles del borde cambian de color
    filo(c, o = {}) {
      c = col(c); const src = this.d.slice(), w = this.w, h = this.h, at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h) ? src[y * w + x] : 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!src[y * w + x]) continue;
        if (!at(x - 1, y) || !at(x + 1, y) || (!o.soloLados && (!at(x, y - 1) || !at(x, y + 1)))) this.d[y * w + x] = c;
      }
      return this;
    }
    // sombra o luz de borde: los pixeles de color `de` que tienen vacío a menos de n pasos en la dirección (dx,dy) pasan a `a`
    sombrear(dx, dy, n, de, a) {
      de = col(de); a = col(a); const src = this.d.slice(), w = this.w, h = this.h;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (src[y * w + x] !== de) continue;
        for (let k = 1; k <= n; k++) { const X = x + dx * k, Y = y + dy * k; if (X < 0 || Y < 0 || X >= w || Y >= h || !src[Y * w + X]) { this.d[y * w + x] = a; break; } }
      }
      return this;
    }
    cambiar(de, a) { de = col(de); a = col(a); for (let i = 0; i < this.d.length; i++) if (this.d[i] === de) this.d[i] = a; return this; }
    // pinta c solo donde ya hay pixeles (para estampados y sombras encima de una forma)
    encima(fn) { const t = new Capa(this.w, this.h); fn(t); for (let i = 0; i < this.d.length; i++) if (t.d[i] && this.d[i]) this.d[i] = t.d[i]; return this; }
    recortar(m) { for (let i = 0; i < this.d.length; i++) if (!m.d[i]) this.d[i] = 0; return this; }
    quitar(m) { for (let i = 0; i < this.d.length; i++) if (m.d[i]) this.d[i] = 0; return this; }
    sobre(src, ox = 0, oy = 0) {
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const c = src.d[y * src.w + x]; if (c) this.px(x + ox, y + oy, c); }
      return this;
    }
    // como sobre(), y además oscurece n filas de lo que queda justo debajo (sombra que proyecta la capa)
    sobreConSombra(src, n = 1, f = .2) {
      const marcas = [];
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) if (src.d[y * src.w + x]) for (let k = 1; k <= n; k++) if (!src.get(x, y + k) && this.get(x, y + k)) marcas.push((y + k) * this.w + x);
      for (const i of new Set(marcas)) this.d[i] = mix(this.d[i], '#6a4a7a', f);
      return this.sobre(src);
    }
    espejo() { const c = new Capa(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) c.d[y * this.w + (this.w - 1 - x)] = this.d[y * this.w + x]; return c; }
    recorte(x, y, w, h) { const c = new Capa(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) c.d[j * w + i] = this.get(x + i, y + j); return c; }
    colores() { const s = new Set(); for (const c of this.d) if (c) s.add(c); return s.size; }
    // bytes RGBA (para canvas o PNG)
    rgba() { const o = new Uint8ClampedArray(this.w * this.h * 4); for (let i = 0; i < this.d.length; i++) { const c = this.d[i]; if (c) { o[i * 4] = R(c); o[i * 4 + 1] = G(c); o[i * 4 + 2] = B(c); o[i * 4 + 3] = 255; } } return o; }
    // peso real del dibujo: bytes de la cuadrícula comprimida por repeticiones (lo que ocuparía guardada)
    alCanvas(cv) { cv.width = this.w; cv.height = this.h; const ctx = cv.getContext('2d'); ctx.putImageData(new ImageData(this.rgba(), this.w, this.h), 0, 0); return cv; }
  }

  Object.assign(BB, { Capa, col, mix, mult, osc, acl, lum, hex, rampa, curva, borde, trama, TINTA });
})(typeof globalThis !== 'undefined' ? globalThis : this);
