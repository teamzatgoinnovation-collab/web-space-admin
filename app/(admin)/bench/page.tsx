import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetAppForm, ListBenchAppsForm, InstallAppForm, UninstallAppForm, MigrateSiteForm } from "./bench-actions";

export default function BenchManagerPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Bench Manager</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Raw bench-level operations — fetch a new app from git, install/uninstall on a site, or migrate. Space Admin
        / System Manager only; every action is queued as a tracked job and audited.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Fetch app from git (bench get-app)</CardTitle>
        </CardHeader>
        <CardContent>
          <GetAppForm />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Bench apps</CardTitle>
        </CardHeader>
        <CardContent>
          <ListBenchAppsForm />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Install app on site</CardTitle>
        </CardHeader>
        <CardContent>
          <InstallAppForm />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Uninstall app from site</CardTitle>
        </CardHeader>
        <CardContent>
          <UninstallAppForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Migrate site</CardTitle>
        </CardHeader>
        <CardContent>
          <MigrateSiteForm />
        </CardContent>
      </Card>
    </div>
  );
}
