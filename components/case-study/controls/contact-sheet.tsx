'use client';

// "The wall" — all 39 Tactile Core screens at once, grouped by tool. The point
// is the sheer surface: one designer, four years, this whole system. Individual
// tiles aren't meant to be read here — the heroes get their own zoom-tours and
// the small components get the details gallery. This beat is the scope statement.

const BASE = '/work/tactile-core';

type Group = { tool: string; files: string[] };

const GROUPS: Group[] = [
  {
    tool: 'Create / configure a game',
    files: [
      'create-new-game-sidebar-navigation-default.png',
      'create-new-game-overview.png',
      'create-new-game-overview-tab.png',
      'create-new-game-after-commercial-name-is-filled-shortcod.png',
      'create-new-game-permissions-adding-users-ii.png',
      'create-new-game-template-parts-container.png',
      'create-new-game-template-parts-container-1.png',
      'create-new-game-template-parts-fingerprint-section.png',
    ],
  },
  {
    tool: 'A/B testing',
    files: [
      'ab-test-tracks-and-journeys.png',
      'ab-test-test-group-card-v2.png',
      'ab-test-test-group-card-v2-1.png',
      'ab-test-test-group-card-v2-2.png',
      'ab-test-randomization-seed-card.png',
      'ab-test-modal.png',
      'ab-test-first-time-open-save-resource-empty-state.png',
    ],
  },
  {
    tool: 'User segments',
    files: [
      'segments-default.png',
      'segments-2-below-header-expanded.png',
      'segments-details-view.jpg',
      'segments-details-frame-1150.png',
      'segments-segment-overlap.png',
      'segments-when-there-are-many-segments.png',
      'segments-when-there-is-only-2-segments.png',
      'segments-dashboard-usage-section.png',
      'segments-dashboard-usage-section-1.png',
      'segments-last-run-result-section.png',
      'segments-last-run-result-section-1.png',
      'segments-create-segment-group.png',
      'segments-add-button-state.png',
      'segments-archive-option-in-kebab-menu.png',
      'segments-kebab-menu-on-tab-level-to-delete.png',
    ],
  },
  {
    tool: 'Scheduled features / offers',
    files: [
      'sf-timeline-view.png',
      'sf-default.png',
      'sf-list-view-metadata-highlights.png',
      'sf-list-view-metadata-highlights-1.png',
      'sf-metadata-highlights.png',
      'sf-creating-when-form-is-filled.png',
      'sf-creating-modal.png',
      'sf-creating-saved-but-not-pushed-changes.png',
      'sf-overview-consecutiveoffertemplate-threeoffers-allavai.png',
    ],
  },
];

export function ContactSheet() {
  const total = GROUPS.reduce((n, g) => n + g.files.length, 0);
  return (
    <div className="h-full w-full overflow-y-auto px-1 py-1">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: '#2CA152' }}>
          The whole surface
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: 'rgba(237,234,224,0.4)' }}>
          {total} screens · 1 designer
        </p>
      </div>
      <div className="space-y-5">
        {GROUPS.map((g) => (
          <div key={g.tool}>
            <p className="mb-2 font-sans text-[12px]" style={{ color: 'rgba(237,234,224,0.55)' }}>
              {g.tool} <span style={{ color: 'rgba(237,234,224,0.3)' }}>· {g.files.length}</span>
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
              {g.files.map((f) => (
                <div
                  key={f}
                  className="group/tile relative overflow-hidden rounded-md ring-1 ring-white/10 transition-transform duration-200 hover:z-10 hover:scale-[1.04] hover:ring-[#2CA152]/70"
                  style={{ aspectRatio: '4 / 3', backgroundColor: 'rgba(255,255,255,0.04)' }}
                >
                  <img
                    src={`${BASE}/${f}`}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover object-top opacity-90 transition-opacity duration-200 group-hover/tile:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
