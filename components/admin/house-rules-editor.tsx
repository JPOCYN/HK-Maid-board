"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function HouseRulesEditor() {
  const { t } = useTranslation();
  const a = t.admin;

  const [rules, setRules] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/house-rules");
      if (!res.ok) return;
      const data = await res.json();
      setRules(data.houseRules ?? "");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/house-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseRules: rules }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function appendTemplate(content: string) {
    setRules((prev) => {
      if (!prev.trim()) return content;
      return prev.trimEnd() + "\n\n" + content;
    });
  }

  const templates = [
    { label: a.rulesTemplateGeneral, content: a.rulesTemplateGeneralContent, emoji: "\uD83C\uDFE0" },
    { label: a.rulesTemplateKitchen, content: a.rulesTemplateKitchenContent, emoji: "\uD83C\uDF73" },
    { label: a.rulesTemplateBaby, content: a.rulesTemplateBabyContent, emoji: "\uD83D\uDC76" },
    { label: a.rulesTemplateLaundry, content: a.rulesTemplateLaundryContent, emoji: "\uD83E\uDDFA" },
    { label: a.rulesTemplateSafety, content: a.rulesTemplateSafetyContent, emoji: "\uD83D\uDEE1\uFE0F" },
  ];

  if (!loaded) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#8e8e93" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(120,120,128,0.12)",
            borderTopColor: "#007aff",
            borderRadius: "50%",
            animation: "spin 800ms linear infinite",
            margin: "0 auto 0.75rem",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "0.85rem" }}>
      {/* Editor */}
      <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.15rem" }}>{a.rulesTitle}</div>
        <p style={{ color: "var(--muted)", margin: "0 0 0.85rem", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {a.rulesHint}
        </p>
        <textarea
          className="input"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder={a.rulesPlaceholder}
          rows={14}
          style={{
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: "0.95rem",
            lineHeight: 1.65,
            borderRadius: 14,
            padding: "0.85rem 1rem",
            minHeight: 200,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "0.55rem 1.4rem", fontSize: "0.95rem" }}
            onClick={save}
            disabled={saving}
          >
            {saving ? a.rulesSaving : saved ? a.rulesSaved : a.rulesSave}
          </button>
          {saved ? (
            <span style={{ color: "#34c759", fontSize: "0.88rem", fontWeight: 600 }}>{"\u2713"}</span>
          ) : null}
        </div>
      </section>

      {/* Starter Templates */}
      <section className="card" style={{ padding: "1.2rem 1.4rem" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.15rem" }}>{a.rulesTemplateTitle}</div>
        <p style={{ color: "var(--muted)", margin: "0 0 0.75rem", fontSize: "0.85rem" }}>
          {a.rulesTemplateHint}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {templates.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.88rem", padding: "0.45rem 0.85rem" }}
              onClick={() => appendTemplate(tmpl.content)}
            >
              {tmpl.emoji} {tmpl.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
