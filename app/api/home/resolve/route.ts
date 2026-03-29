import { NextResponse } from "next/server";
import { isValidHomeCode, normalizeHomeCode } from "@/lib/home-code";
import { prisma } from "@/lib/prisma";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

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
