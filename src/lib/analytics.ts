// Analytics aggregation logic — pure computation, no DB/framework imports

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnalyticsResponse {
  habitRates: {
    daily: { date: string; rate: number; completed: number; total: number }[];
    weeklyAvg: { weekStart: string; rate: number }[];
  };
  goalVelocity: GoalVelocityData[];
  taskThroughput: {
    weekStart: string;
    total: number;
    byProject: Record<string, number>;
  }[];
  weeklySummary: {
    current: WeekStats;
    previous: WeekStats;
  };
}

export interface WeekStats {
  weekStart: string;
  habitRate: number;
  tasksCompleted: number;
  tasksByProject: Record<string, number>;
  goalsOnTrack: number;
  goalsBehind: number;
  goalsAhead: number;
  statusEntriesFilled: number;
}

export interface GoalVelocityData {
  id: string;
  text: string;
  progress: number;
  target: number;
  weeklyRate: number;
  projectedWeeksLeft: number | null;
  status: "ahead" | "on-track" | "behind" | "stalled";
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns the Monday (ISO week start) for a given YYYY-MM-DD string. */
function getISOWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDate(d);
}

/** Returns an array of YYYY-MM-DD strings for the last `days` days (inclusive of today). */
function getDaysArray(days: number): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

// ─── Aggregation functions ───────────────────────────────────────────────────

export function computeHabitRates(
  habits: { completedDates: string[] }[],
  days: number
): AnalyticsResponse["habitRates"] {
  const dates = getDaysArray(days);
  const total = habits.length;

  const daily = dates.map((date) => {
    const completed =
      total === 0
        ? 0
        : habits.filter((h) => h.completedDates.includes(date)).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { date, rate, completed, total };
  });

  // Group daily rates by ISO week and average
  const weekMap = new Map<string, number[]>();
  for (const d of daily) {
    const weekStart = getISOWeekStart(d.date);
    if (!weekMap.has(weekStart)) weekMap.set(weekStart, []);
    weekMap.get(weekStart)!.push(d.rate);
  }

  const weeklyAvg = Array.from(weekMap.entries())
    .map(([weekStart, rates]) => ({
      weekStart,
      rate: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  return { daily, weeklyAvg };
}

export function computeGoalVelocity(
  goals: { id: string; text: string; progress: number; target: number; createdAt: Date }[]
): GoalVelocityData[] {
  const now = Date.now();

  return goals.map((goal) => {
    const msElapsed = now - goal.createdAt.getTime();
    const weeksElapsed = Math.max(1, msElapsed / (7 * 24 * 60 * 60 * 1000));
    const weeklyRate = goal.progress / weeksElapsed;
    const remaining = goal.target - goal.progress;
    const projectedWeeksLeft =
      weeklyRate > 0 ? remaining / weeklyRate : null;

    let status: GoalVelocityData["status"];
    if (goal.progress >= goal.target) {
      status = "on-track";
    } else if (weeklyRate < 0.1) {
      status = "stalled";
    } else {
      const projectedTotalWeeks = goal.target / weeklyRate;
      if (projectedTotalWeeks > 2 * weeksElapsed) {
        status = "behind";
      } else if (
        projectedWeeksLeft !== null &&
        projectedWeeksLeft < weeksElapsed * 0.5
      ) {
        status = "ahead";
      } else {
        status = "on-track";
      }
    }

    return {
      id: goal.id,
      text: goal.text,
      progress: goal.progress,
      target: goal.target,
      weeklyRate: Math.round(weeklyRate * 100) / 100,
      projectedWeeksLeft:
        projectedWeeksLeft !== null
          ? Math.round(projectedWeeksLeft * 10) / 10
          : null,
      status,
    };
  });
}

export function computeTaskThroughput(
  tasks: { status: string; project: string; updatedAt: Date }[],
  weeks: number
): AnalyticsResponse["taskThroughput"] {
  const doneTasks = tasks.filter((t) => t.status === "done");

  // Build the set of week-start Mondays covering the range
  const today = new Date();
  const currentWeekStart = getISOWeekStart(formatDate(today));
  const weekStarts: string[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(currentWeekStart + "T00:00:00");
    d.setDate(d.getDate() - i * 7);
    weekStarts.push(formatDate(d));
  }

  // Initialise each week bucket
  const weekMap = new Map<
    string,
    { total: number; byProject: Record<string, number> }
  >();
  for (const ws of weekStarts) {
    weekMap.set(ws, { total: 0, byProject: {} });
  }

  // Distribute done tasks into week buckets
  for (const task of doneTasks) {
    const taskWeekStart = getISOWeekStart(formatDate(task.updatedAt));
    const entry = weekMap.get(taskWeekStart);
    if (entry) {
      entry.total++;
      entry.byProject[task.project] =
        (entry.byProject[task.project] || 0) + 1;
    }
  }

  return weekStarts.map((weekStart) => ({
    weekStart,
    ...(weekMap.get(weekStart) ?? { total: 0, byProject: {} }),
  }));
}

export function computeWeeklySummary(
  habitRates: AnalyticsResponse["habitRates"],
  goalVelocity: GoalVelocityData[],
  tasks: { status: string; project: string; updatedAt: Date }[],
  statusEntries: { date: string }[]
): AnalyticsResponse["weeklySummary"] {
  const today = new Date();
  const currentWeekStart = getISOWeekStart(formatDate(today));

  const prevWeekDate = new Date(currentWeekStart + "T00:00:00");
  prevWeekDate.setDate(prevWeekDate.getDate() - 7);
  const previousWeekStart = formatDate(prevWeekDate);

  function weekEndStr(weekStart: string): string {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + 6);
    return formatDate(d);
  }

  function buildWeekStats(weekStart: string): WeekStats {
    const end = weekEndStr(weekStart);

    // Habit rate — average of daily rates within the week
    const weekDailyRates = habitRates.daily.filter(
      (d) => d.date >= weekStart && d.date <= end
    );
    const habitRate =
      weekDailyRates.length > 0
        ? Math.round(
            weekDailyRates.reduce((sum, d) => sum + d.rate, 0) /
              weekDailyRates.length
          )
        : 0;

    // Tasks completed this week
    const doneTasks = tasks.filter((t) => {
      if (t.status !== "done") return false;
      const taskDate = formatDate(t.updatedAt);
      return taskDate >= weekStart && taskDate <= end;
    });
    const tasksByProject: Record<string, number> = {};
    for (const t of doneTasks) {
      tasksByProject[t.project] = (tasksByProject[t.project] || 0) + 1;
    }

    // Goal status counts (current snapshot — no historical data available)
    const goalsOnTrack = goalVelocity.filter(
      (g) => g.status === "on-track"
    ).length;
    const goalsBehind = goalVelocity.filter(
      (g) => g.status === "behind"
    ).length;
    const goalsAhead = goalVelocity.filter(
      (g) => g.status === "ahead"
    ).length;

    // Status entries filled during the week
    const statusEntriesFilled = statusEntries.filter(
      (se) => se.date >= weekStart && se.date <= end
    ).length;

    return {
      weekStart,
      habitRate,
      tasksCompleted: doneTasks.length,
      tasksByProject,
      goalsOnTrack,
      goalsBehind,
      goalsAhead,
      statusEntriesFilled,
    };
  }

  return {
    current: buildWeekStats(currentWeekStart),
    previous: buildWeekStats(previousWeekStart),
  };
}
