"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type TaskStatus = "pending" | "in-progress" | "completed";

type PreviewTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  dueTime: string;
  tags: string[];
};

type WorkspaceView = {
  id: "today" | "projects" | "calendar";
  label: string;
  eyebrow: string;
  heading: string;
  summary: string;
  completion: number;
  stats: {
    label: string;
    value: string;
  }[];
  tasks: PreviewTask[];
};

const workspaceViews: WorkspaceView[] = [
  {
    id: "today",
    label: "Today",
    eyebrow: "Daily command center",
    heading: "See exactly what needs attention next.",
    summary:
      "Group your daily priorities, quick wins, and blocked work into one calm planning view.",
    completion: 72,
    stats: [
      { label: "Due today", value: "8" },
      { label: "Completed", value: "5" },
      { label: "Focus time", value: "3.5h" },
    ],
    tasks: [
      {
        id: "task-standup",
        title: "Write standup update",
        description: "Summarize blockers, shipped work, and next focus.",
        status: "in-progress",
        priority: "high",
        dueTime: "9:30 AM",
        tags: ["Team", "Daily"],
      },
      {
        id: "task-homepage",
        title: "Finalize landing page copy",
        description: "Tighten hero message and CTA labels before review.",
        status: "pending",
        priority: "medium",
        dueTime: "1:00 PM",
        tags: ["Marketing", "Website"],
      },
      {
        id: "task-api",
        title: "Review API pull request",
        description: "Check validation, edge cases, and response typing.",
        status: "completed",
        priority: "low",
        dueTime: "4:15 PM",
        tags: ["Engineering"],
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    eyebrow: "Project progress",
    heading: "Connect tasks to outcomes, not scattered lists.",
    summary:
      "Track project momentum with priorities, progress, and next actions in the same workspace.",
    completion: 58,
    stats: [
      { label: "Active projects", value: "4" },
      { label: "Tasks linked", value: "23" },
      { label: "At risk", value: "2" },
    ],
    tasks: [
      {
        id: "task-launch",
        title: "Marketing launch board",
        description: "Map campaign tasks to owners and deadlines.",
        status: "in-progress",
        priority: "high",
        dueTime: "Friday",
        tags: ["Launch", "Planning"],
      },
      {
        id: "task-mobile",
        title: "Mobile bugfix queue",
        description: "Prioritize layout defects before the next release.",
        status: "pending",
        priority: "medium",
        dueTime: "Monday",
        tags: ["Mobile", "QA"],
      },
      {
        id: "task-roadmap",
        title: "Team roadmap draft",
        description: "Turn backlog themes into quarterly milestones.",
        status: "completed",
        priority: "low",
        dueTime: "Done",
        tags: ["Roadmap"],
      },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    eyebrow: "Deadline clarity",
    heading: "Plan around dates before they become urgent.",
    summary:
      "Visualize upcoming deadlines, scheduled work, and open time without leaving your task list.",
    completion: 84,
    stats: [
      { label: "Deadlines", value: "6" },
      { label: "Scheduled", value: "11" },
      { label: "Open slots", value: "4" },
    ],
    tasks: [
      {
        id: "task-checklist",
        title: "Create onboarding checklist",
        description: "Schedule welcome tasks across the first week.",
        status: "pending",
        priority: "high",
        dueTime: "Tomorrow",
        tags: ["Calendar", "People"],
      },
      {
        id: "task-sprint",
        title: "Plan sprint priorities",
        description: "Reserve planning blocks and review capacity.",
        status: "in-progress",
        priority: "medium",
        dueTime: "Wed",
        tags: ["Sprint", "Focus"],
      },
      {
        id: "task-retro",
        title: "Retrospective notes",
        description: "Collect takeaways and assign follow-up actions.",
        status: "completed",
        priority: "low",
        dueTime: "Yesterday",
        tags: ["Team"],
      },
    ],
  },
] satisfies WorkspaceView[];

type WorkspaceViewId = WorkspaceView["id"];

const features = [
  "Priority planning",
  "Project timelines",
  "Smart task filters",
  "Daily focus mode",
];

const statusStyles: Record<TaskStatus, string> = {
  pending: "border-border bg-muted text-muted-foreground",
  "in-progress": "border-accent/30 bg-accent/10 text-accent",
  completed: "border-chart-2/30 bg-chart-2/10 text-chart-2",
};

const priorityStyles: Record<PreviewTask["priority"], string> = {
  low: "text-muted-foreground",
  medium: "text-chart-3",
  high: "text-chart-4",
};

export function LandingPanel() {
  const [activeViewId, setActiveViewId] = useState<WorkspaceViewId>("today");
  const activeView = useMemo(
    () =>
      workspaceViews.find((entry) => entry.id === activeViewId) ??
      workspaceViews[0],
    [activeViewId],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden">
        <div className="app-surface-gradient absolute inset-0 -z-10" />
        <div className="app-grid-overlay absolute inset-0 -z-10 opacity-35" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
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

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16 xl:gap-14">
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
              aria-label="Interactive workspace preview"
              className="rounded-[2rem] border border-border bg-card/70 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
              <div className="rounded-[1.5rem] border border-border bg-background/80 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-accent">
                      {activeView.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                      {activeView.heading}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      {activeView.summary}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-right">
                    <p className="text-3xl font-semibold text-foreground">
                      {activeView.completion}%
                    </p>
                    <p className="text-xs text-muted-foreground">weekly progress</p>
                  </div>
                </div>

                <div
                  className="mt-5 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Workspace views">
                  {workspaceViews.map((view) => (
                    <Button
                      key={view.id}
                      type="button"
                      variant="outline"
                      size="lg"
                      aria-pressed={activeViewId === view.id}
                      className={
                        activeViewId === view.id
                          ? "h-10 rounded-xl border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                          : "h-10 rounded-xl border-border bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                      onClick={() => setActiveViewId(view.id)}>
                      {view.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {activeView.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-card/40 p-4">
                      <p className="text-2xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${activeView.completion}%` }}
                  />
                </div>

                <div className="mt-6 grid gap-3" id="workflow">
                  {activeView.tasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-border bg-card/80 p-4 transition hover:border-ring/40 hover:bg-card">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
                              {task.status}
                            </span>
                            <span
                              className={`text-xs font-medium ${priorityStyles[task.priority]}`}>
                              {task.priority} priority
                            </span>
                          </div>
                          <h3 className="mt-3 text-base font-semibold text-foreground">
                            {task.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                        <time className="rounded-xl border border-border bg-card/40 px-3 py-2 text-sm text-muted-foreground">
                          {task.dueTime}
                        </time>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <span
                            key={`${task.id}-${tag}`}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <footer className="grid gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:grid-cols-3">
            <p>
              Built for fast capture, focused planning, and clear follow-up.
            </p>
            <p className="sm:text-center">Tasks • Projects • Calendar</p>
            <Link
              href="/login"
              className="font-medium text-foreground transition hover:text-accent sm:text-right">
              Continue to app
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
