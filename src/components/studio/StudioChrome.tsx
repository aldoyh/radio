import {
  Activity,
  Aperture,
  AudioLines,
  CircleDot,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { STATIONS } from "@/lib/studio/stations";
import { STUDIO_THEMES, VIZ_MODES, type VizMode } from "@/lib/studio/themes";
import { useStudioStore } from "@/lib/studio/store";
import { useBahrainClock } from "@/lib/studio/use-bahrain-clock";

const MODE_ICONS: Record<VizMode, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  bars: AudioLines,
  cline: Activity,
  particles: Sparkles,
  pulse: CircleDot,
  nebula: Aperture,
};

export function StudioHeader() {
  const { time, date } = useBahrainClock();
  const status = useStudioStore((s) => s.status);
  const live = status === "live";

  return (
    <header className="relative z-30 flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
      <div className="flex items-center gap-3">
        <img
          src="/studio/logo.jpg"
          alt=""
          className="size-11 rounded-full shadow-[0_0_0_1px_rgba(255,244,228,0.18)] sm:size-12"
        />
        <div className="leading-tight">
          <p className="font-display text-xl font-semibold tracking-wide text-cream sm:text-2xl">
            إذاعة البحرين
          </p>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-cream/55 sm:text-xs">
            Radio Bahrain · Virtual Studio
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.18em]",
            live
              ? "bg-rb-red text-cream shadow-[0_0_18px_color-mix(in_oklab,var(--color-rb-red)_55%,transparent)]"
              : "bg-cream/8 text-cream/55",
          )}
        >
          <span className={cn("size-1.5 rounded-full bg-cream", live && "animate-onair")} />
          {live ? "ON AIR" : "STANDBY"}
        </span>
        <p
          suppressHydrationWarning
          className="font-display text-lg tabular-nums leading-none text-cream/90 sm:text-xl"
        >
          {time}
        </p>
        <p suppressHydrationWarning className="text-[0.7rem] text-cream/50">
          {date} · AST
        </p>
      </div>
    </header>
  );
}

export function ModeArc() {
  const vizMode = useStudioStore((s) => s.vizMode);
  const setVizMode = useStudioStore((s) => s.setVizMode);

  return (
    <div className="relative z-20 mt-1 flex h-14 items-end justify-center gap-2.5 sm:mt-3 sm:h-20 sm:gap-4">
      {VIZ_MODES.map((mode, i) => {
        const Icon = MODE_ICONS[mode.id];
        const active = vizMode === mode.id;
        const lift = i === 2 ? "-translate-y-5" : i === 1 || i === 3 ? "-translate-y-3" : "-translate-y-1";
        return (
          <button
            key={mode.id}
            type="button"
            title={`${mode.labelAr} · ${mode.labelEn}`}
            aria-label={mode.labelAr}
            aria-pressed={active}
            onClick={() => setVizMode(mode.id)}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-full sm:size-12",
              "transition-[transform,background-color,box-shadow,border-color] duration-250 ease-out",
              lift,
              active
                ? "border-transparent bg-accent text-accent-fg shadow-[0_0_22px_color-mix(in_oklab,var(--color-glow)_55%,transparent)]"
                : "border border-cream/20 bg-ink/25 text-cream/80 hover:border-cream/45 hover:bg-ink/40",
            )}
          >
            <Icon className="size-5" strokeWidth={1.6} />
            {active && (
              <span className="absolute -bottom-2.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-cream shadow-[0_0_8px_white]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ChannelBar() {
  const stationId = useStudioStore((s) => s.stationId);
  const setStation = useStudioStore((s) => s.setStation);
  const status = useStudioStore((s) => s.status);

  return (
    <div className="relative z-20 mx-auto mt-4 grid w-full max-w-xl grid-cols-2 gap-2 px-4 sm:mt-6 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-2.5">
      {STATIONS.map((station) => {
        const active = station.id === stationId;
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => setStation(station.id)}
            className={cn(
              "min-h-11 rounded-full px-3.5 py-2 text-center transition-[background-color,box-shadow,color] duration-250",
              "sm:px-5",
              active
                ? "bg-accent text-accent-fg shadow-[0_0_20px_color-mix(in_oklab,var(--color-glow)_40%,transparent)]"
                : "bg-cream/8 text-cream/80 hover:bg-cream/14",
            )}
          >
            <span className="block font-display text-base leading-none tabular-nums sm:text-lg">
              {station.freq}
            </span>
            <span className="mt-0.5 block text-[0.7rem] leading-tight sm:text-xs">
              {station.nameAr}
            </span>
            {active && status === "live" && <span className="sr-only">يبث الآن</span>}
          </button>
        );
      })}
    </div>
  );
}

export function VolumeControl() {
  const volume = useStudioStore((s) => s.volume);
  const muted = useStudioStore((s) => s.muted);
  const setVolume = useStudioStore((s) => s.setVolume);
  const toggleMuted = useStudioStore((s) => s.toggleMuted);

  return (
    <div dir="ltr" className="relative z-20 mx-auto mt-3 flex w-full max-w-xs items-center gap-3 px-6 sm:mt-4">
      <button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? "إلغاء الكتم" : "كتم الصوت"}
        className="flex size-10 items-center justify-center rounded-full text-cream/80 transition-colors duration-150 hover:text-cream"
      >
        {muted || volume === 0 ? (
          <VolumeX className="size-5" strokeWidth={1.7} />
        ) : (
          <Volume2 className="size-5" strokeWidth={1.7} />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="مستوى الصوت"
        className="volume-slider w-full"
        suppressHydrationWarning
      />
    </div>
  );
}

export function ThemeDock() {
  const theme = useStudioStore((s) => s.theme);
  const setTheme = useStudioStore((s) => s.setTheme);

  return (
    <footer className="relative z-30 mt-auto flex items-center justify-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
      {STUDIO_THEMES.map((item) => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={`${item.labelAr} · ${item.labelEn}`}
            aria-label={item.labelAr}
            aria-pressed={active}
            onClick={() => setTheme(item.id)}
            className={cn(
              "relative size-12 overflow-hidden rounded-full sm:size-14",
              "transition-[transform,box-shadow] duration-250 ease-out",
              "active:scale-[0.96]",
              active
                ? "shadow-[0_0_0_2px_var(--color-cream),0_0_22px_color-mix(in_oklab,var(--color-glow)_50%,transparent)]"
                : "shadow-[0_0_0_1px_rgba(244,234,216,0.28)] opacity-80 hover:opacity-100",
            )}
          >
            <img
              src={item.image}
              alt=""
              className="size-full object-cover"
              style={{ objectPosition: item.position }}
            />
          </button>
        );
      })}
    </footer>
  );
}

export function StationCaption() {
  const stationId = useStudioStore((s) => s.stationId);
  const status = useStudioStore((s) => s.status);
  const error = useStudioStore((s) => s.error);
  const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];

  const line =
    error ??
    (status === "buffering"
      ? "جاري الاتصال بالبث…"
      : status === "live"
        ? "مباشر من المنامة"
        : status === "paused"
          ? "متوقف"
          : "اضغط الشعار للاستماع");

  return (
    <div className="relative z-20 mt-4 px-4 text-center sm:mt-5">
      <h1 className="font-display text-2xl font-semibold tracking-wide text-cream sm:text-3xl">
        {station.nameAr}
      </h1>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-cream/55">
        {station.nameEn} · FM {station.freq}
      </p>
      <p
        className={cn(
          "mt-2 text-sm",
          status === "live" ? "text-accent" : "text-cream/60",
          error && "text-rb-red",
        )}
      >
        {line}
      </p>
    </div>
  );
}
