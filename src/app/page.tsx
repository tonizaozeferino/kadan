"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import HabitsSection from "@/components/HabitsSection";
import GoalsSection from "@/components/GoalsSection";
import KanbanBoard from "@/components/KanbanBoard";
import StatusSection from "@/components/StatusSection";
import ProjectSelector from "@/components/ProjectSelector";
import type { ProjectKey, TaskStatus, HabitCategory } from "@/types";
import { PROJECTS } from "@/types";
import { formatDate, getLocalDateString } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";

interface HabitData {
  id: string;
  text: string;
  category: HabitCategory;
  value: string;
  completedDates: string[];
  longestStreak: number;
  currentStreak: number;
}

interface GoalData {
  id: string;
  text: string;
  target: number;
  unit: string;
  progress: number;
  category: string | null;
}

interface TaskData {
  id: string;
  text: string;
  status: TaskStatus;
  date: string;
}

function DashboardInner() {
  const { isLoaded, isSignedIn } = useUser();
  const [project, setProject] = useState<ProjectKey>("strachwitz");
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [whatDone, setWhatDone] = useState("");
  const [whatNext, setWhatNext] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const todayStr = getLocalDateString();

  // Seed default data on first load
  const seedData = useCallback(async () => {
    if (seeded) return;
    try {
      await fetch("/api/seed", { method: "POST" });
      setSeeded(true);
    } catch {
      // Ignore seed errors
    }
  }, [seeded]);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, goalsRes, tasksRes, statusRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/goals"),
        fetch(`/api/tasks?project=${project}`),
        fetch(`/api/status?project=${project}&date=${todayStr}`),
      ]);

      const [habitsData, goalsData, tasksData, statusData] = await Promise.all([
        habitsRes.ok ? habitsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : [],
        tasksRes.ok ? tasksRes.json() : [],
        statusRes.ok ? statusRes.json() : ({ whatDone: "", whatNext: "" }),
      ]);

      setHabits(Array.isArray(habitsData) ? habitsData : []);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setWhatDone(statusData?.whatDone || "");
      setWhatNext(statusData?.whatNext || "");
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [project, todayStr]);

  useEffect(() => {
    if (isSignedIn) {
      seedData().then(() => fetchAll());
    }
  }, [isSignedIn, seedData, fetchAll]);

  // Habit actions
  const toggleHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr }),
      });
      const updated = await res.json();
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? updated : h))
      );
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  };

  const addHabit = async (habit: {
    text: string;
    category: HabitCategory;
    value: string;
  }) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
      });
      const created = await res.json();
      setHabits((prev) => [...prev, { ...created, currentStreak: 0 }]);
    } catch (err) {
      console.error("Failed to add habit:", err);
    }
  };

  // Goal actions
  const updateGoal = async (id: string, progress: number) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  // Task actions
  const addTask = async (text: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, text }),
      });
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Status actions
  const saveStatus = async (data: { whatDone: string; whatNext: string }) => {
    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          whatDone: data.whatDone,
          whatNext: data.whatNext,
          date: todayStr,
        }),
      });
    } catch (err) {
      console.error("Failed to save status:", err);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Tonizao Dashboard
          </h1>
          <p className="text-gray-500 mb-8">
            Your personal productivity dashboard for habits, goals, and project
            management.
          </p>
          <a
            href="/sign-in"
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Sign In to Get Started
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">
              {PROJECTS[project].emoji} {PROJECTS[project].label}
            </h1>
            <ProjectSelector project={project} onChange={setProject} />
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Date Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-lg font-semibold">{formatDate(new Date())}</p>
          <p className="text-blue-100 text-sm">
            Stay focused. Stay consistent. Build the life you want.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {/* Goals */}
            <GoalsSection goals={goals} onUpdate={updateGoal} />

            {/* Habits */}
            <HabitsSection
              habits={habits}
              todayStr={todayStr}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
              onAdd={addHabit}
            />

            {/* Status */}
            <StatusSection
              whatDone={whatDone}
              whatNext={whatNext}
              onSave={saveStatus}
            />

            {/* Kanban */}
            <KanbanBoard
              tasks={tasks}
              project={project}
              onAdd={addTask}
              onUpdateStatus={updateTaskStatus}
              onDelete={deleteTask}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-400">
        Tonizao Dashboard &bull; Built with Next.js, Clerk &amp; PostgreSQL
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardInner />
    </ErrorBoundary>
  );
}
