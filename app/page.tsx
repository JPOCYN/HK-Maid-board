import { LanguageProvider } from "@/lib/i18n/context";
import { LandingClient } from "@/components/landing/landing-client";
import "./landing.css";

export default function HomePage() {
  return (
    <LanguageProvider>
      <LandingClient />
    </LanguageProvider>
  );
}
