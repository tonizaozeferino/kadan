// ============================================================
// Kanban Dashboard Types
// ============================================================

export interface User {
  id: string;
  clerkId: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  text: string;
  category: HabitCategory;
  value: string;
  completedDates: string[];
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export type HabitCategory =
  | "routine"
  | "health"
  | "growth"
  | "family"
  | "work"
  | "finance";

export interface Goal {
  id: string;
  userId: string;
  text: string;
  target: number;
  unit: string;
  progress: number;
  category: string | null;
  project: ProjectKey | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  project: ProjectKey;
  text: string;
  status: TaskStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "backlog" | "in_progress" | "done";

export interface StatusEntry {
  id: string;
  userId: string;
  project: ProjectKey;
  whatDone: string | null;
  whatNext: string | null;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectKey = "strachwitz" | "chaunce" | "private";

export const PROJECTS: Record<ProjectKey, { label: string; emoji: string }> = {
  strachwitz: { label: "Strachwitz Consulting", emoji: "🏢" },
  chaunce: { label: "Chaunce Foods", emoji: "🥗" },
  private: { label: "Private", emoji: "🏠" },
};

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  routine: "#a855f7",  // purple
  health: "#10b981",   // green
  work: "#ef4444",     // red
  growth: "#3b82f6",   // blue
  family: "#f59e0b",   // orange
  finance: "#06b6d4",  // cyan
};

export const DEFAULT_HABITS: Omit<Habit, "id" | "userId" | "completedDates" | "longestStreak" | "createdAt" | "updatedAt">[] = [
  { text: "🌅 Wake up at 5 AM", category: "routine", value: "Hard Work" },
  { text: "🏋️ Exercise (30+ min)", category: "health", value: "Health" },
  { text: "📖 Read / Learn (30+ min)", category: "growth", value: "Growth" },
  { text: "📝 Journal & Goal Review", category: "growth", value: "Reflection" },
  { text: "👨‍👧‍👦 Quality Time with Kids", category: "family", value: "Family" },
  { text: "💼 Work on Business/Website", category: "work", value: "Independence" },
  { text: "🥗 Healthy Diet (no junk)", category: "health", value: "Health" },
  { text: "🚫 No Alcohol", category: "health", value: "Resilience" },
  { text: "🛀️ Sleep by 9 PM", category: "routine", value: "Balance" },
  { text: "📋 Daily To-Do List", category: "work", value: "Professionalism" },
];

export const DEFAULT_GOALS: Omit<Goal, "id" | "userId" | "progress" | "createdAt" | "updatedAt">[] = [
  { text: "Financial Independence €13K/month", target: 12, unit: "months", category: "work", project: "strachwitz" },
  { text: "Save €120K for Portugal House", target: 12, unit: "months", category: "finance", project: "strachwitz" },
  { text: "Lose 30 kg (2 kg/week)", target: 24, unit: "weeks", category: "health", project: "private" },
  { text: "Kids Time 3x per week", target: 52, unit: "weeks", category: "family", project: "private" },
  { text: "5 AM Wake-up (6 days/week)", target: 12, unit: "months", category: "routine", project: "private" },
];
