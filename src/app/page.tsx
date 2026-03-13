"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import HabitsSection from "@/components/HabitsSection";
import GoalsSection from "@/components/GoalsSection";
import StatusSection from "@/components/StatusSection";
import StatusHistory from "@/components/StatusHistory";
import GlobalTaskOverview from "@/components/GlobalTaskOverview";
import ProjectSection from "@/components/ProjectSection";
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
  project: ProjectKey;
}

const PROJECT_KEYS = Object.keys(PROJECTS) as ProjectKey[];

function DashboardInner() {
  const { isLoaded, isSignedIn } = useUser();
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [whatDone, setWhatDone] = useState("");
  const [whatNext, setWhatNext] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const addDays = (dateStr: string, days: number): string => {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const goToPrev = () => setSelectedDate((prev) => addDays(prev, -1));
  const goToNext = () =>
    setSelectedDate((prev) => {
      const next = addDays(prev, 1);
      return next <= todayStr ? next : prev;
    });

  const seedData = useCallback(async () => {
    if (seeded) return;
    try {
      await fetch("/api/seed", { method: "POST" });
      setSeeded(true);
    } catch {
      // Ignore seed errors
    }
  }, [seeded]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, goalsRes, tasksRes, statusRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/goals"),
        fetch("/api/tasks"),
        fetch(`/api/status?project=strachwitz&date=${selectedDate}`),
      ]);

      const [habitsData, goalsData, tasksData, statusData] = await Promise.all([
        habitsRes.ok ? habitsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : [],
        tasksRes.ok ? tasksRes.json() : [],
        statusRes.ok ? statusRes.json() : { whatDone: "", whatNext: "" },
      ]);

      setHabits(Array.isArray(habitsData) ? habitsData : []);
      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setAllTasks(Array.isArray(tasksData) ? tasksData : []);
      setWhatDone(statusData?.whatDone || "");
      setWhatNext(statusData?.whatNext || "");
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

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
        body: JSON.stringify({ date: selectedDate }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    } catch {
      toast.error("Failed to update habit");
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success("Habit deleted");
    } catch {
      toast.error("Failed to delete habit");
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
      if (!res.ok) throw new Error();
      const created = await res.json();
      setHabits((prev) => [...prev, { ...created, currentStreak: 0 }]);
      toast.success("Habit added");
    } catch {
      toast.error("Failed to add habit");
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
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const addGoal = async (goal: { text: string; target: number; unit: string; category: string }) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...goal, project: "strachwitz" }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setGoals((prev) => [...prev, created]);
      toast.success("Goal added");
    } catch {
      toast.error("Failed to add goal");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  // Task actions (per-project)
  const makeAddTask = (project: ProjectKey) => async (text: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, text }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setAllTasks((prev) => [...prev, created]);
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const makeUpdateTaskStatus =
    (_project: ProjectKey) => async (id: string, status: TaskStatus) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch {
        toast.error("Failed to move task");
      }
    };

  const makeUpdateTaskText =
    (_project: ProjectKey) => async (id: string, text: string) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success("Task updated");
      } catch {
        toast.error("Failed to update task");
      }
    };

  const makeDeleteTask = (_project: ProjectKey) => async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  // Status actions (global — stored under "strachwitz" key for backwards compat)
  const saveStatus = async (data: { whatDone: string; whatNext: string }) => {
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "strachwitz",
          whatDone: data.whatDone,
          whatNext: data.whatNext,
          date: selectedDate,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status saved", { duration: 1500 });
    } catch {
      toast.error("Failed to save status");
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
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

  // Split tasks by project
  const tasksByProject = Object.fromEntries(
    PROJECT_KEYS.map((k) => [k, allTasks.filter((t) => t.project === k)])
  ) as Record<ProjectKey, TaskData[]>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Tonizao Dashboard
          </h1>
          <UserButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Date Banner */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              className="p-1 rounded-sm hover:bg-white/20 transition text-xl leading-none"
              aria-label="Previous day"
            >
              ‹
            </button>
            <p className="text-lg font-semibold flex-1">
              {formatDate(new Date(selectedDate + "T00:00:00"))}
              {selectedDate !== todayStr && (
                <span className="ml-2 text-sm font-normal text-blue-200">(past)</span>
              )}
            </p>
            <button
              onClick={goToNext}
              disabled={selectedDate === todayStr}
              className="p-1 rounded-sm hover:bg-white/20 transition text-xl leading-none disabled:opacity-30"
              aria-label="Next day"
            >
              ›
            </button>
          </div>
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
            {/* Global Task Overview */}
            <GlobalTaskOverview tasksByProject={tasksByProject} />

            {/* Daily Status (global) */}
            <StatusSection
              whatDone={whatDone}
              whatNext={whatNext}
              onSave={saveStatus}
            />

            {/* Status History */}
            <StatusHistory />

            {/* Habits (shared) */}
            <HabitsSection
              habits={habits}
              todayStr={selectedDate}
              onToggle={toggleHabit}
              onDelete={deleteHabit}
              onAdd={addHabit}
            />

            {/* SMART Goals (all, global) */}
            <GoalsSection goals={goals} onUpdate={updateGoal} onDelete={deleteGoal} onAdd={addGoal} />

            {/* Project Kanban Boards */}
            {PROJECT_KEYS.map((key) => (
              <ProjectSection
                key={key}
                project={key}
                tasks={tasksByProject[key]}
                onAddTask={makeAddTask(key)}
                onUpdateTaskStatus={makeUpdateTaskStatus(key)}
                onUpdateTaskText={makeUpdateTaskText(key)}
                onDeleteTask={makeDeleteTask(key)}
              />
            ))}
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
