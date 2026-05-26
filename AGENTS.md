---
name: general-rule
---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Validation

Before finishing code changes:

- Run the narrowest relevant validation first, such as lint, typecheck, or focused tests.
- For Next.js changes, prefer the project scripts from `package.json`.
- For API route changes, validate request parsing, error responses, and success responses.
- If validation cannot be run, state the blocker clearly.

## Naming

- Use camelCase for variables, functions, object properties, service functions, schema values, and helper names.
- Keep framework-required casing unchanged, such as PascalCase React components and types, uppercase environment variables, Prisma model names, and existing file or route segment conventions.

### Folder structure

-The project should have a reusable dashboard layout, shared UI components, feature-based components, hooks, services, types, and utility folders.

Do not focus on exact file names. Instead, show the folder pattern and explain the purpose of each folder so I know where to put reusable dashboard UI, task components, modals, API logic, hooks, and types.

Make it clean, beginner-friendly, and easy to maintain as the app grows.


- app folder
- components/ui
- components/layout
- components/features
- hooks
- services
- lib
- types