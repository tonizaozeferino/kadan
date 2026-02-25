---
stepsCompleted: [discovery, vision, executive-summary, success, journeys, domain, scoping, functional, nonfunctional, complete]
inputDocuments: [product-brief-analytics.md, docs/project-context.md]
workflowType: 'prd'
---

# Product Requirements Document - Kadan Dashboard Analytics

**Author:** António
**Date:** 2026-02-25

---

## 1. Executive Summary

Add a read-only analytics dashboard to Kadan that surfaces productivity insights from existing habit, goal, task, and status data. Four visualization sections — habit consistency, goal velocity, task throughput, and a weekly summary — give António an at-a-glance answer to "How am I doing?" without any manual data entry.

## 2. Problem & Motivation

Kadan captures daily productivity data across habits (completions), goals (progress), tasks (status transitions), and daily status entries. But the user can only see this data in its raw form — individual habit heatmaps, per-goal progress bars, and per-project Kanban boards. There's no aggregate view that reveals patterns over time.

**User need:** "I want to see whether I'm actually improving week over week, not just check boxes."

## 3. User Journeys

### Journey 1: Morning Review
António opens Kadan in the morning. He clicks the "Analytics" tab. In 10 seconds he sees: habit completion rate (78% this week, up from 65% last week), 3 of 5 goals on track, 12 tasks completed last week. He notices task velocity dropped on Chaunce project and makes a mental note.

### Journey 2: Weekly Reflection
Sunday evening. António opens Analytics to review the week. The weekly summary card shows a compact view: habits completed 54/70 (77%), goals progressing (2 ahead, 1 behind, 2 on track), tasks completed 14 (Strachwitz: 6, Chaunce: 3, Private: 5). He compares with the previous week's numbers shown alongside.

### Journey 3: Goal Check
Mid-month. António wants to know if his goals will be met by their deadlines. The goal velocity section shows projected completion dates based on current progress rate. Two goals are behind pace — he can focus effort there.

## 4. Functional Requirements

### FR-1: Analytics Page
- New route at `/analytics` accessible from main navigation
- Page header consistent with existing dashboard style
- Tab or nav link added to main page to reach analytics

### FR-2: Habit Completion Analytics
- Show daily completion rate (habits completed / total habits) for the last 30 days
- Show weekly average completion rate (current week vs previous 3 weeks)
- Visual: bar chart or area chart showing daily rates over 30 days
- Highlight current week's average prominently

### FR-3: Goal Velocity
- For each active goal: current progress vs target, with percentage
- Projected completion based on progress rate (progress per week extrapolated)
- Status indicator: ahead / on-track / behind / stalled (no progress in 7+ days)
- Visual: horizontal progress bars with projected markers

### FR-4: Task Throughput
- Tasks completed per week for the last 4 weeks
- Breakdown by project (Strachwitz, Chaunce, Private)
- Visual: stacked bar chart (one bar per week, stacked by project)
- Show total completed count per week

### FR-5: Weekly Summary Card
- Compact card showing this week's stats:
  - Habit completion rate (%)
  - Tasks completed (total + per project)
  - Goals on track / behind / ahead
  - Status entries filled (how many daily status logs this week)
- Previous week's numbers shown for comparison (with delta arrows)

### FR-6: API Endpoint
- `GET /api/analytics` returns all computed analytics data as JSON
- Accepts optional `?weeks=N` parameter (default 4, max 12)
- Returns: habitRates[], goalVelocity[], taskThroughput[], weeklySummary
- Protected with withAuth, rate-limited

## 5. Non-Functional Requirements

### NFR-1: Performance
- API response time < 500ms for 4-week window
- Page load time < 2 seconds on mobile
- No blocking of main dashboard functionality

### NFR-2: Bundle Size
- Chart rendering library must add < 50KB gzipped to bundle
- Prefer lightweight: recharts-lite, or raw SVG, or CSS-only charts for simple visualizations

### NFR-3: Responsiveness
- Charts must resize gracefully on mobile (< 640px)
- Summary card must be readable on mobile without horizontal scroll
- Consider chart simplification on mobile (fewer data points, no hover tooltips)

### NFR-4: Accessibility
- Charts must have alt text or aria labels
- Color alone must not convey meaning (use shapes/patterns or labels alongside color)
- Keyboard navigable

### NFR-5: Data Integrity
- All calculations must use UTC-normalized YYYY-MM-DD strings
- Week boundaries: Monday to Sunday (ISO 8601)
- Handle edge cases: new users with no data, habits with 0 completions

## 6. Technical Approach (Summary)

- **Charting**: Use recharts (already well-supported in Next.js ecosystem). If bundle too large, fall back to raw SVG components.
- **Data aggregation**: Server-side in the API route. Query habits/goals/tasks once, compute aggregates in TypeScript, return structured JSON.
- **No new DB tables**: All analytics derived from existing tables (habits.completedDates, goals.progress/target, tasks.status+createdAt).
- **Caching**: None initially. If API is slow, add Upstash Redis cache with 15-min TTL.

## 7. Out of Scope

- Historical comparison beyond 12 weeks
- Per-habit deep-dive analytics
- Export to PDF/CSV
- Goal deadline dates (goals don't have deadlines in current schema)
- Notifications or alerts based on analytics
- Comparison with other users
