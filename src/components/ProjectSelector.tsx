"use client";

import { PROJECTS } from "@/types";
import type { ProjectKey } from "@/types";

interface ProjectSelectorProps {
  project: ProjectKey;
  onChange: (project: ProjectKey) => void;
}

export default function ProjectSelector({
  project,
  onChange,
}: ProjectSelectorProps) {
  return (
    <select
      value={project}
      onChange={(e) => onChange(e.target.value as ProjectKey)}
      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
    >
      {(Object.keys(PROJECTS) as ProjectKey[]).map((key) => (
        <option key={key} value={key}>
          {PROJECTS[key].emoji} {PROJECTS[key].label}
        </option>
      ))}
    </select>
  );
}
