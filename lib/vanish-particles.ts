/**
 * Aceternity-inspired particle vanish engine, adapted for multi-line textareas.
 * Samples glyph pixels from a live source element and dissolves them on submit.
 */

export type VanishParticle = {
  x: number;
  y: number;
  r: number;
  color: string;
};

export type VanishSnapshot = {
  particles: VanishParticle[];
  /** Internal canvas buffer width (pre-scale). */
  bufferWidth: number;
  /** Internal canvas buffer height (pre-scale). */
  bufferHeight: number;
  /** CSS scale applied to canvas (Aceternity uses 0.5 after 2× draw). */
  displayScale: number;
  /** Matches the source textarea writing direction. */
  rtl: boolean;
};

const SUPER_SAMPLE = 2;
const DEFAULT_MAX_PARTICLES = 2200;

function parseCssRgb(color: string): [number, number, number, number] {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [255, 255, 255, 255];
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a === 0 ? 255 : a];
}

function mixRgb(
  a: [number, number, number, number],
  b: [number, number, number, number],
  t: number,
): [number, number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ];
}

/**
 * Rasterize the visible textarea content into particles, aligned to the
 * element's padding, font metrics, line height, and scroll position.
 */
export function buildVanishSnapshot(
  source: HTMLTextAreaElement,
  text: string,
  options?: {
    maxParticles?: number;
    accentColor?: string;
  },
): VanishSnapshot | null {
  const trimmed = text;
  if (!trimmed) return null;

  const styles = getComputedStyle(source);
  const fontSize = Number.parseFloat(styles.fontSize) || 12;
  const lineHeightRaw = styles.lineHeight;
  const lineHeight =
    lineHeightRaw === "normal"
      ? fontSize * 1.5
      : Number.parseFloat(lineHeightRaw) || fontSize * 1.5;

  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
  const rtl = styles.direction === "rtl";

  const displayWidth = source.clientWidth;
  const displayHeight = source.clientHeight;
  if (displayWidth <= 0 || displayHeight <= 0) return null;

  const bufferWidth = Math.max(1, Math.floor(displayWidth * SUPER_SAMPLE));
  const bufferHeight = Math.max(1, Math.floor(displayHeight * SUPER_SAMPLE));

  const canvas = document.createElement("canvas");
  canvas.width = bufferWidth;
  canvas.height = bufferHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, bufferWidth, bufferHeight);
  ctx.fillStyle = styles.color || "#ffffff";
  ctx.textBaseline = "top";
  ctx.textAlign = rtl ? "right" : "left";
  ctx.font = `${fontSize * SUPER_SAMPLE}px ${styles.fontFamily}`;

  const scrollTop = source.scrollTop;
  const allLines = trimmed.split("\n");
  const firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));
  const visibleLineCount =
    Math.ceil(displayHeight / lineHeight) + 2;
  const lastVisibleLine = Math.min(
    allLines.length - 1,
    firstVisibleLine + visibleLineCount,
  );

  const scale = SUPER_SAMPLE;
  const maxTextWidth =
    (displayWidth - paddingLeft - paddingRight) * scale;
  const textX = rtl
    ? (displayWidth - paddingRight) * scale
    : paddingLeft * scale;
  const clipX = rtl ? textX - maxTextWidth : textX;

  for (let i = firstVisibleLine; i <= lastVisibleLine; i++) {
    const line = allLines[i] ?? "";
    if (!line) continue;

    const y =
      (paddingTop + i * lineHeight - scrollTop) * scale;
    if (y + lineHeight * scale < 0 || y > bufferHeight) continue;

    // Soft clip long lines to the visible gutter (matches overflow-x-hidden).
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipX - 1, y - 1, maxTextWidth + 2, lineHeight * scale + 2);
    ctx.clip();
    ctx.fillText(line, textX, y);
    ctx.restore();
  }

  const imageData = ctx.getImageData(0, 0, bufferWidth, bufferHeight);
  const pixels = imageData.data;

  const fg = parseCssRgb(styles.color || "#ffffff");
  const accent = parseCssRgb(
    options?.accentColor ||
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() ||
      styles.color,
  );

  const candidates: VanishParticle[] = [];
  // Stride keeps density readable on dense mono code without melting the GPU.
  const stride = 2;
  for (let y = 0; y < bufferHeight; y += stride) {
    for (let x = 0; x < bufferWidth; x += stride) {
      const idx = (y * bufferWidth + x) * 4;
      if (pixels[idx + 3] < 24) continue;
      if (pixels[idx] === 0 && pixels[idx + 1] === 0 && pixels[idx + 2] === 0) {
        continue;
      }

      const tint = Math.random() > 0.88 ? 0.55 : Math.random() > 0.97 ? 1 : 0;
      const [r, g, b, a] = mixRgb(fg, accent, tint);
      candidates.push({
        x,
        y,
        r: stride * (0.85 + Math.random() * 0.35),
        color: `rgba(${r}, ${g}, ${b}, ${(a / 255) * (0.85 + Math.random() * 0.15)})`,
      });
    }
  }

  const maxParticles = options?.maxParticles ?? DEFAULT_MAX_PARTICLES;
  let particles = candidates;
  if (particles.length > maxParticles) {
    const step = Math.ceil(particles.length / maxParticles);
    particles = particles.filter((_, i) => i % step === 0).slice(0, maxParticles);
  }

  if (particles.length === 0) return null;

  return {
    particles,
    bufferWidth,
    bufferHeight,
    displayScale: 1 / SUPER_SAMPLE,
    rtl,
  };
}

