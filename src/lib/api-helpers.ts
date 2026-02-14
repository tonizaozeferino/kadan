import { NextResponse } from "next/server";
import { requireUser } from "./auth";
import { checkRateLimit } from "./rate-limit";

export async function withAuth(
  handler: (user: { id: string; clerkId: string }) => Promise<NextResponse>
) {
  try {
    const user = await requireUser();
    const { allowed, remaining, resetAt } = checkRateLimit(user.id);

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetAt).toISOString(),
          },
        }
      );
    }

    const response = await handler(user);
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
