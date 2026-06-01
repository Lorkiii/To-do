import { z, ZodError } from "zod";

import { validationRules } from "./validationRules";
import { namePattern, emailPattern, usernamePattern } from "./validationRules";

type EnumValues = readonly [string, ...string[]];
type TextRule = {
  label: string;
  minLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
};

function formatList(values: readonly string[]) {
  return values.join(", ");
}
function nameValidation(label: string) {
  return z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .regex(namePattern, `Invalid ${label.toLowerCase()}. Only letters are allowed.`);
}


// required text
function requiredText(rule: TextRule) {
  const minLength = rule.minLength ?? 1;
  const message =
    minLength === 1
      ? `${rule.label} is required`
      : `${rule.label} must be at least ${minLength} characters long`;

  let schema = z.string({ error: message }).trim().min(minLength, message);

  if (rule.pattern) {
    schema = schema.regex(
      rule.pattern,
      rule.patternMessage ?? `${rule.label} has invalid characters`,
    );
  }

  return schema;
}

// optional text
function optionalText() {
  return z.string().trim().optional();
}
//email field
function emailField(rule: TextRule) {
  return z
    .string({ error: `${rule.label} is required` })
    .trim()
    .min(1, `${rule.label} is required`)
    .regex(emailPattern, `Invalid ${rule.label.toLowerCase()}`);
}


function enumField(label: string, values: EnumValues) {
  return z.enum(values, {
    message: `${label} must be one of: ${formatList(values)}`,
  });
}

function optionalDateField(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: `${label} must be a valid date`,
    });
}

export function getFirstValidationMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid request data.";
}

export function validateField<T>(schema: z.ZodType<T>, value: unknown) {
  const result = schema.safeParse(value);

  if (result.success) {
    return "";
  }

  return getFirstValidationMessage(result.error);
}
// Task request fields.
const taskFields = {
  title: requiredText(validationRules.task.title),
  description: requiredText(validationRules.task.description),
  priority: enumField(
    validationRules.task.priority.label,
    validationRules.task.priority.values,
  ),
  status: enumField(
    validationRules.task.status.label,
    validationRules.task.status.values,
  ),
  dueDate: optionalDateField("Due date"),
  checklistItems: z
    .array(requiredText(validationRules.checklistItem.title))
    .optional(),
  pinned: z.boolean().optional(),
};

// Template request fields.
const taskTemplateFields = {
  // Template name is extra; the other fields mirror task defaults.
  name: requiredText(validationRules.taskTemplate.name),
  title: taskFields.title,
  description: taskFields.description,
  priority: taskFields.priority,
  status: taskFields.status,
  checklistItems: taskFields.checklistItems,
};

// Post request fields.
const postFields = {
  title: requiredText(validationRules.post.title),
  content: requiredText(validationRules.post.content),
  pinned: z.boolean().optional(),
};

export const accountFieldSchemas = {
  firstName: nameValidation(validationRules.user.firstName.label),
  middleName: optionalText(),
  lastName: nameValidation(validationRules.user.lastName.label),
  username: requiredText({
    label: validationRules.user.username.label,
    minLength: validationRules.user.username.minLength,
    pattern: usernamePattern,
    patternMessage: validationRules.user.username.patternMessage,
  }),
  email: emailField({
    label: validationRules.user.email.label,
    pattern: emailPattern,
  }),
  password: requiredText({
    label: validationRules.user.password.label,
    minLength: validationRules.user.password.minLength,
  }),
};

export const loginIdentifierSchema = z
  .string({ error: "Email or username is required" })
  .trim()
  .min(1, "Email or username is required")
  .superRefine((value, context) => {
    if (!value) {
      return;
    }

    if (value.includes("@")) {
      if (!emailPattern.test(value)) {
        context.addIssue({
          code: "custom",
          message: "Invalid email address",
        });
      }

      return;
    }

    if (value.length < validationRules.user.username.minLength) {
      context.addIssue({
        code: "custom",
        message: `${validationRules.user.username.label} must be at least ${validationRules.user.username.minLength} characters long`,
      });
      return;
    }

    if (!usernamePattern.test(value)) {
      context.addIssue({
        code: "custom",
        message: validationRules.user.username.patternMessage,
      });
    }
  });

export const loginFieldSchemas = {
  emailOrUsername: loginIdentifierSchema,
  password: requiredText(validationRules.user.password),
};

// Schemas are composed from shared rules so field constraints stay in one place.
export const createTaskSchema = z.object(taskFields);
export const updateTaskSchema = z.object(taskFields).partial();
export const createTaskTemplateSchema = z.object(taskTemplateFields);
export const updateTaskTemplateSchema = z.object(taskTemplateFields).partial();

export const createPostSchema = z.object(postFields);
export const updatePostSchema = z.object(postFields).partial();

export const userSchema = z.object(accountFieldSchemas);

export const loginSchema = z.object(loginFieldSchemas);
