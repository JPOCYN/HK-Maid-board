import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDayDetails } from "@/lib/dashboard";
import { parseDayKey } from "@/lib/date";

type Params = { params: Promise<{ date: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const { date } = await params;
  const parsed = parseDayKey(date);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
  }

  const details = await getDayDetails(auth.session.householdId, parsed);
  return NextResponse.json(details, { headers: { "Cache-Control": "no-store" } });
}
