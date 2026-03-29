import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const household = await prisma.household.findUnique({
    where: { id: session.householdId },
    select: { houseRules: true },
  });

  return NextResponse.json({ houseRules: household?.houseRules ?? "" });
}

export async function PUT(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const houseRules = typeof body.houseRules === "string" ? body.houseRules : "";

  await prisma.household.update({
    where: { id: session.householdId },
    data: { houseRules },
  });

  return NextResponse.json({ ok: true });
}
