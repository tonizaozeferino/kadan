export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { createHabitSchema } from "@/lib/validation";
import { calculateStreak } from "@/lib/utils";

export async function GET() {
  return withAuth(async (user) => {
    const rows = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, user.id))
      .orderBy(habits.createdAt);

    const result = rows.map((h) => ({
      ...h,
      currentStreak: calculateStreak(h.completedDates),
    }));

    return NextResponse.json(result);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = createHabitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [habit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        text: parsed.data.text,
        category: parsed.data.category,
        value: parsed.data.value,
      })
      .returning();

    return NextResponse.json(habit, { status: 201 });
  });
}
