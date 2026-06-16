import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, walkers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update role
    await db.update(user).set({ role: "walker" }).where(eq(user.id, session.user.id));

    // Create walker profile if it doesn't exist
    const existingWalker = await db.query.walkers.findFirst({
      where: eq(walkers.userId, session.user.id),
    });

    if (!existingWalker) {
      await db.insert(walkers).values({
        userId: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
