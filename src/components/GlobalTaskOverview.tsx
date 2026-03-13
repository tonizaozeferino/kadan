"use client";

import { PROJECTS } from "@/types";
import type { ProjectKey, TaskStatus } from "@/types";

interface TaskData {
  id: string;
  text: string;
  status: TaskStatus;
}

interface GlobalTaskOverviewProps {
  tasksByProject: Record<ProjectKey, TaskData[]>;
}

const STATUS_CONFIG: { key: TaskStatus; label: string; color: string }[] = [
  { key: "backlog", label: "Backlog", color: "#6b7280" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "done", label: "Done", color: "#10b981" },
];

export default function GlobalTaskOverview({ tasksByProject }: GlobalTaskOverviewProps) {
  const projectKeys = Object.keys(PROJECTS) as ProjectKey[];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Task Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projectKeys.map((key) => {
          const proj = PROJECTS[key];
          const tasks = tasksByProject[key] || [];
          const counts: Record<TaskStatus, number> = {
            backlog: tasks.filter((t) => t.status === "backlog").length,
            in_progress: tasks.filter((t) => t.status === "in_progress").length,
            done: tasks.filter((t) => t.status === "done").length,
          };

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{proj.emoji}</span>
                <h3 className="font-semibold text-gray-700 text-sm">{proj.label}</h3>
                <span className="text-xs text-gray-400 ml-auto">{tasks.length} total</span>
              </div>
              <div className="space-y-2">
                {STATUS_CONFIG.map((s) => (
                  <div key={s.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs text-gray-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{counts[s.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
