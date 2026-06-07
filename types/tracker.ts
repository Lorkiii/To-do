export type TrackerType = "habit" | "routine";

export type TrackerColor = "cyan" | "green" | "amber" | "rose";

export type TrackerItem = {
  id: string;
  name: string;
  type: TrackerType;
  color: TrackerColor;
  createdAt: string;
};

// Maps a date key (YYYY-MM-DD) to the tracker ids completed on that day.
export type TrackerCompletions = Record<string, string[]>;
