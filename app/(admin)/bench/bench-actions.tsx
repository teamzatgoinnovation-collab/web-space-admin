"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/lib/use-action";

export type SiteOption = { name: string; label: string };

export function GetAppForm() {
  const { run, busyKey, error } = useAction();
  const [server, setServer] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Server</label>
        <Input value={server} onChange={(e) => setServer(e.target.value)} placeholder="primary-do" />
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
        disabled={!server.trim() || !repo.trim() || busyKey === "get-app"}
        onClick={() =>
          run("get-app", "space_cloud.api.v4.space.bench_get_app", {
            server: server.trim(),
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

export function ListBenchAppsForm() {
  const { run, busyKey, error } = useAction();
  const [server, setServer] = useState("");
  const [apps, setApps] = useState<string[] | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Server</label>
        <Input value={server} onChange={(e) => setServer(e.target.value)} placeholder="primary-do" />
      </div>
      <Button
        variant="secondary"
        disabled={!server.trim() || busyKey === "list-apps"}
        onClick={async () => {
          const data = await run("list-apps", "space_cloud.api.v4.space.bench_list_apps", { server: server.trim() }, { refresh: false });
          setApps((data as string[]) || []);
        }}
      >
        {busyKey === "list-apps" ? "…" : "List bench apps"}
      </Button>
      <Button
        variant="secondary"
        disabled={!server.trim() || busyKey === "restart"}
        onClick={() => run("restart", "space_cloud.api.v4.space.bench_restart", { server: server.trim() })}
      >
        {busyKey === "restart" ? "…" : "Restart bench"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
      {apps ? (
        <div className="flex w-full flex-wrap gap-1.5 pt-1">
          {apps.length ? apps.map((a) => <Badge key={a} variant="secondary">{a}</Badge>) : (
            <p className="text-sm text-muted-foreground">No apps found on this bench.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Pick one site, then run install/uninstall/migrate against it — a single
 * selector shared by all three actions instead of retyping the site per form. */
export function SiteAppActions({ sites }: { sites: SiteOption[] }) {
  const { run, busyKey, error } = useAction();
  const [site, setSite] = useState(sites[0]?.name || "");
  const [appPackage, setAppPackage] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <div className="flex flex-col gap-4">
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

      <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
        <div className="min-w-40 flex-1">
          <label className="mb-1.5 block text-xs text-muted-foreground">App package</label>
          <Input value={appPackage} onChange={(e) => setAppPackage(e.target.value)} placeholder="hrms" />
        </div>
        <div className="min-w-56 flex-[2]">
          <label className="mb-1.5 block text-xs text-muted-foreground">Repository URL (optional, install only)</label>
          <Input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="skip if already on bench" />
        </div>
        <div className="w-28">
          <label className="mb-1.5 block text-xs text-muted-foreground">Branch</label>
          <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" />
        </div>
        <Button
          disabled={!site || !appPackage.trim() || busyKey === "install"}
          onClick={() =>
            run("install", "space_cloud.api.v4.space.bench_install_app", {
              site,
              app_package: appPackage.trim(),
              repo: repo.trim() || null,
              branch: branch.trim() || "main",
            })
          }
        >
          {busyKey === "install" ? "Queuing…" : "Install"}
        </Button>
        <Button
          variant="destructive"
          disabled={!site || !appPackage.trim() || busyKey === "uninstall"}
          onClick={() => {
            if (!window.confirm(`Uninstall ${appPackage.trim()} from ${site}?`)) return;
            run("uninstall", "space_cloud.api.v4.space.bench_uninstall_app", { site, app_package: appPackage.trim() });
          }}
        >
          {busyKey === "uninstall" ? "Queuing…" : "Uninstall"}
        </Button>
        <Button
          variant="secondary"
          disabled={!site || busyKey === "migrate"}
          onClick={() => run("migrate", "space_cloud.api.v4.space.bench_migrate_site", { site })}
        >
          {busyKey === "migrate" ? "Queuing…" : "bench migrate"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
