export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { statusEntries } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";
import { updateStatusSchema } from "@/lib/validation";
import { getLocalDateString } from "@/lib/utils";

export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const project = req.nextUrl.searchParams.get("project");
    const date = req.nextUrl.searchParams.get("date") || getLocalDateString();

    if (!project) {
      return NextResponse.json(
        { error: "project query parameter required" },
        { status: 400 }
      );
    }

    const [entry] = await db
      .select()
      .from(statusEntries)
      .where(
        and(
          eq(statusEntries.userId, user.id),
          eq(statusEntries.project, project),
          eq(statusEntries.date, date)
        )
      )
      .limit(1);

    return NextResponse.json(entry || { whatDone: "", whatNext: "", date, project });
  });
}

export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const date = parsed.data.date || getLocalDateString();

    // Upsert: try to find existing, then update or insert
    const [existing] = await db
      .select()
      .from(statusEntries)
      .where(
        and(
          eq(statusEntries.userId, user.id),
          eq(statusEntries.project, parsed.data.project),
          eq(statusEntries.date, date)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(statusEntries)
        .set({
          whatDone: parsed.data.whatDone ?? existing.whatDone,
          whatNext: parsed.data.whatNext ?? existing.whatNext,
          updatedAt: new Date(),
        })
        .where(eq(statusEntries.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(statusEntries)
      .values({
        userId: user.id,
        project: parsed.data.project,
        whatDone: parsed.data.whatDone || "",
        whatNext: parsed.data.whatNext || "",
        date,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  });
}
