import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useStudioStore } from "@/lib/studio/store";
import type { VizMode } from "@/lib/studio/themes";

type Colors = { from: string; mid: string; to: string; glow: string };

function readColors(el: HTMLElement): Colors {
  const s = getComputedStyle(el);
  return {
    from: s.getPropertyValue("--viz-from").trim() || "#6b4e1e",
    mid: s.getPropertyValue("--viz-mid").trim() || "#d4af5a",
    to: s.getPropertyValue("--viz-to").trim() || "#f6e7c3",
    glow: s.getPropertyValue("--viz-glow").trim() || "#e8c56b",
  };
}

function energyOf(bins: Uint8Array): number {
  let sum = 0;
  const n = Math.min(bins.length, 64);
  for (let i = 0; i < n; i++) sum += bins[i] ?? 0;
  return sum / Math.max(n, 1);
}

type Props = {
  analyserRef: RefObject<AnalyserNode | null>;
  orbRef: RefObject<HTMLButtonElement | null>;
  shellRef: RefObject<HTMLElement | null>;
};

export function Visualizer({ analyserRef, orbRef, shellRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vizMode = useStudioStore((s) => s.vizMode);
  const status = useStudioStore((s) => s.status);
  const modeRef = useRef<VizMode>(vizMode);
  const liveRef = useRef(status === "live");

  modeRef.current = vizMode;
  liveRef.current = status === "live";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const smoothed = new Float32Array(256);
    const peaks = new Float32Array(256);
    const vel = new Float32Array(256);
    const bins = new Uint8Array(256);
    const fake = new Uint8Array(256);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const orb = orbRef.current;
      const shell = shellRef.current;
      if (!orb) return;

      const rect = orb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const baseR = rect.width / 2 + 10;
      const colors = shell ? readColors(shell) : readColors(document.documentElement);

      const analyser = analyserRef.current;
      const live = liveRef.current;
      bins.fill(0);
      if (live && analyser) {
        analyser.getByteFrequencyData(bins);
      }

      const silent = energyOf(bins) < 6;
      if (!live || silent) {
        for (let i = 0; i < fake.length; i++) {
          const wave =
            70 +
            50 * Math.sin(t * 0.0022 + i * 0.11) +
            28 * Math.sin(t * 0.0038 + i * 0.07);
          fake[i] = live ? wave : wave * 0.45;
        }
      }
      const data = !live || silent ? fake : bins;
      const amp = live && !silent ? 1 : live ? 0.55 : 0.22;

      const mode = modeRef.current;
      if (mode === "cline") {
        drawCline(ctx, w, h, cy, data, smoothed, colors, amp, t);
      } else if (mode === "particles") {
        drawParticles(ctx, cx, cy, baseR, data, smoothed, colors, amp, t);
      } else if (mode === "pulse") {
        drawPulse(ctx, cx, cy, baseR, data, colors, amp, t);
      } else {
        drawBars(ctx, cx, cy, baseR, data, smoothed, peaks, vel, colors, amp, t, mode === "nebula");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [analyserRef, orbRef, shellRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    />
  );
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  bins: Uint8Array,
  smoothed: Float32Array,
  peaks: Float32Array,
  vel: Float32Array,
  colors: Colors,
  amp: number,
  t: number,
  nebula: boolean,
) {
  const count = 96;
  const maxLen = Math.min(window.innerWidth, window.innerHeight) * 0.28;
  ctx.lineCap = "round";

  for (let i = 0; i < count; i++) {
    const dataIndex = Math.floor((i / count) * Math.min(bins.length, 90) * 0.85);
    const target = ((bins[dataIndex] ?? 0) / 255) * amp;
    const idle = 0.08 + 0.04 * Math.sin(t * 0.001 + i * 0.2);
    const next = Math.max(target, amp < 1 ? idle * amp : target);
    smoothed[i] += (next - smoothed[i]) * 0.22;
    const value = smoothed[i];

    if (value >= peaks[i]) {
      peaks[i] = value;
      vel[i] = 0;
    } else {
      vel[i] += 0.0024;
      peaks[i] = Math.max(0, peaks[i] - vel[i]);
    }

    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const len = value * maxLen;
    const x1 = cx + Math.cos(angle) * baseR;
    const y1 = cy + Math.sin(angle) * baseR;
    const x2 = cx + Math.cos(angle) * (baseR + len);
    const y2 = cy + Math.sin(angle) * (baseR + len);

    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, colors.from);
    g.addColorStop(0.55, colors.mid);
    g.addColorStop(1, colors.to);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = nebula ? 6 : 3.2;
    ctx.strokeStyle = nebula ? colors.mid : g;
    ctx.globalAlpha = nebula ? 0.28 : 0.95;
    if (nebula) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = colors.glow;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (!nebula && peaks[i] > 0.05) {
      const capR = baseR + peaks[i] * maxLen + 5;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * capR, cy + Math.sin(angle) * capR, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = colors.to;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function drawCline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cy: number,
  bins: Uint8Array,
  smoothed: Float32Array,
  colors: Colors,
  amp: number,
  t: number,
) {
  const n = Math.min(bins.length, 180);
  const renderW = w * 0.78;
  const startX = (w - renderW) / 2;
  const slice = renderW / n;
  ctx.lineWidth = 2.4;
  ctx.shadowBlur = 14;
  ctx.shadowColor = colors.glow;

  const grad = ctx.createLinearGradient(startX, 0, startX + renderW, 0);
  grad.addColorStop(0, "transparent");
  grad.addColorStop(0.2, colors.from);
  grad.addColorStop(0.5, colors.mid);
  grad.addColorStop(0.8, colors.from);
  grad.addColorStop(1, "transparent");
  ctx.strokeStyle = grad;

  const path = (sign: number) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const idle = 0.12 + 0.08 * Math.sin(t * 0.002 + i * 0.15);
      const target = Math.max((bins[i] ?? 0) / 255, amp < 1 ? idle : 0) * amp;
      smoothed[i] += (target - smoothed[i]) * 0.2;
      const v = smoothed[i] * Math.min(h * 0.22, 180);
      const x = startX + i * slice;
      const y = cy + sign * v;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  path(-1);
  path(1);
  ctx.shadowBlur = 0;
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  bins: Uint8Array,
  smoothed: Float32Array,
  colors: Colors,
  amp: number,
  t: number,
) {
  const count = 80;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * Math.min(bins.length, 100));
    const idle = 0.15 + 0.1 * Math.sin(t * 0.0015 + i);
    const target = Math.max((bins[idx] ?? 0) / 255, amp < 1 ? idle : 0) * amp;
    smoothed[i] += (target - smoothed[i]) * 0.16;
    const val = smoothed[i];
    if (val < 0.04) continue;
    const angle = (i / count) * Math.PI * 2 + t * 0.00028;
    const dist = baseR + val * Math.min(window.innerWidth, window.innerHeight) * 0.32;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, val * 5 + 1.2, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? colors.mid : colors.from;
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors.glow;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseR: number,
  bins: Uint8Array,
  colors: Colors,
  amp: number,
  t: number,
) {
  let sum = 0;
  const n = Math.min(28, bins.length);
  for (let i = 0; i < n; i++) sum += bins[i] ?? 0;
  const bass = (sum / Math.max(n, 1) / 255) * amp;
  const idle = 0.12 + 0.06 * Math.sin(t * 0.002);
  const energy = Math.max(bass, amp < 1 ? idle : bass);

  for (let ring = 0; ring < 3; ring++) {
    const r = baseR + energy * (70 + ring * 36) + ring * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2 + energy * 10 - ring;
    ctx.strokeStyle = colors.mid;
    ctx.globalAlpha = 0.45 - ring * 0.12;
    ctx.shadowBlur = 30 * energy;
    ctx.shadowColor = colors.glow;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}
