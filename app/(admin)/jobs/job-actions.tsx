"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";
import type { DeploymentJob } from "./page";

export function JobActions({ job }: { job: DeploymentJob }) {
  const { run, busyKey } = useAction();

  return (
    <div className="flex justify-end gap-1.5">
      {Boolean(job.can_retry) && (
        <Button
          size="sm"
          variant="secondary"
          disabled={busyKey === job.name}
          onClick={() => run(job.name, "space_cloud.api.v2.space.retry_job", { name: job.name })}
        >
          {busyKey === job.name ? "…" : "Retry"}
        </Button>
      )}
      {Boolean(job.can_cancel) && (
        <Button
          size="sm"
          variant="destructive"
          disabled={busyKey === job.name}
          onClick={() => run(job.name, "space_cloud.api.v2.space.cancel_job", { name: job.name })}
        >
          {busyKey === job.name ? "…" : "Cancel"}
        </Button>
      )}
    </div>
  );
}
