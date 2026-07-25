"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";
import type { Backup } from "./page";

export function NewBackupForm() {
  const { run, busyKey, error } = useAction();
  const [site, setSite] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Site</label>
        <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="e.g. acme.zatgo.online" />
      </div>
      <Button
        disabled={!site.trim() || busyKey === "new"}
        onClick={() => run("new", "space_cloud.api.v2.space.backup_now", { site: site.trim() })}
      >
        {busyKey === "new" ? "Starting…" : "Backup now"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function BackupActions({ backup }: { backup: Backup }) {
  const { run, busyKey } = useAction();

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        disabled={busyKey === backup.name || backup.status !== "Succeeded"}
        onClick={() => {
          if (!window.confirm(`Restore ${backup.site} from this backup? This overwrites current data.`)) return;
          run(backup.name, "space_cloud.api.v2.space.restore_backup", { name: backup.name });
        }}
      >
        {busyKey === backup.name ? "…" : "Restore"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={busyKey === backup.name}
        onClick={() => {
          if (!window.confirm(`Delete this backup record for ${backup.site}?`)) return;
          run(backup.name, "space_cloud.api.v2.space.delete_backup", { name: backup.name });
        }}
      >
        {busyKey === backup.name ? "…" : "Delete"}
      </Button>
    </div>
  );
}
