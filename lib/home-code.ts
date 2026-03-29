import { prisma } from "@/lib/prisma";

function randomLetters() {
  return Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
}

function randomDigits() {
  return String(Math.floor(Math.random() * 1000)).padStart(3, "0");
}

export function createRandomHomeCode() {
  return `${randomLetters()}-${randomDigits()}`;
}

export function normalizeHomeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function formatHomeCodeInput(value: string) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

export function isValidHomeCode(value: string) {
  return /^[A-Z]{3}-\d{3}$/.test(value);
}

export async function generateUniqueHomeCode() {
  for (let i = 0; i < 50; i += 1) {
    const code = createRandomHomeCode();
    const exists = await prisma.household.findUnique({
      where: { homeCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Unable to generate unique home code.");
}
