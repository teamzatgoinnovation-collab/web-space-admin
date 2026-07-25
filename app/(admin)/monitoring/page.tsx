import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Alert = {
  name: string;
  title: string;
  severity: string;
  status: string;
  metric: string;
  value: number;
  server: string;
  cluster: string;
  opened_at: string;
};

const SEVERITY_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Warning: "secondary",
  Medium: "secondary",
  Low: "secondary",
};

export default async function MonitoringPage() {
  const alerts = await withAuth((sid) =>
    callMethod<Alert[]>("space_cloud.api.v4.space.list_alerts", { status: "Open" }, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Monitoring</h1>
      <p className="mb-6 text-sm text-muted-foreground">{alerts.length} open alert(s).</p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Server / Cluster</TableHead>
                <TableHead>Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                  <TableCell>
                    <Badge variant={SEVERITY_VARIANT[a.severity] || "secondary"}>{a.severity}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.metric} {a.value != null ? `= ${a.value}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.server || a.cluster || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.opened_at}</TableCell>
                </TableRow>
              ))}
              {!alerts.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No open alerts. 🎉
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
