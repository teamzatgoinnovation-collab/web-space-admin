import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";

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

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "red" | "green" }) {
  return (
    <div className="rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface)] p-4">
      <p className="text-xs text-[var(--adm-muted)]">{label}</p>
      <p
        className="mt-1 text-2xl font-semibold"
        style={{ color: tone === "red" ? "var(--adm-red)" : tone === "green" ? "var(--adm-green)" : "#fff" }}
      >
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await withAuth((sid) =>
    callMethod<DashboardSummary>("space_cloud.api.v2.space.admin_dashboard", undefined, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-white">Fleet Dashboard</h1>
      <p className="mb-6 text-sm text-[var(--adm-muted)]">Live snapshot across every region and server.</p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Customers" value={data.customers} />
        <Stat label="Servers" value={data.servers} />
        <Stat label="Sites (active)" value={`${data.active_sites} / ${data.sites}`} />
        <Stat label="Subscriptions" value={data.subscriptions} />
        <Stat label="Running jobs" value={data.running_jobs} />
        <Stat label="Failed jobs" value={data.failed_jobs} tone={data.failed_jobs > 0 ? "red" : undefined} />
        <Stat label="Trials" value={data.trials} />
        <Stat label="Expiring plans (14d)" value={data.expiring_plans} tone={data.expiring_plans > 0 ? "red" : undefined} />
        <Stat label="Revenue" value={`$${data.revenue.toFixed(2)}`} />
        <Stat label="Avg CPU" value={`${data.cpu_usage}%`} />
        <Stat label="Disk used" value={`${(data.disk_usage / 1024).toFixed(1)} GB`} />
        <Stat
          label="Backups"
          value={`${data.backup_status.succeeded} ok / ${data.backup_status.failed} failed`}
          tone={data.backup_status.failed > 0 ? "red" : "green"}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Server health</h2>
        <ul className="space-y-2 text-sm">
          {data.server_health.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface)] px-4 py-2"
            >
              <span>{s.name}</span>
              <span className="text-[var(--adm-muted)]">
                {s.status} · {s.health}
              </span>
            </li>
          ))}
          {!data.server_health.length ? <li className="text-[var(--adm-muted)]">No servers yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
