export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { toggleHabitSchema } from "@/lib/validation";
import { calculateStreak, getLocalDateString } from "@/lib/utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = toggleHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dateStr = parsed.data?.date || getLocalDateString();

    // Fetch current habit
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .limit(1);

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Toggle: add or remove date
    let newDates: string[];
    if (habit.completedDates.includes(dateStr)) {
      newDates = habit.completedDates.filter((d) => d !== dateStr);
    } else {
      newDates = [...habit.completedDates, dateStr];
    }

    // Calculate new streaks
    const currentStreak = calculateStreak(newDates);
    const longestStreak = Math.max(habit.longestStreak, currentStreak);

    const [updated] = await db
      .update(habits)
      .set({
        completedDates: newDates,
        longestStreak,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    return NextResponse.json({
      ...updated,
      currentStreak,
    });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;

    const result = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  });
}
