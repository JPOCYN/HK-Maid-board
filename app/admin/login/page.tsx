import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { LanguageProvider } from "@/lib/i18n/context";
import { readSession } from "@/lib/session";

export default async function AdminLoginPage() {
  const session = await readSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <LanguageProvider>
      <main className="container" style={{ maxWidth: 460, padding: "4rem 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <LanguageSwitcher />
        </div>
        <LoginForm />
      </main>
    </LanguageProvider>
  );
}
