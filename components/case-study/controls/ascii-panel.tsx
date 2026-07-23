// Monospace ASCII diagram shown in the preview panel for case studies that
// don't have screens yet — a flow sketch that describes the work.
export function AsciiPanel({ art }: { art: string }) {
  return (
    <pre
      className="max-w-full overflow-x-auto whitespace-pre text-center font-mono text-[10px] leading-[1.4] md:text-[13px] md:leading-[1.5]"
      style={{ color: 'rgba(237,234,224,0.72)' }}
    >
      {art}
    </pre>
  );
}
