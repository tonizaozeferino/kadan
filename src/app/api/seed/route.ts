export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits, goals } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { DEFAULT_HABITS, DEFAULT_GOALS } from "@/types";

/**
 * POST /api/seed
 * Seeds default habits and goals for the authenticated user.
 * Only adds them if the user has none yet.
 */
export async function POST() {
  return withAuth(async (user) => {
    // Check if user already has habits
    const existingHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, user.id))
      .limit(1);

    if (existingHabits.length === 0) {
      await db.insert(habits).values(
        DEFAULT_HABITS.map((h) => ({
          userId: user.id,
          text: h.text,
          category: h.category,
          value: h.value,
        }))
      );
    }

    // Check if user already has goals
    const existingGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, user.id))
      .limit(1);

    if (existingGoals.length === 0) {
      await db.insert(goals).values(
        DEFAULT_GOALS.map((g) => ({
          userId: user.id,
          text: g.text,
          target: g.target,
          unit: g.unit,
          category: g.category,
          project: g.project,
        }))
      );
    }

    return NextResponse.json({ success: true, message: "Data seeded" });
  });
}
