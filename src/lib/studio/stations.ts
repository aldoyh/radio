export type Station = {
  id: string;
  freq: string;
  nameAr: string;
  nameEn: string;
  url: string;
};

export const STATIONS: Station[] = [
  {
    id: "bahrain-fm",
    freq: "93.3",
    nameAr: "بحرين إف إم",
    nameEn: "Bahrain FM",
    url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-93-3_all/playlist.m3u8",
  },
  {
    id: "youth",
    freq: "98.4",
    nameAr: "الشبابية",
    nameEn: "Shababiyah",
    url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-98-4_all/playlist.m3u8",
  },
  {
    id: "quran",
    freq: "106.1",
    nameAr: "القرآن الكريم",
    nameEn: "Holy Quran",
    url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-106-1_all/playlist.m3u8",
  },
  {
    id: "traditional",
    freq: "95.0",
    nameAr: "الشعبية",
    nameEn: "Al Shaabiya",
    url: "https://5c7b683162943.streamlock.net/live/ngrp:radio-95-0_all/playlist.m3u8",
  },
];

export function stationById(id: string): Station {
  return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}
