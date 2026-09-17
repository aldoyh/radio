export type StudioThemeId = "gold" | "neon" | "towers" | "crest";

export type StudioTheme = {
  id: StudioThemeId;
  labelAr: string;
  labelEn: string;
  image: string;
  position: string;
};

export const STUDIO_THEMES: StudioTheme[] = [
  {
    id: "gold",
    labelAr: "الاستوديو الذهبي",
    labelEn: "Gold Studio",
    image: "/studio/gold-studio.jpg",
    position: "18% center",
  },
  {
    id: "neon",
    labelAr: "الاستوديو النيون",
    labelEn: "Neon Studio",
    image: "/studio/neon-studio.jpg",
    position: "center",
  },
  {
    id: "towers",
    labelAr: "الأبراج",
    labelEn: "Bahrain Towers",
    image: "/studio/towers.jpg",
    position: "center bottom",
  },
  {
    id: "crest",
    labelAr: "الشعار",
    labelEn: "Crest",
    image: "/studio/branded.jpg",
    position: "center",
  },
];

export function themeById(id: StudioThemeId): StudioTheme {
  return STUDIO_THEMES.find((t) => t.id === id) ?? STUDIO_THEMES[0];
}

export type VizMode = "bars" | "cline" | "particles" | "pulse" | "nebula";

export const VIZ_MODES: { id: VizMode; labelAr: string; labelEn: string }[] = [
  { id: "bars", labelAr: "أشرطة", labelEn: "Bars" },
  { id: "cline", labelAr: "موجة", labelEn: "Wave" },
  { id: "particles", labelAr: "جزيئات", labelEn: "Particles" },
  { id: "pulse", labelAr: "نبض", labelEn: "Pulse" },
  { id: "nebula", labelAr: "سديم", labelEn: "Nebula" },
];
