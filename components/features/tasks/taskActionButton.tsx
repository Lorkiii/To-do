"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskActionButtonProps = {
  label: string;
  icon: IconSvgElement;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onClick: () => void;
};

export function TaskActionButton({
  label,
  icon,
  variant = "outline",
  size = "default",
  className,
  disabled = false,
  ariaLabel,
  onClick,
}: TaskActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("h-9 rounded-xl px-3", className)}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} />
      {label}
    </Button>
  );
}
