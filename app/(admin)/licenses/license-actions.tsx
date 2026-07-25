"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";
import type { License } from "./page";

export function NewLicenseForm() {
  const { run, busyKey, error } = useAction();
  const [customer, setCustomer] = useState("");
  const [plan, setPlan] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Customer</label>
        <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" />
      </div>
      <div className="min-w-48 flex-1">
        <label className="mb-1.5 block text-xs text-muted-foreground">Plan (optional)</label>
        <Input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="e.g. pro" />
      </div>
      <Button
        disabled={!customer.trim() || busyKey === "new"}
        onClick={() => run("new", "space_cloud.api.v3.space.create_license", { customer: customer.trim(), plan: plan.trim() || undefined })}
      >
        {busyKey === "new" ? "Issuing…" : "Issue license"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function LicenseActions({ license }: { license: License }) {
  const { run, busyKey } = useAction();

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        disabled={busyKey === license.name}
        onClick={() => run(license.name, "space_cloud.api.v3.space.renew_license", { name: license.name })}
      >
        {busyKey === license.name ? "…" : "Renew"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={busyKey === license.name || license.status === "Deactivated"}
        onClick={() => {
          if (!window.confirm(`Deactivate license ${license.license_key}?`)) return;
          run(license.name, "space_cloud.api.v3.space.deactivate_license", { name: license.name });
        }}
      >
        {busyKey === license.name ? "…" : "Deactivate"}
      </Button>
    </div>
  );
}
