import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function verifyAdminCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
    include: { household: { select: { id: true, slug: true, isActive: true } } },
  });

  if (!user || !user.isActive || !user.household.isActive) {
    return null;
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    userId: user.id,
    householdId: user.householdId,
    householdSlug: user.household.slug,
    email: user.email,
    name: user.name,
  };
}
