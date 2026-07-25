function toneColor(percent: number): string {
  if (percent >= 90) return "var(--destructive)";
  if (percent >= 70) return "#f59e0b";
  return "var(--primary)";
}

export function UsageGauge({ label, percent, detail }: { label: string; percent: number; detail?: string }) {
  const clamped = Math.min(100, Math.max(0, percent || 0));
  const r = 40;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  const color = toneColor(clamped);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-24">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-border" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-foreground tabular-nums">{Math.round(clamped)}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
      {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}
