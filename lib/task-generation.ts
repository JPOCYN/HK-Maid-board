import { FrequencyType, TaskStatus, TimeBlock } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toDayStart } from "@/lib/date";

function includesWeekday(weekdays: unknown, day: number): boolean {
  if (!Array.isArray(weekdays)) return false;
  return weekdays.includes(day);
}

function templateAppliesOnDate(
  frequencyType: FrequencyType,
  weekdays: unknown,
  oneTimeDate: Date | null,
  date: Date,
): boolean {
  if (frequencyType === FrequencyType.DAILY) return true;
  if (frequencyType === FrequencyType.ONCE) {
    if (!oneTimeDate) return false;
    return toDayStart(oneTimeDate).getTime() === date.getTime();
  }
  const day = date.getUTCDay();
  return includesWeekday(weekdays, day);
}

export async function ensureDailyTasks(householdId: string, date = new Date()) {
  const dayStart = toDayStart(date);

  const templates = await prisma.taskTemplate.findMany({
    where: {
      householdId,
    },
    orderBy: [{ timeBlock: "asc" }, { createdAt: "asc" }],
  });

  const existing = await prisma.dailyTask.findMany({
    where: { householdId, date: dayStart },
    select: { templateId: true },
  });
  const existingTemplateIds = new Set(existing.map((item) => item.templateId));

  const toCreate = templates
    .filter((template) =>
      templateAppliesOnDate(template.frequencyType, template.weekdays, template.oneTimeDate, dayStart),
    )
    .filter((template) => !existingTemplateIds.has(template.id))
    .map((template) => ({
      householdId,
      templateId: template.id,
      date: dayStart,
      titleSnapshot: template.title,
      notesSnapshot: template.notes,
      timeBlock: template.timeBlock,
      status: TaskStatus.PENDING,
    }));

  if (toCreate.length > 0) {
    await prisma.dailyTask.createMany({ data: toCreate });
  }

  return dayStart;
}

export type DailyTaskView = {
  id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  timeBlock: TimeBlock;
  completedAt: string | null;
};

export async function getDailyTasks(householdId: string, date = new Date()) {
  const dayStart = await ensureDailyTasks(householdId, date);
  const tasks = await prisma.dailyTask.findMany({
    where: { householdId, date: dayStart },
    orderBy: [{ timeBlock: "asc" }, { createdAt: "asc" }],
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.titleSnapshot,
    notes: task.notesSnapshot,
    status: task.status,
    timeBlock: task.timeBlock,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  })) satisfies DailyTaskView[];
}
