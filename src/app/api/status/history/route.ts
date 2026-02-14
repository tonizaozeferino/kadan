export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { statusEntries } from "@/lib/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const daysParam = req.nextUrl.searchParams.get("days");
    const days = Math.min(Math.max(parseInt(daysParam || "30", 10) || 30, 1), 90);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceDateStr = sinceDate.toISOString().split("T")[0];

    const entries = await db
      .select({
        id: statusEntries.id,
        date: statusEntries.date,
        whatDone: statusEntries.whatDone,
        whatNext: statusEntries.whatNext,
        project: statusEntries.project,
      })
      .from(statusEntries)
      .where(
        and(
          eq(statusEntries.userId, user.id),
          gte(statusEntries.date, sinceDateStr)
        )
      )
      .orderBy(desc(statusEntries.date));

    return NextResponse.json(entries);
  });
}
