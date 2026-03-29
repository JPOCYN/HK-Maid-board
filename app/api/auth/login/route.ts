import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }

    const user = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await createSession({
      userId: user.userId,
      householdId: user.householdId,
      householdSlug: user.householdSlug,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ error: "Unable to log in right now." }, { status: 500 });
  }
}
