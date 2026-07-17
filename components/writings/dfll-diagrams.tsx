// Minimalist line-SVG + ASCII diagrams for the "Designing For Low Literacy"
// case study. Palette matches the Writings shell: off-white ink on near-black,
// with the site's green (#2CA152) for the one thing that matters in each frame.

const INK = '#EDEAE0'
const MUTED = 'rgba(237,234,224,0.55)'
const FAINT = 'rgba(237,234,224,0.22)'
const GREEN = '#2CA152'

const mono = { fontFamily: 'var(--font-mono)' } as const
const pixel = { fontFamily: 'var(--font-pixel)' } as const

// ── 1 · The proof gap ──────────────────────────────────────────────────────
// Scattered records → a "PROOF?" wall → institutions see risk, not a business.
export function ProofGapDiagram() {
  const notes: [number, number, number, string][] = [
    [26, 44, -8, 'notebook'],
    [150, 34, 7, 'UPI'],
    [26, 150, 6, 'WhatsApp'],
    [150, 158, -6, 'memory'],
  ]
  return (
    <svg viewBox="0 0 680 300" width="100%" role="img"
      aria-label="Scattered records — notebook, UPI, WhatsApp, memory — reach a wall marked 'proof?' before an institution that sees only risk, not a business.">
      {notes.map(([x, y, r, label], i) => (
        <g key={i} transform={`rotate(${r} ${x + 52} ${y + 30})`}>
          <rect x={x} y={y} width={104} height={60} rx={3} fill="none" stroke={FAINT} />
          <text x={x + 52} y={y + 35} textAnchor="middle" fontSize={13} fill={MUTED} style={mono}>{label}</text>
        </g>
      ))}
      {/* converging arrows toward the wall */}
      {[70, 150, 230].map((y, i) => (
        <path key={i} d={`M270 ${y} C 320 ${y}, 340 150, 372 150`} fill="none" stroke={FAINT} strokeWidth={1} />
      ))}
      <path d="M366 146 l8 4 l-8 4" fill="none" stroke={FAINT} strokeWidth={1} />
      {/* the wall */}
      <line x1={392} y1={44} x2={392} y2={256} stroke={GREEN} strokeWidth={1.5} strokeDasharray="4 6" />
      <text x={392} y={30} textAnchor="middle" fontSize={15} fill={GREEN} letterSpacing="0.15em" style={pixel}>proof?</text>
      {/* institution */}
      <g stroke={INK} strokeWidth={1.25} fill="none">
        <path d="M474 122 L556 92 L638 122" strokeLinejoin="round" />
        <line x1={470} y1={122} x2={642} y2={122} />
        {[496, 524, 552, 580, 608].map((x) => <line key={x} x1={x} y1={130} x2={x} y2={198} />)}
        <line x1={470} y1={198} x2={642} y2={198} />
        <line x1={462} y1={206} x2={650} y2={206} />
      </g>
      <text x={556} y={238} textAnchor="middle" fontSize={13} fill={INK} style={mono}>they see <tspan fill={GREEN}>risk</tspan></text>
      <text x={556} y={258} textAnchor="middle" fontSize={13} fill={MUTED} style={mono}>not a business</text>
    </svg>
  )
}

