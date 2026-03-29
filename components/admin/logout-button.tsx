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
    <button
      type="button"
      className="btn"
      onClick={logout}
      disabled={loading}
      style={{
        padding: "0.42rem 0.75rem",
        background: "rgba(255,59,48,0.08)",
        color: "#ff3b30",
        fontSize: "0.85rem",
      }}
    >
      {loading ? a.signingOut : a.signOut}
    </button>
  );
}
