'use client';

import { useRef, useState } from 'react';

const BOARD = {
  backgroundColor: '#141414',
  backgroundImage: 'radial-gradient(rgba(237,234,224,0.12) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

function TextToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
      style={{ color: active ? '#2CA152' : 'rgba(237,234,224,0.42)' }}
    >
      {children}
    </button>
  );
}

type Point = { x: number; y: number };
type CanvasNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;
  ink: string;
};

const INITIAL_NODES: CanvasNode[] = [
  { id: 'shape-1', x: 72, y: 178, w: 126, h: 70, label: 'Shape 01', fill: '#F7D774', ink: '#3A2F00' },
  { id: 'shape-2', x: 402, y: 178, w: 126, h: 70, label: 'Shape 02', fill: '#8FE3B0', ink: '#08351D' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const centerOf = (node: CanvasNode): Point => ({ x: node.x + node.w / 2, y: node.y + node.h / 2 });

function edgeToward(node: CanvasNode, target: Point): Point {
  const center = centerOf(node);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const xScale = Math.abs(dx) > 0.001 ? node.w / 2 / Math.abs(dx) : Infinity;
  const yScale = Math.abs(dy) > 0.001 ? node.h / 2 / Math.abs(dy) : Infinity;
  const scale = Math.min(xScale, yScale);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

function connectorPath(from: CanvasNode, to: CanvasNode, polished: boolean, index: number): string {
  const fromCenter = centerOf(from);
  const toCenter = centerOf(to);
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  if (Math.hypot(dx, dy) < 0.001) return '';

  if (!polished) {
    const start = edgeToward(from, toCenter);
    const targetEdge = edgeToward(to, fromCenter);
    const midX = (start.x + targetEdge.x) / 2;
    const miss = index % 2 === 0 ? 9 : -9;
    // The first generated draft: a plausible curve whose final control point
    // does not respect the target edge normal. It looks fine at rest, then the
    // arrow rotates or misses as cards change sides and stack vertically.
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${targetEdge.y}, ${targetEdge.x + miss} ${targetEdge.y - 7}`;
  }

  // Route on the axis with the most actual clearance between the two cards,
  // not simply the largest centre-to-centre delta. This keeps the elbow out of
  // the card bodies when one axis overlaps but the other has room.
  const horizontalClearance = Math.abs(dx) - (from.w + to.w) / 2;
  const verticalClearance = Math.abs(dy) - (from.h + to.h) / 2;

  if (horizontalClearance >= verticalClearance) {
    const direction = dx >= 0 ? 1 : -1;
    const start = { x: fromCenter.x + direction * from.w / 2, y: fromCenter.y };
    const targetEdge = { x: toCenter.x - direction * to.w / 2, y: toCenter.y };
    const end = { x: targetEdge.x + direction * 3, y: targetEdge.y };
    const midX = (start.x + targetEdge.x) / 2;
    return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`;
  }

  const direction = dy >= 0 ? 1 : -1;
  const start = { x: fromCenter.x, y: fromCenter.y + direction * from.h / 2 };
  const targetEdge = { x: toCenter.x, y: toCenter.y - direction * to.h / 2 };
  const end = { x: targetEdge.x, y: targetEdge.y + direction * 3 };
  const midY = (start.y + targetEdge.y) / 2;
  return `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`;
}

export function ConnectorPlayground() {
  const [polished, setPolished] = useState(false);
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState<Array<[string, string]>>([]);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nextIdRef = useRef(3);
  const dragRef = useRef<{
    id: string;
    dx: number;
    dy: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const pointFromEvent = (event: React.PointerEvent<SVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : { x: 0, y: 0 };
  };

  const startNodeDrag = (event: React.PointerEvent<SVGGElement>, node: CanvasNode) => {
    event.stopPropagation();
    const point = pointFromEvent(event);
    dragRef.current = {
      id: node.id,
      dx: point.x - node.x,
      dy: point.y - node.y,
      startX: point.x,
      startY: point.y,
      moved: false,
    };
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = pointFromEvent(event);
    const drag = dragRef.current;
    if (drag) {
      if (Math.hypot(point.x - drag.startX, point.y - drag.startY) > 4) drag.moved = true;
      setNodes((current) => current.map((node) => (
        node.id === drag.id
          ? {
              ...node,
              x: clamp(point.x - drag.dx, 14, 586 - node.w),
              y: clamp(point.y - drag.dy, 74, 486 - node.h),
            }
          : node
      )));
    }
  };

  const finishGesture = (event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag && !drag.moved) {
      if (!connectFrom) {
        setConnectFrom(drag.id);
      } else if (connectFrom === drag.id) {
        setConnectFrom(null);
      } else {
        const exists = links.some(([from, to]) => (
          (from === connectFrom && to === drag.id) || (from === drag.id && to === connectFrom)
        ));
        if (!exists) setLinks((current) => [...current, [connectFrom, drag.id]]);
        setConnectFrom(null);
      }
    }
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const addShape = () => {
    const idNumber = nextIdRef.current;
    nextIdRef.current += 1;
    const palette = [
      { fill: '#F2A6C0', ink: '#3A0F22' },
      { fill: '#B9A4E3', ink: '#24133B' },
      { fill: '#E9D80C', ink: '#332F00' },
    ];
    const color = palette[(idNumber - 3) % palette.length];
    const column = (idNumber - 3) % 3;
    const row = Math.floor((idNumber - 3) / 3) % 2;
    setNodes((current) => [
      ...current,
      {
        id: `shape-${idNumber}`,
        x: 166 + column * 112,
        y: 296 + row * 92,
        w: 126,
        h: 70,
        label: `Shape ${String(idNumber).padStart(2, '0')}`,
        ...color,
      },
    ]);
    setConnectFrom(`shape-${idNumber}`);
  };

  const nodeById = (id: string) => nodes.find((node) => node.id === id);

  return (
    <div className="relative h-full w-full touch-none overflow-hidden" style={BOARD}>
      <div className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-7">
        <TextToggle active={!polished} onClick={() => setPolished(false)}>AI draft</TextToggle>
        <TextToggle active={polished} onClick={() => setPolished(true)}>Designer polish</TextToggle>
      </div>
      <div className="absolute left-1/2 top-14 z-20 flex -translate-x-1/2 items-center gap-7">
        <button
          type="button"
          onClick={addShape}
          disabled={nodes.length >= 8}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2CA152] transition-opacity disabled:opacity-30"
        >
          + Add shape
        </button>
        <button
          type="button"
          onClick={() => { setLinks([]); setConnectFrom(null); }}
          disabled={links.length === 0 && !connectFrom}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 transition-opacity hover:text-white/70 disabled:opacity-25"
        >
          Clear links
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full select-none"
        aria-label="Interactive whiteboard for adding, connecting, and moving shapes"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) setConnectFrom(null);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
      >
        <defs>
          <marker
            id="good-arrow"
            viewBox="0 0 12 12"
            refX="11.5"
            refY="6"
            markerWidth="14"
            markerHeight="14"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M0 0 L12 6 L0 12 z" fill="#2CA152" />
          </marker>
        </defs>

        <g
          fill="none"
          stroke="#2CA152"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#good-arrow)"
        >
          {links.map(([fromId, toId], index) => {
            const from = nodeById(fromId);
            const to = nodeById(toId);
            if (!from || !to) return null;
            return <path key={`${fromId}-${toId}`} d={connectorPath(from, to, polished, index)} />;
          })}
        </g>

        <g>
          {nodes.map((node) => (
            <g
              key={node.id}
              onPointerDown={(event) => startNodeDrag(event, node)}
              className="cursor-grab active:cursor-grabbing"
            >
              {polished && connectFrom === node.id && (
                <>
                  <rect
                    x={node.x - 7}
                    y={node.y - 7}
                    width={node.w + 14}
                    height={node.h + 14}
                    rx="13"
                    fill="none"
                    stroke="#EDEAE0"
                    strokeWidth="2"
                    strokeDasharray="7 5"
                    pointerEvents="none"
                  />
                  {[
                    [node.x - 9, node.y - 9],
                    [node.x + node.w + 3, node.y - 9],
                    [node.x - 9, node.y + node.h + 3],
                    [node.x + node.w + 3, node.y + node.h + 3],
                  ].map(([x, y], index) => (
                    <rect key={index} x={x} y={y} width="6" height="6" fill="#EDEAE0" pointerEvents="none" />
                  ))}
                  <text
                    x={node.x + node.w / 2}
                    y={node.y - 17}
                    textAnchor="middle"
                    fill="#EDEAE0"
                    pointerEvents="none"
                    className="font-mono text-[10px] uppercase tracking-[0.16em]"
                  >
                    Start shape
                  </text>
                </>
              )}
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="9"
                fill={node.fill}
                stroke={!polished && connectFrom === node.id ? '#E9D80C' : '#2CA152'}
                strokeWidth={!polished && connectFrom === node.id ? 4 : 2}
              />
              <text
                x={node.x + node.w / 2}
                y={node.y + node.h / 2 + 5}
                textAnchor="middle"
                fill={node.ink}
                pointerEvents="none"
                className="font-sans text-[14px]"
              >
                {node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
        {connectFrom
          ? 'Choose another shape to connect'
          : 'Add a shape · click two shapes to connect · drag to reroute'}
      </p>
      <p
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ color: polished ? '#2CA152' : '#E9D80C' }}
      >
        {polished ? 'Elbow routing · explicit selection' : 'Move the shapes until the draft breaks'}
      </p>
    </div>
  );
}

type MembershipState = 'moving' | 'selected' | 'absorbed';

const MEMBERSHIP_LABEL: Record<MembershipState, string> = {
  moving: 'Moving into section',
  selected: 'Section selected',
  absorbed: 'Stretching absorbs object',
};

export function SectionMembershipLab() {
  const [state, setState] = useState<MembershipState>('moving');
  const [sectionLeft, setSectionLeft] = useState(43);
  const [notePosition, setNotePosition] = useState({ x: 8, y: 48 });
  const boardRef = useRef<HTMLDivElement>(null);
  const noteDragRef = useRef<{ dx: number; dy: number } | null>(null);
  const stretchingRef = useRef(false);
  const sectionRight = 91;
  const sectionWidth = sectionRight - sectionLeft;
  const noteInside =
    notePosition.x + 15 >= sectionLeft &&
    notePosition.x + 15 <= sectionRight &&
    notePosition.y >= 25 &&
    notePosition.y <= 68;
  const absorbed = state === 'absorbed' && sectionLeft <= 41;

  const pointInBoard = (event: React.PointerEvent<HTMLElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const changeState = (next: MembershipState) => {
    setState(next);
    setSectionLeft(43);
    setNotePosition(next === 'moving' ? { x: 8, y: 48 } : { x: 52, y: 52 });
  };

  const startNoteDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = pointInBoard(event);
    noteDragRef.current = { dx: point.x - notePosition.x, dy: point.y - notePosition.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveNote = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = noteDragRef.current;
    if (!drag) return;
    const point = pointInBoard(event);
    setNotePosition({
      x: clamp(point.x - drag.dx, 2, 68),
      y: clamp(point.y - drag.dy, 17, 82),
    });
  };

  const finishNoteDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    noteDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const startStretch = (event: React.PointerEvent<HTMLButtonElement>) => {
    stretchingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stretchSection = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!stretchingRef.current) return;
    const point = pointInBoard(event);
    setSectionLeft(clamp(point.x, 21, 43));
  };

  const finishStretch = (event: React.PointerEvent<HTMLButtonElement>) => {
    stretchingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const status =
    state === 'moving'
      ? noteInside ? 'Release to join section' : 'Drag Level hook into section'
      : state === 'selected'
        ? MEMBERSHIP_LABEL.selected
        : absorbed ? 'CTA idea absorbed into section' : 'Drag the left edge to absorb CTA idea';

  return (
    <div ref={boardRef} className="relative h-full w-full touch-none overflow-hidden" style={BOARD}>
      <div className="absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-6">
        <TextToggle active={state === 'moving'} onClick={() => changeState('moving')}>Move in</TextToggle>
        <TextToggle active={state === 'selected'} onClick={() => changeState('selected')}>Selected</TextToggle>
        <TextToggle active={state === 'absorbed'} onClick={() => changeState('absorbed')}>Stretch</TextToggle>
      </div>

      <div
        className="absolute top-[25%] z-10 h-[52%] rounded-xl border transition-[background-color,box-shadow] duration-200"
        style={{
          left: `${sectionLeft}%`,
          width: `${sectionWidth}%`,
          borderColor: '#2CA152',
          borderStyle: state === 'moving' ? 'dashed' : 'solid',
          backgroundColor: state === 'moving' && noteInside ? 'rgba(44,161,82,0.12)' : 'rgba(44,161,82,0.035)',
          boxShadow: state === 'selected' || state === 'absorbed' ? '0 0 0 2px rgba(44,161,82,0.24)' : 'none',
        }}
      >
        <p className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2CA152]">Section 01</p>
        {(state === 'selected' || state === 'absorbed') && (
          <>
            {['-left-1.5 -top-1.5', '-right-1.5 -top-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((position) => (
              <span key={position} className={`absolute h-3 w-3 rounded-sm border border-[#0B0B0B] bg-[#2CA152] ${position}`} />
            ))}
          </>
        )}
        {state === 'absorbed' && (
          <button
            type="button"
            aria-label="Stretch section"
            onPointerDown={startStretch}
            onPointerMove={stretchSection}
            onPointerUp={finishStretch}
            onPointerCancel={finishStretch}
            className="absolute -left-2 top-1/2 z-30 h-12 w-4 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-[#141414] bg-[#2CA152]"
          />
        )}
      </div>

      <div className="absolute left-[57%] top-[37%] z-20 w-[27%] rounded-md bg-[#8FE3B0] px-3 py-2 font-sans text-[12px] font-medium text-[#08351D] shadow-lg">
        Ship it
      </div>

      <div
        onPointerDown={startNoteDrag}
        onPointerMove={moveNote}
        onPointerUp={finishNoteDrag}
        onPointerCancel={finishNoteDrag}
        className="absolute z-20 w-[30%] cursor-grab rounded-md bg-[#F7D774] px-3 py-2 font-sans text-[12px] font-medium text-[#3A2F00] shadow-lg transition-[box-shadow,transform] duration-150 active:cursor-grabbing"
        style={{
          left: `${notePosition.x}%`,
          top: `${notePosition.y}%`,
          transform: state === 'moving' ? 'scale(1.04)' : 'scale(1)',
          boxShadow: state === 'moving' && noteInside ? '0 14px 34px rgba(0,0,0,0.55), 0 0 0 2px #2CA152' : '0 6px 16px rgba(0,0,0,0.35)',
        }}
      >
        Level hook
        {state === 'moving' && noteInside && <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-[#141414] bg-[#2CA152]" />}
      </div>

      <div
        className="absolute left-[27%] top-[65%] z-20 w-[28%] rounded-md bg-[#F2A6C0] px-3 py-2 font-sans text-[12px] font-medium text-[#3A0F22] shadow-lg transition-shadow duration-200"
        style={{ boxShadow: absorbed ? '0 0 0 2px #2CA152, 0 6px 16px rgba(0,0,0,0.35)' : '0 6px 16px rgba(0,0,0,0.35)' }}
      >
        CTA idea
        {absorbed && (
          <span className="absolute -right-2 -top-2 rounded-full bg-[#2CA152] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white">
            joined
          </span>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0B0B0B]/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
        {status}
      </div>
    </div>
  );
}
