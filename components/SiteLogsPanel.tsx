"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";

export function SiteLogsPanel({ site, files }: { site: string; files: string[] }) {
  const { run, busyKey } = useAction();
  const [active, setActive] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>("");

  async function loadLog(file: string) {
    setActive(file);
    const data = await run(
      file,
      "space_cloud.api.v4.space.site_log_tail",
      { site, log_file: file, lines: 200 },
      { refresh: false },
    );
    setLogs((data as { logs?: string } | null)?.logs || "No log output.");
  }

  if (!files.length) {
    return <p className="text-sm text-muted-foreground">No log files found for this site yet.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {files.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={active === f ? "default" : "secondary"}
            disabled={busyKey === f}
            onClick={() => loadLog(f)}
          >
            {busyKey === f ? "…" : f}
          </Button>
        ))}
      </div>
      {active ? (
        <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap text-foreground">
          {logs}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">Select a log file to view the last 200 lines.</p>
      )}
    </div>
  );
}
