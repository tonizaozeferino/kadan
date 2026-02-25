# Story 1.1: Analytics API Endpoint & Aggregation Logic

Status: ready-for-dev

## Story

As a developer,
I want a GET /api/analytics endpoint that returns aggregated productivity data,
so that the frontend can render charts without client-side computation.

## Acceptance Criteria

1. GET /api/analytics returns 200 with JSON matching AnalyticsResponse interface (habitRates, goalVelocity, taskThroughput, weeklySummary)
2. Fresh user with no data gets 200 with zeroed/empty arrays (not errors)
3. ?weeks=8 returns 56 days of habitRates and 8 weeks of taskThroughput
4. Unauthenticated request returns 401
5. Daily habit rate = (habits completed that day / total habits) as percentage, weekly averages per ISO week (Mon-Sun)
6. `npm run build` passes clean with no type errors

## Tasks / Subtasks

- [ ] Task 1 (AC: 1, 5): Create `src/lib/analytics.ts`
  - [ ] Define AnalyticsResponse, WeekStats, GoalVelocityData types
  - [ ] Implement computeHabitRates(habits, days) — daily rates + weekly averages
  - [ ] Implement computeGoalVelocity(goals) — progress rate, projection, status
  - [ ] Implement computeTaskThroughput(tasks, weeks) — per-week per-project counts
  - [ ] Implement computeWeeklySummary(habitRates, goals, tasks, statusEntries) — current vs previous week
- [ ] Task 2 (AC: 1, 3, 4): Create `src/app/api/analytics/route.ts`
  - [ ] Export `const dynamic = "force-dynamic"`
  - [ ] Wrap with withAuth
  - [ ] Parse and validate ?weeks query param (1-12, default 4) with Zod
  - [ ] Fetch habits, goals, tasks, statusEntries for user
  - [ ] Call aggregation functions, return JSON
- [ ] Task 3 (AC: 2): Handle edge cases
  - [ ] No habits → empty habitRates arrays
  - [ ] No goals → empty goalVelocity array
  - [ ] No tasks → empty taskThroughput with zero counts
  - [ ] Invalid weeks param → use default 4
- [ ] Task 4 (AC: 6): Build verification
  - [ ] Run `npm run build` and verify no errors

## Dev Notes

- Use existing patterns from `src/app/api/habits/route.ts` as reference for route structure
- Import db from `@/lib/db`, schema from `@/lib/schema`, withAuth from `@/lib/api-helpers`
- Habit completion dates are stored as TEXT[] (array of YYYY-MM-DD strings) in habits.completedDates
- Tasks have status ('backlog' | 'in_progress' | 'done') and updatedAt timestamp
- Goals have progress (integer) and target (integer)
- Use drizzle `eq(habits.userId, user.id)` pattern for all queries
- ISO week: Monday=1 through Sunday=7. Use date math, not library.
- Status entries have unique constraint on (userId, project, date)

### Project Structure Notes

- New files: `src/lib/analytics.ts`, `src/app/api/analytics/route.ts`
- No modifications to existing files in this story
- Path alias: `@/lib/analytics` for imports

### References

- [Source: docs/project-context.md#API Patterns]
- [Source: _bmad-output/planning-artifacts/architecture-analytics.md#Data Flow]
- [Source: _bmad-output/planning-artifacts/prd-analytics.md#FR-6]
