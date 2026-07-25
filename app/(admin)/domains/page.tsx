import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttachDomainForm, DomainActions } from "./domain-actions";

export const dynamic = "force-dynamic";

export type Domain = {
  name: string;
  site: string;
  domain: string;
  is_primary: number;
  ssl_status: string;
  dns_status: string;
  verified_at: string;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Verified: "default",
  Wildcard: "default",
  Pending: "secondary",
  Failed: "destructive",
};

export default async function DomainsPage() {
  const domains = await withAuth((sid) => callMethod<Domain[]>("space_cloud.api.v2.space.list_domains", {}, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Domains</h1>
      <p className="mb-6 text-sm text-muted-foreground">{domains.length} domain(s) across the fleet.</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Attach a domain</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachDomainForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium text-foreground">{d.domain}</TableCell>
                  <TableCell className="text-muted-foreground">{d.site}</TableCell>
                  <TableCell>{d.is_primary ? <Badge variant="secondary">Primary</Badge> : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[d.dns_status] || "secondary"}>{d.dns_status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[d.ssl_status] || "secondary"}>{d.ssl_status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DomainActions domain={d} />
                  </TableCell>
                </TableRow>
              ))}
              {!domains.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No domains yet.
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
