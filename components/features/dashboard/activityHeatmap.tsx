"use client";

import { Fragment, useState } from "react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildContributionWeeks } from "@/lib/contributions";
import { cn } from "@/lib/utils";
import type {
  ContributionCalendar,
  ContributionDay,
  DashboardActivityLevel,
} from "@/types/dashboard";

type MonthFilter = "all" | `${number}`;

const monthOptions = [
  { value: "all", label: "All months" },
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
] as const;

const weekdayLabelByRow: Record<number, string> = {
  1: "Mon",
  3: "Wed",
  5: "Fri",
};

const levelClassMap: Record<DashboardActivityLevel, string> = {
  0: "bg-muted/40",
  1: "bg-accent/25",
  2: "bg-accent/45",
  3: "bg-accent/70",
  4: "bg-accent",
};

function getMonthFilterValue(month: MonthFilter) {
  return month === "all" ? "all" : Number(month);
}

function getMonthLabel(month: MonthFilter) {
  return (
    monthOptions.find((option) => option.value === month)?.label ??
    "All months"
  );
}

function getSelectedContributionCount(
  countsByDate: Record<string, number>,
  selectedYear: number,
  selectedMonth: MonthFilter,
) {
  const yearPrefix = `${selectedYear}-`;
  const monthPrefix =
    selectedMonth === "all"
      ? null
      : `${selectedYear}-${(Number(selectedMonth) + 1)
          .toString()
          .padStart(2, "0")}-`;

  return Object.entries(countsByDate).reduce((total, [date, count]) => {
    if (!date.startsWith(yearPrefix)) {
      return total;
    }

    if (monthPrefix && !date.startsWith(monthPrefix)) {
      return total;
    }

    return total + count;
  }, 0);
}

function ContributionCell({ day }: { day: ContributionDay | null }) {
  if (!day) {
    return <span aria-hidden="true" className="size-3 rounded-[3px]" />;
  }

  return (
    <span className="group relative block size-3">
      <span
        aria-label={day.label}
        tabIndex={0}
        className={cn(
          "block size-3 rounded-[3px] border border-border/40 transition hover:ring-2 hover:ring-ring/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
          levelClassMap[day.level],
        )}
      />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-52 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md group-hover:block group-focus-within:block">
        {day.label}
      </span>
    </span>
  );
}

export function DashboardActivityHeatmap({
  calendar,
}: {
  calendar: ContributionCalendar;
}) {
  const currentYear = new Date().getFullYear();
  const years = calendar.years.length > 0 ? calendar.years : [currentYear];
  const [selectedYear, setSelectedYear] = useState(
    years.includes(currentYear) ? currentYear : years[0],
  );
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>("all");
  const selectedContributionCount = getSelectedContributionCount(
    calendar.countsByDate,
    selectedYear,
    selectedMonth,
  );
  const { weeks, monthLabels } = buildContributionWeeks(
    calendar.countsByDate,
    selectedYear,
    getMonthFilterValue(selectedMonth),
  );
  const monthLabelByWeek = new Map(
    monthLabels.map((month) => [month.weekIndex, month.label]),
  );
  const gridTemplateColumns = `2rem repeat(${weeks.length}, 0.75rem)`;

  return (
    <section className="rounded-xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">
            Activity calendar
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {selectedContributionCount.toLocaleString()} contributions in{" "}
            {selectedMonth === "all" ? selectedYear : getMonthLabel(selectedMonth)}
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Daily task and blog activity, grouped like GitHub contributions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background/55 px-3 text-xs font-medium text-foreground transition hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
              {getMonthLabel(selectedMonth)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuRadioGroup
                value={selectedMonth}
                onValueChange={(value) =>
                  setSelectedMonth(value as MonthFilter)
                }>
                {monthOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_5rem]">
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="grid w-max items-center gap-1"
            style={{ gridTemplateColumns }}
            aria-label="Activity contributions calendar">
            <span aria-hidden="true" />
            {weeks.map((week, weekIndex) => (
              <span
                key={`month-${week.id}`}
                className="h-4 whitespace-nowrap text-xs text-muted-foreground">
                {monthLabelByWeek.get(weekIndex) ?? ""}
              </span>
            ))}

            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <Fragment key={`row-${rowIndex}`}>
                <span className="flex h-full items-center pr-2 text-xs text-muted-foreground">
                  {weekdayLabelByRow[rowIndex] ?? ""}
                </span>
                {weeks.map((week, weekIndex) => (
                  <ContributionCell
                    key={week.days[rowIndex]?.date ?? `${week.id}-${rowIndex}-${weekIndex}`}
                    day={week.days[rowIndex]}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                "h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 lg:w-full lg:text-left",
                selectedYear === year
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
              )}>
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={cn(
              "size-3 rounded-[3px] border border-border/40",
              levelClassMap[level as DashboardActivityLevel],
            )}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
