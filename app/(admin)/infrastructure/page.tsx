import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DockerControls, MaintenanceForm, MigrationForm } from "./infra-actions";

export const dynamic = "force-dynamic";

type Migration = {
  name: string;
  site: string;
  source_server: string;
  target_server: string;
  status: string;
  validation_ok: number;
  job: string;
};

type Forecast = {
  name: string;
  server?: string;
  metric?: string;
  horizon_days?: number;
  predicted_value?: number;
  creation: string;
};

type DockerRow = { id: string; name: string; status: string; image: string };
type DockerOverview = { containers: DockerRow[]; images: unknown[]; volumes: string[]; networks: string[]; error?: string };

export default async function InfrastructurePage() {
  const [migrations, forecast, docker] = await withAuth((sid) =>
    Promise.all([
      callMethod<Migration[]>("space_cloud.api.v4.space.list_migrations", {}, sid),
      callMethod<Forecast[]>("space_cloud.api.v4.space.capacity_forecast", { horizon_days: 30 }, sid),
      callMethod<DockerOverview>("space_cloud.api.v4.space.docker_overview", {}, sid),
    ]),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Infrastructure</h1>
      <p className="mb-6 text-sm text-muted-foreground">Migrations, capacity forecasting, Docker, and maintenance.</p>

      <Tabs defaultValue="migrations">
        <TabsList>
          <TabsTrigger value="migrations">Migrations ({migrations.length})</TabsTrigger>
          <TabsTrigger value="forecast">Capacity forecast</TabsTrigger>
          <TabsTrigger value="docker">Docker ({docker.containers?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="migrations" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Start a migration</CardTitle>
            </CardHeader>
            <CardContent>
              <MigrationForm />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {migrations.map((m) => (
                    <TableRow key={m.name}>
                      <TableCell className="text-foreground">{m.site}</TableCell>
                      <TableCell className="text-muted-foreground">{m.source_server}</TableCell>
                      <TableCell className="text-muted-foreground">{m.target_server}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!migrations.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No migrations yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Horizon</TableHead>
                    <TableHead>Predicted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast.map((f) => (
                    <TableRow key={f.name}>
                      <TableCell className="text-foreground">{f.server || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{f.metric || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{f.horizon_days ?? 30}d</TableCell>
                      <TableCell className="text-muted-foreground">{f.predicted_value ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {!forecast.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        No forecast data yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docker" className="mt-4 space-y-4">
          <DockerControls />
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Container</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(docker.containers || []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-foreground">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.status}</TableCell>
                      <TableCell className="text-muted-foreground">{c.image}</TableCell>
                    </TableRow>
                  ))}
                  {!docker.containers?.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                        {docker.error || "No container data yet."}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Run a maintenance window</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
