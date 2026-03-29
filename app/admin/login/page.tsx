import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { readSession } from "@/lib/session";

export default async function AdminLoginPage() {
  const session = await readSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="container" style={{ maxWidth: 460, padding: "4rem 0" }}>
      <LoginForm />
    </main>
  );
}
