import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, c as AudioLines, i as Sparkles, l as Aperture, n as Volume2, o as Pause, s as CircleDot, t as VolumeX, u as Activity } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-COaANARO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATIONS = [
	{
		id: "bahrain-fm",
		freq: "93.3",
		nameAr: "بحرين إف إم",
		nameEn: "Bahrain FM",
		url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-93-3_all/playlist.m3u8"
	},
	{
		id: "youth",
		freq: "98.4",
		nameAr: "الشبابية",
		nameEn: "Shababiyah",
		url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-98-4_all/playlist.m3u8"
	},
	{
		id: "quran",
		freq: "106.1",
		nameAr: "القرآن الكريم",
		nameEn: "Holy Quran",
		url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-106-1_all/playlist.m3u8"
	},
	{
		id: "traditional",
		freq: "95.0",
		nameAr: "الشعبية",
		nameEn: "Al Shaabiya",
		url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-95-0_all/playlist.m3u8"
	}
];
function stationById(id) {
	return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}
var useStudioStore = create()(persist((set) => ({
	stationId: STATIONS[0].id,
	theme: "gold",
	vizMode: "bars",
	volume: .86,
	muted: false,
	status: "idle",
	error: null,
	setStation: (stationId) => set({
		stationId,
		error: null
	}),
	setTheme: (theme) => set({ theme }),
	setVizMode: (vizMode) => set({ vizMode }),
	setVolume: (volume) => set({
		volume,
		muted: volume === 0
	}),
	toggleMuted: () => set((s) => ({ muted: !s.muted })),
	setStatus: (status, error = null) => set({
		status,
		error
	})
}), {
	name: "radiobh-virtual-studio",
	skipHydration: true,
	partialize: (s) => ({
		stationId: s.stationId,
		theme: s.theme,
		vizMode: s.vizMode,
		volume: s.volume,
		muted: s.muted
	})
}));
function readColors(el) {
	const s = getComputedStyle(el);
	return {
		from: s.getPropertyValue("--viz-from").trim() || "#6b4e1e",
		mid: s.getPropertyValue("--viz-mid").trim() || "#d4af5a",
		to: s.getPropertyValue("--viz-to").trim() || "#f6e7c3",
		glow: s.getPropertyValue("--viz-glow").trim() || "#e8c56b"
	};
}
function energyOf(bins) {
	let sum = 0;
	const n = Math.min(bins.length, 64);
	for (let i = 0; i < n; i++) sum += bins[i] ?? 0;
	return sum / Math.max(n, 1);
}
function Visualizer({ analyserRef, orbRef, shellRef }) {
	const canvasRef = (0, import_react.useRef)(null);
	const vizMode = useStudioStore((s) => s.vizMode);
	const status = useStudioStore((s) => s.status);
	const modeRef = (0, import_react.useRef)(vizMode);
	const liveRef = (0, import_react.useRef)(status === "live");
	modeRef.current = vizMode;
	liveRef.current = status === "live";
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf = 0;
		const smoothed = /* @__PURE__ */ new Float32Array(256);
		const peaks = /* @__PURE__ */ new Float32Array(256);
		const vel = /* @__PURE__ */ new Float32Array(256);
		const bins = /* @__PURE__ */ new Uint8Array(256);
		const fake = /* @__PURE__ */ new Uint8Array(256);
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
		const tick = (t) => {
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
			if (live && analyser) analyser.getByteFrequencyData(bins);
			const silent = energyOf(bins) < 6;
			if (!live || silent) for (let i = 0; i < fake.length; i++) {
				const wave = 70 + 50 * Math.sin(t * .0022 + i * .11) + 28 * Math.sin(t * .0038 + i * .07);
				fake[i] = live ? wave : wave * .45;
			}
			const data = !live || silent ? fake : bins;
			const amp = live && !silent ? 1 : live ? .55 : .22;
			const mode = modeRef.current;
			if (mode === "cline") drawCline(ctx, w, h, cy, data, smoothed, colors, amp, t);
			else if (mode === "particles") drawParticles(ctx, cx, cy, baseR, data, smoothed, colors, amp, t);
			else if (mode === "pulse") drawPulse(ctx, cx, cy, baseR, data, colors, amp, t);
			else drawBars(ctx, cx, cy, baseR, data, smoothed, peaks, vel, colors, amp, t, mode === "nebula");
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
		};
	}, [
		analyserRef,
		orbRef,
		shellRef
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "pointer-events-none absolute inset-0 z-10",
		"aria-hidden": true
	});
}
function drawBars(ctx, cx, cy, baseR, bins, smoothed, peaks, vel, colors, amp, t, nebula) {
	const count = 96;
	const maxLen = Math.min(window.innerWidth, window.innerHeight) * .28;
	ctx.lineCap = "round";
	for (let i = 0; i < count; i++) {
		const target = (bins[Math.floor(i / count * Math.min(bins.length, 90) * .85)] ?? 0) / 255 * amp;
		const idle = .08 + .04 * Math.sin(t * .001 + i * .2);
		const next = Math.max(target, amp < 1 ? idle * amp : target);
		smoothed[i] += (next - smoothed[i]) * .22;
		const value = smoothed[i];
		if (value >= peaks[i]) {
			peaks[i] = value;
			vel[i] = 0;
		} else {
			vel[i] += .0024;
			peaks[i] = Math.max(0, peaks[i] - vel[i]);
		}
		const angle = i / count * Math.PI * 2 - Math.PI / 2;
		const len = value * maxLen;
		const x1 = cx + Math.cos(angle) * baseR;
		const y1 = cy + Math.sin(angle) * baseR;
		const x2 = cx + Math.cos(angle) * (baseR + len);
		const y2 = cy + Math.sin(angle) * (baseR + len);
		const g = ctx.createLinearGradient(x1, y1, x2, y2);
		g.addColorStop(0, colors.from);
		g.addColorStop(.55, colors.mid);
		g.addColorStop(1, colors.to);
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineWidth = nebula ? 6 : 3.2;
		ctx.strokeStyle = nebula ? colors.mid : g;
		ctx.globalAlpha = nebula ? .28 : .95;
		if (nebula) {
			ctx.shadowBlur = 18;
			ctx.shadowColor = colors.glow;
		}
		ctx.stroke();
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
		if (!nebula && peaks[i] > .05) {
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
function drawCline(ctx, w, h, cy, bins, smoothed, colors, amp, t) {
	const n = Math.min(bins.length, 180);
	const renderW = w * .78;
	const startX = (w - renderW) / 2;
	const slice = renderW / n;
	ctx.lineWidth = 2.4;
	ctx.shadowBlur = 14;
	ctx.shadowColor = colors.glow;
	const grad = ctx.createLinearGradient(startX, 0, startX + renderW, 0);
	grad.addColorStop(0, "transparent");
	grad.addColorStop(.2, colors.from);
	grad.addColorStop(.5, colors.mid);
	grad.addColorStop(.8, colors.from);
	grad.addColorStop(1, "transparent");
	ctx.strokeStyle = grad;
	const path = (sign) => {
		ctx.beginPath();
		for (let i = 0; i < n; i++) {
			const idle = .12 + .08 * Math.sin(t * .002 + i * .15);
			const target = Math.max((bins[i] ?? 0) / 255, amp < 1 ? idle : 0) * amp;
			smoothed[i] += (target - smoothed[i]) * .2;
			const v = smoothed[i] * Math.min(h * .22, 180);
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
function drawParticles(ctx, cx, cy, baseR, bins, smoothed, colors, amp, t) {
	const count = 80;
	for (let i = 0; i < count; i++) {
		const idx = Math.floor(i / count * Math.min(bins.length, 100));
		const idle = .15 + .1 * Math.sin(t * .0015 + i);
		const target = Math.max((bins[idx] ?? 0) / 255, amp < 1 ? idle : 0) * amp;
		smoothed[i] += (target - smoothed[i]) * .16;
		const val = smoothed[i];
		if (val < .04) continue;
		const angle = i / count * Math.PI * 2 + t * 28e-5;
		const dist = baseR + val * Math.min(window.innerWidth, window.innerHeight) * .32;
		ctx.beginPath();
		ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, val * 5 + 1.2, 0, Math.PI * 2);
		ctx.fillStyle = i % 2 === 0 ? colors.mid : colors.from;
		ctx.shadowBlur = 12;
		ctx.shadowColor = colors.glow;
		ctx.fill();
	}
	ctx.shadowBlur = 0;
}
function drawPulse(ctx, cx, cy, baseR, bins, colors, amp, t) {
	let sum = 0;
	const n = Math.min(28, bins.length);
	for (let i = 0; i < n; i++) sum += bins[i] ?? 0;
	const bass = sum / Math.max(n, 1) / 255 * amp;
	const idle = .12 + .06 * Math.sin(t * .002);
	const energy = Math.max(bass, amp < 1 ? idle : bass);
	for (let ring = 0; ring < 3; ring++) {
		const r = baseR + energy * (70 + ring * 36) + ring * 10;
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.lineWidth = 2 + energy * 10 - ring;
		ctx.strokeStyle = colors.mid;
		ctx.globalAlpha = .45 - ring * .12;
		ctx.shadowBlur = 30 * energy;
		ctx.shadowColor = colors.glow;
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
	ctx.shadowBlur = 0;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var PowerOrb = (0, import_react.forwardRef)(function PowerOrb({ onToggle }, ref) {
	const status = useStudioStore((s) => s.status);
	const live = status === "live";
	const buffering = status === "buffering";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-20 flex flex-col items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "orb-ring relative flex items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "orb-notch",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref,
				type: "button",
				onClick: onToggle,
				"aria-label": live ? "إيقاف البث" : "تشغيل البث",
				className: cn("orb-core relative size-[86%] overflow-hidden rounded-full", "transition-transform duration-150 ease-out", "active:scale-[0.96] focus-visible:outline-none", "focus-visible:ring-2 focus-visible:ring-cream/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink", live && "is-live", buffering && "is-buffering"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/studio/logo.jpg",
						alt: "",
						className: "absolute inset-0 size-full scale-110 object-cover",
						draggable: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "orb-sheen",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("absolute inset-0 flex items-center justify-center", "bg-ink/45 transition-opacity duration-200", live ? "opacity-0" : "opacity-100"),
						children: buffering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orb-spinner" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
							className: "size-14 text-cream drop-shadow-md ltr:ml-1 rtl:mr-1 sm:size-16",
							fill: "currentColor",
							strokeWidth: 1.25
						})
					}),
					live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pointer-events-none absolute inset-x-0 bottom-3 flex justify-center sm:bottom-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
							className: "size-5 text-cream/80",
							fill: "currentColor",
							strokeWidth: 1
						})
					})
				]
			})]
		})
	});
});
var STUDIO_THEMES = [
	{
		id: "gold",
		labelAr: "الاستوديو الذهبي",
		labelEn: "Gold Studio",
		image: "/studio/gold-studio.jpg",
		position: "18% center"
	},
	{
		id: "neon",
		labelAr: "الاستوديو النيون",
		labelEn: "Neon Studio",
		image: "/studio/neon-studio.jpg",
		position: "center"
	},
	{
		id: "towers",
		labelAr: "الأبراج",
		labelEn: "Bahrain Towers",
		image: "/studio/towers.jpg",
		position: "center bottom"
	},
	{
		id: "crest",
		labelAr: "الشعار",
		labelEn: "Crest",
		image: "/studio/branded.jpg",
		position: "center"
	}
];
function themeById(id) {
	return STUDIO_THEMES.find((t) => t.id === id) ?? STUDIO_THEMES[0];
}
var VIZ_MODES = [
	{
		id: "bars",
		labelAr: "أشرطة",
		labelEn: "Bars"
	},
	{
		id: "cline",
		labelAr: "موجة",
		labelEn: "Wave"
	},
	{
		id: "particles",
		labelAr: "جزيئات",
		labelEn: "Particles"
	},
	{
		id: "pulse",
		labelAr: "نبض",
		labelEn: "Pulse"
	},
	{
		id: "nebula",
		labelAr: "سديم",
		labelEn: "Nebula"
	}
];
var timeFmt = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Asia/Bahrain",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hour12: false
});
var dateFmt = new Intl.DateTimeFormat("ar-BH", {
	timeZone: "Asia/Bahrain",
	weekday: "long",
	day: "numeric",
	month: "long"
});
function useBahrainClock() {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	return {
		time: timeFmt.format(now),
		date: dateFmt.format(now)
	};
}
var MODE_ICONS = {
	bars: AudioLines,
	cline: Activity,
	particles: Sparkles,
	pulse: CircleDot,
	nebula: Aperture
};
function StudioHeader() {
	const { time, date } = useBahrainClock();
	const live = useStudioStore((s) => s.status) === "live";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative z-30 flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/studio/logo.jpg",
				alt: "",
				className: "size-11 rounded-full shadow-[0_0_0_1px_rgba(255,244,228,0.18)] sm:size-12"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leading-tight",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl font-semibold tracking-wide text-cream sm:text-2xl",
					children: "إذاعة البحرين"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[0.65rem] font-medium uppercase tracking-[0.22em] text-cream/55 sm:text-xs",
					children: "Radio Bahrain · Virtual Studio"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-end gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.18em]", live ? "bg-rb-red text-cream shadow-[0_0_18px_color-mix(in_oklab,var(--color-rb-red)_55%,transparent)]" : "bg-cream/8 text-cream/55"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full bg-cream", live && "animate-onair") }), live ? "ON AIR" : "STANDBY"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					suppressHydrationWarning: true,
					className: "font-display text-lg tabular-nums leading-none text-cream/90 sm:text-xl",
					children: time
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					suppressHydrationWarning: true,
					className: "text-[0.7rem] text-cream/50",
					children: [date, " · AST"]
				})
			]
		})]
	});
}
function ModeArc() {
	const vizMode = useStudioStore((s) => s.vizMode);
	const setVizMode = useStudioStore((s) => s.setVizMode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-20 mt-1 flex h-14 items-end justify-center gap-2.5 sm:mt-3 sm:h-20 sm:gap-4",
		children: VIZ_MODES.map((mode, i) => {
			const Icon = MODE_ICONS[mode.id];
			const active = vizMode === mode.id;
			const lift = i === 2 ? "-translate-y-5" : i === 1 || i === 3 ? "-translate-y-3" : "-translate-y-1";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				title: `${mode.labelAr} · ${mode.labelEn}`,
				"aria-label": mode.labelAr,
				"aria-pressed": active,
				onClick: () => setVizMode(mode.id),
				className: cn("relative flex size-11 items-center justify-center rounded-full sm:size-12", "transition-[transform,background-color,box-shadow,border-color] duration-250 ease-out", lift, active ? "border-transparent bg-accent text-accent-fg shadow-[0_0_22px_color-mix(in_oklab,var(--color-glow)_55%,transparent)]" : "border border-cream/20 bg-ink/25 text-cream/80 hover:border-cream/45 hover:bg-ink/40"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					strokeWidth: 1.6
				}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-2.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-cream shadow-[0_0_8px_white]" })]
			}, mode.id);
		})
	});
}
function ChannelBar() {
	const stationId = useStudioStore((s) => s.stationId);
	const setStation = useStudioStore((s) => s.setStation);
	const status = useStudioStore((s) => s.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative z-20 mx-auto mt-4 grid w-full max-w-xl grid-cols-2 gap-2 px-4 sm:mt-6 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-2.5",
		children: STATIONS.map((station) => {
			const active = station.id === stationId;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setStation(station.id),
				className: cn("min-h-11 rounded-full px-3.5 py-2 text-center transition-[background-color,box-shadow,color] duration-250", "sm:px-5", active ? "bg-accent text-accent-fg shadow-[0_0_20px_color-mix(in_oklab,var(--color-glow)_40%,transparent)]" : "bg-cream/8 text-cream/80 hover:bg-cream/14"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-base leading-none tabular-nums sm:text-lg",
						children: station.freq
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-[0.7rem] leading-tight sm:text-xs",
						children: station.nameAr
					}),
					active && status === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "يبث الآن"
					})
				]
			}, station.id);
		})
	});
}
function VolumeControl() {
	const volume = useStudioStore((s) => s.volume);
	const muted = useStudioStore((s) => s.muted);
	const setVolume = useStudioStore((s) => s.setVolume);
	const toggleMuted = useStudioStore((s) => s.toggleMuted);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "ltr",
		className: "relative z-20 mx-auto mt-3 flex w-full max-w-xs items-center gap-3 px-6 sm:mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: toggleMuted,
			"aria-label": muted ? "إلغاء الكتم" : "كتم الصوت",
			className: "flex size-10 items-center justify-center rounded-full text-cream/80 transition-colors duration-150 hover:text-cream",
			children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
				className: "size-5",
				strokeWidth: 1.7
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
				className: "size-5",
				strokeWidth: 1.7
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max: 1,
			step: .01,
			value: muted ? 0 : volume,
			onChange: (e) => setVolume(Number(e.target.value)),
			"aria-label": "مستوى الصوت",
			className: "volume-slider w-full",
			suppressHydrationWarning: true
		})]
	});
}
function ThemeDock() {
	const theme = useStudioStore((s) => s.theme);
	const setTheme = useStudioStore((s) => s.setTheme);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "relative z-30 mt-auto flex items-center justify-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3",
		children: STUDIO_THEMES.map((item) => {
			const active = theme === item.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: `${item.labelAr} · ${item.labelEn}`,
				"aria-label": item.labelAr,
				"aria-pressed": active,
				onClick: () => setTheme(item.id),
				className: cn("relative size-12 overflow-hidden rounded-full sm:size-14", "transition-[transform,box-shadow] duration-250 ease-out", "active:scale-[0.96]", active ? "shadow-[0_0_0_2px_var(--color-cream),0_0_22px_color-mix(in_oklab,var(--color-glow)_50%,transparent)]" : "shadow-[0_0_0_1px_rgba(244,234,216,0.28)] opacity-80 hover:opacity-100"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.image,
					alt: "",
					className: "size-full object-cover",
					style: { objectPosition: item.position }
				})
			}, item.id);
		})
	});
}
function StationCaption() {
	const stationId = useStudioStore((s) => s.stationId);
	const status = useStudioStore((s) => s.status);
	const error = useStudioStore((s) => s.error);
	const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];
	const line = error ?? (status === "buffering" ? "جاري الاتصال بالبث…" : status === "live" ? "مباشر من المنامة" : status === "paused" ? "متوقف" : "اضغط الشعار للاستماع");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-20 mt-4 px-4 text-center sm:mt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-wide text-cream sm:text-3xl",
				children: station.nameAr
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs uppercase tracking-[0.22em] text-cream/55",
				children: [
					station.nameEn,
					" · FM ",
					station.freq
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 text-sm", status === "live" ? "text-accent" : "text-cream/60", error && "text-rb-red"),
				children: line
			})
		]
	});
}
var graph = {
	ctx: null,
	analyser: null,
	source: null,
	bound: null
};
function useRadioEngine(audio) {
	const hlsRef = (0, import_react.useRef)(null);
	const analyserRef = (0, import_react.useRef)(graph.analyser);
	const loadedUrl = (0, import_react.useRef)(null);
	const wantPlay = (0, import_react.useRef)(false);
	const stationId = useStudioStore((s) => s.stationId);
	const volume = useStudioStore((s) => s.volume);
	const muted = useStudioStore((s) => s.muted);
	const status = useStudioStore((s) => s.status);
	const setStatus = useStudioStore((s) => s.setStatus);
	const streamUrl = stationById(stationId).url;
	const ensureGraph = (0, import_react.useCallback)(async () => {
		if (!audio) return null;
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return null;
		if (!graph.ctx) graph.ctx = new AC();
		if (graph.ctx.state === "suspended") await graph.ctx.resume();
		if (!graph.analyser) {
			const analyser = graph.ctx.createAnalyser();
			analyser.fftSize = 512;
			analyser.smoothingTimeConstant = .52;
			graph.analyser = analyser;
		}
		if (!graph.source || graph.bound !== audio) try {
			graph.source = graph.ctx.createMediaElementSource(audio);
			graph.source.connect(graph.analyser);
			graph.analyser.connect(graph.ctx.destination);
			graph.bound = audio;
		} catch {}
		analyserRef.current = graph.analyser;
		return graph.analyser;
	}, [audio]);
	const loadStream = (0, import_react.useCallback)(async (url) => {
		if (!audio) return;
		const Hls = (await import("../_libs/hls.js.mjs").then((n) => n.t)).default;
		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}
		audio.removeAttribute("src");
		audio.load();
		loadedUrl.current = url;
		if (Hls.isSupported()) {
			const hls = new Hls({
				lowLatencyMode: true,
				enableWorker: true,
				xhrSetup(xhr) {
					xhr.withCredentials = false;
				}
			});
			hls.on(Hls.Events.ERROR, (_e, data) => {
				if (!data.fatal) return;
				if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
					hls.startLoad();
					return;
				}
				setStatus("error", "تعذر تشغيل البث. حاول مرة أخرى.");
			});
			hls.loadSource(url);
			hls.attachMedia(audio);
			hlsRef.current = hls;
		} else if (audio.canPlayType("application/vnd.apple.mpegurl")) audio.src = url;
		else setStatus("error", "المتصفح لا يدعم بث الراديو.");
	}, [audio, setStatus]);
	(0, import_react.useEffect)(() => {
		if (!audio) return;
		const onPlaying = () => setStatus("live");
		const onWaiting = () => {
			if (wantPlay.current) setStatus("buffering");
		};
		const onPause = () => {
			if (wantPlay.current) return;
			setStatus("paused");
		};
		const onError = () => {
			if (wantPlay.current) setStatus("error", "تعذر تشغيل البث.");
		};
		audio.addEventListener("playing", onPlaying);
		audio.addEventListener("waiting", onWaiting);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("error", onError);
		return () => {
			audio.removeEventListener("playing", onPlaying);
			audio.removeEventListener("waiting", onWaiting);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("error", onError);
		};
	}, [audio, setStatus]);
	(0, import_react.useEffect)(() => {
		if (!audio) return;
		audio.volume = muted ? 0 : volume;
	}, [
		audio,
		volume,
		muted
	]);
	(0, import_react.useEffect)(() => {
		if (!audio || !wantPlay.current) return;
		if (loadedUrl.current === streamUrl) return;
		setStatus("buffering");
		(async () => {
			await loadStream(streamUrl);
			try {
				await audio.play();
			} catch {
				setStatus("error", "اضغط التشغيل مرة أخرى.");
			}
		})();
	}, [
		audio,
		streamUrl,
		loadStream,
		setStatus
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			hlsRef.current?.destroy();
			hlsRef.current = null;
			loadedUrl.current = null;
		};
	}, []);
	const play = (0, import_react.useCallback)(async () => {
		if (!audio) return;
		wantPlay.current = true;
		setStatus("buffering");
		await ensureGraph();
		if (loadedUrl.current !== streamUrl) await loadStream(streamUrl);
		try {
			await audio.play();
			setStatus("live");
		} catch {
			wantPlay.current = false;
			setStatus("error", "اضغط التشغيل مرة أخرى.");
		}
	}, [
		audio,
		ensureGraph,
		loadStream,
		streamUrl,
		setStatus
	]);
	const pause = (0, import_react.useCallback)(() => {
		wantPlay.current = false;
		audio?.pause();
		setStatus("paused");
	}, [audio, setStatus]);
	return {
		toggle: (0, import_react.useCallback)(() => {
			if (status === "live" || status === "buffering") pause();
			else play();
		}, [
			status,
			play,
			pause
		]),
		play,
		pause,
		analyserRef
	};
}
function StudioApp() {
	const theme = useStudioStore((s) => s.theme);
	const scene = themeById(theme);
	const [audioEl, setAudioEl] = (0, import_react.useState)(null);
	const orbRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const { toggle, analyserRef } = useRadioEngine(audioEl);
	(0, import_react.useEffect)(() => {
		useStudioStore.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.code !== "Space") return;
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
			e.preventDefault();
			toggle();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [toggle]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		ref: shellRef,
		"data-studio": theme,
		className: "studio-shell relative flex h-dvh min-h-0 flex-col overflow-hidden bg-ink text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "studio-bg",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: scene.image,
						alt: "",
						className: "studio-bg-img",
						style: { objectPosition: scene.position }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "studio-scrim" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "studio-grain" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Visualizer, {
				analyserRef,
				orbRef,
				shellRef
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center pb-1 pt-1", theme === "gold" && "md:me-auto md:w-[min(100%,40rem)] md:ps-6"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeArc, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerOrb, {
						ref: orbRef,
						onToggle: toggle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationCaption, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelBar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeControl, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeDock, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: setAudioEl,
				crossOrigin: "anonymous",
				playsInline: true,
				preload: "none",
				className: "hidden"
			})
		]
	});
}
var SplitComponent = StudioApp;
//#endregion
export { SplitComponent as component };