// ── 2 · The hand-to-mouth loop ─────────────────────────────────────────────
// earn → spend → jot it down → lose the note → repeat. Loose, hand-drawn arcs.
export function HandToMouthLoop() {
  const cx = 210
  const cy = 150
  const nodes = [
    { x: cx, y: 44, t: 'earn' },
    { x: 358, y: cy, t: 'spend' },
    { x: cx, y: 256, t: 'jot it down' },
    { x: 62, y: cy, t: 'lose the note' },
  ]
  return (
    <svg viewBox="0 0 420 300" width="100%" role="img"
      aria-label="A closed loop: earn, spend, jot it down, lose the note, and back to earn — the same cycle every month.">
      {/* four slightly irregular clockwise arcs */}
      <g fill="none" stroke={FAINT} strokeWidth={1.25} strokeLinecap="round">
        <path d="M244 58 C 300 74, 340 104, 348 132" />
        <path d="M346 176 C 336 206, 300 232, 250 244" />
        <path d="M170 244 C 120 232, 84 206, 74 176" />
        <path d="M72 132 C 82 104, 118 74, 176 58" />
      </g>
      {/* arrowheads */}
      <g fill="none" stroke={FAINT} strokeWidth={1.25} strokeLinecap="round">
        <path d="M340 126 l9 8 l-13 3" />
        <path d="M256 240 l-7 10 l13 1" />
        <path d="M80 174 l-9 -8 l13 -3" />
        <path d="M164 60 l7 -10 l-13 -1" />
      </g>
      {nodes.map((n, i) => (
        <text key={i} x={n.x} y={n.y} textAnchor="middle" fontSize={14} fill={i === 0 ? GREEN : INK} style={mono}>{n.t}</text>
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={13} fill={MUTED} style={mono}>same loop,</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={13} fill={MUTED} style={mono}>every month</text>
    </svg>
  )
}

// A monospaced ASCII figure: hidden from AT (the <figure> carries the label).
function Ascii({ children }: { children: string }) {
  return (
    <pre aria-hidden className="font-mono leading-[1.45] text-[12px] sm:text-[13px] whitespace-pre overflow-x-auto"
      style={{ color: INK }}>{children}</pre>
  )
}

// ── 3 · The emotional universe of small-business accounting ────────────────
export function EmotionalUniverse() {
  return (
    <Ascii>{String.raw`                    money in
                       │
                       ▼
        ┌──────────────────────────────┐
        │   the whole job:              │
        │   money in  ·  money out      │
        └──────────────────────────────┘
                       │
                       ▼
                    money out

     who paid  ✓        who didn't  ✗
      i owe   ──▶          ◀──  owes me

     not debit. not credit. not receivables.`}</Ascii>
  )
}

// ── 4 (of the shipped set) · Two attempts: calculator vs. payment ──────────
export function AttemptsContrast() {
  return (
    <Ascii>{String.raw`attempt 1 · borrow from the calculator

   type an amount  ──▶  = 1,240  ──▶  ???
                                       └─ ✗  "a transaction?"
                                          the intent never arrived


attempt 2 · borrow from payment apps

   pick a person  ──▶  amount  ──▶  confirm  ──▶  ✓ done
                                                  └─ it felt like
                                                     it happened`}</Ascii>
  )
}

// ── 5 (of the shipped set) · From a transaction to a way out ───────────────
export function ClosingProgression() {
  const stops = [
    { x: 70, label: ['money in /', 'money out'] },
    { x: 232, label: ['saved'] },
    { x: 394, label: ['a record'] },
    { x: 540, label: ['proof'] },
    { x: 686, label: ['a way out'] },
  ]
  return (
    <svg viewBox="0 0 760 130" width="100%" role="img"
      aria-label="A progression left to right: money in / money out, saved, a record, proof, and finally a way out.">
      <line x1={70} y1={52} x2={686} y2={52} stroke={FAINT} strokeWidth={1} />
      {stops.map((s, i) => {
        const last = i === stops.length - 1
        return (
          <g key={i}>
            {i > 0 && (
              <path d={`M${stops[i - 1].x + 44} 52 L ${s.x - 12} 52`} fill="none" stroke={FAINT} strokeWidth={1} />
            )}
            <circle cx={s.x} cy={52} r={last ? 9 : 5} fill={last ? GREEN : 'none'} stroke={last ? GREEN : INK} strokeWidth={1.5} />
            {s.label.map((line, j) => (
              <text key={j} x={s.x} y={84 + j * 17} textAnchor="middle" fontSize={13}
                fill={last ? GREEN : MUTED} style={last ? pixel : mono}
                letterSpacing={last ? '0.08em' : undefined}>{line}</text>
            ))}
          </g>
        )
      })}
      {/* small arrowhead into the final node */}
      <path d="M672 46 l10 6 l-10 6" fill="none" stroke={GREEN} strokeWidth={1.5} />
    </svg>
  )
}
