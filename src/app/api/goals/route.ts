export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { createGoalSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const project = req.nextUrl.searchParams.get("project");

    const rows = await db
      .select()
      .from(goals)
      .where(
        project
          ? and(eq(goals.userId, user.id), eq(goals.project, project))
          : eq(goals.userId, user.id)
      )
      .orderBy(goals.createdAt);

    return NextResponse.json(rows);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [goal] = await db
      .insert(goals)
      .values({
        userId: user.id,
        text: parsed.data.text,
        target: parsed.data.target,
        unit: parsed.data.unit,
        category: parsed.data.category || null,
        project: parsed.data.project,
      })
      .returning();

    return NextResponse.json(goal, { status: 201 });
  });
}
