import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function requireAdminPageSession() {
  const session = await readSession();
  if (!session) redirect("/admin/login");

  if (session.boardToken) return session;

  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
    select: { boardToken: true },
  });

  return {
    ...session,
    boardToken: household?.boardToken ?? "",
  };
}
