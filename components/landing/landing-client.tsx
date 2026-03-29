"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

function BoardMockup({ tasks, labels }: {
  tasks: { morning: { title: string; done: boolean }[]; afternoon: { title: string; done: boolean }[]; evening: { title: string; done: boolean }[] };
  labels: { morning: string; afternoon: string; evening: string };
}) {
  const doneCount = [...tasks.morning, ...tasks.afternoon, ...tasks.evening].filter(t => t.done).length;
  const totalCount = [...tasks.morning, ...tasks.afternoon, ...tasks.evening].length;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="showcase-board">
      <div className="showcase-board-header">
        <div className="showcase-board-dot" />
        <div className="showcase-board-dot" />
        <div className="showcase-board-dot" />
        <span className="showcase-board-title">iPad — Helper Board</span>
      </div>
      <div className="showcase-board-progress">
        <div className="showcase-board-progress-bar">
          <div className="showcase-board-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="showcase-board-progress-text">{doneCount}/{totalCount}</span>
      </div>
      <div className="showcase-board-columns">
        {(["morning", "afternoon", "evening"] as const).map((block) => (
          <div key={block} className="showcase-board-col">
            <div className={`showcase-board-col-label showcase-board-col-label-${block}`}>
              {block === "morning" ? "\u2600\uFE0F" : block === "afternoon" ? "\uD83C\uDF24\uFE0F" : "\uD83C\uDF19"} {labels[block]}
            </div>
            {tasks[block].map((task, i) => (
              <div key={i} className={`showcase-task ${task.done ? "showcase-task-done" : ""}`}>
                <div className={`showcase-check ${task.done ? "showcase-check-done" : ""}`}>
                  {task.done && "\u2713"}
                </div>
                <span>{task.title}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPreviewAdmin() {
  return (
    <div className="step-preview step-preview-admin">
      <div className="step-preview-row">
        <div className="step-preview-chip step-preview-chip-active">{"\u2600\uFE0F"} Morning</div>
        <div className="step-preview-chip">{"\uD83C\uDF24\uFE0F"} Afternoon</div>
        <div className="step-preview-chip">{"\uD83C\uDF19"} Evening</div>
      </div>
      <div className="step-preview-task-item">
        <span className="step-preview-plus">+</span>
        <span>Prepare breakfast</span>
        <span className="step-preview-tag">Daily</span>
      </div>
      <div className="step-preview-task-item">
        <span className="step-preview-plus">+</span>
        <span>Wet market shopping</span>
        <span className="step-preview-tag">Daily</span>
      </div>
    </div>
  );
}

function StepPreviewCode() {
  return (
    <div className="step-preview step-preview-code">
      <div className="step-preview-code-label">Home Code</div>
      <div className="step-preview-code-value">KWN-482</div>
      <div className="step-preview-code-hint">Share this with your helper</div>
    </div>
  );
}

function StepPreviewTrack() {
  return (
    <div className="step-preview step-preview-track">
      <div className="step-preview-progress-ring">
        <svg viewBox="0 0 64 64" className="step-preview-ring-svg">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e5ea" strokeWidth="5" />
          <circle cx="32" cy="32" r="28" fill="none" stroke="#34c759" strokeWidth="5"
            strokeDasharray={`${0.67 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
            strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <span className="step-preview-ring-label">67%</span>
      </div>
      <div className="step-preview-track-stats">
        <div><span className="step-preview-stat-dot step-preview-stat-done" /> 6 Done</div>
        <div><span className="step-preview-stat-dot step-preview-stat-pending" /> 3 Pending</div>
      </div>
    </div>
  );
}

export function LandingClient() {
  const { t } = useTranslation();
  const l = t.landing;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">{t.common.appEmoji} {t.common.appName}</div>
        <div className="landing-nav-right">
          <LanguageSwitcher compact />
          <Link href="/enter" className="landing-btn-secondary" style={{ padding: "0.55rem 1.2rem", fontSize: "0.92rem" }}>
            {l.enterCode}
          </Link>
          <Link href="/admin/login" className="landing-btn-secondary" style={{ padding: "0.55rem 1.2rem", fontSize: "0.92rem" }}>
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
          <Link href="/enter" className="landing-btn-secondary">
            {l.enterCode}
          </Link>
        </div>
      </section>

      {/* "Use your idle device" section */}
      <section className="landing-devices">
        <h2>{l.deviceTitle}</h2>
        <p className="landing-devices-sub">{l.deviceSub}</p>
        <div className="landing-devices-grid">
          <div className="landing-device-card">
            <div className="landing-device-icon">{"\uD83D\uDCF1"}</div>
            <div className="landing-device-emoji-row">
              <span className="landing-device-emoji-item">{"\uD83D\uDCBB"}</span>
              <span className="landing-device-emoji-item">{"\uD83E\uDDF9"}</span>
            </div>
            <h3>{l.devicePad}</h3>
            <p>{l.devicePadDesc}</p>
          </div>
          <div className="landing-device-card">
            <div className="landing-device-icon">{"\uD83D\uDCF2"}</div>
            <h3>{l.devicePhone}</h3>
            <p>{l.devicePhoneDesc}</p>
          </div>
          <div className="landing-device-card">
            <div className="landing-device-icon">{"\u2705"}</div>
            <h3>{l.deviceYou}</h3>
            <p>{l.deviceYouDesc}</p>
          </div>
        </div>
      </section>

      {/* Board showcase mockup */}
      <section className="landing-showcase">
        <h2>{l.showcaseTitle}</h2>
        <p className="landing-showcase-sub">{l.showcaseSub}</p>
        <BoardMockup
          tasks={l.demoTasks}
          labels={{ morning: t.board.morning, afternoon: t.board.afternoon, evening: t.board.evening }}
        />
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

      {/* 3-step how-to with visual previews */}
      <section className="landing-how">
        <h2>{l.howTitle}</h2>
        <div className="landing-steps-v2">
          <div className="landing-step-v2">
            <div className="landing-step-num">1</div>
            <div className="landing-step-content">
              <h3>{l.step1}</h3>
              <p>{l.step1Desc}</p>
            </div>
            <StepPreviewAdmin />
          </div>
          <div className="landing-step-v2">
            <div className="landing-step-num">2</div>
            <div className="landing-step-content">
              <h3>{l.step2}</h3>
              <p>{l.step2Desc}</p>
            </div>
            <StepPreviewCode />
          </div>
          <div className="landing-step-v2">
            <div className="landing-step-num">3</div>
            <div className="landing-step-content">
              <h3>{l.step3}</h3>
              <p>{l.step3Desc}</p>
            </div>
            <StepPreviewTrack />
          </div>
        </div>
      </section>

      {/* SEO keyword section */}
      <section className="landing-seo">
        <h2>{l.seoTitle}</h2>
        <p>{l.seoParagraph}</p>
        <div className="landing-seo-tags">
          {l.seoTags.map((tag) => (
            <span key={tag} className="landing-seo-tag">{tag}</span>
          ))}
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
        <div>{l.footerMade} &middot; {t.common.appEmoji} {t.common.appName}</div>
        <div className="landing-footer-contact">
          {l.footerContact}: <a href="mailto:info@hkmaidboard.com">info@hkmaidboard.com</a>
        </div>
      </footer>
    </div>
  );
}
