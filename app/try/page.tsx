import { LanguageProvider } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { GuestDemo } from "@/components/guest/guest-demo";

export default function TryPage() {
  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem", maxWidth: 760 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
          <LanguageSwitcher compact />
        </div>
        <GuestDemo />
      </main>
    </LanguageProvider>
  );
}
