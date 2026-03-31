"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function SignupForm() {
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Signup failed.");
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
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ padding: "2rem 1.6rem", animation: "fadeInUp 500ms cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <h1 style={{ marginTop: 0, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
        {a.signupTitle}
      </h1>
      <p style={{ color: "var(--muted)", marginTop: "-0.15rem", marginBottom: "1.4rem", fontSize: "0.95rem" }}>
        {a.signupSubtitle}
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <label className="label" htmlFor="email">{a.email}</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label className="label" htmlFor="password">{a.password}</label>
        <input id="password" className="input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "0.9rem", margin: "0 0 0.8rem" }}>{error}</p>
      ) : null}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={loading}
        style={{ width: "100%", minHeight: 48, fontSize: "1rem", borderRadius: 14 }}
      >
        {loading ? a.creating : a.signUp}
      </button>

      <p style={{ textAlign: "center", marginBottom: 0, marginTop: "1.2rem", color: "var(--muted)", fontSize: "0.92rem" }}>
        {a.hasAccount}{" "}
        <Link href="/admin/login" style={{ color: "var(--primary)", fontWeight: 600 }}>{a.logIn}</Link>
      </p>
      <p style={{ textAlign: "center", marginBottom: 0, marginTop: "0.6rem", color: "var(--muted)", fontSize: "0.9rem" }}>
        <Link href="/try" style={{ color: "var(--primary)", fontWeight: 600 }}>{a.tryWithoutSignup}</Link>
      </p>
    </form>
  );
}
