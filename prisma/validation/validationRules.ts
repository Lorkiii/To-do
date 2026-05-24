export const taskPriorities = ["Low", "Medium", "High"] as const;
export const taskStatuses = ["To Do", "In Progress", "Done"] as const;
export const usernamePattern = /^[a-zA-Z0-9_]+$/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const namePattern = /^[a-zA-Z]+$/;


export const validationRules = {
  task: {
    title: { label: "Title", minLength: 1 },
    description: { label: "Description", minLength: 1 },
    priority: { label: "Priority", values: taskPriorities },
    status: { label: "Status", values: taskStatuses },
  },
  post: {
    title: { label: "Title", minLength: 1 },
    content: { label: "Content", minLength: 1 },
  },
  user: {
    firstName: { label: "First name", minLength: 1 },
    middleName: { label: "Middle name" },
    lastName: { label: "Last name", minLength: 1 },
    username: {
      label: "Username",
      minLength: 3,
      pattern: usernamePattern,
      patternMessage: "Username can only use letters, numbers, and underscores",
    },
    email: { label: "Email address" },
    password: { label: "Password", minLength: 6 },
  },
} as const;

