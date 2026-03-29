import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { generateBoardToken } from "@/lib/board-token";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await requireAdminSession();
  if (auth.error || !auth.session) return auth.error;

  let token = generateBoardToken();
  for (let i = 0; i < 10; i += 1) {
    const exists = await prisma.household.findUnique({
      where: { boardToken: token },
      select: { id: true },
    });
    if (!exists) break;
    token = generateBoardToken();
  }

  await prisma.household.update({
    where: { id: auth.session.householdId },
    data: { boardToken: token },
  });

  return NextResponse.json({ ok: true, boardToken: token });
}
