"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";
import type { Domain } from "./page";

export function AttachDomainForm() {
  const { run, busyKey, error } = useAction();
  const [site, setSite] = useState("");
  const [domain, setDomain] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Site</label>
        <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="acme.zatgo.online" />
      </div>
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Domain</label>
        <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="www.acme.com" />
      </div>
      <Button
        disabled={!site.trim() || !domain.trim() || busyKey === "attach"}
        onClick={() => run("attach", "space_cloud.api.v2.space.attach_domain", { site: site.trim(), domain: domain.trim() })}
      >
        {busyKey === "attach" ? "Attaching…" : "Attach"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function DomainActions({ domain }: { domain: Domain }) {
  const { run, busyKey } = useAction();

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        disabled={busyKey === domain.name}
        onClick={() => run(domain.name, "space_cloud.api.v2.space.verify_domain", { name: domain.name })}
      >
        {busyKey === domain.name ? "…" : "Verify"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={busyKey === domain.name}
        onClick={() => {
          if (!window.confirm(`Detach ${domain.domain}?`)) return;
          run(domain.name, "space_cloud.api.v2.space.detach_domain", { name: domain.name });
        }}
      >
        {busyKey === domain.name ? "…" : "Detach"}
      </Button>
    </div>
  );
}
