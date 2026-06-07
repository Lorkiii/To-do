import type { BlogPostListItem } from "@/types/blog";

export type DashboardMetricTone = "accent" | "success" | "warning" | "danger";

export type DashboardStat = {
  id: "totalTasks" | "inProgress" | "completed" | "overdue";
  label: string;
  value: number;
  helper: string;
  tone: DashboardMetricTone;
};

export type DashboardActivityLevel = 0 | 1 | 2 | 3 | 4;

export type DashboardActivityDay = {
  date: string;
  count: number;
  level: DashboardActivityLevel;
};

export type ContributionDay = {
  date: string;
  count: number;
  level: DashboardActivityLevel;
  label: string;
};

export type ContributionWeek = {
  id: string;
  days: Array<ContributionDay | null>;
};

export type ContributionMonthLabel = {
  id: string;
  label: string;
  weekIndex: number;
};

export type ContributionCalendar = {
  countsByDate: Record<string, number>;
  years: number[];
};

export type DashboardTaskPreview = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueLabel: string;
  isOverdue: boolean;
  updatedAt: string;
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  description: string;
  type: "task" | "post";
  timestamp: string;
  post?: BlogPostListItem;
};

export type DashboardViewModel = {
  userName: string;
  generatedAt: string;
  summary: {
    completionRate: number;
    activeDays: number;
    weeklyActivityCount: number;
  };
  stats: DashboardStat[];
  activityDays: DashboardActivityDay[];
  activityCalendar: ContributionCalendar;
  upcomingTasks: DashboardTaskPreview[];
  recentActivities: DashboardActivityItem[];
};
