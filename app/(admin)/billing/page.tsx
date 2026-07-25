import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

type Invoice = {
  name: string;
  customer: string;
  subscription: string;
  status: string;
  payment_status: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount: number;
  currency: string;
};

type Payment = {
  name: string;
  customer: string;
  invoice: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paid_on: string;
  reference: string;
};

type Usage = {
  name: string;
  site: string;
  customer: string;
  period_start: string;
  period_end: string;
  storage_mb: number;
  database_mb: number;
  cpu_hours: number;
  ram_mb_avg: number;
};

const PAY_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Paid: "default",
  Free: "default",
  Failed: "destructive",
  Pending: "secondary",
};

export default async function BillingPage() {
  const [invoices, payments, usage] = await withAuth((sid) =>
    Promise.all([
      callMethod<Invoice[]>("space_cloud.api.v2.space.list_invoices", undefined, sid),
      callMethod<Payment[]>("space_cloud.api.v2.space.list_payment_history", undefined, sid),
      callMethod<Usage[]>("space_cloud.api.v2.space.list_usage", undefined, sid),
    ]),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Billing</h1>
      <p className="mb-6 text-sm text-muted-foreground">Invoices, payments, and usage across all customers.</p>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="usage">Usage ({usage.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.name}>
                      <TableCell className="text-foreground">{i.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {i.period_start} → {i.period_end}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{i.due_date || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {i.amount} {i.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{i.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PAY_VARIANT[i.payment_status] || "secondary"}>{i.payment_status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!invoices.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No invoices yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid on</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="text-foreground">{p.customer}</TableCell>
                      <TableCell className="text-muted-foreground">{p.invoice || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.amount} {p.currency}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.method}</TableCell>
                      <TableCell>
                        <Badge variant={PAY_VARIANT[p.status] || "secondary"}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.paid_on || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {!payments.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No payments yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>CPU hrs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((u) => (
                    <TableRow key={u.name}>
                      <TableCell className="text-foreground">{u.site}</TableCell>
                      <TableCell className="text-muted-foreground">{u.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.period_start} → {u.period_end}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.storage_mb} MB</TableCell>
                      <TableCell className="text-muted-foreground">{u.database_mb} MB</TableCell>
                      <TableCell className="text-muted-foreground">{u.cpu_hours}</TableCell>
                    </TableRow>
                  ))}
                  {!usage.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                        No usage records yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
