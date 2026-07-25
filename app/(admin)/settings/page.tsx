import { callMethod } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export type SpaceSettings = {
  domain_suffix: string;
  portal_base_url: string;
  default_plan: string;
  ram_pool_mb: number;
  disk_pool_mb: number;
  backup_schedule: string;
  backup_retention_days: number;
  monitoring_interval_minutes: number;
  email_notifications_enabled: number;
  notification_email: string;
  rate_limit_per_minute: number;
};

const FIELDS = [
  "domain_suffix",
  "portal_base_url",
  "default_plan",
  "ram_pool_mb",
  "disk_pool_mb",
  "backup_schedule",
  "backup_retention_days",
  "monitoring_interval_minutes",
  "email_notifications_enabled",
  "notification_email",
  "rate_limit_per_minute",
];

export default async function SettingsPage() {
  const settings = await withAuth((sid) =>
    callMethod<SpaceSettings>("frappe.client.get", { doctype: "Space Settings", name: "Space Settings" }, sid),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Platform-wide Space configuration.</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Space Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm initial={settings} fields={FIELDS} />
        </CardContent>
      </Card>
    </div>
  );
}
