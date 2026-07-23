// Placeholder stage visual for case studies whose prose is written but whose
// screens aren't uploaded yet. Swap the section's visual to { kind: 'image' }
// once the real asset exists.
export function PendingVisual({ label = 'Screens coming' }: { label?: string }) {
  return (
    <div className="flex h-[55%] w-[78%] items-center justify-center rounded-xl border border-dashed border-white/15 px-6 text-center">
      <span className="font-mono uppercase tracking-widest text-[11px]" style={{ color: 'rgba(237,234,224,0.4)' }}>
        {label}
      </span>
    </div>
  );
}
