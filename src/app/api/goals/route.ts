export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goals } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/api-helpers";

export async function GET() {
  return withAuth(async (user) => {
    const rows = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, user.id))
      .orderBy(goals.createdAt);

    return NextResponse.json(rows);
  });
}
