"use client";

import { useState, useCallback } from "react";
import { CATEGORY_COLORS } from "@/types";
import type { HabitCategory } from "@/types";

interface GoalData {
  id: string;
  text: string;
  target: number;
  unit: string;
  progress: number;
  category: string | null;
}

interface GoalsSectionProps {
  goals: GoalData[];
  onUpdate: (id: string, progress: number) => void;
  onDelete?: (id: string) => void;
  onAdd?: (goal: { text: string; target: number; unit: string; category: string }) => void;
}

const GOAL_CATEGORIES = [
  "growth", "health", "work", "finance", "family", "routine",
] as const;

export default function GoalsSection({ goals, onUpdate, onDelete, onAdd }: GoalsSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newTarget, setNewTarget] = useState("12");
  const [newUnit, setNewUnit] = useState("months");
  const [newCategory, setNewCategory] = useState("growth");

  const handleAdd = useCallback(() => {
    const target = parseInt(newTarget, 10);
    if (!newText.trim() || !newUnit.trim() || isNaN(target) || target <= 0) return;
    onAdd?.({ text: newText.trim(), target, unit: newUnit.trim(), category: newCategory });
    setNewText("");
    setNewTarget("12");
    setNewUnit("months");
    setNewCategory("growth");
    setShowAdd(false);
  }, [newText, newTarget, newUnit, newCategory, onAdd]);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">SMART Goals</h2>
        {onAdd && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
          >
            + Add Goal
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Goal description..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <input
              type="number"
              placeholder="Target (e.g. 12)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              min={1}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <input
              type="text"
              placeholder="Unit (e.g. months, kg)"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
          >
            Add Goal
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((goal.progress / goal.target) * 100)
          );
          const color =
            CATEGORY_COLORS[(goal.category as HabitCategory) || "growth"] ||
            "#3b82f6";

          return (
            <div
              key={goal.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 leading-tight flex-1">
                  {goal.text}
                </h3>
                {onDelete && (
                  <button
                    onClick={() => onDelete(goal.id)}
                    className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 ml-1 shrink-0"
                    title="Delete goal"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {goal.progress}/{goal.target} {goal.unit}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color }}
                >
                  {pct}%
                </span>
              </div>

              {/* Increment / Decrement */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() =>
                    onUpdate(goal.id, Math.max(0, goal.progress - 1))
                  }
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition text-lg font-bold"
                  disabled={goal.progress <= 0}
                >
                  -
                </button>
                <span className="text-lg font-bold text-gray-700 w-8 text-center">
                  {goal.progress}
                </span>
                <button
                  onClick={() =>
                    onUpdate(
                      goal.id,
                      Math.min(goal.target, goal.progress + 1)
                    )
                  }
                  className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition text-lg font-bold"
                  disabled={goal.progress >= goal.target}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
