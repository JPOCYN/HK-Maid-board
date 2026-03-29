"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function LandingClient() {
  const { t } = useTranslation();
  const l = t.landing;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">{t.common.appName}</div>
        <div className="landing-nav-right">
          <LanguageSwitcher compact />
          <Link href="/admin/login" className="landing-btn-secondary" style={{ padding: "0.55rem 1rem", fontSize: "0.95rem" }}>
            {l.loginCta}
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <h1>{l.heroTitle}</h1>
        <p>{l.heroSub}</p>
        <div className="landing-hero-actions">
          <Link href="/admin/signup" className="landing-btn-primary">
            {l.getStarted} {"\u2192"}
          </Link>
          <Link href="/admin/login" className="landing-btn-secondary">
            {l.loginCta}
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature-card">
          <div className="landing-feature-icon landing-feature-icon-board">{"\uD83D\uDCCB"}</div>
          <h3>{l.featureBoard}</h3>
          <p>{l.featureBoardDesc}</p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-icon landing-feature-icon-admin">{"\uD83D\uDCF1"}</div>
          <h3>{l.featureAdmin}</h3>
          <p>{l.featureAdminDesc}</p>
        </div>
        <div className="landing-feature-card">
          <div className="landing-feature-icon landing-feature-icon-auto">{"\u2699\uFE0F"}</div>
          <h3>{l.featureAuto}</h3>
          <p>{l.featureAutoDesc}</p>
        </div>
      </section>

      <section className="landing-how">
        <h2>{l.howTitle}</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-num">1</div>
            <h3>{l.step1}</h3>
            <p>{l.step1Desc}</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">2</div>
            <h3>{l.step2}</h3>
            <p>{l.step2Desc}</p>
          </div>
          <div className="landing-step">
            <div className="landing-step-num">3</div>
            <h3>{l.step3}</h3>
            <p>{l.step3Desc}</p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <h2>{l.ctaTitle}</h2>
        <p>{l.ctaSub}</p>
        <Link href="/admin/signup" className="landing-btn-primary">
          {l.getStarted} {"\u2192"}
        </Link>
      </section>

      <footer className="landing-footer">
        {l.footerMade} &middot; {t.common.appName}
      </footer>
    </div>
  );
}
