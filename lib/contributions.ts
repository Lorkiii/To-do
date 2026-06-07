import type {
  ContributionCalendar,
  ContributionDay,
  ContributionMonthLabel,
  ContributionWeek,
  DashboardActivityLevel,
} from "@/types/dashboard";

type MonthFilter = "all" | number;

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
const tooltipDateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
});

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isAfter(firstDate: Date, secondDate: Date) {
  return firstDate.getTime() > secondDate.getTime();
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function toContributionDateKey(date: Date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

export function getContributionLevel(count: number): DashboardActivityLevel {
  if (count === 0) {
    return 0;
  }

  if (count === 1) {
    return 1;
  }

  if (count === 2) {
    return 2;
  }

  if (count <= 4) {
    return 3;
  }

  return 4;
}

export function buildContributionCounts(dates: Date[]) {
  const countsByDate: Record<string, number> = {};

  for (const date of dates) {
    const dateKey = toContributionDateKey(startOfDay(date));
    countsByDate[dateKey] = (countsByDate[dateKey] ?? 0) + 1;
  }

  return countsByDate;
}

export function buildContributionCalendar(dates: Date[]): ContributionCalendar {
  const countsByDate = buildContributionCounts(dates);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    new Set([
      currentYear,
      ...Object.keys(countsByDate).map((dateKey) => Number(dateKey.slice(0, 4))),
    ]),
  )
    .filter((year) => Number.isFinite(year))
    .sort((firstYear, secondYear) => secondYear - firstYear);

  return { countsByDate, years };
}

function createContributionDay(
  date: Date,
  countsByDate: Record<string, number>,
): ContributionDay {
  const dateKey = toContributionDateKey(date);
  const count = countsByDate[dateKey] ?? 0;
  const contributionLabel =
    count === 1 ? "1 contribution" : `${count} contributions`;

  return {
    date: dateKey,
    count,
    level: getContributionLevel(count),
    label:
      count === 0
        ? `No contributions on ${tooltipDateFormatter.format(date)}`
        : `${contributionLabel} on ${tooltipDateFormatter.format(date)}`,
  };
}

function getVisibleRange(year: number, month: MonthFilter) {
  if (month === "all") {
    return {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31),
    };
  }

  return {
    startDate: new Date(year, month, 1),
    endDate: new Date(year, month, getDaysInMonth(year, month)),
  };
}

function getMonthLabel(date: Date, weekIndex: number): ContributionMonthLabel {
  return {
    id: `${date.getFullYear()}-${date.getMonth()}-${weekIndex}`,
    label: monthFormatter.format(date),
    weekIndex,
  };
}

export function buildContributionWeeks(
  countsByDate: Record<string, number>,
  year: number,
  month: MonthFilter,
) {
  const today = startOfDay(new Date());
  const { startDate, endDate } = getVisibleRange(year, month);
  const startDayIndex = startDate.getDay();
  const weeks: ContributionWeek[] = [];
  const monthLabels: ContributionMonthLabel[] = [];
  const seenMonthKeys = new Set<string>();
  let cursor = new Date(startDate);
  let weekIndex = 0;

  while (cursor.getTime() <= endDate.getTime()) {
    const days: ContributionWeek["days"] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const isLeadingPadding = weekIndex === 0 && dayIndex < startDayIndex;
      const isPastRange = cursor.getTime() > endDate.getTime();

      if (!isLeadingPadding && !isPastRange) {
        const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;

        if (!seenMonthKeys.has(monthKey)) {
          monthLabels.push(getMonthLabel(cursor, weekIndex));
          seenMonthKeys.add(monthKey);
        }
      }

      if (isLeadingPadding || isPastRange || isAfter(cursor, today)) {
        days.push(null);
      } else {
        days.push(createContributionDay(cursor, countsByDate));
      }

      if (!isLeadingPadding && !isPastRange) {
        cursor = addDays(cursor, 1);
      }
    }

    weeks.push({
      id: `${year}-${month}-${weekIndex}`,
      days,
    });
    weekIndex += 1;
  }

  return { weeks, monthLabels };
}
