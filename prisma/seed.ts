import { PrismaClient, FrequencyType, Prisma, TimeBlock } from "@prisma/client";
import { hash } from "bcryptjs";
import { generateBoardToken } from "@/lib/board-token";

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    title: "Prepare breakfast",
    notes: "Simple and healthy meal",
    timeBlock: TimeBlock.MORNING,
    frequencyType: FrequencyType.DAILY,
    weekdays: null,
  },
  {
    title: "Laundry and folding",
    notes: "Focus on school uniforms first",
    timeBlock: TimeBlock.AFTERNOON,
    frequencyType: FrequencyType.WEEKDAYS,
    weekdays: [1, 3, 5],
  },
  {
    title: "Kitchen deep clean",
    notes: "Sink, stove, and countertops",
    timeBlock: TimeBlock.EVENING,
    frequencyType: FrequencyType.WEEKDAYS,
    weekdays: [2, 4, 6],
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "owner@maidboard.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeThisStrongPassword123!";
  const householdName = process.env.DEFAULT_HOUSEHOLD_NAME ?? "Home";
  const householdSlug = process.env.DEFAULT_HOUSEHOLD_SLUG ?? "home";

  const household = await prisma.household.upsert({
    where: { slug: householdSlug },
    update: { name: householdName },
    create: { name: householdName, slug: householdSlug, boardToken: generateBoardToken() },
  });

  const passwordHash = await hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      householdId: household.id,
      passwordHash,
      isActive: true,
      name: "Household Owner",
    },
    create: {
      email,
      passwordHash,
      householdId: household.id,
      name: "Household Owner",
    },
  });

  for (const template of defaultTemplates) {
    const exists = await prisma.taskTemplate.findFirst({
      where: {
        householdId: household.id,
        title: template.title,
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.taskTemplate.create({
        data: {
          householdId: household.id,
          title: template.title,
          notes: template.notes,
          timeBlock: template.timeBlock,
          frequencyType: template.frequencyType,
          weekdays: template.weekdays ?? Prisma.JsonNull,
          isActive: true,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
