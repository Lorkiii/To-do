"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

type TaskActionButtonProps = {
  label: string;
  icon: IconSvgElement;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  onClick: () => void;
};

export function TaskActionButton({
  label,
  icon,
  variant = "outline",
  disabled = false,
  onClick,
}: TaskActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className="h-9 rounded-xl px-3"
      disabled={disabled}
      onClick={onClick}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} />
      {label}
    </Button>
  );
}
