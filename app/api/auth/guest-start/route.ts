import { FrequencyType, Prisma, TimeBlock } from "@prisma/client";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { generateBoardToken } from "@/lib/board-token";
import { generateUniqueHomeCode } from "@/lib/home-code";
import { prisma } from "@/lib/prisma";
import { createSession, readSession } from "@/lib/session";

const guestStartSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        timeBlock: z.enum(TimeBlock),
      }),
    )
    .max(60)
    .optional()
    .default([]),
});

function makeGuestSlug() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function POST(request: Request) {
  try {
    const existingSession = await readSession();
    if (existingSession) {
      return NextResponse.json({ ok: true, redirectTo: "/admin", alreadySignedIn: true });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = guestStartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid guest data." }, { status: 400 });
    }

    const guestId = Math.random().toString(36).slice(2, 10);
    const slug = makeGuestSlug();
    const homeCode = await generateUniqueHomeCode();
    const guestEmail = `guest-${guestId}@guest.hkmaidboard.local`;
    const passwordHash = await hash(`${guestId}-${Date.now()}`, 8);

    const household = await prisma.household.create({
      data: {
        name: "Guest Home",
        slug,
        boardToken: generateBoardToken(),
        homeCode,
      },
    });

    const user = await prisma.adminUser.create({
      data: {
        householdId: household.id,
        email: guestEmail,
        passwordHash,
        name: "Guest User",
      },
    });

    if (parsed.data.tasks.length > 0) {
      await prisma.$transaction(
        parsed.data.tasks.map((task) =>
          prisma.taskTemplate.create({
            data: {
              householdId: household.id,
              title: task.title,
              notes: null,
              timeBlock: task.timeBlock,
              frequencyType: FrequencyType.DAILY,
              weekdays: Prisma.DbNull,
              oneTimeDate: null,
            },
          }),
        ),
      );
    }

    await createSession({
      userId: user.id,
      householdId: household.id,
      boardToken: household.boardToken,
      email: user.email,
      isGuest: true,
    });

    return NextResponse.json({ ok: true, redirectTo: "/admin" });
  } catch {
    return NextResponse.json({ error: "Unable to start guest mode right now." }, { status: 500 });
  }
}
