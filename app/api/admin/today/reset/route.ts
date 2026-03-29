import { TaskStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { toDayStart } from "@/lib/date";
import { requireAdminSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const today = toDayStart(new Date());
  await prisma.dailyTask.updateMany({
    where: {
      householdId: auth.session.householdId,
      date: today,
    },
    data: {
      status: TaskStatus.PENDING,
      completedAt: null,
      skippedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
