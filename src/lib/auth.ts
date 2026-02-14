import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export async function getOrCreateUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  // Check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({ clerkId })
    .returning();

  return newUser;
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
