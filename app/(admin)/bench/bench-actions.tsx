"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/lib/use-action";

export type SiteOption = { name: string; label: string; server: string };
export type ServerOption = { name: string; label: string };
export type ServerAppsMap = Record<string, string[]>;
type AppVersionRow = { app_package: string; version: string; git_head: string };

export function GetAppForm({ servers }: { servers: ServerOption[] }) {
  const { run, busyKey, error } = useAction();
  const [server, setServer] = useState(servers[0]?.name || "");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Server</label>
        <Select value={server} onValueChange={(v) => setServer(v || "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a server" />
          </SelectTrigger>
          <SelectContent>
            {servers.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-64 flex-[2]">
        <label className="mb-1.5 block text-xs text-muted-foreground">Repository URL</label>
        <Input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/org/app.git" />
      </div>
      <div className="w-32">
        <label className="mb-1.5 block text-xs text-muted-foreground">Branch</label>
        <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" />
      </div>
      <Button
        disabled={!server || !repo.trim() || busyKey === "get-app"}
        onClick={() =>
          run("get-app", "space_cloud.api.v4.space.bench_get_app", {
            server,
            repo: repo.trim(),
            branch: branch.trim() || "main",
          })
        }
      >
        {busyKey === "get-app" ? "Queuing…" : "Run get-app"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ListBenchAppsForm({ servers }: { servers: ServerOption[] }) {
  const { run, busyKey, error } = useAction();
  const [server, setServer] = useState(servers[0]?.name || "");
  const [apps, setApps] = useState<string[] | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Server</label>
        <Select value={server} onValueChange={(v) => setServer(v || "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a server" />
          </SelectTrigger>
          <SelectContent>
            {servers.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="secondary"
        disabled={!server || busyKey === "list-apps"}
        onClick={async () => {
          const data = await run("list-apps", "space_cloud.api.v4.space.bench_list_apps", { server }, { refresh: false });
          setApps((data as string[]) || []);
        }}
      >
        {busyKey === "list-apps" ? "…" : "List bench apps"}
      </Button>
      <Button
        variant="secondary"
        disabled={!server || busyKey === "restart"}
        onClick={() => run("restart", "space_cloud.api.v4.space.bench_restart", { server })}
      >
        {busyKey === "restart" ? "…" : "Restart bench"}
      </Button>
      <p className="w-full text-xs text-muted-foreground">
        Soft, best-effort <code>bench restart</code> — often a no-op under docker-compose workers, and only affects
        this bench&apos;s own processes. For a real restart of the shared backend container, use &quot;Restart
        backend&quot; under Site app actions below (affects every site on that server).
      </p>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      {apps ? (
        <div className="flex w-full flex-wrap gap-1.5 pt-1">
          {apps.length ? (
            apps.map((a) => (
              <Badge key={a} variant="secondary">
                {a}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No apps found on this bench.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Pick one site, then run install/uninstall/migrate/versions/cache/restart against it —
 * a single selector shared by every action instead of retyping the site per form. */
export function SiteAppActions({
  sites,
  benchAppsByServer,
}: {
  sites: SiteOption[];
  benchAppsByServer: ServerAppsMap;
}) {
  const [site, setSite] = useState(sites[0]?.name || "");
  const currentSite = useMemo(() => sites.find((s) => s.name === site), [sites, site]);

  // Each concern gets its own useAction() instance — busyKey/error are single-valued
  // per instance, and this component now runs several independent things at once.
  const installAction = useAction();
  const uninstallAction = useAction();
  const migrateAction = useAction();
  const installedAppsAction = useAction();
  const versionsAction = useAction();
  const opsAction = useAction();

  const [installPackage, setInstallPackage] = useState("");
  const [uninstallPackage, setUninstallPackage] = useState("");
  const [installedApps, setInstalledApps] = useState<string[] | null>(null);
  const [versionRows, setVersionRows] = useState<AppVersionRow[] | null>(null);
  const [rebuildApp, setRebuildApp] = useState("");

  const benchApps = benchAppsByServer[currentSite?.server ?? ""] ?? [];
  // Only offer apps that are on the bench but not already installed on this site —
  // an app already installed here has nothing left to "install".
  const remainingBenchApps = useMemo(
    () => benchApps.filter((a) => !(installedApps || []).includes(a)),
    [benchApps, installedApps],
  );

  useEffect(() => {
    setInstallPackage("");
    setUninstallPackage("");
    setInstalledApps(null);
    setVersionRows(null);
    setRebuildApp("");
    if (!site) return;

    (async () => {
      const apps = await installedAppsAction.run(
        "site-apps",
        "space_cloud.api.v4.space.bench_list_site_apps",
        { site },
        { refresh: false },
      );
      setInstalledApps((apps as string[]) || []);
    })();
    (async () => {
      const rows = await versionsAction.run(
        "site-versions",
        "space_cloud.api.v4.space.bench_site_app_versions",
        { site },
        { refresh: false },
      );
      setVersionRows((rows as AppVersionRow[]) || []);
    })();
    // installedAppsAction/versionsAction are stable (useCallback), only `site` should retrigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  async function refreshVersions() {
    if (!site) return;
    const rows = await versionsAction.run(
      "refresh-versions",
      "space_cloud.api.v4.space.bench_site_app_versions",
      { site },
      { refresh: false },
    );
    setVersionRows((rows as AppVersionRow[]) || []);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xs">
        <label className="mb-1.5 block text-xs text-muted-foreground">Site</label>
        <Select value={site} onValueChange={(v) => setSite(v || "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!sites.length ? <p className="mt-1 text-xs text-muted-foreground">No sites yet.</p> : null}
      </div>

      {/* Installed apps on this site — shown plainly, not just buried in the Uninstall picker */}
      <div className="border-t border-border pt-4">
        <label className="mb-2 block text-xs text-muted-foreground">Apps installed on this site</label>
        {installedApps === null ? (
          <p className="text-sm text-muted-foreground">{site ? "Loading…" : "Select a site."}</p>
        ) : installedApps.length ? (
          <div className="flex flex-wrap gap-1.5">
            {installedApps.map((a) => (
              <Badge key={a} variant="secondary">
                {a}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No apps installed on this site yet.</p>
        )}
        {installedAppsAction.error && <p className="mt-1 text-sm text-destructive">{installedAppsAction.error}</p>}
      </div>

      {/* Install */}
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="min-w-56 flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">App to install (on this bench, not yet on this site)</label>
          <Select value={installPackage} onValueChange={(v) => setInstallPackage(v || "")}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={remainingBenchApps.length ? "Select an app" : "No remaining bench apps to install"}
              />
            </SelectTrigger>
            <SelectContent>
              {remainingBenchApps.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!remainingBenchApps.length && benchApps.length ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Every app on this bench is already installed on this site.
            </p>
          ) : null}
          {!benchApps.length ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Nothing on this server&apos;s bench yet — use &quot;Fetch app from git&quot; above first.
            </p>
          ) : null}
        </div>
        <Button
          disabled={!site || !installPackage || installAction.busyKey === "install"}
          onClick={() =>
            installAction.run("install", "space_cloud.api.v4.space.bench_install_app", {
              site,
              app_package: installPackage,
              repo: null,
              branch: "main",
            })
          }
        >
          {installAction.busyKey === "install" ? "Queuing…" : "Install"}
        </Button>
      </div>
      {installAction.error && <p className="text-sm text-destructive">{installAction.error}</p>}

      {/* Uninstall */}
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="min-w-56 flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">App to uninstall</label>
          <Select value={uninstallPackage} onValueChange={(v) => setUninstallPackage(v || "")}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  installedApps === null
                    ? "Loading installed apps…"
                    : installedApps.length
                      ? "Select an app"
                      : "No apps installed"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(installedApps || []).map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="destructive"
          disabled={!site || !uninstallPackage || uninstallAction.busyKey === "uninstall"}
          onClick={() => {
            if (!window.confirm(`Uninstall ${uninstallPackage} from ${site}?`)) return;
            uninstallAction.run("uninstall", "space_cloud.api.v4.space.bench_uninstall_app", {
              site,
              app_package: uninstallPackage,
            });
          }}
        >
          {uninstallAction.busyKey === "uninstall" ? "Queuing…" : "Uninstall"}
        </Button>
      </div>
      {uninstallAction.error && <p className="text-sm text-destructive">{uninstallAction.error}</p>}

      {/* Migrate */}
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <Button
          variant="secondary"
          disabled={!site || migrateAction.busyKey === "migrate"}
          onClick={() => migrateAction.run("migrate", "space_cloud.api.v4.space.bench_migrate_site", { site })}
        >
          {migrateAction.busyKey === "migrate" ? "Queuing…" : "bench migrate"}
        </Button>
        {migrateAction.error && <p className="text-sm text-destructive">{migrateAction.error}</p>}
      </div>

      {/* Installed app versions */}
      <div className="border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Installed app versions</label>
          <Button
            variant="secondary"
            size="sm"
            disabled={!site || versionsAction.busyKey === "refresh-versions"}
            onClick={refreshVersions}
          >
            {versionsAction.busyKey === "refresh-versions" ? "…" : "Refresh"}
          </Button>
        </div>
        {versionRows === null ? (
          <p className="text-sm text-muted-foreground">{site ? "Loading…" : "Select a site."}</p>
        ) : versionRows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Commit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versionRows.map((r) => (
                <TableRow key={r.app_package}>
                  <TableCell>{r.app_package}</TableCell>
                  <TableCell>{r.version || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.git_head || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No apps installed.</p>
        )}
        {versionsAction.error && <p className="mt-1 text-sm text-destructive">{versionsAction.error}</p>}
      </div>

      {/* Clear cache / rebuild assets */}
      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <Button
          variant="secondary"
          disabled={!site || opsAction.busyKey === "clear-cache"}
          onClick={() => opsAction.run("clear-cache", "space_cloud.api.v4.space.bench_clear_cache", { site })}
        >
          {opsAction.busyKey === "clear-cache" ? "Queuing…" : "Clear cache"}
        </Button>
        <div className="min-w-48">
          <label className="mb-1.5 block text-xs text-muted-foreground">Rebuild assets for</label>
          <Select value={rebuildApp} onValueChange={(v) => setRebuildApp(v || "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All apps" />
            </SelectTrigger>
            <SelectContent>
              {(installedApps || []).map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="secondary"
          disabled={!site || opsAction.busyKey === "build-assets"}
          onClick={() =>
            opsAction.run("build-assets", "space_cloud.api.v4.space.bench_build_assets", {
              site,
              app_package: rebuildApp || null,
            })
          }
        >
          {opsAction.busyKey === "build-assets" ? "Queuing…" : "Rebuild assets"}
        </Button>
      </div>

      {/* Hard restart backend */}
      <Alert variant="destructive" className="mt-2">
        <AlertTitle>Restart backend container (docker restart)</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            A hard restart of {currentSite ? currentSite.server : "the selected site's server"}&apos;s shared backend
            container — every site on that server will be briefly unreachable, not just {site || "this site"}. Try
            the soft &quot;Restart bench&quot; button above first.
          </p>
          <Button
            variant="destructive"
            disabled={!currentSite || opsAction.busyKey === "restart-backend"}
            onClick={() => {
              if (!currentSite) return;
              if (
                !window.confirm(
                  `docker restart on the shared backend container for ${currentSite.server} — every site on this server will be briefly unreachable, not just ${site}. Continue?`,
                )
              )
                return;
              opsAction.run("restart-backend", "space_cloud.api.v4.space.bench_restart_backend", {
                server: currentSite.server,
              });
            }}
          >
            {opsAction.busyKey === "restart-backend" ? "Restarting…" : "Restart backend"}
          </Button>
        </AlertDescription>
      </Alert>
      {opsAction.error && <p className="text-sm text-destructive">{opsAction.error}</p>}
    </div>
  );
}
