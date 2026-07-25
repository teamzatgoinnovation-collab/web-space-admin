import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JobActions } from "./job-actions";

export const dynamic = "force-dynamic";

export type DeploymentJob = {
  name: string;
  site: string;
  server: string;
  job_type: string;
  status: string;
  progress: number;
  estimated_minutes: number;
  started_at: string;
  finished_at: string;
  can_retry: number;
  can_cancel: number;
  can_rollback: number;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Succeeded: "default",
  Failed: "destructive",
  Running: "secondary",
  Queued: "secondary",
};

export default async function JobsPage() {
  const jobs = await withAuth((sid) =>
    callMethod<DeploymentJob[]>("space_cloud.api.v2.space.list_jobs", { limit: 200 }, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Jobs</h1>
      <p className="mb-6 text-sm text-muted-foreground">{jobs.length} deployment job(s) across the fleet.</p>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.name}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{j.name}</TableCell>
                  <TableCell className="text-foreground">{j.site}</TableCell>
                  <TableCell className="text-muted-foreground">{j.job_type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[j.status] || "secondary"}>{j.status}</Badge>
                  </TableCell>
                  <TableCell className="w-32">
                    <Progress value={j.progress ?? 0} className="h-1.5" />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{j.started_at || "—"}</TableCell>
                  <TableCell className="text-right">
                    <JobActions job={j} />
                  </TableCell>
                </TableRow>
              ))}
              {!jobs.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    No jobs yet.
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
