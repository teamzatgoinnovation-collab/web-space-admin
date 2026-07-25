import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewTicketForm, ReplyButton } from "./support-actions";

export const dynamic = "force-dynamic";

type Ticket = {
  name: string;
  subject: string;
  customer: string;
  site: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string;
  creation: string;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Open: "secondary",
  "In Progress": "default",
  Resolved: "default",
  Closed: "secondary",
};

const PRIORITY_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Urgent: "destructive",
  High: "destructive",
  Medium: "secondary",
  Low: "secondary",
};

export default async function SupportPage() {
  const tickets = await withAuth((sid) => callMethod<Ticket[]>("space_cloud.api.v3.space.list_tickets", {}, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Support</h1>
      <p className="mb-6 text-sm text-muted-foreground">{tickets.length} ticket(s).</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <NewTicketForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.name}>
                  <TableCell className="text-foreground">{t.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{t.customer || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[t.priority] || "secondary"}>{t.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[t.status] || "secondary"}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.creation}</TableCell>
                  <TableCell className="text-right">
                    <ReplyButton ticket={t.name} />
                  </TableCell>
                </TableRow>
              ))}
              {!tickets.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No tickets yet.
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
