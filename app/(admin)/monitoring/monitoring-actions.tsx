"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";

export function AcknowledgeButton({ name }: { name: string }) {
  const { run, busyKey } = useAction();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={busyKey === name}
      onClick={() => run(name, "space_cloud.api.v4.space.acknowledge_alert", { name })}
    >
      {busyKey === name ? "…" : "Acknowledge"}
    </Button>
  );
}

export function HeartbeatButton() {
  const { run, busyKey, error } = useAction();
  return (
    <div className="text-right">
      <Button
        variant="secondary"
        size="sm"
        disabled={busyKey === "hb"}
        onClick={() => run("hb", "space_cloud.api.v4.space.heartbeat_now", {})}
      >
        {busyKey === "hb" ? "Running…" : "Run heartbeat now"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
