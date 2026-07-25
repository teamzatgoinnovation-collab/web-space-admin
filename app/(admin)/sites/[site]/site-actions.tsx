"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAction } from "@/lib/use-action";

export type PlanOption = { name: string; title: string };

/** Install/uninstall/migrate scoped to this one site — no site picker needed,
 * the site is already the page you're on. */
export function SiteBenchActions({ site }: { site: string }) {
  const { run, busyKey, error } = useAction();
  const [appPackage, setAppPackage] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
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
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!appPackage.trim() || busyKey === "install"}
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
          size="sm"
          variant="destructive"
          disabled={!appPackage.trim() || busyKey === "uninstall"}
          onClick={() => {
            if (!window.confirm(`Uninstall ${appPackage.trim()} from ${site}?`)) return;
            run("uninstall", "space_cloud.api.v4.space.bench_uninstall_app", { site, app_package: appPackage.trim() });
          }}
        >
          {busyKey === "uninstall" ? "Queuing…" : "Uninstall"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busyKey === "migrate"}
          onClick={() => run("migrate", "space_cloud.api.v4.space.bench_migrate_site", { site })}
        >
          {busyKey === "migrate" ? "Queuing…" : "bench migrate"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ChangePlanForm({ site, currentPlan, plans }: { site: string; currentPlan: string; plans: PlanOption[] }) {
  const { run, busyKey, error } = useAction();
  const [plan, setPlan] = useState(currentPlan);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48">
        <label className="mb-1.5 block text-xs text-muted-foreground">Plan</label>
        <Select value={plan} onValueChange={(v) => setPlan(v || "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.name} value={p.name}>
                {p.title || p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        disabled={!plan || plan === currentPlan || busyKey === "change-plan"}
        onClick={() => run("change-plan", "space_cloud.api.v4.space.change_site_plan", { site, plan })}
      >
        {busyKey === "change-plan" ? "Changing…" : "Change plan"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}
