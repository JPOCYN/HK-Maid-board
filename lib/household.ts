import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function getDefaultHouseholdOrThrow() {
  const household = await prisma.household.findUnique({
    where: { slug: env.DEFAULT_HOUSEHOLD_SLUG },
    select: { id: true, slug: true, name: true, isActive: true },
  });

  if (!household || !household.isActive) {
    throw new Error(
      `Default household '${env.DEFAULT_HOUSEHOLD_SLUG}' not found or inactive. Run db seed first.`,
    );
  }

  return household;
}
