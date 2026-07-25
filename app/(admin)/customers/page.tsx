import Link from "next/link";
import { getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type CustomerRow = {
  name: string;
  customer_name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  user: string;
};

type SiteRow = { name: string; customer: string; status: string; storage_used_mb: number };

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Active: "default",
  Inactive: "secondary",
  Suspended: "destructive",
};

export default async function CustomersPage() {
  const { customers, sitesByCustomer } = await withAuth(async (sid) => {
    const [customers, sites] = await Promise.all([
      getList<CustomerRow>(
        "Space Customer",
        { fields: ["name", "customer_name", "company", "email", "phone", "status", "user"], order_by: "customer_name asc" },
        sid,
      ),
      getList<SiteRow>(
        "Space Site",
        { fields: ["name", "customer", "status", "storage_used_mb"], filters: { status: ["!=", "Deleted"] }, limit_page_length: 500 },
        sid,
      ),
    ]);
    const sitesByCustomer = new Map<string, SiteRow[]>();
    for (const s of sites) {
      if (!s.customer) continue;
      const list = sitesByCustomer.get(s.customer) || [];
      list.push(s);
      sitesByCustomer.set(s.customer, list);
    }
    return { customers, sitesByCustomer };
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Customers</h1>
      <p className="mb-6 text-sm text-muted-foreground">{customers.length} customer(s).</p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sites</TableHead>
                <TableHead>Active sites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const sites = sitesByCustomer.get(c.name) || [];
                const active = sites.filter((s) => s.status === "Active").length;
                return (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/customers/${encodeURIComponent(c.name)}`}
                        className="text-foreground hover:text-primary hover:underline"
                      >
                        {c.customer_name || c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.company || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] || "secondary"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sites.length}</TableCell>
                    <TableCell className="text-muted-foreground">{active}</TableCell>
                  </TableRow>
                );
              })}
              {!customers.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No customers yet.
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
