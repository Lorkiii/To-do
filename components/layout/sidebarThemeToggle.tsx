"use client";

import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function SidebarThemeToggle({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const { theme, isSavingTheme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={isMobile ? "default" : "icon-lg"}
          className={cn(
            isMobile
              ? "h-14 min-w-14 flex-1 flex-col gap-1 rounded-xl px-2 text-[0.68rem]"
              : "size-9 rounded-lg",
          )}
          disabled={isSavingTheme}
          aria-label={label}
          onClick={() => void toggleTheme()}>
          <HugeiconsIcon
            icon={isDark ? Sun02Icon : Moon02Icon}
            strokeWidth={2}
          />
          {isMobile && <span>{isDark ? "Light" : "Dark"}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "top" : "right"}>{label}</TooltipContent>
    </Tooltip>
  );
}
