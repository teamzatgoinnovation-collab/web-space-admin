import { getList } from "@/lib/frappe-admin";
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

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Active: "default",
  Failed: "destructive",
  Suspended: "secondary",
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium text-foreground">{s.domain || s.site_name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status] || "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.ssl_status || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.customer || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.server || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.plan || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.storage_used_mb ?? 0} MB</TableCell>
                </TableRow>
              ))}
              {!sites.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
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
