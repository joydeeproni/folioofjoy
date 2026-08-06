import type { RichInlineArt } from '@/lib/content/types';

function DenmarkFlag() {
  return (
    <span className="relative block h-[14px] w-[21px] bg-[#C8102E]">
      <span className="absolute inset-y-0 left-[6px] w-[3px] bg-white" />
      <span className="absolute inset-x-0 top-[5px] h-[3px] bg-white" />
    </span>
  );
}

const METRO_M = ['#...#', '##.##', '#.#.#', '#...#', '#...#'];

function MetroSign() {
  return (
    <span className="relative block h-[22px] w-[17px]">
      <span className="absolute left-[2px] top-0 grid grid-cols-5 bg-[#EDEAE0] p-[1px]">
        {METRO_M.flatMap((row, y) =>
          [...row].map((cell, x) => (
            <span
              key={`${x}-${y}`}
              className="h-[2px] w-[2px]"
              style={{ backgroundColor: cell === '#' ? '#EC2D2D' : 'transparent' }}
            />
          )),
        )}
      </span>
      <span className="absolute bottom-0 left-[8px] h-[10px] w-[2px] bg-[#EDEAE0]/60" />
      <span className="absolute bottom-0 left-[5px] h-[2px] w-[8px] bg-[#EDEAE0]/60" />
    </span>
  );
}

const TACTILE_DISC = [
  '.#####.',
  '#######',
  '#######',
  '#######',
  '#######',
  '#######',
  '.#####.',
];
const TACTILE_MARK = [
  '...#...',
  '..###..',
  '...#...',
  '.#####.',
  '...#...',
  '...##..',
  '....#..',
];

function TactileMark() {
  return (
    <span className="relative block h-[21px] w-[21px]">
      {[...Array(49)].map((_, index) => {
        const x = index % 7;
        const y = Math.floor(index / 7);
        const disc = TACTILE_DISC[y][x] === '#';
        const mark = TACTILE_MARK[y][x] === '#';
        return (
          <span
            key={index}
            className="absolute h-[3px] w-[3px]"
            style={{
              left: x * 3,
              top: y * 3,
              backgroundColor: mark ? '#FFFFFF' : disc ? '#5A2095' : 'transparent',
            }}
          />
        );
      })}
    </span>
  );
}

export function InlinePixelArt({ icon, label }: { icon: RichInlineArt; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="mx-1.5 inline-flex translate-y-[0.2em] align-baseline"
    >
      {icon === 'denmark' ? <DenmarkFlag /> : icon === 'metro' ? <MetroSign /> : <TactileMark />}
    </span>
  );
}
