import { FrequencyType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { taskTemplateSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const tasks = await prisma.taskTemplate.findMany({
    where: { householdId: auth.session.householdId },
    orderBy: [{ isActive: "desc" }, { timeBlock: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    tasks.map((task) => ({
      ...task,
      weekdays: task.frequencyType === FrequencyType.WEEKDAYS ? task.weekdays : null,
    })),
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  try {
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

    const task = await prisma.taskTemplate.create({
      data: {
        householdId: auth.session.householdId,
        title: payload.title,
        notes: payload.notes ?? null,
        timeBlock: payload.timeBlock,
        frequencyType: payload.frequencyType,
        weekdays,
        isActive: payload.isActive ?? true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create task." }, { status: 500 });
  }
}
