"use client";

import { PROJECTS } from "@/types";
import type { ProjectKey, TaskStatus } from "@/types";
import KanbanBoard from "@/components/KanbanBoard";

interface TaskData {
  id: string;
  text: string;
  status: TaskStatus;
  date: string;
}

const PROJECT_BORDER_COLORS: Record<ProjectKey, string> = {
  strachwitz: "#3b82f6",
  chaunce: "#10b981",
  private: "#a855f7",
};

interface ProjectSectionProps {
  project: ProjectKey;
  tasks: TaskData[];
  onAddTask: (text: string) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTaskText: (id: string, text: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function ProjectSection({
  project,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onUpdateTaskText,
  onDeleteTask,
}: ProjectSectionProps) {
  const proj = PROJECTS[project];
  const borderColor = PROJECT_BORDER_COLORS[project];

  return (
    <div
      className="rounded-xl border-l-4 bg-white shadow-sm border border-gray-100 p-6"
      style={{ borderLeftColor: borderColor }}
    >
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-2xl">{proj.emoji}</span>
        {proj.label}
      </h2>

      <KanbanBoard
        tasks={tasks}
        project={project}
        onAdd={onAddTask}
        onUpdateStatus={onUpdateTaskStatus}
        onUpdateText={onUpdateTaskText}
        onDelete={onDeleteTask}
      />
    </div>
  );
}
