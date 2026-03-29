"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const a = t.admin;
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="btn btn-secondary" onClick={logout} disabled={loading}>
      {loading ? a.signingOut : a.signOut}
    </button>
  );
}
