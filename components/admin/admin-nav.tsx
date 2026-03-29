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
    { href: "/admin/rules", label: a.rulesTab },
    { href: "/admin/history", label: a.history },
  ];

  return (
    <header
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderRadius: 20,
        padding: "0.75rem 1rem",
        marginBottom: "1rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ marginRight: "0.5rem" }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1c1c1e" }}>{t.common.appEmoji} {a.portalTitle}</div>
          </div>

          <div
            style={{
              display: "inline-flex",
              background: "rgba(120,120,128,0.08)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "0.42rem 0.85rem",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: active ? "#007aff" : "#636366",
                    background: active ? "#ffffff" : "transparent",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 200ms ease",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Link
            href={boardToken ? `/board/${boardToken}` : "/enter"}
            className="btn"
            style={{
              padding: "0.42rem 0.85rem",
              background: "rgba(52,199,89,0.1)",
              color: "#248a3d",
              fontSize: "0.88rem",
            }}
          >
            {a.openBoard}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <LanguageSwitcher compact />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
