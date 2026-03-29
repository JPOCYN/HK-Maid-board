import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1 style={{ marginTop: 0 }}>MaidBoard</h1>
        <p style={{ color: "var(--muted)", maxWidth: 700 }}>
          A simple household task system with a shared board for helpers and a remote dashboard for owners.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/board" className="btn btn-primary">
            Open Board
          </Link>
          <Link href="/admin" className="btn btn-secondary">
            Open Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
