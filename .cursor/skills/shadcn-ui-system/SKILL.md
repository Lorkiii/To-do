---
name: shadcn-ui-system
description: Builds and updates responsive React, Next.js, TypeScript interfaces with shadcn/ui. Use when creating or updating UI components, page layouts, dashboard screens, task/project/calendar/profile/settings modules, or reusable frontend patterns in this project.
---

# shadcn UI System

## Role

Act as a senior front-end engineer. Build a responsive UI for a [system name] using React, Next.js, TypeScript, and shadcn/ui.

## Before Coding

1. Read the existing project structure and follow local patterns.
2. For Next.js App Router work, read the relevant guide in `node_modules/next/dist/docs/` before writing code.
3. Check `components.json` and existing `components/ui/` shadcn components before adding new primitives.
4. Keep page-specific code separate from reusable components.

## UI Requirements

The UI must:
- be mobile-first and fully responsive
- use reusable and dynamic components
- support props-based data rendering
- follow clean component composition
- include proper TypeScript typing
- use shadcn/ui for cards, buttons, dialogs, tables, forms, tabs, dropdowns, or other relevant elements
- be visually polished and professional
- include empty/loading states where appropriate
- be easy to extend for future features

## Create

1. A main page layout
2. Reusable UI components
3. Any helper types or mock data needed

## Constraints

- Do not hardcode UI for only one dataset.
- Keep components generic and reusable.
- Use best practices for Next.js App Router.
- Ensure accessibility and semantic HTML.
- Prefer composition over large page files.
- Use descriptive prop names and strict TypeScript types.
- Do not duplicate shadcn/ui primitives; wrap or compose them only when it improves reuse.

## Foldering

Use a structure that separates shared UI from page/module-specific components:

```text
app/
  [module]/
    page.tsx
components/
  ui/
  layout/
  shared/
  [module]/
lib/
  types/
  data/
  utils/
```

Guidelines:
- Put shadcn/ui primitives in `components/ui/`.
- Put cross-page layouts, shells, headers, sidebars, and navigation in `components/layout/`.
- Put reusable domain components in `components/shared/` when used by multiple modules.
- Put module-only components in `components/[module]/`.
- Put helper types in `lib/types/` and mock data in `lib/data/`.

## System Modules

Build for a modern dashboard-style task management system with dark/light mode support.

Dashboard:
- Task statistics
- Completed tasks
- Pending tasks
- Recent activities
- Productivity chart

Tasks:
- Create task
- Edit task
- Delete task
- Mark complete
- Assign priority
- Set due date
- Add tags
- Search tasks
- Filter tasks
- Sort tasks

Projects:
- Create project
- Add multiple tasks
- View project progress

Calendar:
- View tasks by date
- Schedule deadlines

Profile:
- Update profile
- Change password

Settings:
- Dark mode
- Notification settings

## Data Shapes

Use these fields as the default domain model. Extend only when needed by the requested UI.

```ts
export type Task = {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  dueDate: string
  tags: string[]
  createdAt: string
}

export type Project = {
  id: string
  projectName: string
  description: string
  progress: number
}
```

## Component Standards

- Design components around props, not fixed local constants.
- Accept arrays and render dynamic content with stable keys.
- Provide empty states for empty arrays and loading states for async sections.
- Use accessible labels, headings, form controls, focus states, and semantic elements.
- Prefer shadcn/ui components for cards, buttons, dialogs, forms, inputs, tables, tabs, dropdowns, badges, sheets, calendars, and selects.
- Use responsive Tailwind classes starting from mobile defaults, then add `sm:`, `md:`, `lg:`, and `xl:` enhancements.
- Keep visual styling consistent across cards, tables, forms, and navigation.

## Verification

After UI changes:
- Run the project lint/typecheck/build command when available and practical.
- Check responsive behavior for mobile, tablet, and desktop layouts.
- Confirm dark and light mode styles remain readable.
- Confirm components can render different datasets without code changes.
