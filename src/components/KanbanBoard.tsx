"use client";

import { useState, useCallback, useRef } from "react";
import type { TaskStatus, ProjectKey } from "@/types";

interface TaskData {
  id: string;
  text: string;
  status: TaskStatus;
  date: string | Date;
}

interface KanbanBoardProps {
  tasks: TaskData[];
  project: ProjectKey;
  onAdd: (text: string) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { key: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { key: "backlog", label: "Backlog", color: "#6b7280", bgColor: "bg-gray-50" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b", bgColor: "bg-amber-50" },
  { key: "done", label: "Done", color: "#10b981", bgColor: "bg-green-50" },
];

export default function KanbanBoard({
  tasks,
  onAdd,
  onUpdateStatus,
  onDelete,
}: KanbanBoardProps) {
  const [newTask, setNewTask] = useState("");
  const dragItem = useRef<string | null>(null);

  const handleAdd = useCallback(() => {
    if (!newTask.trim()) return;
    onAdd(newTask.trim());
    setNewTask("");
  }, [newTask, onAdd]);

  const handleDragStart = (taskId: string) => {
    dragItem.current = taskId;
  };

  const handleDrop = (status: TaskStatus) => {
    if (dragItem.current) {
      onUpdateStatus(dragItem.current, status);
      dragItem.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Kanban Board</h2>

      {/* Add task */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition font-medium"
        >
          Add
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              className={`${col.bgColor} rounded-lg p-4 min-h-[200px] border-2 border-dashed border-transparent transition`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="font-semibold text-gray-700 text-sm">
                  {col.label}
                </h3>
                <span className="text-xs text-gray-400 ml-auto">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700 flex-1">
                        {task.text}
                      </p>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0"
                        title="Delete task"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(task.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-8">
                    Drop tasks here
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
