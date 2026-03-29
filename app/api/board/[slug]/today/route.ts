import { NextResponse } from "next/server";
import { TaskStatus, TimeBlock } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDailyTasks } from "@/lib/task-generation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const household = await prisma.household.findUnique({
      where: { slug },
      select: { id: true, name: true, isActive: true },
    });

    if (!household || !household.isActive) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    const tasks = await getDailyTasks(household.id, new Date());
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
    const skipped = tasks.filter((task) => task.status === TaskStatus.SKIPPED).length;
    const pending = total - completed - skipped;

    const groups = {
      MORNING: tasks.filter((task) => task.timeBlock === TimeBlock.MORNING),
      AFTERNOON: tasks.filter((task) => task.timeBlock === TimeBlock.AFTERNOON),
      EVENING: tasks.filter((task) => task.timeBlock === TimeBlock.EVENING),
    };

    return NextResponse.json(
      {
        household: household.name,
        progress: {
          total,
          completed,
          skipped,
          pending,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
        groups,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load board." }, { status: 500 });
  }
}
