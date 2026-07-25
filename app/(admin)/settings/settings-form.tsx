"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";

const LABELS: Record<string, string> = {
  domain_suffix: "Default domain suffix",
  portal_base_url: "Portal URL",
  default_plan: "Default plan",
  ram_pool_mb: "RAM pool (MB)",
  disk_pool_mb: "Disk pool (MB)",
  backup_schedule: "Backup schedule",
  backup_retention_days: "Backup retention (days)",
  monitoring_interval_minutes: "Monitoring interval (minutes)",
  email_notifications_enabled: "Email notifications enabled (0/1)",
  notification_email: "Ops notification email",
  rate_limit_per_minute: "API rate limit / minute",
};

export function SettingsForm({ initial, fields }: { initial: Record<string, unknown>; fields: string[] }) {
  const { run, busyKey, error } = useAction();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f, String(initial[f] ?? "")])),
  );
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaved(false);
    const result = await run(
      "save",
      "frappe.client.set_value",
      { doctype: "Space Settings", name: "Space Settings", fieldname: values },
      { refresh: false },
    );
    if (result) setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f} className="grid gap-1.5">
            <Label htmlFor={f}>{LABELS[f] || f}</Label>
            <Input
              id={f}
              value={values[f]}
              onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button disabled={busyKey === "save"} onClick={save}>
          {busyKey === "save" ? "Saving…" : "Save settings"}
        </Button>
        {saved && <p className="text-sm text-emerald-500">Saved.</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
