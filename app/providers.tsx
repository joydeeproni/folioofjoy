'use client';

import { AudioProvider } from '@/lib/audio-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}
