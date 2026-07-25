import Link from "next/link";
import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UsageGauge } from "@/components/UsageGauge";
import { MetricsTrend, type MetricPoint } from "@/components/MetricsTrend";

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

type Server = {
  name: string;
  title: string;
  cpu_used_percent: number;
  ram_mb: number;
  ram_used_mb: number;
  disk_mb: number;
  disk_used_mb: number;
};
type Infra = { servers: Server[] };

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
  const { data, infra, history } = await withAuth(async (sid) => {
    const [data, infra] = await Promise.all([
      callMethod<DashboardSummary>("space_cloud.api.v2.space.admin_dashboard", undefined, sid),
      callMethod<Infra>("space_cloud.api.v4.space.infra_status", undefined, sid),
    ]);
    const primaryServer = infra.servers[0]?.name;
    const history = primaryServer
      ? await callMethod<MetricPoint[]>(
          "space_cloud.api.v2.space.metrics",
          { server: primaryServer, limit: 48 },
          sid,
        )
      : [];
    return { data, infra, history };
  });

  const ramTotal = infra.servers.reduce((sum, s) => sum + (s.ram_mb || 0), 0);
  const ramUsed = infra.servers.reduce((sum, s) => sum + (s.ram_used_mb || 0), 0);
  const diskTotal = infra.servers.reduce((sum, s) => sum + (s.disk_mb || 0), 0);
  const diskUsed = infra.servers.reduce((sum, s) => sum + (s.disk_used_mb || 0), 0);
  const ramPct = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;
  const diskPct = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Fleet Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Live snapshot across every region and server.</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Resource usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap justify-around gap-6">
            <UsageGauge label="CPU" percent={data.cpu_usage} detail="fleet average" />
            <UsageGauge
              label="RAM"
              percent={ramPct}
              detail={`${(ramUsed / 1024).toFixed(1)} / ${(ramTotal / 1024).toFixed(1)} GB · ${((ramTotal - ramUsed) / 1024).toFixed(1)} GB free`}
            />
            <UsageGauge
              label="Disk"
              percent={diskPct}
              detail={`${(diskUsed / 1024).toFixed(1)} / ${(diskTotal / 1024).toFixed(1)} GB · ${((diskTotal - diskUsed) / 1024).toFixed(1)} GB free`}
            />
          </div>
          <MetricsTrend points={history} />
        </CardContent>
      </Card>

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
