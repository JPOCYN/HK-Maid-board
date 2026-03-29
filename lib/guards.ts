import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";

export async function requireAdminPageSession() {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
}
