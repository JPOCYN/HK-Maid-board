import { AdminNav } from "@/components/admin/admin-nav";
import { HistoryOverview } from "@/components/admin/history-overview";
import { requireAdminPageSession } from "@/lib/guards";

export default async function AdminHistoryPage() {
  await requireAdminPageSession();

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <AdminNav />
      <HistoryOverview />
    </main>
  );
}
