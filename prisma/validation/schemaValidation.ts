import { z } from "zod";

// Task schema validation using Zod
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["Low", "Medium", "High"], {
    message: "Priority must be one of: Low, Medium, High",
  }),
  status: z.enum(["To Do", "In Progress", "Done"], {
    message: "Status must be one of: To Do, In Progress, Done",
  }),
  pinned: z.boolean().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
    priority: z.enum(["Low", "Medium", "High"], {
    message: "Priority must be one of: Low, Medium, High",
  }).optional(),
  status: z.enum(["To Do", "In Progress", "Done"], {    
    message: "Status must be one of: To Do, In Progress, Done",
  }).optional(),
  pinned: z.boolean().optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  pinned: z.boolean().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  pinned: z.boolean().optional(),
});

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
