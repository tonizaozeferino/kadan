"use client";

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
}

export default function GoalsSection({ goals, onUpdate }: GoalsSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">SMART Goals</h2>
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
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 leading-tight">
                  {goal.text}
                </h3>
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
