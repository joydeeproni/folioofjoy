// Shared content types. Previously these lived in lib/sanity/queries.ts; the site
// no longer uses a CMS, so all content is defined in code (see lib/content,
// lib/work/local.ts, lib/writings/local.ts). This is a leaf module — data files
// and the content index both import from here, so it must not import them back.

// ---- Work ----

// SVC = service for others, JOY = fun/experiments, BIZ = money work, DTY = duty/busywork.
export type WorkCategory = 'SVC' | 'JOY' | 'BIZ' | 'DTY';

export interface WorkLinkItem {
  label: string;
  url: string;
}

export interface WorkItem {
  src: string; // image or video URL (Vercel Blob)
  caption: string;
  category: WorkCategory;
  links: WorkLinkItem[];
}

// ---- About + Inspiration ----

// A paragraph is either plain text or a run of segments, where a segment is
// plain text or an inline link. Keeps the About essay in code without a
// rich-text runtime.
export type RichSegment = string | { text: string; href: string };
export type Para = string | RichSegment[];

export interface AboutDoc {
  lede: string;
  subLede?: string;
  intro: Para[];
  quote?: string;
  quoteAttribution?: string;
  outro: Para[];
}

export interface InspirationItem {
  category: string;
  name: string;
  note?: string;
  url?: string;
}

// ---- Writings ----

// The kind of writing, shown as a category label in place of the date.
export type WritingType = 'Thoughts' | 'Research' | 'Experiments' | 'Case Study';

export interface WritingNav {
  slug: string;
  title: string;
}

export interface WritingListItem extends WritingNav {
  number: string;
  postedOn: string;
  type?: WritingType;
}

export interface Writing extends WritingListItem {
  titled: string;
  subhead: string;
  references: { label: string; href: string }[];
  body: string[];
  heroImage?: string;
}
