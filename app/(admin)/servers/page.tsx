import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";

export const dynamic = "force-dynamic";

type Region = { name: string; region_code: string; title: string; country: string; status: string };
type Cluster = {
  name: string;
  cluster_name: string;
  title: string;
  region: string;
  status: string;
  health: string;
  active_sites: number;
  max_sites: number;
};
type Server = {
  name: string;
  title: string;
  status: string;
  health: string;
  cpu_cores: number;
  cpu_used_percent: number;
  ram_mb: number;
  ram_used_mb: number;
  disk_mb: number;
  disk_used_mb: number;
  active_sites: number;
};
type Infra = { regions: Region[]; clusters: Cluster[]; servers: Server[]; alerts_open: number };

function pct(used: number, total: number) {
  if (!total) return "—";
  return `${Math.round((used / total) * 100)}%`;
}

export default async function ServersPage() {
  const data = await withAuth((sid) => callMethod<Infra>("space_cloud.api.v4.space.infra_status", undefined, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-white">Servers &amp; Infrastructure</h1>
      <p className="mb-6 text-sm text-[var(--adm-muted)]">
        {data.servers.length} server(s) · {data.clusters.length} cluster(s) · {data.regions.length} region(s) ·{" "}
        <span style={{ color: data.alerts_open > 0 ? "var(--adm-red)" : "var(--adm-muted)" }}>
          {data.alerts_open} open alert(s)
        </span>
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium text-white">Servers</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--adm-border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--adm-surface2)] text-xs uppercase tracking-wide text-[var(--adm-muted)]">
              <tr>
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">CPU</th>
                <th className="px-4 py-3">RAM</th>
                <th className="px-4 py-3">Disk</th>
                <th className="px-4 py-3">Active sites</th>
              </tr>
            </thead>
            <tbody>
              {data.servers.map((s) => (
                <tr key={s.name} className="border-t border-[var(--adm-border)] bg-[var(--adm-surface)]">
                  <td className="px-4 py-3 text-white">{s.title || s.name}</td>
                  <td className="px-4 py-3" style={{ color: s.health === "Healthy" ? "var(--adm-green)" : "var(--adm-red)" }}>
                    {s.status} / {s.health}
                  </td>
                  <td className="px-4 py-3 text-[var(--adm-muted)]">{s.cpu_used_percent ?? 0}%</td>
                  <td className="px-4 py-3 text-[var(--adm-muted)]">{pct(s.ram_used_mb, s.ram_mb)}</td>
                  <td className="px-4 py-3 text-[var(--adm-muted)]">{pct(s.disk_used_mb, s.disk_mb)}</td>
                  <td className="px-4 py-3 text-[var(--adm-muted)]">{s.active_sites ?? 0}</td>
                </tr>
              ))}
              {!data.servers.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[var(--adm-muted)]">
                    No servers registered.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium text-white">Clusters</h2>
        <ul className="space-y-2 text-sm">
          {data.clusters.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface)] px-4 py-2"
            >
              <span className="text-white">{c.title || c.cluster_name}</span>
              <span className="text-[var(--adm-muted)]">
                {c.region} · {c.status}/{c.health} · {c.active_sites}/{c.max_sites} sites
              </span>
            </li>
          ))}
          {!data.clusters.length ? <li className="text-[var(--adm-muted)]">No clusters yet.</li> : null}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Regions</h2>
        <ul className="space-y-2 text-sm">
          {data.regions.map((r) => (
            <li key={r.name} className="text-[var(--adm-muted)]">
              {r.title} {r.country ? `· ${r.country}` : ""}
            </li>
          ))}
          {!data.regions.length ? <li className="text-[var(--adm-muted)]">No regions yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
