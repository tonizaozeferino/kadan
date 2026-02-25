---
stepsCompleted: [validate-prerequisites, design-epics, create-stories, final-validation]
inputDocuments: [prd-analytics.md, architecture-analytics.md, docs/project-context.md]
---

# Kadan Dashboard Analytics - Epic Breakdown

## Overview

Decomposes the analytics PRD into 3 epics and 7 stories, ordered for incremental delivery. Each epic produces a working, testable increment.

## Requirements Coverage

| Requirement | Epic | Story |
|------------|------|-------|
| FR-6: API Endpoint | Epic 1 | 1.1 |
| FR-2: Habit Analytics | Epic 2 | 2.1 |
| FR-3: Goal Velocity | Epic 2 | 2.2 |
| FR-4: Task Throughput | Epic 2 | 2.3 |
| FR-5: Weekly Summary | Epic 2 | 2.4 |
| FR-1: Analytics Page + Navigation | Epic 3 | 3.1, 3.2 |
| NFR-1-5: Performance, Bundle, Responsive, A11y, Data | All | All |

## Epic List

1. **Epic 1: Analytics API & Data Layer** — Server-side aggregation logic and API endpoint
2. **Epic 2: Chart Components** — Individual visualization components (habit, goal, task, summary)
3. **Epic 3: Analytics Page & Navigation** — Page assembly, routing, and dashboard integration

---

## Epic 1: Analytics API & Data Layer

Build the server-side aggregation logic and API endpoint that computes all analytics from existing data. This epic has no UI — it produces a tested API that returns structured JSON.

### Story 1.1: Analytics API Endpoint & Aggregation Logic

As a developer,
I want a GET /api/analytics endpoint that returns aggregated productivity data,
so that the frontend can render charts without client-side computation.

**Acceptance Criteria:**

1. **Given** an authenticated user with habits, goals, and tasks
   **When** GET /api/analytics is called
   **Then** response is 200 with JSON matching the AnalyticsResponse interface
   **And** response includes habitRates, goalVelocity, taskThroughput, weeklySummary

2. **Given** an authenticated user with no data (fresh account)
   **When** GET /api/analytics is called
   **Then** response is 200 with zeroed/empty arrays (not errors)

3. **Given** a request with ?weeks=8
   **When** GET /api/analytics?weeks=8 is called
   **Then** habitRates.daily covers the last 56 days
   **And** taskThroughput covers 8 weeks

4. **Given** an unauthenticated request
   **When** GET /api/analytics is called
   **Then** response is 401 Unauthorized

5. **Given** habit data exists
   **When** aggregation runs
   **Then** daily habit rate = (habits completed that day / total habits) as percentage
   **And** weekly averages are computed correctly per ISO week (Mon-Sun)

6. **Given** the API route
   **When** `npm run build` is executed
   **Then** build passes clean with no type errors

**Tasks:**

1. Create `src/lib/analytics.ts` with types (AnalyticsResponse, WeekStats, GoalVelocityData) and aggregation functions (computeHabitRates, computeGoalVelocity, computeTaskThroughput, computeWeeklySummary)
2. Create `src/app/api/analytics/route.ts` with GET handler using withAuth, rate limiting, Zod validation for query params
3. Wire up aggregation: fetch habits/goals/tasks/status for user, call compute functions, return JSON
4. Handle edge cases: no data, invalid weeks param, zero habits
5. Verify `npm run build` passes

---

## Epic 2: Chart Components

Build the four visualization components. Each is independent and testable in isolation.

### Story 2.1: Habit Completion Chart

As António,
I want to see my daily habit completion rate over the last 30 days as a bar chart,
so that I can spot consistency patterns and drops in my routine.

**Acceptance Criteria:**

1. **Given** habitRates data from the API
   **When** HabitChart renders
   **Then** a bar chart shows one bar per day for the last 30 days
   **And** Y-axis shows percentage (0-100%)
   **And** bars are green-colored

2. **Given** the chart is on a mobile screen (< 640px)
   **When** the page renders
   **Then** the chart resizes to fit without horizontal scroll

3. **Given** habitRates with weekly averages
   **When** HabitChart renders
   **Then** current week's average is displayed prominently as a number above the chart

4. **Given** the component
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Install recharts: `npm install recharts`
2. Create `src/components/analytics/HabitChart.tsx` — "use client", ResponsiveContainer, BarChart, typed props
3. Style with Tailwind wrapper, green bars, percentage axis
4. Show weekly average as stat above the chart
5. Verify responsive behavior and build

### Story 2.2: Goal Velocity Display

As António,
I want to see each goal's progress with a projected completion indicator,
so that I can identify which goals need more attention.

