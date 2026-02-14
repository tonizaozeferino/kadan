"use client";

import { useState, useCallback } from "react";
import { CATEGORY_COLORS } from "@/types";
import type { HabitCategory } from "@/types";

interface HabitData {
  id: string;
  text: string;
  category: HabitCategory;
  value: string;
  completedDates: string[];
  longestStreak: number;
  currentStreak: number;
}

interface HabitsSectionProps {
  habits: HabitData[];
  todayStr: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (habit: { text: string; category: HabitCategory; value: string }) => void;
}

const CATEGORIES: { key: HabitCategory; label: string }[] = [
  { key: "routine", label: "Routine" },
  { key: "health", label: "Health" },
  { key: "work", label: "Work" },
  { key: "growth", label: "Growth" },
  { key: "family", label: "Family" },
  { key: "finance", label: "Finance" },
];

export default function HabitsSection({
  habits,
  todayStr,
  onToggle,
  onDelete,
  onAdd,
}: HabitsSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState<HabitCategory>("routine");
  const [newValue, setNewValue] = useState("");

  const handleAdd = useCallback(() => {
    if (!newText.trim() || !newValue.trim()) return;
    onAdd({ text: newText.trim(), category: newCategory, value: newValue.trim() });
    setNewText("");
    setNewValue("");
    setShowAdd(false);
  }, [newText, newCategory, newValue, onAdd]);

  // Group habits by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    habits: habits.filter((h) => h.category === cat.key),
    color: CATEGORY_COLORS[cat.key],
  })).filter((g) => g.habits.length > 0);

  const completedCount = habits.filter((h) =>
    h.completedDates.includes(todayStr)
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daily Habits</h2>
          <p className="text-sm text-gray-500">
            {completedCount}/{habits.length} completed today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
        >
          + Add Habit
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Habit text..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as HabitCategory)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Value (e.g. Health)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
          >
            Add Habit
          </button>
        </div>
      )}

      {/* Habits by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {group.label}
              </span>
            </div>
            <div className="space-y-2">
              {group.habits.map((habit) => {
                const isCompleted = habit.completedDates.includes(todayStr);
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                      isCompleted
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => onToggle(habit.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCompleted ? "text-green-700 line-through" : "text-gray-800"
                        }`}
                      >
                        {habit.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{habit.value}</span>
                        {habit.currentStreak > 0 && (
                          <span className="text-xs font-bold text-orange-500">
                            🔥 {habit.currentStreak}d
                          </span>
                        )}
                        {habit.longestStreak > 0 && (
                          <span className="text-xs text-gray-400">
                            Best: {habit.longestStreak}d
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(habit.id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                      title="Delete habit"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
