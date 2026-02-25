---
project_name: 'kadan'
user_name: 'António'
date: '2026-02-25'
sections_completed: ['technology_stack', 'patterns', 'rules', 'schema', 'api', 'components']
existing_patterns_found: 47
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in Kadan. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.35 | App Router framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Strict mode enabled |
| drizzle-orm | 0.45.1 | PostgreSQL ORM |
| postgres | 3.4.8 | DB driver |
| @neondatabase/serverless | 1.0.2 | Neon serverless adapter |
| @clerk/nextjs | 6.36.10 | Authentication |
| Tailwind CSS | 3.4.1 | Styling |
| zod | 4.3.6 | Runtime validation |
| sonner | 2.0.7 | Toast notifications |
| @upstash/redis | 1.36.2 | Rate limiting |

**Path alias:** `@/*` → `./src/*` (tsconfig.json). Never use relative imports.

---

## Critical Implementation Rules

### API Routes

1. **Every route** must export `const dynamic = "force-dynamic"` at top
2. **Every handler** must be wrapped with `withAuth(async (user) => { ... })` from `@/lib/api-helpers`
3. **Validation**: Use Zod `.safeParse()` — return `{ error, details: error.flatten() }` on failure (400)
4. **DB operations**: Use drizzle operators (`eq`, `and`, `or`), always call `.returning()` after insert/update/delete
5. **Rate limiting** is automatic via `withAuth` — do not bypass or re-implement
6. **Response codes**: 200 OK, 201 Created, 400 Bad Input, 401 Unauthorized, 404 Not Found, 429 Rate Limited, 500 Error

### Components

1. **All components** in `src/components/` must start with `"use client"`
2. **Props**: TypeScript interfaces with `Props` suffix (e.g., `HabitsSectionProps`)
3. **Event handlers**: `on*` for props (`onToggle`, `onDelete`), `make*` for factory functions in page.tsx
4. **Wrap handlers** in `useCallback` with proper dependency arrays
5. **Styling**: Pure Tailwind utilities only — no custom CSS beyond `globals.css`
6. **Card pattern**: `bg-white rounded-xl shadow-sm border border-gray-100 p-6`
7. **Toast**: Import `toast` from `sonner`, use `toast.success()` / `toast.error()`

### Database

1. **Schema file**: `src/lib/schema.ts` — update here first, then run migrations
2. **DB singleton**: Import `db` from `@/lib/db` — never create new connections
3. **All tables** have `userId` FK to users with cascade delete
4. **Date format**: Always `YYYY-MM-DD` strings for dates
5. **Table naming**: snake_case (`status_entries`, `completed_dates`)
6. **Column naming**: camelCase in TypeScript, snake_case in DB

### Auth

1. **Middleware** (`src/middleware.ts`): Clerk protects all routes except `/`, `/sign-in`, `/sign-up`
2. **Server-side**: Use `getOrCreateUser()` from `@/lib/auth` — creates user on first login
3. **Client-side**: Use `useUser()` hook from `@clerk/nextjs`
4. **Never** store auth tokens in localStorage — Clerk manages sessions

### Validation Schemas

All in `src/lib/validation.ts`:
- `createHabitSchema`: text (1-255), category (HabitCategory), value (1-100)
- `createGoalSchema`: text, target (>0), unit, category?, project (ProjectKey)
- `createTaskSchema`: project (ProjectKey), text (1-500), status? (TaskStatus)
- `updateTaskSchema`: status?, text? (1-500)
- `updateGoalSchema`: progress (>=0)
- `updateStatusSchema`: project, whatDone?, whatNext?, date?
- `toggleHabitSchema`: date? (YYYY-MM-DD)

---

## Project Constants

```typescript
type ProjectKey = "strachwitz" | "chaunce" | "private"
type TaskStatus = "backlog" | "in_progress" | "done"
type HabitCategory = "routine" | "health" | "growth" | "family" | "work" | "finance"
```

All defined in `src/types/index.ts` with `PROJECTS` and `CATEGORY_COLORS` lookup maps.

---

## File Organization

```
src/app/api/{resource}/route.ts       — GET/POST for collection
src/app/api/{resource}/[id]/route.ts  — PUT/DELETE for single item
src/components/{Name}Section.tsx      — Feature sections
src/lib/{name}.ts                     — Utilities and helpers
src/types/index.ts                    — All shared types and constants
```

**Naming**: PascalCase for components, camelCase for utilities, snake_case for DB.

---

## State Management Pattern

- **No Redux/Context** — simple `useState` + `useCallback` in `page.tsx`
- **Data flow**: `useEffect` fetches on mount → state variables → props to children
- **Optimistic updates**: Mutate local state on success, toast on error
- **Date navigation**: `selectedDate` state, `addDays` helper, capped at today

---

## Common Pitfalls

1. Forgetting `"use client"` on new components
2. Using relative imports instead of `@/` alias
3. Creating new DB connections instead of using the singleton
4. Hardcoding project names instead of using `PROJECTS` constant
5. Not adding Zod schema for new API inputs
6. Not calling `.returning()` on Drizzle insert/update
7. Missing `const dynamic = "force-dynamic"` on API routes
