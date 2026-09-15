import { callMethod, getList } from "@/lib/frappe-admin";
import { withAuth } from "@/lib/require-sid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GetAppForm,
  ListBenchAppsForm,
  SiteAppActions,
  type GithubAppsResult,
  type ServerAppsMap,
  type ServerOption,
  type SiteOption,
} from "./bench-actions";

export const dynamic = "force-dynamic";

const EMPTY_GITHUB_APPS: GithubAppsResult = {
  configured: false,
  apps: [],
  error: "Could not reach the control plane to list GitHub apps.",
};

export default async function BenchManagerPage() {
  const { siteOptions, serverOptions, benchAppsByServer, githubApps } = await withAuth(async (sid) => {
    const [sites, servers] = await Promise.all([
      getList<{ name: string; domain: string; site_name: string; server: string }>(
        "Space Site",
        { fields: ["name", "domain", "site_name", "server"], filters: { status: ["!=", "Deleted"] }, order_by: "domain asc" },
        sid,
      ),
      getList<{ name: string; title: string }>(
        "Space Server",
        { fields: ["name", "title"], filters: { status: "Active" }, order_by: "name asc" },
        sid,
      ),
    ]);

    const siteOptions: SiteOption[] = sites.map((s) => ({
      name: s.name,
      label: s.domain || s.site_name || s.name,
      server: s.server,
    }));
    const serverOptions: ServerOption[] = servers.map((s) => ({ name: s.name, label: s.title || s.name }));

    // Each server's bench-apps fetch is independent and must not take the whole
    // page down if one server is unreachable — unlike the sites/servers fetch
    // above, this hits the target servers themselves (via the Agent/subprocess
    // path), a new failure surface this page didn't have before.
    const benchAppsByServer: ServerAppsMap = {};
    await Promise.all(
      serverOptions.map(async (s) => {
        try {
          benchAppsByServer[s.name] = await callMethod<string[]>(
            "space_cloud.api.v4.space.bench_list_apps",
            { server: s.name },
            sid,
          );
        } catch {
          benchAppsByServer[s.name] = [];
        }
      }),
    );

    let githubApps: GithubAppsResult;
    try {
      githubApps = await callMethod<GithubAppsResult>("space_cloud.api.v4.space.bench_github_apps", {}, sid);
    } catch {
      githubApps = EMPTY_GITHUB_APPS;
    }

    return { siteOptions, serverOptions, benchAppsByServer, githubApps };
  });

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
          <GetAppForm servers={serverOptions} />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Bench apps</CardTitle>
        </CardHeader>
        <CardContent>
          <ListBenchAppsForm servers={serverOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site app actions</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteAppActions sites={siteOptions} benchAppsByServer={benchAppsByServer} githubApps={githubApps} />
        </CardContent>
      </Card>
    </div>
  );
}
