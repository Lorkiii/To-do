"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  DashboardSpeed02Icon,
  Task01Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingPreviewTaskStatus = "todo" | "inProgress" | "completed";
type LandingPreviewFilter = "all" | LandingPreviewTaskStatus;
type LandingPreviewTaskPriority = "low" | "medium" | "high";

type LandingPreviewTask = {
  id: string;
  title: string;
  description: string;
  status: LandingPreviewTaskStatus;
  priority: LandingPreviewTaskPriority;
  dueLabel: string;
};

type LandingPreviewFilterOption = {
  id: LandingPreviewFilter;
  label: string;
};

type LandingBenefit = {
  title: string;
  description: string;
  icon: IconSvgElement;
};

const features = [
  "Priority planning",
  "Project timelines",
  "Smart task filters",
  "Daily focus mode",
];

const previewFilters: LandingPreviewFilterOption[] = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "inProgress", label: "Focus" },
  { id: "completed", label: "Done" },
];

const previewTasks: LandingPreviewTask[] = [
  {
    id: "daily-plan",
    title: "Plan today's top priorities",
    description: "Pick the three tasks that should shape the day.",
    status: "inProgress",
    priority: "high",
    dueLabel: "9:30 AM",
  },
  {
    id: "project-timeline",
    title: "Update project timeline",
    description: "Move open tasks into the right launch milestones.",
    status: "todo",
    priority: "medium",
    dueLabel: "1:00 PM",
  },
  {
    id: "weekly-review",
    title: "Send weekly progress note",
    description: "Share completed work, blockers, and next actions.",
    status: "completed",
    priority: "low",
    dueLabel: "Done",
  },
];

const benefits: LandingBenefit[] = [
  {
    title: "Capture fast",
    description: "Add tasks before they scatter across notes, chats, and memory.",
    icon: Task01Icon,
  },
  {
    title: "Plan clearly",
    description: "Sort priorities by status, deadline, and what needs focus next.",
    icon: Calendar03Icon,
  },
  {
    title: "Track progress",
    description: "See what moved today without turning planning into extra work.",
    icon: DashboardSpeed02Icon,
  },
];

const statusLabels: Record<LandingPreviewTaskStatus, string> = {
  todo: "To do",
  inProgress: "In focus",
  completed: "Done",
};

const statusStyles: Record<LandingPreviewTaskStatus, string> = {
  todo: "border-border bg-muted/55 text-muted-foreground",
  inProgress: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-chart-2/30 bg-chart-2/10 text-chart-2",
};

const priorityStyles: Record<LandingPreviewTaskPriority, string> = {
  low: "text-muted-foreground",
  medium: "text-chart-3",
  high: "text-chart-4",
};

const initialTaskStatuses = previewTasks.reduce(
  (statuses, task) => ({
    ...statuses,
    [task.id]: task.status,
  }),
  {} as Record<string, LandingPreviewTaskStatus>,
);

