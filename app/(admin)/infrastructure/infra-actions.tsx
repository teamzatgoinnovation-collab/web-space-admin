"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";

export function MigrationForm() {
  const { run, busyKey, error } = useAction();
  const [site, setSite] = useState("");
  const [target, setTarget] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Site</label>
        <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="acme.zatgo.online" />
      </div>
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Target server</label>
        <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="server name" />
      </div>
      <Button
        disabled={!site.trim() || !target.trim() || busyKey === "mig"}
        onClick={() => run("mig", "space_cloud.api.v4.space.enqueue_migration", { site: site.trim(), target_server: target.trim() })}
      >
        {busyKey === "mig" ? "Starting…" : "Start migration"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function DockerControls() {
  const { run, busyKey, error } = useAction();
  const [container, setContainer] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Container name</label>
        <Input value={container} onChange={(e) => setContainer(e.target.value)} placeholder="container name" />
      </div>
      <Button
        variant="secondary"
        disabled={!container.trim() || busyKey === "restart"}
        onClick={() => run("restart", "space_cloud.api.v4.space.docker_restart", { container: container.trim() })}
      >
        {busyKey === "restart" ? "…" : "Restart container"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function MaintenanceForm() {
  const { run, busyKey, error } = useAction();
  const [window_, setWindow] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Maintenance Window name</label>
        <Input value={window_} onChange={(e) => setWindow(e.target.value)} placeholder="Space Maintenance Window record" />
      </div>
      <Button
        disabled={!window_.trim() || busyKey === "maint"}
        onClick={() => run("maint", "space_cloud.api.v4.space.start_maintenance", { window: window_.trim() })}
      >
        {busyKey === "maint" ? "Starting…" : "Run"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}
