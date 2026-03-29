"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/lib/i18n/context";

export function AdminNav({ boardToken }: { boardToken?: string }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const a = t.admin;

  const links = [
    { href: "/admin", label: a.dashboard },
    { href: "/admin/tasks", label: a.tasks },
    { href: "/admin/history", label: a.history },
  ];

  return (
    <header className="card" style={{ padding: "0.8rem 1rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
          <strong style={{ marginRight: "0.4rem" }}>MaidBoard Admin</strong>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="btn"
                style={{
                  padding: "0.45rem 0.8rem",
                  background: active ? "#dce7ff" : "#f3f6fc",
                  color: active ? "#1d3b82" : "#314259",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={boardToken ? `/board/${boardToken}` : "/"}
            className="btn"
            style={{ padding: "0.45rem 0.8rem", background: "#ecfdf5", color: "#166534" }}
          >
            {a.openBoard}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
