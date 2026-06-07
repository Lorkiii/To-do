import prisma from "@/prisma/client";
import {
  buildContributionCalendar,
  getContributionLevel,
  toContributionDateKey,
} from "@/lib/contributions";
import type {
  DashboardActivityItem,
  DashboardStat,
  DashboardTaskPreview,
  DashboardViewModel,
} from "@/types/dashboard";
import { listPosts, toBlogPostListItem } from "@/services/postService";

type SourceTask = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
};

type SourcePost = Awaited<ReturnType<typeof listPosts>>[number];

const heatmapDays = 84;

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getCompletionRate(tasks: SourceTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => isCompletedStatus(task.status)).length;
  return Math.round((completed / tasks.length) * 100);
}

function isCompletedStatus(status: string) {
  const normalizedStatus = status.trim().toLowerCase();
  return normalizedStatus === "done" || normalizedStatus === "completed";
}

function isInProgressStatus(status: string) {
  return status.trim().toLowerCase() === "in progress";
}

function isTaskOverdue(task: SourceTask, now: Date) {
  if (!task.dueDate || isCompletedStatus(task.status)) {
    return false;
  }

  return task.dueDate.getTime() < now.getTime();
}

function getStats(tasks: SourceTask[], now: Date): DashboardStat[] {
  const completed = tasks.filter((task) => isCompletedStatus(task.status)).length;
  const inProgress = tasks.filter((task) => isInProgressStatus(task.status)).length;

  return [
    {
      id: "totalTasks",
      label: "Total Tasks",
      value: tasks.length,
      helper: "All active task records",
      tone: "accent",
    },
    {
      id: "inProgress",
      label: "In Progress",
      value: inProgress,
      helper: "Tasks currently moving",
      tone: "warning",
    },
    {
      id: "completed",
      label: "Completed",
      value: completed,
      helper: "Finished tasks",
      tone: "success",
    },
    {
      id: "overdue",
      label: "Overdue",
      value: tasks.filter((task) => isTaskOverdue(task, now)).length,
      helper: "Waiting on a due date field",
      tone: "danger",
    },
  ];
}

function getActivityDates(tasks: SourceTask[], posts: SourcePost[]) {
  return [
    ...tasks.flatMap((task) => [task.createdAt, task.updatedAt]),
    ...posts.flatMap((post) => [post.createdAt, post.updatedAt]),
  ];
}

function getActivityDays(tasks: SourceTask[], posts: SourcePost[]) {
  const countsByDay = new Map<string, number>();

  // Bucket task and post timestamps into day keys so Prisma rows can replace mock data without changing the UI.
  for (const date of getActivityDates(tasks, posts)) {
    const dateKey = toContributionDateKey(date);
    countsByDay.set(dateKey, (countsByDay.get(dateKey) ?? 0) + 1);
  }

  return Array.from({ length: heatmapDays }, (_, index) => {
    const date = daysAgo(heatmapDays - 1 - index);
    const dateKey = toContributionDateKey(date);
    const count = countsByDay.get(dateKey) ?? 0;

    return {
      date: dateKey,
      count,
      level: getContributionLevel(count),
    };
  });
}

function getPreviewTasks(tasks: SourceTask[], now: Date): DashboardTaskPreview[] {
  return tasks
    .slice()
    .sort((firstTask, secondTask) => {
      return secondTask.updatedAt.getTime() - firstTask.updatedAt.getTime();
    })
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueLabel: task.dueDate ? formatDayLabel(task.dueDate) : "No due date",
      isOverdue: isTaskOverdue(task, now),
      updatedAt: formatTimeLabel(task.updatedAt),
    }));
}

function getRecentActivities(
  tasks: SourceTask[],
  posts: SourcePost[],
): DashboardActivityItem[] {
  const taskActivities = tasks.map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    description: `Task ${task.status.toLowerCase()}`,
    type: "task" as const,
    timestamp: task.updatedAt,
  }));

  const postActivities = posts.map((post) => ({
    id: `post-${post.id}`,
    title: post.title,
    description: post.content ?? "Blog post activity",
    type: "post" as const,
    timestamp: post.updatedAt,
    post: toBlogPostListItem(post),
  }));

  return [...taskActivities, ...postActivities]
    .sort((firstItem, secondItem) => {
      return secondItem.timestamp.getTime() - firstItem.timestamp.getTime();
    })
    .slice(0, 5)
    .map((item) => ({
      ...item,
      timestamp: formatTimeLabel(item.timestamp),
    }));
}

function buildDashboardViewModel(
  tasks: SourceTask[],
  posts: SourcePost[],
): DashboardViewModel {
  const now = new Date();
  const activityDates = getActivityDates(tasks, posts);
  const activityDays = getActivityDays(tasks, posts);
  const activeDays = activityDays.filter((day) => day.count > 0).length;
  const weeklyActivityCount = activityDays
    .slice(-7)
    .reduce((total, day) => total + day.count, 0);

  return {
    userName: "Lazylet",
    generatedAt: formatTimeLabel(now),
    summary: {
      completionRate: getCompletionRate(tasks),
      activeDays,
      weeklyActivityCount,
    },
    stats: getStats(tasks, now),
    activityDays,
    activityCalendar: buildContributionCalendar(activityDates),
    upcomingTasks: getPreviewTasks(tasks, now),
    recentActivities: getRecentActivities(tasks, posts),
  };
}

export async function getDashboardViewModel(
  authorId?: string,
): Promise<DashboardViewModel> {
  if (!authorId) {
    return buildDashboardViewModel([], []);
  }

  try {
    const [tasks, posts] = await Promise.all([
      prisma.task.findMany({
        where: {
          deletedAt: null,
          ...(authorId ? { authorId } : {}),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      listPosts(authorId),
    ]);

    return buildDashboardViewModel(tasks, posts);
  } catch {
    return buildDashboardViewModel([], []);
  }
}
