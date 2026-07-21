import { ABOUT, INSPIRATION } from './about';
import { LOCAL_WORK } from '@/lib/work/local';
import { orderWork } from '@/lib/work/order';
import { LOCAL_WRITINGS, LOCAL_WRITING_DOCS, sortByNumber } from '@/lib/writings/local';
import type {
  AboutDoc, InspirationItem, WorkItem, Writing, WritingListItem, WritingNav,
} from './types';

// All content lives in code now (no CMS). These accessors mirror the old
// Sanity query names so call sites didn't have to change shape — they just
// return the local data directly.
export * from './types';

export function getWork(): WorkItem[] {
  // Rainbow-sort + de-dupe the whole Work list (see lib/work/order.ts).
  return orderWork(LOCAL_WORK);
}

export function getAbout(): AboutDoc {
  return ABOUT;
}

export function getInspiration(): InspirationItem[] {
  return INSPIRATION;
}

export function getWritingsNav(): WritingNav[] {
  return sortByNumber(LOCAL_WRITINGS).map(({ slug, title }) => ({ slug, title }));
}

export function getWritingsList(): WritingListItem[] {
  return sortByNumber(LOCAL_WRITINGS);
}

export function getWritingSlugs(): string[] {
  return LOCAL_WRITINGS.map((w) => w.slug);
}

export function getWriting(slug: string): Writing | null {
  return LOCAL_WRITING_DOCS[slug] ?? null;
}
