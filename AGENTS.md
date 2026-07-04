<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:medtrack-agent-rules -->

# MedTrack Coding Standards & Architecture

You are working on the MedTrack project. You MUST adhere to the following architecture, standards, and rules for every change you make in this repository.

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Backend / DB**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Components**: ShadCN UI v4 (Base UI), Lucide React
- **State / Fetching**: TanStack Query (React Query) for CSR, Next.js async components for SSR.
- **Forms**: React Hook Form + Zod

## Architecture & Data Fetching

- **Intelligent SSR/CSR Mix**:
  - Use Server Components (SSR) for fast initial page loads and reading data.
  - Use React Server Components wrapped in React `<Suspense>` boundaries with Shadcn `<Skeleton>` fallbacks for fetching API data. DO NOT block the entire page shell from rendering while waiting for data.
  - Use Client Components (CSR) for highly interactive UI (forms, search, tables). Use TanStack Query hooks in `hooks/` to manage client-side fetching and mutations.
- **Supabase Setup**:
  - Server Components should use `import { createClient } from '@/lib/supabase/server'`.
  - RLS (Row-Level Security) is ENABLED on tables, but for this prototype, policies must allow public (anon) access. See `001-init.sql`.
  - Database IDs use UUIDv7 (time-sortable) via a custom PL/pgSQL function.

## Coding Standards

1.  **Single Responsibility Principle (SRP)**: Each file/function must do one thing well. Do not overengineer. Add a brief `// SRP: [description]` comment at the top of component files to explain their purpose.
2.  **Naming Conventions**: Use `kebab-case` for all file names and directory names (e.g., `patient-form.tsx`, `use-patients.ts`).
3.  **UI / UX / Styling**:
    - The application must prioritize speed, minimal typing, and ease of use.
    - Support Dark Mode fully using Tailwind's `dark:` classes.
    - Avoid empty spaces on large screens. Do not arbitrarily constrain main dashboard content widths (e.g., avoid `max-w-6xl` if it leaves half the screen empty).
    - **Sheet/Drawer Padding**: Shadcn v4 `SheetContent` does NOT have default inner padding. If you render a form inside a Sheet, you MUST wrap it in a container with padding (e.g., `<div className="px-4 pb-4">`) so inputs don't touch the screen edges.
4.  **Forms & React Hook Form**: \* Never let a controlled component (like Shadcn/BaseUI `Select`) start as uncontrolled. Always provide a default value (e.g., `"male"` or `""`, never `undefined`) in the `useForm` defaultValues.
5.  **Error Handling**: NEVER expose raw technical error messages (e.g., SQL errors, schema cache errors, stack traces) to the user via UI toasts or console logs. Always catch errors and display friendly, user-centric messages (e.g., "Failed to save visit. Please try again.").
<!-- END:medtrack-agent-rules -->
