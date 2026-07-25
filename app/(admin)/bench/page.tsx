import { getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetAppForm, ListBenchAppsForm, SiteAppActions, type SiteOption } from "./bench-actions";

export const dynamic = "force-dynamic";

export default async function BenchManagerPage() {
  const sites = await withAuth((sid) =>
    getList<{ name: string; domain: string; site_name: string }>(
      "Space Site",
      { fields: ["name", "domain", "site_name"], filters: { status: ["!=", "Deleted"] }, order_by: "domain asc" },
      sid,
    ),
  );
  const siteOptions: SiteOption[] = sites.map((s) => ({ name: s.name, label: s.domain || s.site_name || s.name }));

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site app actions</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteAppActions sites={siteOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
