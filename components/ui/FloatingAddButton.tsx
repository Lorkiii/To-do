import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  children?: ReactNode;
  label: string;
  className?: string;
};

export function FloatingActionButton({
  children = "+",
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      aria-label={label}
      size="icon-lg"
      className={cn(
        "fixed bottom-28 right-4 z-50 size-14 rounded-full bg-primary text-2xl text-primary-foreground shadow-xl transition hover:bg-primary/90 md:bottom-8 md:right-8",
        className,
      )}
    >
      {children}
    </Button>
  );
}