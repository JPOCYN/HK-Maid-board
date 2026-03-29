import { AdminNav } from "@/components/admin/admin-nav";
import { TodayDashboard } from "@/components/admin/today-dashboard";
import { requireAdminPageSession } from "@/lib/guards";

export default async function AdminDashboardPage() {
  await requireAdminPageSession();

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <AdminNav />
      <TodayDashboard />
    </main>
  );
}
