import { LanguageProvider } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { GuestAutoStart } from "@/components/guest/guest-auto-start";

export default function TryPage() {
  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem", maxWidth: 760 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <LanguageSwitcher compact />
        </div>
        <GuestAutoStart />
      </main>
    </LanguageProvider>
  );
}
