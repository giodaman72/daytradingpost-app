export const COLORS = {
  background: "#070b12",
  backgroundSoft: "#0b111c",
  blue: "#5c8dff",
  gold: "#f5b942",
  goldLight: "#ffd978",
  green: "#27d497",
  purple: "#9c7cff",
  red: "#ff647c",
  surface: "#101826",
  surfaceLight: "#162131",
  text: "#f8fafc",
  textMuted: "#748095",
  textSoft: "#a5b1c2",
} as const;

export type ColorToken = keyof typeof COLORS;
