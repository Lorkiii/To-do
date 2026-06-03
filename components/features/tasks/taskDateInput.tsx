"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type DateInputElement = HTMLInputElement & {
  showPicker?: () => void;
};

type TaskDateInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "onChange" | "type" | "value"
> & {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const dateInputClassName =
  "h-11 w-full rounded-xl border border-input bg-card/40 px-3 pr-12 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25";

export function TaskDateInput({
  className,
  id,
  label,
  name,
  value,
  onChange,
  ...props
}: TaskDateInputProps) {
  const inputRef = useRef<DateInputElement>(null);

  function handlePickerClick() {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });

    try {
      input.showPicker?.();
    } catch {
      input.focus();
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="date"
          value={value}
          className={cn(
            dateInputClassName,
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            className,
          )}
          onChange={onChange}
          {...props}
        />
        <button
          type="button"
          aria-label={`Choose ${label.toLowerCase()}`}
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          onClick={handlePickerClick}
        >
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
        </button>
      </div>
    </div>
  );
}
