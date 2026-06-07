import prisma from "@/prisma/client";
import {
  buildContributionCalendar,
  getContributionLevel,
  toContributionDateKey,
} from "@/lib/contributions";
import type {
  ActivityFeedGroup,
  ActivityFeedItem,
  ActivityStat,
  ActivityViewModel,
} from "@/types/activity";
import type { DashboardActivityDay } from "@/types/dashboard";

type SourceTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type SourcePost = {
  id: string;
  title: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawActivity = {
  id: string;
  type: "task" | "post";
  title: string;
  description: string;
  action: string;
  timestamp: Date;
};

const heatmapDays = 84;
const maxFeedItems = 40;
// Treat created and updated within this window as a single creation event.
const updateThresholdMs = 60 * 1000;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toDateKey(date: Date) {
  return toContributionDateKey(startOfDay(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
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

function formatGroupLabel(date: Date) {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function isCompletedStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  return normalized === "done" || normalized === "completed";
}

function buildRawActivities(
  tasks: SourceTask[],
  posts: SourcePost[],
): RawActivity[] {
  const activities: RawActivity[] = [];

  for (const task of tasks) {
    activities.push({
      id: `task-${task.id}-created`,
      type: "task",
      title: task.title,
      description: task.description || "Task created",
      action: "Created task",
      timestamp: task.createdAt,
    });

    if (task.updatedAt.getTime() - task.createdAt.getTime() > updateThresholdMs) {
      activities.push({
        id: `task-${task.id}-updated`,
        type: "task",
        title: task.title,
        description: task.description || "Task updated",
        action: isCompletedStatus(task.status)
          ? "Completed task"
          : "Updated task",
        timestamp: task.updatedAt,
      });
    }
  }

  for (const post of posts) {
    activities.push({
      id: `post-${post.id}-created`,
      type: "post",
      title: post.title,
      description: post.content ?? "Blog post created",
      action: "Published post",
      timestamp: post.createdAt,
    });

    if (post.updatedAt.getTime() - post.createdAt.getTime() > updateThresholdMs) {
      activities.push({
        id: `post-${post.id}-updated`,
        type: "post",
        title: post.title,
        description: post.content ?? "Blog post updated",
        action: "Updated post",
        timestamp: post.updatedAt,
      });
    }
  }

  return activities.sort(
    (first, second) => second.timestamp.getTime() - first.timestamp.getTime(),
  );
}

function getActivityDates(tasks: SourceTask[], posts: SourcePost[]) {
  return [
    ...tasks.flatMap((task) => [task.createdAt, task.updatedAt]),
    ...posts.flatMap((post) => [post.createdAt, post.updatedAt]),
  ];
}

function getActivityDays(activityDates: Date[]): DashboardActivityDay[] {
  const countsByDay = new Map<string, number>();

  for (const activityDate of activityDates) {
    const key = toDateKey(activityDate);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const today = startOfDay(new Date());

  return Array.from({ length: heatmapDays }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (heatmapDays - 1 - index));
    const key = toDateKey(date);
    const count = countsByDay.get(key) ?? 0;

    return { date: key, count, level: getContributionLevel(count) };
  });
}

function getCurrentStreak(activityDays: DashboardActivityDay[]) {
  let streak = 0;

  for (let index = activityDays.length - 1; index >= 0; index -= 1) {
    if (activityDays[index].count > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function getCompletionRate(tasks: SourceTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => isCompletedStatus(task.status)).length;
  return Math.round((completed / tasks.length) * 100);
}

function groupActivities(activities: RawActivity[]): ActivityFeedGroup[] {
  const groups = new Map<string, ActivityFeedItem[]>();
  const orderedKeys: string[] = [];

  for (const activity of activities.slice(0, maxFeedItems)) {
    const key = toDateKey(activity.timestamp);

    if (!groups.has(key)) {
      groups.set(key, []);
      orderedKeys.push(key);
    }

    groups.get(key)?.push({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      action: activity.action,
      time: formatTime(activity.timestamp),
    });
  }

  return orderedKeys.map((key) => ({
    id: key,
    label: formatGroupLabel(new Date(`${key}T00:00:00`)),
    items: groups.get(key) ?? [],
  }));
}

function buildActivityViewModel(
  tasks: SourceTask[],
  posts: SourcePost[],
): ActivityViewModel {
  const activities = buildRawActivities(tasks, posts);
  const activityDates = getActivityDates(tasks, posts);
  const activityDays = getActivityDays(activityDates);
  const activeDays = activityDays.filter((day) => day.count > 0).length;
  const weeklyActivityCount = activityDays
    .slice(-7)
    .reduce((total, day) => total + day.count, 0);
  const currentStreak = getCurrentStreak(activityDays);

  const stats: ActivityStat[] = [
    {
      id: "totalActivities",
      label: "Total activity",
      value: activities.length,
      helper: "Tracked task and post events",
    },
    {
      id: "activeDays",
      label: "Active days",
      value: activeDays,
      helper: "Days with movement in view",
    },
    {
      id: "currentStreak",
      label: "Current streak",
      value: currentStreak,
      helper: "Consecutive active days",
    },
    {
      id: "weeklyActivity",
      label: "This week",
      value: weeklyActivityCount,
      helper: "Updates in the last 7 days",
    },
  ];

  return {
    generatedAt: formatTimeLabel(new Date()),
    stats,
    activityDays,
    activityCalendar: buildContributionCalendar(activityDates),
    summary: {
      completionRate: getCompletionRate(tasks),
      activeDays,
      weeklyActivityCount,
    },
    groups: groupActivities(activities),
  };
}

export async function getActivityViewModel(
  authorId?: string,
): Promise<ActivityViewModel> {
  if (!authorId) {
    return buildActivityViewModel([], []);
  }

  try {
    const [tasks, posts] = await Promise.all([
      prisma.task.findMany({
        where: { deletedAt: null, authorId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.findMany({
        where: { authorId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return buildActivityViewModel(tasks, posts);
  } catch {
    return buildActivityViewModel([], []);
  }
}
