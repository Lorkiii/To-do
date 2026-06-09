"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { ThemeContext } from "@/hooks/useTheme";
import { themeCookieMaxAgeSeconds } from "@/lib/settingsPolicy";
import type { SettingsViewModel, Theme } from "@/types/settings";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document.cookie = `theme=${theme}; path=/; max-age=${themeCookieMaxAgeSeconds}; samesite=lax`;
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
}) {
  const { status } = useSession();
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let isCurrent = true;

    async function loadAccountTheme() {
      try {
        const response = await fetch("/api/settings");
        const result = (await response.json()) as {
          settings?: SettingsViewModel;
        };

        if (isCurrent && response.ok && result.settings) {
          setThemeState(result.settings.system.theme);
        }
      } catch {
        // Keep the cookie theme when account preferences are unavailable.
      }
    }

    void loadAccountTheme();

    return () => {
      isCurrent = false;
    };
  }, [status]);

  const setTheme = useCallback(
    async (nextTheme: Theme) => {
      if (nextTheme === theme || isSavingTheme) {
        return true;
      }

      const previousTheme = theme;
      setThemeState(nextTheme);

      if (status !== "authenticated") {
        return true;
      }

      setIsSavingTheme(true);

      try {
        const response = await fetch("/api/settings/system", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: nextTheme }),
        });

        if (!response.ok) {
          setThemeState(previousTheme);
          return false;
        }

        return true;
      } catch {
        setThemeState(previousTheme);
        return false;
      } finally {
        setIsSavingTheme(false);
      }
    },
    [isSavingTheme, status, theme],
  );

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [setTheme, theme],
  );

  const value = useMemo(
    () => ({ theme, isSavingTheme, setTheme, toggleTheme }),
    [isSavingTheme, setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
