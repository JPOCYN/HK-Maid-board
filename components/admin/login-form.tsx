"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const a = t.admin;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Login failed.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect. Please check network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: "1.4rem" }}>
      <h1 style={{ marginTop: 0 }}>{a.loginTitle}</h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.2rem" }}>{a.loginSubtitle}</p>

      <div style={{ marginBottom: "0.85rem" }}>
        <label className="label" htmlFor="email">
          {a.email}
        </label>
        <input
          id="email"
          className="input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div style={{ marginBottom: "0.85rem" }}>
        <label className="label" htmlFor="password">
          {a.password}
        </label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error ? <p style={{ color: "#9b1c1c" }}>{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
        {loading ? a.signingIn : a.signIn}
      </button>

      <p style={{ textAlign: "center", marginBottom: 0, marginTop: "1rem", color: "var(--muted)" }}>
        {a.noAccount}{" "}
        <Link href="/admin/signup" style={{ color: "#1d3b82", fontWeight: 600 }}>
          {a.signUp}
        </Link>
      </p>
    </form>
  );
}
