// Outcome metrics rendered as the preview-panel visual (kind: 'component'):
// large Praktikal-thin numbers with mono labels, centered in the stage.
const FG = '#EDEAE0';
const MUTED = 'rgba(237,234,224,0.5)';
const ACCENT = '#2CA152';

export function MetricsPanel({
  stats,
  progression,
}: {
  stats: { value: string; label: string }[];
  progression?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-8 text-center md:gap-10">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col items-center">
          {progression && i > 0 && (
            <span className="mb-6 text-3xl md:text-4xl leading-none" style={{ color: ACCENT }} aria-hidden>
              ↓
            </span>
          )}
          <div className="font-mono font-thin text-6xl md:text-7xl leading-none tracking-tight tabular-nums" style={{ color: FG }}>
            {s.value}
          </div>
          <div className="mt-3 font-mono uppercase tracking-widest text-xs" style={{ color: MUTED }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
