---
stepsCompleted: [context, decisions, patterns, structure, validation, complete]
inputDocuments: [prd-analytics.md, docs/project-context.md]
---

# Architecture Document - Kadan Dashboard Analytics

**Author:** António
**Date:** 2026-02-25

---

## 1. Architecture Overview

The analytics feature adds one new API route and one new page to the existing Next.js App Router structure. All data is computed server-side from existing database tables — no schema changes, no new tables, no migrations.

```
Client (Analytics Page)          Server (API Route)           Database
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────┐
│ /analytics           │───>│ GET /api/analytics    │───>│ habits       │
│                      │    │                       │    │ goals        │
│ - HabitChart         │<───│ Aggregation logic     │<───│ tasks        │
│ - GoalVelocity       │    │ (TypeScript)          │    │ statusEntries│
│ - TaskThroughput     │    └──────────────────────┘    └──────────────┘
│ - WeeklySummary      │
└──────────────────────┘
```

## 2. Key Decisions

### Decision 1: Charting Library — recharts
**Choice:** recharts
**Rationale:** Most popular React charting library, good Next.js compatibility, responsive containers built in. Bundle size (~45KB gzipped) is within our 50KB budget. Already used widely with Tailwind projects.
**Trade-off:** Heavier than raw SVG, but saves significant dev time and handles responsiveness/accessibility better.
**Alternative considered:** Raw SVG — lighter but much more implementation effort for responsive charts.

### Decision 2: Server-Side Aggregation
**Choice:** Compute all analytics in the API route, return pre-aggregated JSON.
**Rationale:** Keeps client bundle small. Database queries are cheap on Neon (no full table scans — we query by userId). Aggregation logic in TypeScript is straightforward.
**Trade-off:** Slightly slower API response vs. caching raw data client-side. Acceptable for single-user app.

### Decision 3: No Caching Initially
**Choice:** Skip Redis caching for analytics API.
**Rationale:** Single user, data changes at most once per day for habits, a few times per day for tasks. Sub-500ms response expected with Neon. Add caching later if needed.

### Decision 4: Separate Page, Not Tab
**Choice:** `/analytics` as a separate route, not a tab on the main dashboard.
**Rationale:** Keeps the main dashboard fast (no chart library loaded). Analytics data fetching is independent. Navigation via link in header.

## 3. Data Flow

### API: GET /api/analytics?weeks=4

**Input:** Authenticated user, optional `weeks` parameter (1-12, default 4).

**Processing:**
1. Fetch all habits for user (with completedDates arrays)
2. Fetch all goals for user (with progress, target)
3. Fetch all tasks for user within date range (with status, project, createdAt)
4. Fetch status entries for user within date range

**Aggregation (in `src/lib/analytics.ts`):**

```typescript
interface AnalyticsResponse {
  habitRates: {
    daily: { date: string; rate: number; completed: number; total: number }[]
    weeklyAvg: { weekStart: string; rate: number }[]
  }
  goalVelocity: {
    id: string; text: string; progress: number; target: number
    weeklyRate: number; projectedWeeksLeft: number | null
    status: 'ahead' | 'on-track' | 'behind' | 'stalled'
  }[]
  taskThroughput: {
    weekStart: string
    total: number
    byProject: Record<string, number>
  }[]
  weeklySummary: {
    current: WeekStats
    previous: WeekStats
  }
}

interface WeekStats {
  weekStart: string
  habitRate: number
  tasksCompleted: number
  tasksByProject: Record<string, number>
  goalsOnTrack: number
  goalsBehind: number
  goalsAhead: number
  statusEntriesFilled: number
}
```

**Response:** JSON with all four sections.

### Habit Rate Calculation
- For each day in the range: count habits where `completedDates` includes that date
- Rate = completed / total habits (as percentage)
- Weekly average = mean of daily rates within that ISO week

### Goal Velocity Calculation
- Current rate = progress / (weeks since goal creation)
- Projected weeks remaining = (target - progress) / weeklyRate
- Status:
  - `stalled`: no progress change in last 7 days (compare with last week's snapshot — approximated from current data)
  - `behind`: projected completion > 2x current elapsed time
  - `on-track`: projected completion within reasonable range
  - `ahead`: progress exceeds expected pace

### Task Throughput
- Group tasks by ISO week of their `updatedAt` (when moved to `done`)
- Count per project per week
- Note: tasks table has `status` and `updatedAt` — filter status='done' and group by week

### Weekly Summary
- Combines habit rate, task count, goal status counts, and status entry count for current and previous week

## 4. File Structure

```
src/
├── app/
│   ├── analytics/
│   │   └── page.tsx              # Analytics page (client component)
│   └── api/
│       └── analytics/
│           └── route.ts          # GET /api/analytics
├── components/
│   ├── analytics/
│   │   ├── HabitChart.tsx        # Bar chart: daily habit completion rate
│   │   ├── GoalVelocity.tsx      # Progress bars with projections
│   │   ├── TaskThroughput.tsx    # Stacked bar chart: tasks per week
│   │   └── WeeklySummary.tsx     # Summary card with deltas
└── lib/
    └── analytics.ts              # Aggregation logic + types
```

## 5. Component Architecture

### AnalyticsPage (`src/app/analytics/page.tsx`)
- `"use client"`
- Fetches `/api/analytics?weeks=4` on mount
- Loading state with skeleton placeholders
- Error state with retry button
- Renders 4 chart components in a 2x2 grid (responsive: 1 column on mobile)
- Header with back link to main dashboard

### HabitChart
- Props: `data: { date: string; rate: number }[]`
- recharts `ResponsiveContainer` + `BarChart`
- Green bars, percentage Y-axis
- Shows current week highlighted

### GoalVelocity
- Props: `goals: GoalVelocityData[]`
- No charting library needed — Tailwind progress bars
- Each goal: name, progress/target, status badge, projected weeks remaining
- Color-coded: green (ahead/on-track), amber (behind), red (stalled)

### TaskThroughput
- Props: `data: { weekStart: string; total: number; byProject: Record<string, number> }[]`
- recharts `ResponsiveContainer` + `BarChart` with stacked bars
- Project colors match existing `PROJECTS` emoji/color mapping

### WeeklySummary
- Props: `current: WeekStats, previous: WeekStats`
- Card layout matching existing Kadan card style
- Delta arrows (green up, red down) comparing current vs previous

## 6. Navigation

Add analytics link to the main page header:
- In `src/app/page.tsx`, add a link/button next to the date navigation: "Analytics" → `/analytics`
- On the analytics page, add "Back to Dashboard" link

## 7. Dependencies

### New Package
- `recharts` (~45KB gzipped) — install via `npm install recharts`

### No Other Changes
- No schema changes
- No migration files
- No new environment variables
- No middleware changes

## 8. Testing Strategy

- **API route**: Verify response shape matches `AnalyticsResponse` type
- **Edge cases**: User with no habits, no tasks, no goals — should return zeroes, not errors
- **Date handling**: Verify ISO week boundaries work correctly
- **Build**: `npm run build` must pass clean
