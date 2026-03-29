import { NextResponse } from "next/server";
import { TaskStatus, TimeBlock } from "@prisma/client";
import { getDefaultHouseholdOrThrow } from "@/lib/household";
import { getDailyTasks } from "@/lib/task-generation";

export async function GET() {
  try {
    const household = await getDefaultHouseholdOrThrow();
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
    return NextResponse.json(
      { error: "Board setup incomplete. Please run database migration and seed." },
      { status: 500 },
    );
  }
}
