"use client";

import { useMemo, useState } from "react";
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/lib/utils";
import type {
  TrackerColor,
  TrackerCompletions,
  TrackerItem,
  TrackerType,
} from "@/types/tracker";

const trackersStorageKey = "lazylet.activity.trackers";
const completionsStorageKey = "lazylet.activity.completions";

const emptyTrackers: TrackerItem[] = [];
const emptyCompletions: TrackerCompletions = {};

const colorStyles: Record<
  TrackerColor,
  { dot: string; badge: string; swatch: string }
> = {
  cyan: {
    dot: "bg-accent",
    badge: "border-accent/30 bg-accent/10 text-accent",
    swatch: "bg-accent",
  },
  green: {
    dot: "bg-chart-2",
    badge: "border-chart-2/30 bg-chart-2/10 text-chart-2",
    swatch: "bg-chart-2",
  },
  amber: {
    dot: "bg-chart-3",
    badge: "border-chart-3/30 bg-chart-3/10 text-chart-3",
    swatch: "bg-chart-3",
  },
  rose: {
    dot: "bg-chart-4",
    badge: "border-chart-4/30 bg-chart-4/10 text-chart-4",
    swatch: "bg-chart-4",
  },
};

const colorOptions: TrackerColor[] = ["cyan", "green", "amber", "rose"];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});
const dayFormatter = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getTodayKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

type MonthCell = { day: number; dateKey: string } | null;

function buildMonthCells(year: number, month: number): MonthCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: MonthCell[] = [];

  for (let blank = 0; blank < firstWeekday; blank += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, dateKey: toDateKey(year, month, day) });
  }

  return cells;
}

