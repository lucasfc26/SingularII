/* ------------------------------------------------------------------
   Stellar lifecycle renderer (Canvas 2D).

   Everything drawn is a pure function of (progress, time), so the user
   can scrub forward and backward with the scroll and the scene stays
   consistent. GSAP ScrollTrigger feeds `setTarget(progress)`; the
   renderer eases toward it for cinematic inertia.

   p: 0.00 main sequence star (rising into view)
      0.12 luminosity pulses
      0.22 core grows
      0.30 envelope expands → supergiant with plasma, cells, prominences
      0.60 core collapse (envelope falls in, core turns blue-white)
      0.71 implosion → flash + shockwave + debris
      0.80 remnant: black hole w/ accretion disk + lensing (dark)
                    white dwarf + planetary nebula (light)
------------------------------------------------------------------- */

type RGB = [number, number, number];
export type StellarTheme = 'dark' | 'light';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;
const TAU = Math.PI * 2;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Palette {
  bg: RGB;
  star: RGB;
  starAlpha: number;
  ms: { core: RGB; mid: RGB; limb: RGB; glow: RGB };
  giant: { core: RGB; mid: RGB; limb: RGB; glow: RGB };
  collapse: RGB;
  nebula: RGB[];
  additive: boolean;
}

const PALETTES: Record<StellarTheme, Palette> = {
  dark: {
    bg: [5, 6, 10],
    star: [235, 240, 255],
    starAlpha: 0.9,
    ms: { core: [255, 253, 240], mid: [255, 230, 160], limb: [255, 168, 72], glow: [255, 196, 120] },
    giant: { core: [255, 236, 200], mid: [255, 138, 62], limb: [196, 46, 24], glow: [255, 96, 44] },
    collapse: [190, 220, 255],
    nebula: [[108, 140, 255], [167, 139, 250], [83, 221, 245], [255, 120, 80]],
    additive: true,
  },
  light: {
    bg: [245, 247, 252],
    star: [52, 72, 140],
    starAlpha: 0.38,
    ms: { core: [255, 255, 250], mid: [255, 224, 150], limb: [242, 150, 66], glow: [255, 176, 92] },
    giant: { core: [255, 242, 220], mid: [250, 150, 90], limb: [214, 86, 58], glow: [242, 120, 80] },
    collapse: [120, 150, 255],
    nebula: [[52, 88, 197], [121, 87, 189], [21, 155, 183], [240, 150, 110]],
    additive: false,
  },
};

interface Star { x: number; y: number; z: number; r: number; tw: number }
interface Particle { a: number; s: number; ph: number; size: number; hue: number }
interface Cell { lon: number; lat: number; size: number; dark: boolean }
interface Prominence { a: number; w: number; h: number; ph: number }

export interface StellarOptions {
  quality: 'high' | 'low';
  reducedMotion: boolean;
}

