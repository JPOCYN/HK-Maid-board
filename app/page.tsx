import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/context";
import { LandingClient } from "@/components/landing/landing-client";
import "./landing.css";

export const metadata: Metadata = {
  title: "HK MaidBoard — 工人 Checklist | 家務清單 | 外傭工作表 | 家務分工 App | 香港",
  description:
    "HK MaidBoard 係免費嘅家務管理工具，專為香港家庭而設。輕鬆建立工人每日工作表、家務清單、外傭家規、家庭任務清單。喺 iPad 顯示任務看板，最適合新工人 orientation。2026年香港家庭首選家務分工 App。",
  keywords: [
    "工人 checklist",
    "家務清單",
    "工人每日工作",
    "工人工作表",
    "helper 工作表",
    "家務 checklist",
    "工人 app",
    "家務分工 app",
    "家務管理 工具",
    "家庭任務清單",
    "家務安排 表",
    "家務管理 系統",
    "工人 工作安排",
    "外傭 工作表",
    "工人 每日工作表",
    "外傭家規",
    "helper house rules hk",
    "新工人 orientation",
    "外傭合約 2026",
    "香港家務",
    "家務助理 app",
    "domestic helper task list",
    "maid checklist hong kong",
    "hong kong maid app",
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
