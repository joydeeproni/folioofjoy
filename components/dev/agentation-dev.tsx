'use client';

import { useEffect, useState, type ComponentType } from 'react';

// Dev-only mount of the Agentation visual-feedback toolbar. We dynamic-import
// the package inside an effect so it (a) only loads in development and (b) never
// ends up in the production client bundle — the import() never runs in prod, so
// its chunk is never requested. Renders a bottom-right toolbar you click to
// annotate elements; output is wired to the agentation MCP server.
export function AgentationDev() {
  const [Toolbar, setToolbar] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    let alive = true;
    import('agentation')
      .then((m) => {
        if (alive) setToolbar(() => m.Agentation);
      })
      .catch(() => {
        /* package not installed / dev-only devDep — silently no-op */
      });
    return () => {
      alive = false;
    };
  }, []);

  return Toolbar ? <Toolbar /> : null;
}
