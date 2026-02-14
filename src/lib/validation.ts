import { z } from "zod";

export const createHabitSchema = z.object({
  text: z.string().min(1).max(255),
  category: z.enum(["routine", "health", "growth", "family", "work", "finance"]),
  value: z.string().min(1).max(100),
});

export const toggleHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateGoalSchema = z.object({
  progress: z.number().int().min(0),
});

export const createTaskSchema = z.object({
  project: z.enum(["strachwitz", "chaunce"]),
  text: z.string().min(1).max(500),
  status: z.enum(["backlog", "in_progress", "done"]).optional(),
});

export const updateTaskSchema = z.object({
  status: z.enum(["backlog", "in_progress", "done"]).optional(),
  text: z.string().min(1).max(500).optional(),
});

export const updateStatusSchema = z.object({
  project: z.enum(["strachwitz", "chaunce"]),
  whatDone: z.string().max(10000).optional(),
  whatNext: z.string().max(10000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