export function HabitRoutineCalendar() {
  const [trackers, setTrackers] = usePersistentState<TrackerItem[]>(
    trackersStorageKey,
    emptyTrackers,
  );
  const [completions, setCompletions] = usePersistentState<TrackerCompletions>(
    completionsStorageKey,
    emptyCompletions,
  );

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<TrackerType>("habit");
  const [newColor, setNewColor] = useState<TrackerColor>("cyan");

  const todayKey = getTodayKey();
  const monthCells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );
  const monthLabel = monthFormatter.format(new Date(viewYear, viewMonth, 1));
  const selectedLabel = dayFormatter.format(
    new Date(`${selectedDateKey}T00:00:00`),
  );

  const trackersById = useMemo(() => {
    return new Map(trackers.map((tracker) => [tracker.id, tracker]));
  }, [trackers]);

  const monthlyCounts = useMemo(() => {
    const prefix = `${viewYear}-${pad(viewMonth + 1)}`;
    const counts = new Map<string, number>();

    for (const [dateKey, ids] of Object.entries(completions)) {
      if (!dateKey.startsWith(prefix)) {
        continue;
      }

      for (const id of ids) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    return counts;
  }, [completions, viewYear, viewMonth]);

  const selectedCompleted = completions[selectedDateKey] ?? [];

  function goToMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function goToToday() {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateKey(getTodayKey());
  }

  function handleAddTracker() {
    const name = newName.trim();

    if (!name) {
      return;
    }

    const tracker: TrackerItem = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      type: newType,
      color: newColor,
      createdAt: new Date().toISOString(),
    };

    setTrackers((current) => [...current, tracker]);
    setNewName("");
    setNewColor("cyan");
    setNewType("habit");
    setIsAdding(false);
  }

  function handleDeleteTracker(id: string) {
    setTrackers((current) => current.filter((tracker) => tracker.id !== id));
    setCompletions((current) => {
      const next: TrackerCompletions = {};

      for (const [dateKey, ids] of Object.entries(current)) {
        const filtered = ids.filter((trackerId) => trackerId !== id);

        if (filtered.length > 0) {
          next[dateKey] = filtered;
        }
      }

      return next;
    });
  }

  function toggleCompletion(dateKey: string, id: string) {
    setCompletions((current) => {
      const dayList = current[dateKey] ?? [];
      const nextList = dayList.includes(id)
        ? dayList.filter((trackerId) => trackerId !== id)
        : [...dayList, id];

      const next = { ...current };

      if (nextList.length > 0) {
        next[dateKey] = nextList;
      } else {
        delete next[dateKey];
      }

      return next;
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Habit & routine tracker</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Track your day on the calendar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add habits and routines, then tap a day to check them off.
          </p>
        </div>

        <Button
          type="button"
          variant={isAdding ? "outline" : "default"}
          className="h-9 shrink-0 gap-2 rounded-xl px-3"
          onClick={() => setIsAdding((current) => !current)}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          {isAdding ? "Close" : "New tracker"}
        </Button>
      </div>

      {isAdding && (
        <div className="mt-4 rounded-xl border border-border bg-background/55 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <label
                htmlFor="tracker-name"
                className="text-xs font-medium text-muted-foreground"
              >
                Name
              </label>
              <input
                id="tracker-name"
                type="text"
                value={newName}
                placeholder="e.g., Morning workout"
                className="h-10 w-full rounded-xl border border-input bg-card/40 px-3 text-sm text-foreground shadow-xs transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddTracker();
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-muted-foreground">
                Type
              </span>
              <div className="flex gap-2">
                {(["habit", "routine"] as TrackerType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewType(type)}
                    aria-pressed={newType === type}
                    className={cn(
                      "h-10 flex-1 rounded-xl border px-3 text-sm font-medium capitalize transition sm:flex-none",
                      newType === type
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Color
              </span>
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  aria-pressed={newColor === color}
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "size-6 rounded-full ring-offset-2 ring-offset-background transition",
                    colorStyles[color].swatch,
                    newColor === color
                      ? "ring-2 ring-ring"
                      : "opacity-70 hover:opacity-100",
                  )}
                />
              ))}
            </div>

            <Button
              type="button"
              className="h-9 gap-2 rounded-xl px-4"
              onClick={handleAddTracker}
              disabled={!newName.trim()}
            >
              Add tracker
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {monthLabel}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                aria-label="Previous month"
                onClick={() => goToMonth(-1)}
              >
                <span aria-hidden="true">&#8249;</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg px-3 text-xs"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-lg"
                aria-label="Next month"
                onClick={() => goToMonth(1)}
              >
                <span aria-hidden="true">&#8250;</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center sm:gap-1.5">
            {weekdays.map((weekday) => (
              <div
                key={weekday}
                className="pb-1 text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs"
              >
                <span className="sm:hidden">{weekday.charAt(0)}</span>
                <span className="hidden sm:inline">{weekday}</span>
              </div>
            ))}

            {monthCells.map((cell, index) => {
              if (!cell) {
                return <div key={`blank-${index}`} aria-hidden="true" />;
              }

              const dayCompleted = completions[cell.dateKey] ?? [];
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-start gap-1 rounded-lg border p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:p-1.5",
                    isSelected
                      ? "border-accent/50 bg-accent/10"
                      : "border-border bg-background/40 hover:border-ring/40 hover:bg-background/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[0.7rem] font-medium sm:size-6 sm:text-xs",
                      isToday
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground",
                    )}
                  >
                    {cell.day}
                  </span>

                  {dayCompleted.length > 0 && (
                    <span className="flex flex-wrap items-center justify-center gap-0.5">
                      {dayCompleted.slice(0, 3).map((id) => {
                        const tracker = trackersById.get(id);

                        return (
                          <span
                            key={id}
                            className={cn(
                              "size-1.5 rounded-full",
                              tracker
                                ? colorStyles[tracker.color].dot
                                : "bg-muted-foreground",
                            )}
                          />
                        );
                      })}
                      {dayCompleted.length > 3 && (
                        <span className="text-[0.55rem] font-medium leading-none text-muted-foreground">
                          +{dayCompleted.length - 3}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/55 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {selectedDateKey === todayKey ? "Today" : "Selected day"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            {selectedLabel}
          </h3>

          {trackers.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
              No habits or routines yet. Add your first tracker to start checking
              off your days.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {trackers.map((tracker) => {
                const isDone = selectedCompleted.includes(tracker.id);
                const monthlyCount = monthlyCounts.get(tracker.id) ?? 0;
                const styles = colorStyles[tracker.color];

                return (
                  <li
                    key={tracker.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleCompletion(selectedDateKey, tracker.id)
                      }
                      aria-pressed={isDone}
                      aria-label={`${isDone ? "Unmark" : "Mark"} ${tracker.name}`}
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md border transition",
                        isDone
                          ? `${styles.badge} border-transparent`
                          : "border-input text-transparent hover:border-ring/50",
                      )}
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          isDone
                            ? "text-foreground"
                            : "text-foreground/90",
                        )}
                      >
                        {tracker.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 font-medium capitalize",
                            styles.badge,
                          )}
                        >
                          {tracker.type}
                        </span>
                        <span>{monthlyCount} this month</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTracker(tracker.id)}
                      aria-label={`Delete ${tracker.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
