import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getHistorySummaries } from "@/lib/dashboard";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const summaries = await getHistorySummaries(auth.session.householdId, 7);
  return NextResponse.json(summaries, { headers: { "Cache-Control": "no-store" } });
}
