// Pixel-art roadworks sign — marks a listing whose write-up isn't finished.
// Served from /public rather than inlined: the artwork is ~30KB of paths and
// appears on many rows at once.
export function ConstructionSign({ className }: { className?: string }) {
  return <img src="/construction-sign.svg" alt="" width={691} height={654} className={className} />;
}
