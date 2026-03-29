import { FrequencyType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { taskTemplateSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = taskTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid task data." }, { status: 400 });
    }

    const payload = parsed.data;
    const weekdays =
      payload.frequencyType === FrequencyType.WEEKDAYS
        ? (payload.weekdays?.length ? payload.weekdays : [1, 2, 3, 4, 5])
        : Prisma.JsonNull;

    const task = await prisma.taskTemplate.updateMany({
      where: { id, householdId: auth.session.householdId },
      data: {
        title: payload.title,
        notes: payload.notes ?? null,
        timeBlock: payload.timeBlock,
        frequencyType: payload.frequencyType,
        weekdays,
        isActive: payload.isActive ?? true,
      },
    });

    if (task.count === 0) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not update task." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const { id } = await params;
  const deleted = await prisma.taskTemplate.deleteMany({
    where: { id, householdId: auth.session.householdId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
