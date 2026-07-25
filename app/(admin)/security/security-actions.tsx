"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";

export function RevokeTokenButton({ name, disabled }: { name: string; disabled?: boolean }) {
  const { run, busyKey } = useAction();
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={disabled || busyKey === name}
      onClick={() => {
        if (!window.confirm(`Revoke token ${name}?`)) return;
        run(name, "space_cloud.api.v3.space.revoke_api_token", { name });
      }}
    >
      {busyKey === name ? "…" : "Revoke"}
    </Button>
  );
}

export function TestWebhookButton({ name }: { name: string }) {
  const { run, busyKey } = useAction();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={busyKey === name}
      onClick={() => run(name, "space_cloud.api.v3.space.test_webhook", { name }, { refresh: false })}
    >
      {busyKey === name ? "…" : "Test"}
    </Button>
  );
}