export class StellarRenderer {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private target = 0;
  private p = 0;
  private t = 0;
  private intro = 0;
  private last = 0;
  private raf = 0;
  private active = true;
  private theme: StellarTheme = 'dark';
  private stars: Star[] = [];
  private wind: Particle[] = [];
  private debris: Particle[] = [];
  private cells: Cell[] = [];
  private prominences: Prominence[] = [];
  private nebula?: HTMLCanvasElement;
  private ro: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, private opts: StellarOptions) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.seed();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    if (opts.reducedMotion) this.intro = 1;
  }

  /* ---------- public API ---------- */
  setTarget(p: number) {
    this.target = clamp(p);
    if (this.opts.reducedMotion) this.p = this.target;
    if (!this.raf) this.frame(performance.now());
  }
  setTheme(theme: StellarTheme) {
    this.theme = theme;
    this.buildNebula();
    this.draw();
  }
  setActive(active: boolean) {
    this.active = active;
    if (active && !this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
  }
  start() {
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
  }

  /* ---------- setup ---------- */
  private seed() {
    const rnd = mulberry32(1987);
    const hi = this.opts.quality === 'high';
    this.stars = Array.from({ length: hi ? 420 : 170 }, () => ({
      x: rnd(), y: rnd(), z: 0.15 + rnd() * 0.85, r: rnd() ** 3 * 1.6 + 0.35, tw: rnd() * TAU,
    }));
    this.wind = Array.from({ length: hi ? 160 : 60 }, () => ({ a: rnd() * TAU, s: 0.08 + rnd() * 0.22, ph: rnd(), size: 0.6 + rnd() * 1.8, hue: rnd() }));
    this.debris = Array.from({ length: hi ? 520 : 200 }, () => ({ a: rnd() * TAU, s: 0.25 + rnd() ** 0.6 * 0.75, ph: rnd(), size: 0.5 + rnd() * 2.2, hue: rnd() }));
    this.cells = Array.from({ length: hi ? 70 : 30 }, () => ({ lon: rnd() * TAU, lat: (rnd() - 0.5) * Math.PI * 0.95, size: 0.12 + rnd() * 0.22, dark: rnd() > 0.55 }));
    this.prominences = Array.from({ length: 6 }, (_, i) => ({ a: (i / 6) * TAU + rnd() * 0.6, w: 0.08 + rnd() * 0.12, h: 0.18 + rnd() * 0.32, ph: rnd() * TAU }));
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const maxDpr = this.opts.quality === 'high' ? 1.75 : 1.25;
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.buildNebula();
    this.draw();
  }

  private buildNebula() {
    const c = document.createElement('canvas');
    const s = 0.5;
    c.width = Math.max(1, Math.round(this.w * s));
    c.height = Math.max(1, Math.round(this.h * 1.4 * s));
    const g = c.getContext('2d')!;
    const pal = PALETTES[this.theme];
    const rnd = mulberry32(42);
    const blobs = 9;
    for (let i = 0; i < blobs; i++) {
      const x = rnd() * c.width;
      const y = rnd() * c.height;
      const r = (0.25 + rnd() * 0.45) * Math.max(c.width, c.height);
      const col = pal.nebula[i % pal.nebula.length]!;
      const a = (this.theme === 'dark' ? 0.07 : 0.06) * (0.5 + rnd());
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, rgba(col, a));
      grd.addColorStop(0.5, rgba(col, a * 0.4));
      grd.addColorStop(1, rgba(col, 0));
      g.fillStyle = grd;
      g.fillRect(0, 0, c.width, c.height);
    }
    this.nebula = c;
  }

  /* ---------- loop ---------- */
  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.opts.reducedMotion) {
      this.t += dt;
      this.intro = Math.min(1, this.intro + dt / 1.6);
      this.p += (this.target - this.p) * (1 - Math.exp(-dt * 7));
    }
    this.draw();
    this.raf = this.active ? requestAnimationFrame(this.loop) : 0;
  };

  private frame(now: number) {
    this.last = now;
    this.draw();
  }

  /* ---------- drawing ---------- */
  private draw() {
    const { ctx, w, h, dpr } = this;
    if (!w || !h) return;
    const pal = PALETTES[this.theme];
    const p = this.p;
    const t = this.t;
    const minDim = Math.min(w, h);
    const mobile = w < 768;
    const base = minDim * (mobile ? 0.1 : 0.085);

    // stage parameters
    const rise = smooth(0, 0.12, p);
    const pulse = smooth(0.1, 0.24, p) * (1 - smooth(0.56, 0.62, p));
    const coreGrow = smooth(0.2, 0.42, p);
    const expand = smooth(0.28, 0.56, p);
    const collapse = smooth(0.6, 0.71, p);
    const flash = smooth(0.69, 0.725, p) * (1 - smooth(0.735, 0.84, p));
    const shock = smooth(0.705, 0.93, p);
    const remnant = smooth(0.78, 0.95, p);
    const starAlpha = (1 - smooth(0.705, 0.735, p)) * this.intro;
    const osc = 0.5 + 0.5 * Math.sin(t * 3.1) * Math.sin(t * 1.3 + 0.7);
    const lum = 1 + pulse * 0.7 * osc + coreGrow * 0.15;

    const cx = w / 2;
    const cy = lerp(h * (mobile ? 0.8 : 0.8), h * 0.5, rise);

    let R = base * (0.78 + 0.22 * rise) * (1 + 2.9 * expand);
    R *= 1 - 0.985 * Math.pow(collapse, 1.3);
    R *= 1 + pulse * 0.05 * osc;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(pal.bg, 1);
    ctx.fillRect(0, 0, w, h);

    // nebula with parallax
    if (this.nebula) {
      ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 0.2);
      ctx.drawImage(this.nebula, 0, -p * h * 0.35, w, h * 1.4);
      ctx.globalAlpha = 1;
    }

    const bhR = base * 1.05 * (0.45 + 0.55 * remnant);
    this.drawStarfield(pal, p, t, cx, cy, this.theme === 'dark' ? remnant * bhR : 0);

    if (starAlpha > 0.001) this.drawStar(pal, { cx, cy, R, base, expand, coreGrow, collapse, pulse, lum, starAlpha, osc });
    if (flash > 0 || (shock > 0 && (shock < 1 || !pal.additive))) this.drawExplosion(pal, { cx, cy, base, flash, shock, remnant });
    if (remnant > 0.001) {
      if (this.theme === 'dark') this.drawBlackHole({ cx, cy, rs: bhR, k: remnant });
      else this.drawWhiteDwarf({ cx, cy, base, k: remnant });
    }

    // vignette blends canvas edges into the page
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(w / 2, h / 2, minDim * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.62);
    v.addColorStop(0, rgba(pal.bg, 0));
    v.addColorStop(1, rgba(pal.bg, this.theme === 'dark' ? 0.75 : 0.6));
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  private drawStarfield(pal: Palette, p: number, t: number, cx: number, cy: number, lensR: number) {
    const { ctx, w, h } = this;
    const E2 = (lensR * 2.1) ** 2;
    ctx.fillStyle = rgba(pal.star, 1);
    for (const s of this.stars) {
      let x = s.x * w;
      let y = (((s.y - p * 0.22 * s.z) % 1) + 1) % 1 * h;
      let stretch = 1;
      let ang = 0;
      if (lensR > 0) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.hypot(dx, dy) || 1;
        if (r < lensR * 1.02) continue;
        const r2 = r + E2 / r;
        x = cx + (dx / r) * r2;
        y = cy + (dy / r) * r2;
        stretch = Math.min(5, 1 + (E2 / (r * r)) * 1.6);
        ang = Math.atan2(dy, dx) + Math.PI / 2;
      }
      const tw = this.opts.reducedMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * (0.6 + s.z) + s.tw);
      ctx.globalAlpha = pal.starAlpha * s.z * tw;
      if (stretch > 1.05) {
        ctx.beginPath();
        ctx.ellipse(x, y, s.r * stretch, s.r * 0.8, ang, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, s.r, s.r);
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawStar(
    pal: Palette,
    s: { cx: number; cy: number; R: number; base: number; expand: number; coreGrow: number; collapse: number; pulse: number; lum: number; starAlpha: number; osc: number },
  ) {
    const { ctx } = this;
    const { cx, cy, R, base, expand, coreGrow, collapse, lum, starAlpha } = s;
    const t = this.t;
    const add = pal.additive;
    const col = {
      core: mix(pal.ms.core, pal.giant.core, expand),
      mid: mix(pal.ms.mid, pal.giant.mid, expand),
      limb: mix(pal.ms.limb, pal.giant.limb, expand),
      glow: mix(mix(pal.ms.glow, pal.giant.glow, expand), pal.collapse, collapse),
    };

    // outer glow
    ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    const glowR = R * (3 + 0.9 * s.pulse * s.osc) + base * (1.2 + 1.4 * expand) + base * 2 * collapse;
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, glowR);
    const ga = (add ? 0.5 : 0.42) * lum * starAlpha;
    g.addColorStop(0, rgba(col.glow, ga));
    g.addColorStop(0.3, rgba(col.glow, ga * 0.35));
    g.addColorStop(1, rgba(col.glow, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, TAU);
    ctx.fill();

    // JWST-like hexagonal diffraction spikes while the star is compact
    const spike = (1 - smooth(0, 0.3, expand)) * starAlpha;
    if (spike > 0.02) {
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        const isH = i >= 6;
        const a = isH ? (i === 6 ? 0 : Math.PI) : (i * Math.PI) / 3 + Math.PI / 6;
        const len = Math.min(R * (isH ? 3.2 : 6.2), base * (isH ? 3 : 5.5)) * (0.85 + 0.25 * lum);
        ctx.rotate(0);
        const lg = ctx.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
        lg.addColorStop(0, rgba(col.core, (add ? 0.65 : 0.5) * spike));
        lg.addColorStop(1, rgba(col.glow, 0));
        ctx.strokeStyle = lg;
        ctx.lineWidth = Math.max(1, R * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();
    }

    // turbulent plasma limb
    const amp = 0.012 + 0.06 * expand;
    ctx.beginPath();
    const steps = this.opts.quality === 'high' ? 120 : 64;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * TAU;
      const n = Math.sin(a * 5 + t * 0.7) * 0.5 + Math.sin(a * 11 - t * 1.3) * 0.3 + Math.sin(a * 23 + t * 2.1) * 0.2;
      const r = R * (1.04 + amp * n + amp * 0.6);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    const lg = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * (1.1 + amp * 2));
    lg.addColorStop(0, rgba(col.limb, 0.9 * starAlpha));
    lg.addColorStop(1, rgba(col.limb, 0));
    ctx.fillStyle = lg;
    ctx.fill();

    // body with limb darkening
    ctx.globalCompositeOperation = 'source-over';
    const bg = ctx.createRadialGradient(cx - R * 0.18, cy - R * 0.2, R * 0.05, cx, cy, R);
    bg.addColorStop(0, rgba(col.core, starAlpha));
    bg.addColorStop(0.55, rgba(col.mid, starAlpha));
    bg.addColorStop(0.92, rgba(col.limb, starAlpha));
    bg.addColorStop(1, rgba(mix(col.limb, [80, 20, 10], 0.35), starAlpha * 0.9));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.fill();

    // convection cells (granulation → giant supergranules)
    const cellsA = smooth(0.12, 0.5, expand) * starAlpha * (1 - collapse);
    if (cellsA > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();
      for (const c of this.cells) {
        const lon = c.lon + t * 0.04;
        const cosLon = Math.cos(lon);
        if (cosLon < 0) continue;
        const x = cx + Math.sin(lon) * Math.cos(c.lat) * R * 0.95;
        const y = cy + Math.sin(c.lat) * R * 0.95;
        const rr = c.size * R * (0.6 + 0.6 * expand) * (0.4 + 0.6 * cosLon);
        const cg = ctx.createRadialGradient(x, y, 0, x, y, rr);
        if (c.dark) {
          ctx.globalCompositeOperation = 'source-over';
          cg.addColorStop(0, rgba([90, 20, 10], 0.32 * cellsA));
          cg.addColorStop(1, rgba([90, 20, 10], 0));
        } else {
          ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
          cg.addColorStop(0, rgba(col.core, 0.3 * cellsA));
          cg.addColorStop(1, rgba(col.core, 0));
        }
        ctx.fillStyle = cg;
        ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
      ctx.restore();
    }

    // prominences
    const promA = smooth(0.2, 0.7, expand) * starAlpha * (1 - collapse);
    if (promA > 0.01) {
      ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
      ctx.lineCap = 'round';
      for (const pr of this.prominences) {
        const a = pr.a + t * 0.02;
        const a0 = a - pr.w;
        const a1 = a + pr.w;
        const hgt = R * (1 + pr.h * (0.8 + 0.3 * Math.sin(t * 0.8 + pr.ph)));
        const x0 = cx + Math.cos(a0) * R;
        const y0 = cy + Math.sin(a0) * R;
        const x1 = cx + Math.cos(a1) * R;
        const y1 = cy + Math.sin(a1) * R;
        const qx = cx + Math.cos(a) * hgt * 1.25;
        const qy = cy + Math.sin(a) * hgt * 1.25;
        for (const [lw, al] of [[R * 0.06, 0.12], [R * 0.018, 0.55]] as const) {
          ctx.strokeStyle = rgba(col.glow, al * promA);
          ctx.lineWidth = Math.max(1, lw);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(qx, qy, x1, y1);
          ctx.stroke();
        }
      }
    }

    // core
    ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    const coreR = base * (0.3 + 0.55 * coreGrow) * (1 - 0.85 * collapse) + base * 0.06;
    const coreCol = mix(col.core, pal.collapse, collapse);
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * (1 + collapse * 2));
    const ca = (0.35 + 0.35 * coreGrow + 0.6 * collapse) * starAlpha * lum;
    cg.addColorStop(0, rgba([255, 255, 255], ca));
    cg.addColorStop(0.35, rgba(coreCol, ca * 0.7));
    cg.addColorStop(1, rgba(coreCol, 0));
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * (1 + collapse * 2), 0, TAU);
    ctx.fill();

    // stellar wind
    const windA = (0.2 + 0.8 * expand) * starAlpha * (1 - collapse);
    if (windA > 0.02) {
      for (const pt of this.wind) {
        const life = (t * pt.s + pt.ph) % 1;
        const r = R * (1.03 + life * (1.2 + expand * 0.8));
        const x = cx + Math.cos(pt.a + life * 0.15) * r;
        const y = cy + Math.sin(pt.a + life * 0.15) * r;
        ctx.fillStyle = rgba(mix(col.glow, col.core, pt.hue * 0.5), (1 - life) * 0.75 * windA);
        ctx.fillRect(x, y, pt.size, pt.size);
      }
    }

    // infalling shells during collapse
    if (collapse > 0 && collapse < 1) {
      ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
      for (let i = 0; i < 4; i++) {
        const k = (collapse * 1.4 + i * 0.22) % 1;
        const rr = base * 3.6 * (1 - k) + R;
        ctx.strokeStyle = rgba(mix(col.glow, pal.collapse, k), Math.sin(k * Math.PI) * 0.35 * Math.sin(collapse * Math.PI));
        ctx.lineWidth = 1 + 6 * (1 - k);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawExplosion(pal: Palette, s: { cx: number; cy: number; base: number; flash: number; shock: number; remnant: number }) {
    const { ctx, w, h } = this;
    const { cx, cy, base, flash, shock, remnant } = s;
    const add = pal.additive;
    const maxR = Math.hypot(w, h) * 0.62;

    if (flash > 0.001) {
      ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
      const fr = maxR * (0.25 + flash * 0.9);
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
      const c1: RGB = add ? [255, 255, 255] : [255, 196, 120];
      const c2: RGB = add ? [170, 205, 255] : [121, 87, 189];
      fg.addColorStop(0, rgba(c1, flash * (add ? 1 : 0.85)));
      fg.addColorStop(0.25, rgba(c2, flash * 0.55));
      fg.addColorStop(1, rgba(c2, 0));
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, w, h);
    }

    if (shock > 0) {
      const fade = 1 - shock;
      const sr = Math.pow(shock, 0.65) * maxR;
      const lw = 4 + 40 * fade;
      ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
      const rg = ctx.createRadialGradient(cx, cy, Math.max(0, sr - lw), cx, cy, sr + lw);
      const ring: RGB = add ? [120, 200, 255] : [52, 88, 197];
      rg.addColorStop(0, rgba(ring, 0));
      rg.addColorStop(0.5, rgba(add ? [210, 235, 255] : [121, 87, 189], 0.55 * fade));
      rg.addColorStop(1, rgba(ring, 0));
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, cy, sr + lw, 0, TAU);
      ctx.fill();

      // debris streaks
      const shellR = base * 2.8;
      const darkCols: RGB[] = [[255, 190, 120], [255, 120, 70], [160, 200, 255], [200, 160, 255]];
      const lightCols: RGB[] = [[21, 155, 183], [121, 87, 189], [230, 120, 90], [52, 88, 197]];
      const cols = add ? darkCols : lightCols;
      ctx.lineCap = 'round';
      for (const d of this.debris) {
        let dist = Math.pow(shock, 0.55) * d.s * maxR * 0.9;
        let alpha = Math.min(1, fade * 1.6) * (0.4 + 0.6 * d.s);
        if (!add) {
          // light theme: ejected layers settle into a planetary nebula shell
          dist = lerp(dist, shellR * (0.75 + 0.5 * d.ph), remnant);
          alpha = lerp(alpha, 0.35 * (0.4 + d.s), remnant);
        }
        const len = 2 + 18 * fade * d.s;
        const ca = Math.cos(d.a);
        const sa = Math.sin(d.a);
        ctx.strokeStyle = rgba(cols[(d.hue * cols.length) | 0]!, alpha);
        ctx.lineWidth = d.size;
        ctx.beginPath();
        ctx.moveTo(cx + ca * Math.max(0, dist - len), cy + sa * Math.max(0, dist - len));
        ctx.lineTo(cx + ca * dist, cy + sa * dist);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private diskColor(f: number): RGB {
    // f: 0 inner (white-hot) → 1 outer (deep red)
    if (f < 0.35) return mix([255, 248, 232], [255, 196, 120], f / 0.35);
    return mix([255, 196, 120], [190, 52, 28], (f - 0.35) / 0.65);
  }

  private drawDiskBand(cx: number, cy: number, inner: number, outer: number, yScale: number, a0: number, a1: number, k: number, gain: number) {
    const { ctx } = this;
    const hi = this.opts.quality === 'high';
    const rings = hi ? 26 : 14;
    const segs = hi ? 40 : 22;
    const t = this.t;
    const da = (a1 - a0) / segs;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, yScale);
    ctx.lineWidth = ((outer - inner) / rings) * 1.5;
    for (let i = 0; i < rings; i++) {
      const f = i / (rings - 1);
      const r = lerp(inner, outer, f);
      const col = this.diskColor(f);
      const baseA = Math.pow(1 - f, 1.3) * gain * k;
      const omega = 2.4 * Math.pow(inner / r, 1.5);
      for (let j = 0; j < segs; j++) {
        const a = a0 + (j + 0.5) * da;
        const doppler = 0.42 + 0.58 * (0.5 + 0.5 * Math.cos(a));
        const streak = 0.55 + 0.45 * Math.sin(a * 3 + f * 19 - t * omega) * Math.sin(a * 7 - f * 9 + t * omega * 0.6);
        ctx.strokeStyle = rgba(col, baseA * doppler * streak);
        ctx.beginPath();
        ctx.arc(0, 0, r, a - da * 0.55, a + da * 0.55);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawBlackHole(s: { cx: number; cy: number; rs: number; k: number }) {
    const { ctx } = this;
    const { cx, cy, rs, k } = s;
    const tilt = 0.2;

    // ambient glow
    ctx.globalCompositeOperation = 'lighter';
    const ag = ctx.createRadialGradient(cx, cy, rs, cx, cy, rs * 7);
    ag.addColorStop(0, `rgba(255,150,70,${0.22 * k})`);
    ag.addColorStop(0.4, `rgba(167,110,250,${0.06 * k})`);
    ag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(cx, cy, rs * 7, 0, TAU);
    ctx.fill();

    // relativistic jets
    for (const dir of [-1, 1]) {
      const jg = ctx.createLinearGradient(cx, cy, cx, cy + dir * rs * 6);
      jg.addColorStop(0, `rgba(140,200,255,${0.1 * k})`);
      jg.addColorStop(1, 'rgba(140,200,255,0)');
      ctx.fillStyle = jg;
      ctx.beginPath();
      ctx.moveTo(cx - rs * 0.12, cy);
      ctx.lineTo(cx - rs * 0.3, cy + dir * rs * 6);
      ctx.lineTo(cx + rs * 0.3, cy + dir * rs * 6);
      ctx.lineTo(cx + rs * 0.12, cy);
      ctx.fill();
    }

    // back half of the disk (behind the hole)
    this.drawDiskBand(cx, cy, rs * 1.6, rs * 4.8, tilt, Math.PI, TAU, k, 0.85);
    // lensed image of the far side, arching over (and under) the shadow
    this.drawDiskBand(cx, cy, rs * 1.08, rs * 1.75, 1, Math.PI, TAU, k, 0.95);
    this.drawDiskBand(cx, cy, rs * 1.06, rs * 1.4, 1, 0, Math.PI, k, 0.35);

    // shadow
    ctx.globalCompositeOperation = 'source-over';
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rs);
    sg.addColorStop(0, `rgba(0,0,0,${k})`);
    sg.addColorStop(0.92, `rgba(2,2,5,${k})`);
    sg.addColorStop(1, `rgba(10,6,4,${k})`);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, rs, 0, TAU);
    ctx.fill();

    // photon ring
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,170,90,${0.25 * k})`;
    ctx.lineWidth = Math.max(2, rs * 0.12);
    ctx.beginPath();
    ctx.arc(cx, cy, rs * 1.04, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,240,215,${0.9 * k})`;
    ctx.lineWidth = Math.max(1, rs * 0.025);
    ctx.beginPath();
    ctx.arc(cx, cy, rs * 1.02, 0, TAU);
    ctx.stroke();

    // front half of the disk (in front of the shadow)
    this.drawDiskBand(cx, cy, rs * 1.6, rs * 4.8, tilt, 0, Math.PI, k, 1);
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawWhiteDwarf(s: { cx: number; cy: number; base: number; k: number }) {
    const { ctx } = this;
    const { cx, cy, base, k } = s;
    const t = this.t;
    const r = base * 0.42 * (0.6 + 0.4 * k);

    // planetary nebula shell
    const shellR = base * 2.9;
    const ng = ctx.createRadialGradient(cx, cy, shellR * 0.35, cx, cy, shellR * 1.35);
    ng.addColorStop(0, 'rgba(21,155,183,0)');
    ng.addColorStop(0.45, `rgba(21,155,183,${0.16 * k})`);
    ng.addColorStop(0.7, `rgba(121,87,189,${0.14 * k})`);
    ng.addColorStop(0.85, `rgba(230,120,110,${0.1 * k})`);
    ng.addColorStop(1, 'rgba(230,120,110,0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(cx, cy, shellR * 1.35, 0, TAU);
    ctx.fill();

    // luminous halo
    const hg = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 6);
    hg.addColorStop(0, `rgba(120,150,255,${0.5 * k})`);
    hg.addColorStop(0.35, `rgba(150,175,255,${0.18 * k})`);
    hg.addColorStop(1, 'rgba(150,175,255,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 6, 0, TAU);
    ctx.fill();

    // rotating faint rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.05);
    ctx.strokeStyle = `rgba(52,88,197,${0.25 * k})`;
    ctx.lineWidth = 1;
    for (const m of [1.9, 2.6]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * m * 1.2, r * m * 0.45, 0.4, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    // sphere: dark core, luminous edge
    const bg = ctx.createRadialGradient(cx - r * 0.15, cy - r * 0.15, 0, cx, cy, r);
    bg.addColorStop(0, `rgba(17,24,52,${k})`);
    bg.addColorStop(0.55, `rgba(52,78,160,${k})`);
    bg.addColorStop(0.88, `rgba(200,215,255,${k})`);
    bg.addColorStop(1, `rgba(255,255,255,${k})`);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.95 * k})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // crisp spikes
    ctx.strokeStyle = `rgba(52,88,197,${0.45 * k})`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 1.4);
      ctx.lineTo(cx + Math.cos(a) * r * 4.2, cy + Math.sin(a) * r * 4.2);
      ctx.stroke();
    }
  }
}
