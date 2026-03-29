import { AdminNav } from "@/components/admin/admin-nav";
import { HistoryOverview } from "@/components/admin/history-overview";
import { requireAdminPageSession } from "@/lib/guards";
import { LanguageProvider } from "@/lib/i18n/context";

export default async function AdminHistoryPage() {
  const session = await requireAdminPageSession();

  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem" }}>
        <AdminNav boardToken={session.boardToken} />
        <HistoryOverview />
      </main>
    </LanguageProvider>
  );
}
