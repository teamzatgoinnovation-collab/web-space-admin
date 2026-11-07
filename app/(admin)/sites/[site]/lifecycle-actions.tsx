"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/lib/use-action";

export type LifecycleView = {
  lifecycle_status: string | null;
  trial_ends_at: string | null;
  remaining_days: number | null;
  paid_until: string | null;
  next_billing_date: string | null;
  last_activity_at: string | null;
  inactive_days: number;
  deletion_scheduled_at: string | null;
  deletion_hold: boolean;
  monthly_price: number | null;
  yearly_price?: number | null;
  billing_period?: "Monthly" | "Yearly";
  period_price?: number | null;
  /** A real company site Space only tracks: neutral Active badge, no lifecycle controls. */
  protected?: boolean;
  read_only: boolean;
};

export type LifecycleEvent = { name: string; creation: string; kind: string; status: string; actor: string | null; details: string | null };

const day = (iso: string | null) => (iso ? iso.slice(0, 16).replace("T", " ") : "-");

/** Trial / subscription / deletion controls for one site. Every action needs a reason and is audited server-side. */
export function LifecycleControls({
  site,
  view,
  excluded,
  events,
}: {
  site: string;
  view: LifecycleView | null;
  excluded: boolean;
  events: LifecycleEvent[];
}) {
  const { run, busyKey, error } = useAction();
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const [months, setMonths] = useState("1");
  const [confirm, setConfirm] = useState("");
  const [deleteDays, setDeleteDays] = useState("7");
  const [msg, setMsg] = useState<string | null>(null);
  const [period, setPeriod] = useState<"Monthly" | "Yearly">(view?.billing_period === "Yearly" ? "Yearly" : "Monthly");

  if (view?.protected) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2"><Badge variant="secondary">ACTIVE</Badge><Badge variant="outline">protected</Badge></div>
        <p className="text-muted-foreground">
          A real company site that Space only tracks (Space Settings &gt; Protected Domains). It shows a neutral Active badge,
          has no trial and is never restricted or deleted, so there are no lifecycle controls.
        </p>
      </div>
    );
  }

  if (!view || !view.lifecycle_status) {
    return <p className="text-sm text-muted-foreground">This site has no lifecycle state yet (it is set when provisioning succeeds).</p>;
  }

  const needReason = () => {
    if (reason.trim().length < 3) {
      setMsg("Enter a reason (at least 3 characters). It is stored in the audit log.");
      return false;
    }
    setMsg(null);
    return true;
  };
  const call = (key: string, method: string, extra: Record<string, unknown> = {}) => {
    if (!needReason()) return;
    void run(key, `space.api.lifecycle.${method}`, { site, reason: reason.trim(), ...extra });
  };
  const status = view.lifecycle_status;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={view.read_only ? "destructive" : "secondary"}>{status}</Badge>
        {view.read_only ? <span className="text-muted-foreground">read-only for the customer</span> : null}
        {view.deletion_hold ? <Badge variant="outline">deletion hold</Badge> : null}
        {excluded ? <Badge variant="outline">excluded from deletion</Badge> : null}
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {([
          ["Trial ends (UTC)", day(view.trial_ends_at)],
          ["Days left", view.remaining_days === null ? "-" : String(view.remaining_days)],
          ["Paid until (UTC)", day(view.paid_until)],
          ["Billing period", view.billing_period === "Yearly" ? "Yearly" : "Monthly"],
          ["Monthly price", view.monthly_price ? `${view.monthly_price} SAR` : "-"],
          ["Yearly price", view.yearly_price ? `${view.yearly_price} SAR` : "not set"],
          ["Last activity (UTC)", day(view.last_activity_at)],
          ["Inactive for", `${Math.floor(view.inactive_days)} days`],
          ["Scheduled deletion (UTC)", day(view.deletion_scheduled_at)],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-border/60 py-1">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <div>
        <label className="mb-1.5 block text-xs text-muted-foreground">Reason (required for every action, stored in the audit log)</label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. customer asked for more time" />
      </div>
      {msg ? <p className="text-sm text-destructive">{msg}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-end gap-2">
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value === "Yearly" ? "Yearly" : "Monthly")}
          aria-label="Billing period"
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
        <Button size="sm" variant="secondary" disabled={busyKey === "period"} onClick={() => call("period", "set_billing_period", { period })}>
          Set billing period
        </Button>
        <span className="basis-full text-xs text-muted-foreground">
          Applies from the next payment. Yearly charges the plan&apos;s yearly price and credits 12 months.
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Input className="w-20" value={days} onChange={(e) => setDays(e.target.value)} aria-label="Days to extend" />
        <Button size="sm" disabled={busyKey === "extend"} onClick={() => call("extend", "extend_trial", { days: Number(days) })}>Extend trial (days)</Button>
        <Input className="w-20" value={months} onChange={(e) => setMonths(e.target.value)} aria-label="Months to grant" />
        <Button size="sm" disabled={busyKey === "activate"} onClick={() => call("activate", "activate", { months: Number(months) })}>Activate (months)</Button>
        {status === "SUSPENDED" || status === "EXPIRED" || status === "PENDING_PAYMENT" ? (
          <Button size="sm" variant="secondary" disabled={busyKey === "reactivate"} onClick={() => call("reactivate", "reactivate")}>Reactivate</Button>
        ) : (
          <Button size="sm" variant="secondary" disabled={busyKey === "suspend" || status === "DELETION_SCHEDULED"} onClick={() => call("suspend", "suspend")}>Suspend</Button>
        )}
        {status === "DELETION_SCHEDULED" ? (
          <Button size="sm" variant="secondary" disabled={busyKey === "cancel"} onClick={() => call("cancel", "cancel_deletion")}>Cancel deletion</Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={busyKey === "hold"} onClick={() => call("hold", "set_hold", { hold: view.deletion_hold ? 0 : 1 })}>
          {view.deletion_hold ? "Release hold" : "Hold: never delete"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busyKey === "exclude"}
          onClick={() => {
            if (!needReason()) return;
            void run("exclude", excluded ? "space.api.lifecycle.remove_exclusion" : "space.api.lifecycle.add_exclusion", excluded ? { site } : { site, reason: reason.trim() });
          }}
        >
          {excluded ? "Remove exclusion" : "Exclude from auto-deletion"}
        </Button>
      </div>

      <div className="rounded-lg border border-destructive/30 p-3">
        <p className="mb-2 text-sm font-medium text-destructive">Schedule a deletion</p>
        <p className="mb-2 text-xs text-muted-foreground">The customer is emailed first. Type the site name to confirm.</p>
        <div className="flex flex-wrap items-end gap-2">
          <Input className="w-20" value={deleteDays} onChange={(e) => setDeleteDays(e.target.value)} aria-label="Days until deletion" />
          <Input className="w-56" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={site} aria-label="Type the site name" />
          <Button
            size="sm"
            variant="destructive"
            disabled={confirm !== site || busyKey === "schedule"}
            onClick={() => call("schedule", "schedule_deletion", { days: Number(deleteDays), confirm_site: confirm })}
          >
            Schedule deletion
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Recent lifecycle events</p>
        <ul className="max-h-56 space-y-1 overflow-auto text-xs">
          {events.length === 0 ? <li className="text-muted-foreground">None yet.</li> : null}
          {events.map((e) => (
            <li key={e.name} className="flex flex-wrap justify-between gap-2 border-b border-border/40 py-1">
              <span>{day(e.creation)} · {e.kind} · {e.status}</span>
              <span className="text-muted-foreground">{e.actor || ""}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
