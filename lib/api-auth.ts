import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";

export async function requireAdminSession() {
  const session = await readSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}
