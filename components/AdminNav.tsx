"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/sites", label: "Sites" },
  { href: "/servers", label: "Servers" },
  { href: "/monitoring", label: "Monitoring" },
];

export function AdminNav() {
  const path = usePathname() || "/";
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      style={{ height: "var(--adm-nav-h)" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--adm-border)] bg-[var(--adm-bg)]"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ background: "var(--adm-accent)" }}
          >
            ⚙
          </span>
          <span>
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--adm-accent)]">
              ZatGo Space
            </span>
            <span className="text-base font-extrabold text-white">Admin Console</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium"
                style={{
                  color: active ? "#fff" : "var(--adm-muted)",
                  background: active ? "var(--adm-surface2)" : "transparent",
                  border: active ? "1px solid var(--adm-border)" : "1px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface2)] px-3 py-1.5 text-sm font-medium text-[var(--adm-muted)] hover:text-white"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
