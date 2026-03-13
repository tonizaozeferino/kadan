export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { habits, goals, tasks, statusEntries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import {
  computeHabitRates,
  computeGoalVelocity,
  computeTaskThroughput,
  computeWeeklySummary,
} from "@/lib/analytics";

const weeksSchema = z.number().int().min(1).max(12);

export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const url = new URL(req.url);
    const weeksParam = url.searchParams.get("weeks");
    const weeksParsed = weeksSchema.safeParse(
      weeksParam ? Number(weeksParam) : 4
    );
    const weeks = weeksParsed.success ? weeksParsed.data : 4;
    const days = weeks * 7;

    const [userHabits, userGoals, userTasks, userStatusEntries] =
      await Promise.all([
        db.select().from(habits).where(eq(habits.userId, user.id)),
        db.select().from(goals).where(eq(goals.userId, user.id)),
        db.select().from(tasks).where(eq(tasks.userId, user.id)),
        db
          .select()
          .from(statusEntries)
          .where(eq(statusEntries.userId, user.id)),
      ]);

    const habitRates = computeHabitRates(userHabits, days);
    const goalVelocity = computeGoalVelocity(userGoals);
    const taskThroughput = computeTaskThroughput(userTasks, weeks);
    const weeklySummary = computeWeeklySummary(
      habitRates,
      goalVelocity,
      userTasks,
      userStatusEntries
    );

    return NextResponse.json({
      habitRates,
      goalVelocity,
      taskThroughput,
      weeklySummary,
    });
  });
}
