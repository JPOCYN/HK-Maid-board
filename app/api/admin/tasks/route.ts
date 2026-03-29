import { FrequencyType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { taskTemplateSchema } from "@/lib/schemas";
import { toDayStart } from "@/lib/date";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const tasks = await prisma.taskTemplate.findMany({
    where: { householdId: auth.session.householdId },
    orderBy: [{ timeBlock: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    tasks.map((task) => ({
      ...task,
      weekdays: task.frequencyType === FrequencyType.WEEKDAYS ? task.weekdays : null,
      oneTimeDate: task.oneTimeDate ? task.oneTimeDate.toISOString().slice(0, 10) : null,
    })),
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  try {
    if (!auth.session.householdId) {
      return NextResponse.json({ error: "Missing household context." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = taskTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid task data." }, { status: 400 });
    }

    const payload = parsed.data;
    const weekdays =
      payload.frequencyType === FrequencyType.WEEKDAYS
        ? (payload.weekdays?.length ? payload.weekdays : [1, 2, 3, 4, 5])
        : Prisma.DbNull;
    const oneTimeDate =
      payload.frequencyType === FrequencyType.ONCE && payload.oneTimeDate
        ? toDayStart(new Date(payload.oneTimeDate))
        : null;

    const task = await prisma.taskTemplate.create({
      data: {
        householdId: auth.session.householdId,
        title: payload.title,
        notes: payload.notes ?? null,
        timeBlock: payload.timeBlock,
        frequencyType: payload.frequencyType,
        weekdays,
        oneTimeDate,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error while creating task.";
    return NextResponse.json({ error: `Could not create task. ${message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "No task ids provided." }, { status: 400 });
    }

    const deleted = await prisma.taskTemplate.deleteMany({
      where: {
        householdId: auth.session.householdId,
        id: { in: ids },
      },
    });

    return NextResponse.json({ ok: true, deleted: deleted.count });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error while deleting tasks.";
    return NextResponse.json({ error: `Could not delete selected tasks. ${message}` }, { status: 500 });
  }
}
