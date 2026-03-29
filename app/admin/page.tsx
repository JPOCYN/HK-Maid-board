import { AdminNav } from "@/components/admin/admin-nav";
import { TodayDashboard } from "@/components/admin/today-dashboard";
import { requireAdminPageSession } from "@/lib/guards";
import { LanguageProvider } from "@/lib/i18n/context";

export default async function AdminDashboardPage() {
  const session = await requireAdminPageSession();

  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem" }}>
        <AdminNav boardToken={session.boardToken} />
        <TodayDashboard boardToken={session.boardToken} />
      </main>
    </LanguageProvider>
  );
}
