import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas";
import { createSession } from "@/lib/session";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "home"
  );
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  const existing = await prisma.household.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!existing) return slug;

  const suffix = Math.random().toString(36).slice(2, 6);
  slug = `${slug}-${suffix}`;
  return slug;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please fill all fields correctly." }, { status: 400 });
    }

    const { name, email, password, householdName } = parsed.data;

    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const slug = await uniqueSlug(householdName);
    const passwordHash = await hash(password, 12);

    const household = await prisma.household.create({
      data: { name: householdName, slug },
    });

    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        householdId: household.id,
      },
    });

    await createSession({
      userId: user.id,
      householdId: household.id,
      householdSlug: slug,
      email: user.email,
    });

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create account right now." }, { status: 500 });
  }
}
