"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function GuestAutoStart() {
  const router = useRouter();
  const { t } = useTranslation();
  const g = t.guest;
  const started = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function start() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/auth/guest-start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(payload.error ?? g.startError);
          return;
        }
        router.replace(payload.redirectTo ?? "/admin");
        router.refresh();
      } catch {
        setError(g.startError);
      } finally {
        setLoading(false);
      }
    }

    void start();
  }, [router, g.startError]);

  return (
    <section className="card" style={{ padding: "1rem" }}>
      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{g.title}</div>
      <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>{g.subtitle}</p>

      <div style={{ marginTop: "0.8rem", color: "var(--secondary)", fontSize: "0.95rem" }}>
        {loading ? g.starting : error ? error : g.starting}
      </div>

      {error ? (
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            {g.startFullGuestMode}
          </button>
          <Link href="/admin/signup" className="btn btn-secondary">
            {g.ctaSignup}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
