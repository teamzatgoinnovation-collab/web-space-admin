import Link from "next/link";
import { callMethod, getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

type QuotaSummaryRow = { site: string; domain: string; quota_percent: number | null; status: string };

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Active: "default",
  Failed: "destructive",
  Suspended: "secondary",
};

const QUOTA_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Healthy: "default",
  Warning: "secondary",
  Critical: "destructive",
};

export default async function SitesPage() {
  const { sites, quotaBySite } = await withAuth(async (sid) => {
    const [sites, quotaRows] = await Promise.all([
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
      callMethod<QuotaSummaryRow[]>("space_cloud.api.v4.space.fleet_quota_summary", undefined, sid),
    ]);
    const quotaBySite = new Map(quotaRows.map((q) => [q.site, q]));
    return { sites, quotaBySite };
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Sites</h1>
      <p className="mb-6 text-sm text-muted-foreground">{sites.length} site(s) across the fleet.</p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Quota %</TableHead>
                <TableHead>Quota Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((s) => {
                const q = quotaBySite.get(s.name);
                return (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">
                      <Link href={`/sites/${encodeURIComponent(s.name)}`} className="text-foreground hover:text-primary hover:underline">
                        {s.domain || s.site_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[s.status] || "secondary"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.ssl_status || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.customer ? (
                        <Link href={`/customers/${encodeURIComponent(s.customer)}`} className="hover:text-primary hover:underline">
                          {s.customer}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.server || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.plan || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.storage_used_mb ?? 0} MB</TableCell>
                    <TableCell className="text-muted-foreground">
                      {q?.quota_percent != null ? `${q.quota_percent}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={QUOTA_VARIANT[q?.status || "Healthy"] || "secondary"}>{q?.status || "Healthy"}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!sites.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                    No sites yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
