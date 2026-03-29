import { AdminNav } from "@/components/admin/admin-nav";
import { TaskManager } from "@/components/admin/task-manager";
import { requireAdminPageSession } from "@/lib/guards";
import { LanguageProvider } from "@/lib/i18n/context";

export default async function AdminTasksPage() {
  const session = await requireAdminPageSession();

  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem" }}>
        <AdminNav boardToken={session.boardToken} />
        <TaskManager />
      </main>
    </LanguageProvider>
  );
}
