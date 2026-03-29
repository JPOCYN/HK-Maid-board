import { redirect } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SignupForm } from "@/components/admin/signup-form";
import { readSession } from "@/lib/session";

export default async function AdminSignupPage() {
  const session = await readSession();
  if (session) redirect("/admin");

  return (
    <LanguageProvider>
      <main className="container" style={{ maxWidth: 460, padding: "3rem 0" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <LanguageSwitcher compact />
        </div>
        <SignupForm />
      </main>
    </LanguageProvider>
  );
}
