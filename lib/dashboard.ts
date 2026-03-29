import { TaskStatus } from "@prisma/client";
import { addDays, dayKey, toDayStart } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { ensureDailyTasks, getDailyTasks } from "@/lib/task-generation";

export async function getTodayProgress(householdId: string) {
  const date = await ensureDailyTasks(householdId, new Date());
  const tasks = await prisma.dailyTask.findMany({
    where: { householdId, date },
    select: { status: true },
  });

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
  const skipped = tasks.filter((task) => task.status === TaskStatus.SKIPPED).length;
  const pending = total - completed - skipped;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    date: dayKey(date),
    total,
    completed,
    skipped,
    pending,
    completionRate,
  };
}

export async function getHistorySummaries(householdId: string, days = 7) {
  const today = toDayStart(new Date());
  const start = addDays(today, -(days - 1));

  for (let i = 0; i < days; i += 1) {
    await ensureDailyTasks(householdId, addDays(start, i));
  }

  const tasks = await prisma.dailyTask.findMany({
    where: {
      householdId,
      date: {
        gte: start,
        lte: today,
      },
    },
    select: {
      date: true,
      status: true,
    },
    orderBy: { date: "desc" },
  });

  const byDay = new Map<
    string,
    {
      total: number;
      completed: number;
      skipped: number;
      pending: number;
      completionRate: number;
    }
  >();

  for (const task of tasks) {
    const key = dayKey(task.date);
    const current = byDay.get(key) ?? {
      total: 0,
      completed: 0,
      skipped: 0,
      pending: 0,
      completionRate: 0,
    };

    current.total += 1;
    if (task.status === TaskStatus.COMPLETED) current.completed += 1;
    if (task.status === TaskStatus.SKIPPED) current.skipped += 1;
    byDay.set(key, current);
  }

  return Array.from(byDay.entries()).map(([date, stats]) => {
    const pending = stats.total - stats.completed - stats.skipped;
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return {
      date,
      total: stats.total,
      completed: stats.completed,
      skipped: stats.skipped,
      pending,
      completionRate,
    };
  });
}

export async function getDayDetails(householdId: string, date: Date) {
  const tasks = await getDailyTasks(householdId, date);
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
  const skipped = tasks.filter((task) => task.status === TaskStatus.SKIPPED).length;
  const pending = total - completed - skipped;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    date: dayKey(toDayStart(date)),
    totals: {
      total,
      completed,
      skipped,
      pending,
      completionRate,
    },
    tasks,
  };
}
