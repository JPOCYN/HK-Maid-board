import { AdminNav } from "@/components/admin/admin-nav";
import { TaskManager } from "@/components/admin/task-manager";
import { requireAdminPageSession } from "@/lib/guards";

export default async function AdminTasksPage() {
  await requireAdminPageSession();

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <AdminNav />
      <TaskManager />
    </main>
  );
}
