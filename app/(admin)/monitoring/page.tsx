import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";

export const dynamic = "force-dynamic";

type Alert = {
  name: string;
  title: string;
  severity: string;
  status: string;
  metric: string;
  value: number;
  server: string;
  cluster: string;
  opened_at: string;
};

const SEVERITY_TONE: Record<string, string> = {
  Critical: "var(--adm-red)",
  High: "var(--adm-red)",
  Warning: "var(--adm-yellow)",
  Medium: "var(--adm-yellow)",
  Low: "var(--adm-muted)",
};

export default async function MonitoringPage() {
  const alerts = await withAuth((sid) =>
    callMethod<Alert[]>("space_cloud.api.v4.space.list_alerts", { status: "Open" }, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-white">Monitoring</h1>
      <p className="mb-6 text-sm text-[var(--adm-muted)]">{alerts.length} open alert(s).</p>

      <div className="overflow-x-auto rounded-xl border border-[var(--adm-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--adm-surface2)] text-xs uppercase tracking-wide text-[var(--adm-muted)]">
            <tr>
              <th className="px-4 py-3">Alert</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Server / Cluster</th>
              <th className="px-4 py-3">Opened</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.name} className="border-t border-[var(--adm-border)] bg-[var(--adm-surface)]">
                <td className="px-4 py-3 text-white">{a.title}</td>
                <td className="px-4 py-3" style={{ color: SEVERITY_TONE[a.severity] || "var(--adm-muted)" }}>
                  {a.severity}
                </td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">
                  {a.metric} {a.value != null ? `= ${a.value}` : ""}
                </td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{a.server || a.cluster || "—"}</td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{a.opened_at}</td>
              </tr>
            ))}
            {!alerts.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[var(--adm-muted)]">
                  No open alerts. 🎉
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
