import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "This endpoint has been removed. Use /api/board/[token]/today instead." },
    { status: 410 },
  );
}
