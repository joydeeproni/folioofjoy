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
  caseStudy?: string; // slug of a /work/[slug] case study this card links into
}

// ---- About + Inspiration ----

// A paragraph is either plain text or a run of segments, where a segment is
// plain text or an inline link. Keeps the About essay in code without a
// rich-text runtime.
export type RichSegment = string | { text: string; href: string };
export type Para = string | RichSegment[];

// A design value, shown as a colour chip + title + body on the About page.
export interface AboutValue {
  title: string;
  color: string; // hex, drives the chip
  body: string;
}

// A piece of kit. `image` is a path under /public (or a Blob URL); until one is
// set the card renders an empty slot so the grid keeps its shape.
export interface KitItem {
  name: string;
  note: string;
  image?: string;
}

export interface AboutDoc {
  lede: string;
  subLede?: string;
  intro: Para[];
  // Collapsed by default on the page — the long-form "what design is" answer.
  thesis?: { title: string; paras: Para[] };
  quote?: string;
  quoteAttribution?: string;
  outro: Para[];
  values?: AboutValue[];
  kitLede?: string;
  kit?: KitItem[];
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
  season?: string; // e.g. 'Spring 2026' — shown as the row meta in the writings index
}

export interface Writing extends WritingListItem {
  titled: string;
  subhead: string;
  references: { label: string; href: string }[];
  body: string[];
  heroImage?: string;
}