**Acceptance Criteria:**

1. **Given** goalVelocity data from the API
   **When** GoalVelocity renders
   **Then** each goal shows: name, progress/target, percentage, status badge
   **And** a Tailwind progress bar visualizes current progress

2. **Given** a goal with status 'stalled'
   **When** GoalVelocity renders
   **Then** the goal is highlighted with a red/amber indicator

3. **Given** a goal with status 'ahead' or 'on-track'
   **When** GoalVelocity renders
   **Then** the goal shows a green indicator

4. **Given** the component
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Create `src/components/analytics/GoalVelocity.tsx` — "use client", Tailwind progress bars (no recharts needed)
2. Map status to color: ahead/on-track → green, behind → amber, stalled → red
3. Show projected weeks remaining for each goal
4. Verify build

### Story 2.3: Task Throughput Chart

As António,
I want to see how many tasks I complete per week, broken down by project,
so that I can track my execution velocity and balance across projects.

**Acceptance Criteria:**

1. **Given** taskThroughput data from the API
   **When** TaskThroughput renders
   **Then** a stacked bar chart shows one bar per week for the last 4 weeks
   **And** each bar is stacked by project with distinct colors

2. **Given** project data
   **When** TaskThroughput renders
   **Then** project colors use existing project color scheme from types/index.ts
   **And** a legend shows project names with colors

3. **Given** the chart
   **When** viewed on mobile
   **Then** it resizes gracefully

4. **Given** the component
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Create `src/components/analytics/TaskThroughput.tsx` — "use client", ResponsiveContainer, BarChart with stacked bars
2. Map project keys to colors (Strachwitz, Chaunce, Private)
3. Add legend and week labels
4. Verify build

### Story 2.4: Weekly Summary Card

As António,
I want a compact summary card comparing this week vs last week,
so that I can see my trend at a glance without interpreting charts.

**Acceptance Criteria:**

1. **Given** weeklySummary data (current + previous)
   **When** WeeklySummary renders
   **Then** card shows: habit rate %, tasks completed, goals on-track/behind/ahead, status entries filled

2. **Given** current week habit rate is higher than previous
   **When** WeeklySummary renders
   **Then** a green up arrow and delta percentage is shown next to habit rate

3. **Given** current week tasks completed is lower than previous
   **When** WeeklySummary renders
   **Then** a red down arrow and delta is shown next to task count

4. **Given** the card
   **When** viewed on mobile
   **Then** it stacks vertically and remains readable

5. **Given** the component
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Create `src/components/analytics/WeeklySummary.tsx` — "use client", Tailwind card layout
2. Compute deltas (current - previous) for each metric
3. Render up/down arrows with green/red coloring
4. Match existing card style (bg-white rounded-xl shadow-sm border)
5. Verify build

---

## Epic 3: Analytics Page & Navigation

Assemble components into a page and integrate with the main dashboard.

### Story 3.1: Analytics Page Assembly

As António,
I want an /analytics page that displays all four analytics sections in a clean layout,
so that I can see all my productivity insights in one place.

**Acceptance Criteria:**

1. **Given** the user navigates to /analytics
   **When** the page loads
   **Then** it fetches /api/analytics and displays all 4 components
   **And** shows loading skeletons while data loads

2. **Given** the API returns an error
   **When** the page renders
   **Then** an error message with retry button is shown

3. **Given** a desktop viewport
   **When** the page renders
   **Then** components are arranged in a 2x2 grid

4. **Given** a mobile viewport
   **When** the page renders
   **Then** components stack vertically (single column)

5. **Given** the page
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Create `src/app/analytics/page.tsx` — "use client", fetch on mount, loading/error states
2. Import all 4 analytics components
3. Layout: 2x2 grid on desktop, 1-col on mobile
4. Add page header with "Analytics" title and "Back to Dashboard" link
5. Verify build

### Story 3.2: Dashboard Navigation Link

As António,
I want an "Analytics" link on the main dashboard,
so that I can navigate to the analytics page easily.

**Acceptance Criteria:**

1. **Given** the main dashboard page
   **When** it renders
   **Then** an "Analytics" link/button is visible in the header area

2. **Given** the user clicks "Analytics"
   **When** navigation occurs
   **Then** the user lands on /analytics

3. **Given** the analytics page
   **When** the user clicks "Back to Dashboard"
   **Then** the user returns to the main page

4. **Given** the change
   **When** `npm run build` is executed
   **Then** build passes with no errors

**Tasks:**

1. Edit `src/app/page.tsx` — add Next.js Link to /analytics in the header
2. Style consistent with existing header elements
3. Verify build
