import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { error: "This endpoint has been removed. Use /api/board/[token]/tasks/[id] instead." },
    { status: 410 },
  );
}
