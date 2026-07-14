"use client";

import { createContext, type ReactNode, useState } from "react";

export type Theme = "dark" | "light" | "system";

export type ThemeContextValue = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
