import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackupActions, NewBackupForm } from "./backup-actions";

export const dynamic = "force-dynamic";

export type Backup = {
  name: string;
  site: string;
  backup_type: string;
  status: string;
  file_size_mb: number;
  started_at: string;
  finished_at: string;
  is_restore_point: number;
  job: string;
};

const STATUS_VARIANT: Record<string, "default" | "destructive" | "secondary"> = {
  Succeeded: "default",
  Failed: "destructive",
  Running: "secondary",
};

export default async function BackupsPage() {
  const backups = await withAuth((sid) => callMethod<Backup[]>("space_cloud.api.v2.space.list_backups", {}, sid));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Backups</h1>
      <p className="mb-6 text-sm text-muted-foreground">{backups.length} backup(s) across the fleet.</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Trigger a backup</CardTitle>
        </CardHeader>
        <CardContent>
          <NewBackupForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.name}>
                  <TableCell className="text-foreground">{b.site}</TableCell>
                  <TableCell className="text-muted-foreground">{b.backup_type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[b.status] || "secondary"}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{b.file_size_mb ? `${b.file_size_mb} MB` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{b.finished_at || "—"}</TableCell>
                  <TableCell className="text-right">
                    <BackupActions backup={b} />
                  </TableCell>
                </TableRow>
              ))}
              {!backups.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No backups yet.
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
