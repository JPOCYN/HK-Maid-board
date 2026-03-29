import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HK MaidBoard — 工人 Checklist | 家務清單 App | 外傭工作表 | 香港家庭適用",
    template: "%s | HK MaidBoard",
  },
  description:
    "HK MaidBoard 係香港家庭專用嘅家務管理工具。輕鬆建立工人每日工作表、家務 checklist、外傭家規，用 iPad 做共用看板，免費使用。2026年最適合香港家庭嘅家務分工 App。",
  keywords: [
    "工人 checklist",
    "家務清單",
    "工人每日工作",
    "工人工作表",
    "helper 工作表",
    "家務 checklist",
    "工人 app",
    "家務助理",
    "香港工人",
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
    "domestic helper checklist",
    "maid task board",
    "household chores app",
    "helper daily tasks",
    "hong kong helper app",
    "hong kong maid app",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏠</text></svg>",
  },
  authors: [{ name: "HK MaidBoard" }],
  creator: "HK MaidBoard",
  metadataBase: new URL("https://hkmaidboard.com"),
  alternates: {
    canonical: "/",
    languages: {
      "zh-HK": "/",
      en: "/",
    },
  },
  openGraph: {
    title: "HK MaidBoard — 工人 Checklist | 家務清單 | 外傭工作表 App",
    description:
      "香港家庭專用嘅家務管理工具。管理工人每日工作表、外傭家規、家務 checklist，免費即用。",
    url: "https://hkmaidboard.com",
    siteName: "HK MaidBoard",
    locale: "zh_HK",
    alternateLocale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HK MaidBoard — 工人 Checklist | 家務清單 | 外傭工作表 App",
    description:
      "香港家庭專用嘅家務管理工具。管理工人每日工作表、外傭家規、家務 checklist，免費即用。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "HK MaidBoard",
              url: "https://hkmaidboard.com",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "HKD",
              },
              description:
                "香港家庭專用嘅家務管理工具。管理工人每日工作表、外傭家規、家務 checklist、家庭任務清單，免費使用。適合新工人 orientation。",
              inLanguage: ["zh-HK", "en"],
              availableLanguage: [
                { "@type": "Language", name: "Chinese (Traditional, Hong Kong)" },
                { "@type": "Language", name: "English" },
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@hkmaidboard.com",
                contactType: "customer support",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
