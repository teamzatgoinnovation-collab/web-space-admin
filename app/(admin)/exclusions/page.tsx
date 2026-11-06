import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LifecycleEvent } from "../sites/[site]/lifecycle-actions";

export const dynamic = "force-dynamic";

type Exclusion = { site: string; customer: string | null; reason: string; owner: string; creation: string };

export default async function ExclusionsPage() {
  const [exclusions, events] = await withAuth((sid) =>
    Promise.all([
      callMethod<Exclusion[]>("space.api.lifecycle.list_exclusions", {}, sid),
      callMethod<(LifecycleEvent & { site: string | null })[]>("space.api.lifecycle.list_events", { limit: 200 }, sid),
    ]),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Deletion exclusions &amp; lifecycle audit</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sites listed here are never deleted automatically. Add or remove one from the site's page.
      </p>

      <Card className="mb-8">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Site</TableHead><TableHead>Customer</TableHead><TableHead>Reason</TableHead><TableHead>Added by</TableHead><TableHead>Added</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {exclusions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-muted-foreground">No exclusions.</TableCell></TableRow>
              ) : exclusions.map((e) => (
                <TableRow key={e.site}>
                  <TableCell className="font-medium">{e.site}</TableCell>
                  <TableCell>{e.customer || "-"}</TableCell>
                  <TableCell>{e.reason}</TableCell>
                  <TableCell>{e.owner}</TableCell>
                  <TableCell>{e.creation?.slice(0, 16)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h2 className="mb-2 text-lg font-semibold">Recent lifecycle events (all sites)</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead>When</TableHead><TableHead>Site</TableHead><TableHead>Event</TableHead><TableHead>Status</TableHead><TableHead>Actor</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.name}>
                  <TableCell>{e.creation?.slice(0, 16)}</TableCell>
                  <TableCell>{e.site || "-"}</TableCell>
                  <TableCell>{e.kind}</TableCell>
                  <TableCell><Badge variant={e.status === "Failed" ? "destructive" : "secondary"}>{e.status}</Badge></TableCell>
                  <TableCell>{e.actor || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
