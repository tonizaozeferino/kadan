/**
 * Calculate the current streak from an array of completed date strings (YYYY-MM-DD).
 */
export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort().reverse();
  const today = getLocalDateString();
  const yesterday = getLocalDateString(-1);

  // Streak must include today or yesterday to be active
  if (sorted[0] !== today && sorted[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1]);
    const prev = new Date(sorted[i]);
    const diffMs = current.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get local date string in YYYY-MM-DD format.
 */
export function getLocalDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
