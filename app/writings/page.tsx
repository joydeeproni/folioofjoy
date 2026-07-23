import { BackLink } from '@/components/back-link';
import { getWritingsList } from '@/lib/content';
import { WritingsIndex } from '@/components/writings/writings-index';

const BG = '#0B0B0B';
const FG = '#EDEAE0';

export default function Writings() {
  const WRITINGS = getWritingsList();
  return (
    <main className="relative min-h-screen w-full px-8 md:px-16 py-10" style={{ backgroundColor: BG, color: FG }}>
      <BackLink />
      <WritingsIndex writings={WRITINGS} />
    </main>
  );
}
