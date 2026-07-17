// Monospace ASCII diagrams for the "Designing For Low Literacy" case study.
// All five share one look: off-white monospace on the article background, no
// frame — they read as part of the prose.

const INK = '#EDEAE0'

// A monospaced ASCII figure. Hidden from AT (the <figure> carries the label).
function Ascii({ children }: { children: string }) {
  return (
    <pre aria-hidden className="font-mono leading-[1.5] text-[12px] sm:text-[13px] whitespace-pre overflow-x-auto"
      style={{ color: INK }}>{children}</pre>
  )
}

// ── 1 · The proof gap ──────────────────────────────────────────────────────
export function ProofGapDiagram() {
  return (
    <Ascii>{String.raw`   notebook  ·  WhatsApp  ·  UPI  ·  memory
                     │
                     ▼   scattered — no proof
      ╌╌╌╌╌╌╌╌╌╌  proof?  ╌╌╌╌╌╌╌╌╌╌
                     │
                     ▼
      institutions see  ✗ risk,  not a business`}</Ascii>
  )
}

// ── 2 · The hand-to-mouth loop ─────────────────────────────────────────────
export function HandToMouthLoop() {
  return (
    <Ascii>{String.raw`   ┌──▶  earn  ──▶  spend  ──▶  jot it down  ──┐
   │                                           │
   └──────────  lose the note  ◀───────────────┘

              same loop, every month`}</Ascii>
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

// ── 4 · Two attempts: calculator vs. payment ───────────────────────────────
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

// ── 5 · From a transaction to a way out ────────────────────────────────────
export function ClosingProgression() {
  return (
    <Ascii>{String.raw`   ○ money in / out  ──▶  ○ saved  ──▶  ○ a record  ──▶  ○ proof  ──▶  ● a way out`}</Ascii>
  )
}
