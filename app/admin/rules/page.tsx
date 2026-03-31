import { AdminNav } from "@/components/admin/admin-nav";
import { HouseRulesEditor } from "@/components/admin/house-rules-editor";
import { requireAdminPageSession } from "@/lib/guards";
import { LanguageProvider } from "@/lib/i18n/context";

export default async function AdminRulesPage() {
  const session = await requireAdminPageSession();

  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem" }}>
        <AdminNav boardToken={session.boardToken} isGuest={session.isGuest} />
        <HouseRulesEditor />
      </main>
    </LanguageProvider>
  );
}
