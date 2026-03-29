import { NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { toDayStart } from "@/lib/date";
import { getDefaultHouseholdOrThrow } from "@/lib/household";
import { prisma } from "@/lib/prisma";
import { updateTaskStatusSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const household = await getDefaultHouseholdOrThrow();
    const today = toDayStart(new Date());
    const status = parsed.data.status;

    const existing = await prisma.dailyTask.findFirst({
      where: { id, householdId: household.id, date: today },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task not found for today." }, { status: 404 });
    }

    const updated = await prisma.dailyTask.update({
      where: { id },
      data: {
        status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
        skippedAt: status === TaskStatus.SKIPPED ? new Date() : null,
      },
      select: { id: true, status: true, completedAt: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update task status." }, { status: 500 });
  }
}
