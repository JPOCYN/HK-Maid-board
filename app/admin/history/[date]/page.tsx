import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { HistoryDay } from "@/components/admin/history-day";
import { parseDayKey } from "@/lib/date";
import { requireAdminPageSession } from "@/lib/guards";

type Params = { params: Promise<{ date: string }> };

export default async function AdminHistoryDetailPage({ params }: Params) {
  await requireAdminPageSession();
  const { date } = await params;
  if (!parseDayKey(date)) notFound();

  return (
    <main className="container" style={{ padding: "1rem 0 2rem" }}>
      <AdminNav />
      <div style={{ marginBottom: "0.8rem" }}>
        <Link href="/admin/history" className="btn btn-secondary">
          Back to 7-day view
        </Link>
      </div>
      <HistoryDay date={date} />
    </main>
  );
}
