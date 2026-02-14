export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { createTaskSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const project = req.nextUrl.searchParams.get("project");

    const query = db
      .select()
      .from(tasks)
      .where(
        project
          ? and(eq(tasks.userId, user.id), eq(tasks.project, project))
          : eq(tasks.userId, user.id)
      )
      .orderBy(tasks.createdAt);

    const rows = await query;
    return NextResponse.json(rows);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [task] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        project: parsed.data.project,
        text: parsed.data.text,
        status: parsed.data.status || "backlog",
      })
      .returning();

    return NextResponse.json(task, { status: 201 });
  });
}
