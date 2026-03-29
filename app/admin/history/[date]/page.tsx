import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { HistoryDay } from "@/components/admin/history-day";
import { HistoryBackLink } from "@/components/admin/history-back-link";
import { parseDayKey } from "@/lib/date";
import { requireAdminPageSession } from "@/lib/guards";
import { LanguageProvider } from "@/lib/i18n/context";

type Params = { params: Promise<{ date: string }> };

export default async function AdminHistoryDetailPage({ params }: Params) {
  const session = await requireAdminPageSession();
  const { date } = await params;
  if (!parseDayKey(date)) notFound();

  return (
    <LanguageProvider>
      <main className="container" style={{ padding: "1rem 0 2rem" }}>
        <AdminNav boardToken={session.boardToken} />
        <div style={{ marginBottom: "0.8rem" }}>
          <HistoryBackLink />
        </div>
        <HistoryDay date={date} />
      </main>
    </LanguageProvider>
  );
}
