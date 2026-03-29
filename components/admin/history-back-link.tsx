"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

export function HistoryBackLink() {
  const { t } = useTranslation();

  return (
    <Link href="/admin/history" className="btn btn-secondary">
      {t.admin.backTo7Day}
    </Link>
  );
}
