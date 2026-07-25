"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Server,
  Activity,
  ListChecks,
  DatabaseBackup,
  Link2,
  Receipt,
  Store,
  LifeBuoy,
  KeyRound,
  Network,
  ShieldCheck,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { title: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/sites", label: "Sites", icon: Globe },
      { href: "/servers", label: "Servers", icon: Server },
      { href: "/monitoring", label: "Monitoring", icon: Activity },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/jobs", label: "Jobs", icon: ListChecks },
      { href: "/backups", label: "Backups", icon: DatabaseBackup },
      { href: "/domains", label: "Domains", icon: Link2 },
    ],
  },
  {
    title: "Customer",
    items: [
      { href: "/billing", label: "Billing", icon: Receipt },
      { href: "/marketplace", label: "Marketplace", icon: Store },
      { href: "/support", label: "Support", icon: LifeBuoy },
      { href: "/licenses", label: "Licenses", icon: KeyRound },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/infrastructure", label: "Infrastructure", icon: Network },
      { href: "/security", label: "Security", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export function AdminSidebar() {
  const path = usePathname() || "/";
  const router = useRouter();

  const isActive = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-border bg-background sm:flex">
      <Link href="/" className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <SettingsIcon className="size-4" />
        </span>
        <span>
          <span className="block text-[0.6rem] font-bold tracking-[0.12em] text-primary uppercase">ZatGo Space</span>
          <span className="text-sm font-extrabold text-foreground">Admin Console</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-2 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
