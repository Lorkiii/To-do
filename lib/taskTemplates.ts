import type { TaskTemplateOption } from "@/types/taskTemplates";

export const builtInTaskTemplates: TaskTemplateOption[] = [
  {
    id: "built-in-daily-planner",
    name: "Daily planner",
    title: "Plan today's priorities",
    description:
      "Set the main focus for the day, organize key tasks, and close with a short review.",
    priority: "Medium",
    status: "To Do",
    checklistItems: [
      "Write the top 3 priorities",
      "Block time for focused work",
      "Handle quick admin tasks",
      "Review what was completed",
    ],
    source: "built-in",
  },
  {
    id: "built-in-student-planner",
    name: "Student planner",
    title: "Study session plan",
    description:
      "Prepare study goals, assignments, review notes, and follow-up questions.",
    priority: "Medium",
    status: "To Do",
    checklistItems: [
      "List subjects or topics to study",
      "Review class notes",
      "Complete assignment tasks",
      "Write questions for the next class",
    ],
    source: "built-in",
  },
  {
    id: "built-in-workout-planner",
    name: "Workout planner",
    title: "Complete workout routine",
    description:
      "Track warm-up, main exercises, cooldown, and recovery notes for one session.",
    priority: "Medium",
    status: "To Do",
    checklistItems: [
      "Warm up for 5-10 minutes",
      "Complete main exercise sets",
      "Stretch and cool down",
      "Log workout notes",
    ],
    source: "built-in",
  },
];
