import { getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";

export const dynamic = "force-dynamic";

type SiteRow = {
  name: string;
  site_name: string;
  domain: string;
  status: string;
  ssl_status: string;
  customer: string;
  server: string;
  plan: string;
  storage_used_mb: number;
};

const STATUS_TONE: Record<string, string> = {
  Active: "var(--adm-green)",
  Failed: "var(--adm-red)",
  Suspended: "var(--adm-yellow)",
};

export default async function SitesPage() {
  const sites = await withAuth((sid) =>
    getList<SiteRow>(
      "Space Site",
      {
        fields: ["name", "site_name", "domain", "status", "ssl_status", "customer", "server", "plan", "storage_used_mb"],
        filters: { status: ["!=", "Deleted"] },
        order_by: "modified desc",
        limit_page_length: 200,
      },
      sid,
    ),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-white">Sites</h1>
      <p className="mb-6 text-sm text-[var(--adm-muted)]">{sites.length} site(s) across the fleet.</p>

      <div className="overflow-x-auto rounded-xl border border-[var(--adm-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[var(--adm-surface2)] text-xs uppercase tracking-wide text-[var(--adm-muted)]">
            <tr>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SSL</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Server</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Storage</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.name} className="border-t border-[var(--adm-border)] bg-[var(--adm-surface)]">
                <td className="px-4 py-3 text-white">{s.domain || s.site_name}</td>
                <td className="px-4 py-3" style={{ color: STATUS_TONE[s.status] || "var(--adm-muted)" }}>
                  {s.status}
                </td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{s.ssl_status || "—"}</td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{s.customer || "—"}</td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{s.server || "—"}</td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{s.plan || "—"}</td>
                <td className="px-4 py-3 text-[var(--adm-muted)]">{s.storage_used_mb ?? 0} MB</td>
              </tr>
            ))}
            {!sites.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[var(--adm-muted)]">
                  No sites yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
