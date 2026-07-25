import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type Region = { name: string; region_code: string; title: string; country: string; status: string };
type Cluster = {
  name: string;
  cluster_name: string;
  title: string;
  region: string;
  status: string;
  health: string;
  active_sites: number;
  max_sites: number;
};
type Server = {
  name: string;
  title: string;
  status: string;
  health: string;
  cpu_cores: number;
  cpu_used_percent: number;
  ram_mb: number;
  ram_used_mb: number;
  disk_mb: number;
  disk_used_mb: number;
  active_sites: number;
};
type Infra = { regions: Region[]; clusters: Cluster[]; servers: Server[]; alerts_open: number };

function pct(used: number, total: number) {
  if (!total) return "—";
  return `${Math.round((used / total) * 100)}%`;
}

export default async function ServersPage() {
  const data = await withAuth((sid) => callMethod<Infra>("space_cloud.api.v4.space.infra_status", undefined, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Servers &amp; Infrastructure</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {data.servers.length} server(s) · {data.clusters.length} cluster(s) · {data.regions.length} region(s) ·{" "}
        <span className={data.alerts_open > 0 ? "text-destructive" : "text-muted-foreground"}>
          {data.alerts_open} open alert(s)
        </span>
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Servers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>RAM</TableHead>
                <TableHead>Disk</TableHead>
                <TableHead>Active sites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.servers.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium text-foreground">{s.title || s.name}</TableCell>
                  <TableCell>
                    <Badge variant={s.health === "Healthy" ? "default" : "destructive"}>
                      {s.status} / {s.health}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.cpu_used_percent ?? 0}%</TableCell>
                  <TableCell className="text-muted-foreground">{pct(s.ram_used_mb, s.ram_mb)}</TableCell>
                  <TableCell className="text-muted-foreground">{pct(s.disk_used_mb, s.disk_mb)}</TableCell>
                  <TableCell className="text-muted-foreground">{s.active_sites ?? 0}</TableCell>
                </TableRow>
              ))}
              {!data.servers.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No servers registered.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Clusters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {data.clusters.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm"
            >
              <span className="text-foreground">{c.title || c.cluster_name}</span>
              <span className="text-muted-foreground">
                {c.region} · {c.status}/{c.health} · {c.active_sites}/{c.max_sites} sites
              </span>
            </div>
          ))}
          {!data.clusters.length ? <p className="text-sm text-muted-foreground">No clusters yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {data.regions.map((r) => (
            <p key={r.name} className="text-sm text-muted-foreground">
              {r.title} {r.country ? `· ${r.country}` : ""}
            </p>
          ))}
          {!data.regions.length ? <p className="text-sm text-muted-foreground">No regions yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
