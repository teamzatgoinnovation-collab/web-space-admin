"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";

export function InstallAppForm({ slug }: { slug: string }) {
  const { run, busyKey, error } = useAction();
  const [site, setSite] = useState("");

  return (
    <div className="flex items-center gap-2">
      <Input
        value={site}
        onChange={(e) => setSite(e.target.value)}
        placeholder="site to install on"
        className="h-8 text-xs"
      />
      <Button
        size="sm"
        disabled={!site.trim() || busyKey === slug}
        onClick={() => run(slug, "space_cloud.api.v3.space.install_app", { site: site.trim(), app: slug })}
      >
        {busyKey === slug ? "…" : "Install"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
