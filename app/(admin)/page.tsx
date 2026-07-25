import Link from "next/link";
import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DashboardSummary = {
  customers: number;
  servers: number;
  sites: number;
  active_sites: number;
  failed_jobs: number;
  running_jobs: number;
  subscriptions: number;
  trials: number;
  expiring_plans: number;
  revenue: number;
  cpu_usage: number;
  disk_usage: number;
  backup_status: { succeeded: number; failed: number };
  server_health: { name: string; health: string; status: string }[];
};

function Stat({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  tone?: "red" | "green";
  href?: string;
}) {
  const card = (
    <Card className={cn(href && "transition-colors hover:border-primary/50 hover:bg-secondary/40")}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold",
            tone === "red" && "text-destructive",
            tone === "green" && "text-emerald-500",
            !tone && "text-foreground",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

export default async function DashboardPage() {
  const data = await withAuth((sid) =>
    callMethod<DashboardSummary>("space_cloud.api.v2.space.admin_dashboard", undefined, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Fleet Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Live snapshot across every region and server.</p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Customers" value={data.customers} />
        <Stat label="Servers" value={data.servers} href="/servers" />
        <Stat label="Sites (active)" value={`${data.active_sites} / ${data.sites}`} href="/sites" />
        <Stat label="Subscriptions" value={data.subscriptions} href="/billing" />
        <Stat label="Running jobs" value={data.running_jobs} href="/jobs" />
        <Stat label="Failed jobs" value={data.failed_jobs} tone={data.failed_jobs > 0 ? "red" : undefined} href="/jobs" />
        <Stat label="Trials" value={data.trials} href="/billing" />
        <Stat
          label="Expiring plans (14d)"
          value={data.expiring_plans}
          tone={data.expiring_plans > 0 ? "red" : undefined}
          href="/billing"
        />
        <Stat label="Revenue" value={`$${data.revenue.toFixed(2)}`} href="/billing" />
        <Stat label="Avg CPU" value={`${data.cpu_usage}%`} href="/servers" />
        <Stat label="Disk used" value={`${(data.disk_usage / 1024).toFixed(1)} GB`} href="/servers" />
        <Stat
          label="Backups"
          value={`${data.backup_status.succeeded} ok / ${data.backup_status.failed} failed`}
          tone={data.backup_status.failed > 0 ? "red" : "green"}
          href="/backups"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Server health</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {data.server_health.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2 text-sm"
            >
              <span>{s.name}</span>
              <span className="text-muted-foreground">
                {s.status} · {s.health}
              </span>
            </div>
          ))}
          {!data.server_health.length ? <p className="text-sm text-muted-foreground">No servers yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
