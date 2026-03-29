import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/context";
import { LandingClient } from "@/components/landing/landing-client";
import "./landing.css";

export const metadata: Metadata = {
  title: "HK MaidBoard — 工人 Checklist | 家務清單 | 工人每日工作 App | 香港",
  description:
    "HK MaidBoard 係免費嘅工人 checklist app，專為香港家庭而設。輕鬆建立家務清單、工人每日工作安排、helper 工作表。喺 iPad 顯示任務看板，管理家務 checklist 從未如此簡單。",
  keywords: [
    "工人 checklist",
    "家務清單",
    "工人每日工作",
    "工人工作表",
    "helper 工作表",
    "家務 checklist",
    "工人 app",
    "香港家務",
    "家務助理 app",
    "domestic helper task list",
    "maid checklist hong kong",
  ],
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <LanguageProvider>
      <LandingClient />
    </LanguageProvider>
  );
}
