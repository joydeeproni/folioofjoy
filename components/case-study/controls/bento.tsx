'use client';

// A bento / masonry view for a single stage beat — 3–6 related screens shown at
// once (a tool's states, a set of detail cards). Natural-height masonry via CSS
// columns so mixed aspect ratios sit together without cropping. Click a tile to
// open it full-size in the shared lightbox is handled by the stage; here we just
// lay them out and lift on hover.

const BASE = '/work/tactile-core';

export function Bento({
  images,
  columns = 2,
}: {
  images: Array<{ file: string; alt?: string }>;
  columns?: 2 | 3;
}) {
  const colClass = columns === 3 ? 'columns-2 md:columns-3' : 'columns-1 sm:columns-2';
  return (
    <div className="h-full w-full overflow-y-auto px-1 py-1">
      <div className={`${colClass} gap-2 [column-fill:_balance]`}>
        {images.map((im) => (
          <div
            key={im.file}
            className="mb-2 break-inside-avoid overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform duration-200 hover:z-10 hover:scale-[1.02] hover:ring-[#2CA152]/60"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <img
              src={`${BASE}/${im.file}`}
              alt={im.alt ?? ''}
              loading="lazy"
              draggable={false}
              className="h-auto w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
