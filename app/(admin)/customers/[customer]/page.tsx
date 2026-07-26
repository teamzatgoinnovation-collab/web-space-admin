import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callMethod, getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

type CustomerDoc = {
  name: string;
  customer_name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  user: string;
  notes: string;
};

type SiteRow = {
  name: string;
  domain: string;
  site_name: string;
  status: string;
  server: string;
  plan: string;
  storage_used_mb: number;
};

type SubscriptionRow = {
  name: string;
  plan: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Active: "default",
  Failed: "destructive",
  Suspended: "secondary",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ customer: string }> }) {
  const { customer: rawCustomer } = await params;
  // Customer names can contain spaces (autoname: field:customer_name) — the route
  // segment sometimes arrives still percent-encoded, so decode defensively.
  const customer = decodeURIComponent(rawCustomer);

  const { doc, sites, subscriptions } = await withAuth(async (sid) => {
    const [doc, sites, subscriptions] = await Promise.all([
      callMethod<CustomerDoc>("frappe.client.get", { doctype: "Space Customer", name: customer }, sid),
      getList<SiteRow>(
        "Space Site",
        {
          fields: ["name", "domain", "site_name", "status", "server", "plan", "storage_used_mb"],
          filters: { customer, status: ["!=", "Deleted"] },
          order_by: "modified desc",
        },
        sid,
      ),
      getList<SubscriptionRow>(
        "Space Subscription",
        {
          fields: ["name", "plan", "status", "payment_status", "start_date", "end_date"],
          filters: { customer },
          order_by: "modified desc",
        },
        sid,
      ),
    ]);
    return { doc, sites, subscriptions };
  });

  return (
    <div>
      <Link href="/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="size-3.5" />
        All customers
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{doc.customer_name || doc.name}</h1>
        <Badge variant="secondary">{doc.status}</Badge>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {doc.company ? `${doc.company} · ` : ""}
        {doc.email || "—"} {doc.phone ? `· ${doc.phone}` : ""} {doc.user ? `· linked user: ${doc.user}` : ""}
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Sites ({sites.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Storage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/sites/${encodeURIComponent(s.name)}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {s.domain || s.site_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status] || "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.server || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.plan || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.storage_used_mb ?? 0} MB</TableCell>
                </TableRow>
              ))}
              {!sites.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No sites yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscriptions ({subscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium text-foreground">{s.plan}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status] || "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.payment_status}</TableCell>
                  <TableCell className="text-muted-foreground">{s.start_date || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.end_date || "—"}</TableCell>
                </TableRow>
              ))}
              {!subscriptions.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No subscriptions yet.
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
