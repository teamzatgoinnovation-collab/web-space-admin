export type MetricPoint = {
  captured_at: string;
  cpu_percent: number;
  ram_percent: number;
  disk_percent: number;
};

const SERIES: { key: keyof MetricPoint; label: string; color: string }[] = [
  { key: "cpu_percent", label: "CPU", color: "var(--primary)" },
  { key: "ram_percent", label: "RAM", color: "#22d3ee" },
  { key: "disk_percent", label: "Disk", color: "#22c55e" },
];

/** Simple dependency-free SVG line chart — snapshots come in newest-first, chart reads left-to-right chronologically. */
export function MetricsTrend({ points }: { points: MetricPoint[] }) {
  if (!points.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No historical data yet.</p>;
  }

  const chrono = [...points].reverse();
  const w = 600;
  const h = 160;
  const pad = 8;
  const stepX = chrono.length > 1 ? (w - pad * 2) / (chrono.length - 1) : 0;
  const y = (v: number) => h - pad - (Math.min(100, Math.max(0, v || 0)) / 100) * (h - pad * 2);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map((g) => (
          <line key={g} x1={0} x2={w} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth={1} />
        ))}
        {SERIES.map((s) => {
          const d = chrono
            .map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${y(Number(p[s.key]))}`)
            .join(" ");
          return <path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={2} />;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
