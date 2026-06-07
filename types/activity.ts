import type {
  ContributionCalendar,
  DashboardActivityDay,
} from "@/types/dashboard";

export type ActivityType = "task" | "post";

export type ActivityStat = {
  id: "totalActivities" | "activeDays" | "currentStreak" | "weeklyActivity";
  label: string;
  value: number;
  helper: string;
};

export type ActivityFeedItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  action: string;
  time: string;
};

export type ActivityFeedGroup = {
  id: string;
  label: string;
  items: ActivityFeedItem[];
};

export type ActivityViewModel = {
  generatedAt: string;
  stats: ActivityStat[];
  activityDays: DashboardActivityDay[];
  activityCalendar: ContributionCalendar;
  summary: {
    completionRate: number;
    activeDays: number;
    weeklyActivityCount: number;
  };
  groups: ActivityFeedGroup[];
};
