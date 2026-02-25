---
stepsCompleted: [vision, users, metrics, scope]
inputDocuments: [ROADMAP.md, docs/project-context.md]
date: 2026-02-25
author: António
---

# Product Brief: Kadan Dashboard Analytics

## Vision

Give António a single screen that answers "How am I doing?" — across habits, goals, and tasks — without having to mentally aggregate scattered data. The analytics view transforms raw tracking data into visual patterns that reveal productivity trends, habit consistency, and goal velocity.

## Problem Statement

Kadan tracks habits, goals, tasks, and daily status effectively. But there's no way to see the bigger picture:
- Habit completion rates are invisible beyond the 30-day heatmap per habit
- Goal progress is shown per-goal but there's no aggregate trend
- Task throughput (how many tasks move from backlog → done per week) isn't tracked
- No weekly or monthly productivity summary exists
- The user has to mentally compute patterns from raw data

## Target User

António (sole user). Power user who tracks daily across 3 projects, 10+ habits, 5+ goals, and dozens of tasks. Wants data-driven self-improvement insights without extra manual work.

## Success Metrics

1. **Habit completion rate** visible at a glance (% of habits completed today, this week, this month)
2. **Goal velocity** — are goals on track based on current progress rate?
3. **Task throughput** — tasks completed per week across all projects
4. **Weekly summary** — one-screen view of the past 7 days
5. **Zero manual input** — all analytics derive from existing data, no new tracking required

## Scope

### In Scope
- New `/analytics` page (or dashboard tab) with 4 chart sections
- Habit completion rate (daily/weekly/monthly aggregation)
- Goal progress tracking with projected completion
- Task velocity (completed tasks per week, per project)
- Weekly productivity summary card
- Responsive layout (mobile + desktop)

### Out of Scope
- No new database tables (compute from existing data)
- No charting library with heavy bundle size (keep it lightweight)
- No export/PDF generation (separate feature)
- No historical comparison beyond 30 days initially
- No per-habit deep-dive analytics (the heatmap already covers this)

## Key Risks

1. **Data volume**: Computing aggregates over 30+ days of habits/tasks could be slow — may need server-side aggregation
2. **Chart library size**: recharts is ~200KB gzipped — consider lightweight alternatives
3. **Date timezone issues**: Habit dates are YYYY-MM-DD strings, need consistent local-time handling

## Constraints

- Must work within existing Next.js 14 App Router + Tailwind stack
- No new database tables or schema changes
- Must follow existing auth pattern (Clerk + withAuth)
- Must be mobile-responsive
- Charts must be accessible (color-blind friendly, keyboard navigable)
