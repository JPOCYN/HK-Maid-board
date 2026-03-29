"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

export function HistoryBackLink() {
  const { t } = useTranslation();

  return (
    <Link href="/admin/history" className="btn btn-ghost" style={{ fontSize: "0.88rem" }}>
      {"\u2190"} {t.admin.backTo7Day}
    </Link>
  );
}