export function LandingPanel() {
  const [activeFilter, setActiveFilter] =
    useState<LandingPreviewFilter>("all");
  const [taskStatuses, setTaskStatuses] =
    useState<Record<string, LandingPreviewTaskStatus>>(initialTaskStatuses);

  const completedTaskCount = previewTasks.filter(
    (task) => taskStatuses[task.id] === "completed",
  ).length;
  const completionPercentage = Math.round(
    (completedTaskCount / previewTasks.length) * 100,
  );

  const visibleTasks = useMemo(
    () =>
      previewTasks.filter(
        (task) =>
          activeFilter === "all" || taskStatuses[task.id] === activeFilter,
      ),
    [activeFilter, taskStatuses],
  );

  function toggleTaskStatus(taskId: string) {
    setTaskStatuses((currentStatuses) => ({
      ...currentStatuses,
      [taskId]:
        currentStatuses[taskId] === "completed" ? "todo" : "completed",
    }));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden">
        <div className="app-surface-gradient absolute inset-0 -z-10" />
        <div className="app-grid-overlay absolute inset-0 -z-10 opacity-35" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/40 px-4 py-3 backdrop-blur md:px-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
              aria-label="Lazylet home">
              <span className="flex size-10 items-center justify-center rounded-2xl border border-border bg-muted text-lg font-bold text-foreground">
                L
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Lazylet
              </span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
              <a className="transition hover:text-foreground" href="#features">
                Features
              </a>
              <a className="transition hover:text-foreground" href="#preview">
                Preview
              </a>
              <a className="transition hover:text-foreground" href="#workflow">
                Workflow
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="hidden h-10 rounded-xl px-4 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-10 rounded-xl bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                <Link href="/create-account">Get started</Link>
              </Button>
            </div>
          </header>

          {/* Main content */}
          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14 xl:gap-14">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-accent">
                Clean task planning
              </p>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Organize your day without the noise.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Lazylet brings tasks, projects, and deadlines into one focused
                dashboard with a calm dark interface that keeps the next step
                obvious.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90">
                  <Link href="/create-account">Start organizing</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl border-border bg-card/40 px-6 text-base text-foreground hover:bg-muted">
                  <Link href="/login">View workspace</Link>
                </Button>
              </div>

              <div
                id="features"
                className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-border bg-card/40 px-4 py-3">
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <section
              id="preview"
              aria-label="Interactive Lazylet task preview"
              className="rounded-[1.6rem] border border-border bg-card/70 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
              <div className="rounded-[1.2rem] border border-border bg-background/85 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                      <HugeiconsIcon icon={TimeQuarterPassIcon} strokeWidth={2} />
                      Live task preview
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                      Today&apos;s focus, filtered in seconds.
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                      Try the filters or complete a task to watch the progress
                      update instantly.
                    </p>
                  </div>

                  <div className="grid min-w-28 place-items-center rounded-2xl border border-border bg-card/50 px-4 py-3 text-center">
                    <p className="text-3xl font-semibold text-foreground">
                      {completionPercentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">complete</p>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div
                  className="mt-5 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter preview tasks">
                  {previewFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      type="button"
                      variant="outline"
                      size="lg"
                      aria-pressed={activeFilter === filter.id}
                      className={cn(
                        "h-9 rounded-xl px-3 text-xs",
                        activeFilter === filter.id
                          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => setActiveFilter(filter.id)}>
                      {filter.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-5 grid gap-3" id="workflow">
                  {visibleTasks.map((task) => {
                    const currentStatus = taskStatuses[task.id];
                    const isCompleted = currentStatus === "completed";

                    return (
                      <article
                        key={task.id}
                        className="rounded-2xl border border-border bg-card/70 p-4 transition hover:border-ring/40 hover:bg-card">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className={cn(
                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                              isCompleted
                                ? "border-chart-2/30 bg-chart-2/10 text-chart-2"
                                : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                            )}
                            aria-label={
                              isCompleted
                                ? `Reopen ${task.title}`
                                : `Complete ${task.title}`
                            }
                            onClick={() => toggleTaskStatus(task.id)}>
                            {isCompleted ? (
                              <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                strokeWidth={2}
                              />
                            ) : (
                              <span className="size-2 rounded-full bg-current" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full border px-2.5 py-1 text-xs font-medium",
                                  statusStyles[currentStatus],
                                )}>
                                {statusLabels[currentStatus]}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  priorityStyles[task.priority],
                                )}>
                                {task.priority} priority
                              </span>
                            </div>

                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3
                                  className={cn(
                                    "text-base font-semibold text-foreground",
                                    isCompleted && "text-muted-foreground line-through",
                                  )}>
                                  {task.title}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>
                              <time className="shrink-0 rounded-xl border border-border bg-background/55 px-3 py-2 text-sm text-muted-foreground">
                                {isCompleted ? "Done" : task.dueLabel}
                              </time>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <section
            id="benefits"
            aria-label="Lazylet benefits"
            className="grid gap-3 pb-10 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-border bg-card/45 p-4 backdrop-blur">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/55 text-accent">
                  <HugeiconsIcon icon={benefit.icon} strokeWidth={2} />
                </span>
                <h2 className="mt-4 text-base font-semibold text-foreground">
                  {benefit.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {benefit.description}
                </p>
              </article>
            ))}
          </section>

          <footer className="grid gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:grid-cols-3">
            <p>
              Built for fast capture, focused planning, and clear follow-up.
            </p>
            <p className="sm:text-center">Tasks • Projects • Calendar</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
