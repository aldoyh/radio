import { useEffect, useRef, useState } from "react";
import { Visualizer } from "./Visualizer";
import { PowerOrb } from "./PowerOrb";
import {
  ChannelBar,
  ModeArc,
  StationCaption,
  StudioHeader,
  ThemeDock,
  VolumeControl,
} from "./StudioChrome";
import { cn } from "@/lib/utils";
import { themeById } from "@/lib/studio/themes";
import { useStudioStore } from "@/lib/studio/store";
import { useRadioEngine } from "@/lib/studio/use-radio-engine";

export function StudioApp() {
  const theme = useStudioStore((s) => s.theme);
  const scene = themeById(theme);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const { toggle, analyserRef } = useRadioEngine(audioEl);

  useEffect(() => {
    void useStudioStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <main
      ref={shellRef}
      data-studio={theme}
      className="studio-shell relative flex h-dvh min-h-0 flex-col overflow-hidden bg-ink text-cream"
    >
      <div className="studio-bg" aria-hidden>
        <img
          src={scene.image}
          alt=""
          className="studio-bg-img"
          style={{ objectPosition: scene.position }}
        />
        <div className="studio-scrim" />
        <div className="studio-grain" />
      </div>

      <Visualizer analyserRef={analyserRef} orbRef={orbRef} shellRef={shellRef} />

      <StudioHeader />

      <div
        className={cn(
          "relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center pb-1 pt-1",
          theme === "gold" && "md:me-auto md:w-[min(100%,40rem)] md:ps-6",
        )}
      >
        <ModeArc />
        <PowerOrb ref={orbRef} onToggle={toggle} />
        <StationCaption />
        <ChannelBar />
        <VolumeControl />
      </div>

      <ThemeDock />

      <audio
        ref={setAudioEl}
        crossOrigin="anonymous"
        playsInline
        preload="none"
        className="hidden"
      />
    </main>
  );
}
