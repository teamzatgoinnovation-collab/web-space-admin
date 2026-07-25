import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callMethod, getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UsageGauge } from "@/components/UsageGauge";
import { MetricsTrend, type MetricPoint } from "@/components/MetricsTrend";
import { SiteLogsPanel } from "@/components/SiteLogsPanel";
import { SiteBenchActions, ChangePlanForm, type PlanOption } from "./site-actions";

export const dynamic = "force-dynamic";

type SiteDoc = {
  name: string;
  site_name: string;
  domain: string;
  status: string;
  server: string;
  plan: string;
  ram_limit_mb: number;
  disk_limit_mb: number;
  storage_used_mb: number;
  ram_used_mb: number;
};

type SiteUsage = {
  storage_used_mb: number;
  database_size_mb: number;
  public_files_mb: number;
  private_files_mb: number;
  backup_files_mb: number;
  site_user_count: number;
  site_company_count: number;
  usage_last_scanned_at: string | null;
};

type QuotaDimension = { used: number; limit: number | null; remaining: number | null; percent: number | null; status: string };
type SiteQuota = {
  storage: QuotaDimension;
  users: QuotaDimension;
  companies: QuotaDimension;
  overall_status: string;
};

const QUOTA_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  Warning: "secondary",
  Critical: "destructive",
};

function QuotaRow({ label, dim }: { label: string; dim: QuotaDimension }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {dim.limit == null
            ? `${dim.used} used · Unlimited`
            : `${dim.used} / ${dim.limit} · ${dim.remaining} remaining`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={dim.percent ?? 0} className="flex-1" />
        <Badge variant={QUOTA_VARIANT[dim.status] || "secondary"}>{dim.status}</Badge>
      </div>
    </div>
  );
}

export default async function SiteDetailPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  const { doc, history, usage, quota, logFiles, plans } = await withAuth(async (sid) => {
    const [doc, history, usage, quota, logFiles, plans] = await Promise.all([
      callMethod<SiteDoc>("frappe.client.get", { doctype: "Space Site", name: site }, sid),
      callMethod<MetricPoint[]>("space_cloud.api.v2.space.metrics", { site, limit: 48 }, sid),
      callMethod<SiteUsage>("space_cloud.api.v4.space.site_usage", { site }, sid),
      callMethod<SiteQuota>("space_cloud.api.v4.space.site_quota", { site }, sid),
      callMethod<string[]>("space_cloud.api.v4.space.site_log_files", { site }, sid),
      getList<PlanOption>("Space Plan", { fields: ["name", "title"], filters: { is_active: 1 }, order_by: "sort_order asc" }, sid),
    ]);
    return { doc, history, usage, quota, logFiles, plans };
  });

  const latest = history[0];
  const ramPct = latest?.ram_percent ?? (doc.ram_limit_mb ? ((doc.ram_used_mb || 0) / doc.ram_limit_mb) * 100 : 0);
  const diskPct =
    latest?.disk_percent ?? (doc.disk_limit_mb ? ((doc.storage_used_mb || 0) / doc.disk_limit_mb) * 100 : 0);
  const cpuPct = latest?.cpu_percent ?? 0;

  const storageParts = [
    { label: "Database", mb: usage.database_size_mb },
    { label: "Public files", mb: usage.public_files_mb },
    { label: "Private files", mb: usage.private_files_mb },
    { label: "Backups", mb: usage.backup_files_mb },
  ];
  const storageTotal = storageParts.reduce((sum, p) => sum + (p.mb || 0), 0) || 1;

  return (
    <div>
      <Link href="/sites" className="mb-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="size-3.5" />
        All sites
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{doc.domain || doc.site_name}</h1>
        <Badge variant="secondary">{doc.status}</Badge>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Server: {doc.server || "—"} · Plan: {doc.plan || "—"} · {usage.site_user_count} user(s) ·{" "}
        {usage.site_company_count} compan{usage.site_company_count === 1 ? "y" : "ies"}
        {usage.usage_last_scanned_at ? ` · usage as of ${new Date(usage.usage_last_scanned_at).toLocaleString()}` : ""}
      </p>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap justify-around gap-6">
              <UsageGauge label="CPU" percent={cpuPct} />
              <UsageGauge
                label="RAM"
                percent={ramPct}
                detail={doc.ram_limit_mb ? `${doc.ram_used_mb || 0} / ${doc.ram_limit_mb} MB` : undefined}
              />
              <UsageGauge
                label="Storage"
                percent={diskPct}
                detail={doc.disk_limit_mb ? `${doc.storage_used_mb || 0} / ${doc.disk_limit_mb} MB` : undefined}
              />
            </div>
            <MetricsTrend points={history} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {storageParts.map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{p.label}</span>
                  <span className="text-muted-foreground">{(p.mb || 0).toFixed(1)} MB</span>
                </div>
                <Progress value={((p.mb || 0) / storageTotal) * 100} />
              </div>
            ))}
            <p className="mt-1 text-xs text-muted-foreground">
              Total {(usage.storage_used_mb || 0).toFixed(1)} MB on disk.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quota</CardTitle>
            <Badge variant={QUOTA_VARIANT[quota.overall_status] || "secondary"}>{quota.overall_status}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <QuotaRow label="Storage" dim={quota.storage} />
            <QuotaRow label="Users" dim={quota.users} />
            <QuotaRow label="Companies" dim={quota.companies} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <SiteLogsPanel site={site} files={logFiles} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePlanForm site={site} currentPlan={doc.plan} plans={plans} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Apps &amp; bench actions</CardTitle>
          </CardHeader>
          <CardContent>
            <SiteBenchActions site={site} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