export type VanishAnimationHandle = {
  cancel: () => void;
};

/**
 * Dissolves particles along the reading direction with a gentle upward “send” bias.
 * LTR: right→left · RTL: left→right.
 */
export function runVanishAnimation(
  canvas: HTMLCanvasElement,
  snapshot: VanishSnapshot,
  options?: {
    onComplete?: () => void;
    /** Called each frame with the current sweep position (buffer coords). */
    onSweep?: (pos: number, bufferWidth: number, rtl: boolean) => void;
  },
): VanishAnimationHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    options?.onComplete?.();
    return { cancel: () => undefined };
  }

  canvas.width = snapshot.bufferWidth;
  canvas.height = snapshot.bufferHeight;

  let particles = snapshot.particles.map((p) => ({ ...p }));
  let rafId = 0;
  let cancelled = false;
  const rtl = snapshot.rtl;

  const maxX = particles.reduce((m, p) => (p.x > m ? p.x : m), 0);
  const minX = particles.reduce(
    (m, p) => (p.x < m ? p.x : m),
    snapshot.bufferWidth,
  );

  const frame = (pos: number) => {
    if (cancelled) return;

    options?.onSweep?.(pos, snapshot.bufferWidth, rtl);

    const next: VanishParticle[] = [];
    for (let i = 0; i < particles.length; i++) {
      const current = particles[i];
      const stillSolid = rtl ? current.x > pos : current.x < pos;
      if (stillSolid) {
        next.push(current);
        continue;
      }
      if (current.r <= 0.05) continue;

      // Classic Aceternity scatter…
      current.x += Math.random() > 0.5 ? 1.15 : -1.15;
      current.y += Math.random() > 0.5 ? 1.05 : -1.05;
      // …plus a subtle upward lift so the dissolve reads as “sending”.
      current.y -= 0.35 + Math.random() * 0.55;
      current.r -= 0.045 * Math.random() + 0.012;
      next.push(current);
    }
    particles = next;

    ctx.clearRect(0, 0, snapshot.bufferWidth, snapshot.bufferHeight);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dissolving = rtl ? p.x <= pos : p.x >= pos;
      if (!dissolving) continue;
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.r, p.r);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    const continueSweep = rtl
      ? particles.length > 0 && pos < snapshot.bufferWidth + 48
      : particles.length > 0 && pos > -48;

    if (continueSweep) {
      rafId = requestAnimationFrame(() => frame(pos + (rtl ? 10 : -10)));
    } else {
      ctx.clearRect(0, 0, snapshot.bufferWidth, snapshot.bufferHeight);
      options?.onComplete?.();
    }
  };

  rafId = requestAnimationFrame(() => frame(rtl ? minX : maxX));

  return {
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, snapshot.bufferWidth, snapshot.bufferHeight);
    },
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
