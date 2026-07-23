'use client';

import { useRef, useState } from 'react';

// A tiny stand-in for the real Canvas: a few draggable notes on a dotted board,
// wired up with the interaction states the case study talks about (idle → hover
// → selected → dragging). Positions are stored as 0–100 percentages of the
// board so it stays responsive. Not the real thing — just enough to make the
// point that this behaviour has to be felt, not screenshotted.

type Note = { id: string; x: number; y: number; w: number; text: string; tone: string; ink: string };

const INITIAL: Note[] = [
  { id: 'a', x: 10, y: 16, w: 34, text: 'Group these', tone: '#F7D774', ink: '#3a2f00' },
  { id: 'b', x: 54, y: 40, w: 32, text: 'Ship it', tone: '#8FE3B0', ink: '#08351d' },
  { id: 'c', x: 22, y: 60, w: 38, text: 'Rescope Monday', tone: '#F2A6C0', ink: '#3a0f22' },
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function MiniCanvas() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [notes, setNotes] = useState<Note[]>(INITIAL);
  const [selected, setSelected] = useState<string | null>('a');
  const [hovered, setHovered] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const pctFromEvent = (e: React.PointerEvent) => {
    const r = boardRef.current!.getBoundingClientRect();
    return { px: ((e.clientX - r.left) / r.width) * 100, py: ((e.clientY - r.top) / r.height) * 100 };
  };

  const onDown = (e: React.PointerEvent, note: Note) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { px, py } = pctFromEvent(e);
    drag.current = { id: note.id, dx: px - note.x, dy: py - note.y };
    setSelected(note.id);
    setDragging(note.id);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { px, py } = pctFromEvent(e);
    const { id, dx, dy } = drag.current;
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, x: clamp(px - dx, 0, 100 - n.w), y: clamp(py - dy, 2, 82) } : n)));
  };
  const onUp = (e: React.PointerEvent) => {
    drag.current = null;
    setDragging(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const state = dragging ? 'dragging' : selected ? 'selected' : hovered ? 'hover' : 'idle';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={boardRef}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
        className="relative aspect-[4/3] w-[min(92%,460px)] touch-none overflow-hidden rounded-xl"
        style={{
          backgroundColor: '#141414',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      >
        {notes.map((n) => {
          const isSel = selected === n.id;
          const isHov = hovered === n.id;
          const isDrag = dragging === n.id;
          return (
            <div
              key={n.id}
              onPointerDown={(e) => onDown(e, n)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerEnter={() => setHovered(n.id)}
              onPointerLeave={() => setHovered((h) => (h === n.id ? null : h))}
              className="absolute select-none rounded-md px-3 py-2 font-sans text-[13px] font-medium leading-tight shadow-lg"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                width: `${n.w}%`,
                background: n.tone,
                color: n.ink,
                cursor: isDrag ? 'grabbing' : 'grab',
                transform: isDrag ? 'scale(1.04)' : isHov ? 'translateY(-1px)' : 'none',
                transition: isDrag ? 'none' : 'transform 140ms ease-out, box-shadow 140ms ease-out',
                outline: isSel ? '2px solid #2CA152' : '2px solid transparent',
                outlineOffset: 2,
                boxShadow: isDrag ? '0 12px 30px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.35)',
                zIndex: isDrag || isSel ? 5 : 1,
              }}
            >
              {n.text}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: 'rgba(237,234,224,0.5)' }}>
        state: <span style={{ color: '#2CA152' }}>{state}</span>
      </p>
    </div>
  );
}
