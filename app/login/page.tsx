"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usr, pwd }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed.");
        setBusy(false);
        return;
      }
      router.push(params.get("redirect-to") || "/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--adm-accent)]">
          ZatGo Space
        </span>
        <h1 className="mt-1 text-2xl font-semibold text-white">Admin Console</h1>
        <p className="mt-2 text-sm text-[var(--adm-muted)]">
          Sign in with your space.zatgo.online admin account.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--adm-muted)]">Email</label>
          <input
            type="email"
            required
            autoFocus
            value={usr}
            onChange={(e) => setUsr(e.target.value)}
            className="w-full rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--adm-accent)]"
            placeholder="you@zatgo.online"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--adm-muted)]">Password</label>
          <input
            type="password"
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--adm-accent)]"
            placeholder="••••••••"
          />
        </div>
        {error ? <p className="text-sm text-[var(--adm-red)]">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-lg bg-[var(--adm-accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
