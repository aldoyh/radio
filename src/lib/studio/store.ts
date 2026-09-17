import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STATIONS } from "./stations";
import type { StudioThemeId, VizMode } from "./themes";

export type EngineStatus = "idle" | "buffering" | "live" | "paused" | "error";

type StudioState = {
  stationId: string;
  theme: StudioThemeId;
  vizMode: VizMode;
  volume: number;
  muted: boolean;
  status: EngineStatus;
  error: string | null;
  setStation: (id: string) => void;
  setTheme: (theme: StudioThemeId) => void;
  setVizMode: (mode: VizMode) => void;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
  setStatus: (status: EngineStatus, error?: string | null) => void;
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      stationId: STATIONS[0].id,
      theme: "gold",
      vizMode: "bars",
      volume: 0.86,
      muted: false,
      status: "idle",
      error: null,
      setStation: (stationId) => set({ stationId, error: null }),
      setTheme: (theme) => set({ theme }),
      setVizMode: (vizMode) => set({ vizMode }),
      setVolume: (volume) => set({ volume, muted: volume === 0 }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setStatus: (status, error = null) => set({ status, error }),
    }),
    {
      name: "radiobh-virtual-studio",
      skipHydration: true,
      partialize: (s) => ({
        stationId: s.stationId,
        theme: s.theme,
        vizMode: s.vizMode,
        volume: s.volume,
        muted: s.muted,
      }),
    },
  ),
);
