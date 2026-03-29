import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { getDailyTasks } from "@/lib/task-generation";
import { getTodayProgress } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const [progress, tasks, household] = await Promise.all([
    getTodayProgress(auth.session.householdId),
    getDailyTasks(auth.session.householdId, new Date()),
    prisma.household.findUnique({
      where: { id: auth.session.householdId },
      select: { boardToken: true, homeCode: true },
    }),
  ]);

  return NextResponse.json(
    {
      progress,
      tasks,
      boardToken: household?.boardToken ?? null,
      homeCode: household?.homeCode ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
