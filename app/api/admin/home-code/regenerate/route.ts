import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { generateUniqueHomeCode } from "@/lib/home-code";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  const homeCode = await generateUniqueHomeCode();
  await prisma.household.update({
    where: { id: auth.session.householdId },
    data: { homeCode },
  });

  return NextResponse.json({ ok: true, homeCode });
}
