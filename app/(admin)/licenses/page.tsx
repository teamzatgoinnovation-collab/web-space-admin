import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LicenseActions, NewLicenseForm } from "./license-actions";

export const dynamic = "force-dynamic";

export type License = {
  name: string;
  license_key: string;
  customer: string;
  plan: string;
  site: string;
  status: string;
  issued_on: string;
  expires_on: string;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Active: "default",
  Expired: "destructive",
  Deactivated: "secondary",
};

export default async function LicensesPage() {
  const licenses = await withAuth((sid) => callMethod<License[]>("space_cloud.api.v3.space.list_licenses", {}, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Licenses</h1>
      <p className="mb-6 text-sm text-muted-foreground">{licenses.length} license(s).</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Issue a license</CardTitle>
        </CardHeader>
        <CardContent>
          <NewLicenseForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((l) => (
                <TableRow key={l.name}>
                  <TableCell className="font-mono text-xs text-foreground">{l.license_key}</TableCell>
                  <TableCell className="text-muted-foreground">{l.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{l.plan || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[l.status] || "secondary"}>{l.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.expires_on || "—"}</TableCell>
                  <TableCell className="text-right">
                    <LicenseActions license={l} />
                  </TableCell>
                </TableRow>
              ))}
              {!licenses.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No licenses yet.
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
