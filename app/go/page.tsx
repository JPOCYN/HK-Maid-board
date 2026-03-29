import { LanguageProvider } from "@/lib/i18n/context";
import { HomeCodeEntry } from "@/components/entry/home-code-entry";

export default function GoPage() {
  return (
    <LanguageProvider>
      <HomeCodeEntry />
    </LanguageProvider>
  );
}
