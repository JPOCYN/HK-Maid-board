import { NextResponse } from "next/server";
import { isValidHomeCode, normalizeHomeCode } from "@/lib/home-code";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCode = searchParams.get("code") ?? "";
  const code = normalizeHomeCode(rawCode);

  if (!isValidHomeCode(code)) {
    return NextResponse.json({ error: "Invalid code format." }, { status: 400 });
  }

  const household = await prisma.household.findUnique({
    where: { homeCode: code },
    select: { boardToken: true, isActive: true },
  });

  if (!household || !household.isActive) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    boardToken: household.boardToken,
    boardUrl: `/board/${household.boardToken}`,
    homeCode: code,
  });
}
