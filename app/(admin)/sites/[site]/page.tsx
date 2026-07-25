import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsageGauge } from "@/components/UsageGauge";
import { MetricsTrend, type MetricPoint } from "@/components/MetricsTrend";

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

export default async function SiteDetailPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;

  const { doc, history } = await withAuth(async (sid) => {
    const [doc, history] = await Promise.all([
      callMethod<SiteDoc>("frappe.client.get", { doctype: "Space Site", name: site }, sid),
      callMethod<MetricPoint[]>("space_cloud.api.v2.space.metrics", { site, limit: 48 }, sid),
    ]);
    return { doc, history };
  });

  const latest = history[0];
  const ramPct = latest?.ram_percent ?? (doc.ram_limit_mb ? ((doc.ram_used_mb || 0) / doc.ram_limit_mb) * 100 : 0);
  const diskPct =
    latest?.disk_percent ?? (doc.disk_limit_mb ? ((doc.storage_used_mb || 0) / doc.disk_limit_mb) * 100 : 0);
  const cpuPct = latest?.cpu_percent ?? 0;

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
        Server: {doc.server || "—"} · Plan: {doc.plan || "—"}
      </p>

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
    </div>
  );
}
