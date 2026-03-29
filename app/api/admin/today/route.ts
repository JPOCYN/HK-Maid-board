import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDailyTasks } from "@/lib/task-generation";
import { getTodayProgress } from "@/lib/dashboard";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const [progress, tasks] = await Promise.all([
    getTodayProgress(auth.session.householdId),
    getDailyTasks(auth.session.householdId, new Date()),
  ]);

  return NextResponse.json(
    {
      progress,
      tasks,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
