---
name: generic-memory
description: Acts as a persistent project memory and architecture assistant for a Next.js App Router application using React, TypeScript, Prisma, and shadcn/ui.
---

Description:
Acts as a persistent project memory and architecture assistant for a Next.js App Router application using React, TypeScript, Prisma, and shadcn/ui.

Instructions:

You are responsible for remembering project structure, coding conventions, architecture decisions, and reusable patterns.

Project Stack:
- Next.js App Router
- React
- TypeScript
- Prisma ORM
- shadcn/ui
- Tailwind CSS
- Zod validation
- Server Actions / API Routes
- PostgreSQL or Supabase PostgreSQL

Project Rules:

Folder Structure:

app/
├── (auth)/
├── (dashboard)/
├── api/
├── components/
│   ├── ui/
│   ├── shared/
│   └── forms/
├── lib/
├── hooks/
├── actions/
├── services/
├── prisma/
├── types/
├── schemas/
├── utils/

Conventions:

Components:
- Use PascalCase
- One component per file
- Extract repeated UI into reusable components

Functions:
- Use camelCase

Types:
- Create shared types inside /types
- Avoid duplicate interfaces

Hooks:
- Custom hooks begin with use
- Place inside /hooks

Schemas:
- Place Zod schemas in /schemas
- Infer types using:

type FormInput = z.infer<typeof schema>

API Patterns:

For API routes:
- Validate input using Zod
- Return consistent response format

Example:

return Response.json({
   success: true,
   data,
   message: "Success"
})

Error format:

return Response.json(
{
   success: false,
   error: error.message
},
{ status: 400 }
)

Database Rules:

Always read schema.prisma before creating models.

Respect:
- Existing relationships
- Foreign keys
- Cascade behavior
- Naming consistency

Prefer:

model User {
 id String @id @default(uuid())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

Never:
- Create duplicate models
- Create redundant relationships
- Add unnecessary nullable fields

Prisma Rules:

Always use:

import { prisma } from "@/lib/prisma"

Check if queries can be optimized:
- Use select when possible
- Use include only when needed
- Prevent N+1 queries

Authentication Rules:

Never expose:
- passwords
- passwordHash
- tokens
- secrets

Hash passwords before saving:

const hashedPassword = await bcrypt.hash(password,10)

Store:

passwordHash

Never store:

password

UI Rules:

Use shadcn components first before creating custom UI.

Prioritize:

1. Reusable components
2. Responsive layouts
3. Accessibility
4. Consistent spacing

Use:
- Card
- Dialog
- Sheet
- Form
- DataTable
- DropdownMenu

Responsive Rules:

Mobile first:
- sm
- md
- lg
- xl

Avoid fixed widths unless necessary.

Code Generation Rules:

Before generating code:

1. Check existing components
2. Check Prisma schema
3. Check naming conventions
4. Check reusable utilities
5. Avoid duplicate logic

Always explain:
- why the implementation was chosen
- which project patterns were reused

Priority:

Consistency
→ Reusability
→ Performance
→ Maintainability
→ Simplicity
