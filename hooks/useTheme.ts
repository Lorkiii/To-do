"use client";

import { createContext, useContext } from "react";

import type { Theme } from "@/types/settings";

export type ThemeContextValue = {
  theme: Theme;
  isSavingTheme: boolean;
  setTheme: (theme: Theme) => Promise<boolean>;
  toggleTheme: () => Promise<boolean>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
