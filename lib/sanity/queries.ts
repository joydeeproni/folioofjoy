import type { PortableTextBlock } from '@portabletext/react';
import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from './client';
import { urlFor } from './image';
import { LOCAL_WRITINGS, mergeLocalWritings } from '@/lib/writings/local';
import { LOCAL_WORK } from '@/lib/work/local';

// Revalidate cached fetches every minute; a webhook can make this instant later.
const CACHE = { next: { revalidate: 60 } } as const;

// ---- About + Inspiration ----

export interface AboutDoc {
  lede?: string;
  subLede?: string;
  intro?: PortableTextBlock[];
  quote?: string;
  quoteAttribution?: string;
  outro?: PortableTextBlock[];
}

export interface InspirationItem {
  category: string;
  name: string;
  note?: string;
  url?: string;
}

const ABOUT_QUERY = `*[_type == "about"][0]{lede, subLede, intro, quote, quoteAttribution, outro}`;
const INSPIRATION_QUERY = `*[_type == "inspiration"][0].items[]{category, name, note, url}`;

export function getAbout() {
  return sanityClient.fetch<AboutDoc | null>(ABOUT_QUERY, {}, CACHE);
}

export function getInspiration() {
  return sanityClient.fetch<InspirationItem[] | null>(INSPIRATION_QUERY, {}, CACHE);
}

// ---- Work ----

export type WorkCategory = 'SVC' | 'JOY' | 'BIZ' | 'DTY';

export interface WorkLinkItem {
  label: string;
  url: string;
}

export interface WorkItem {
  src: string; // resolved CDN url (image or video)
  caption: string;
  category: WorkCategory;
  links: WorkLinkItem[];
}

interface RawWorkItem {
  caption?: string;
  category?: WorkCategory;
  links?: WorkLinkItem[];
  image?: SanityImageSource;
  videoUrl?: string;
}

const WORK_QUERY = `*[_type == "work"][0].items[]{caption, category, links, image, "videoUrl": video.asset->url}`;

export async function getWork(): Promise<WorkItem[]> {
  const items = (await sanityClient.fetch<RawWorkItem[] | null>(WORK_QUERY, {}, CACHE)) ?? [];
  const sanityWork = items.map((it) => ({
    src: it.videoUrl
      ? it.videoUrl
      : it.image
        ? urlFor(it.image).width(1600).auto('format').quality(80).url()
        : '',
    caption: it.caption ?? '',
    category: it.category ?? 'SVC',
    links: it.links ?? [],
  }));
  // Local (Blob-hosted) items lead the list so they surface in the Work Preview.
  return [...LOCAL_WORK, ...sanityWork];
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

const WRITINGS_NAV_QUERY = `*[_type == "writing"] | order(number asc){"slug": slug.current, title, number}`;
const WRITINGS_LIST_QUERY = `*[_type == "writing"] | order(number asc){"slug": slug.current, number, title, postedOn, type}`;
const WRITING_SLUGS_QUERY = `*[_type == "writing" && defined(slug.current)].slug.current`;
const WRITING_QUERY = `*[_type == "writing" && slug.current == $slug][0]{
  "slug": slug.current, number, title, postedOn, type, titled, subhead, references,
  body, "heroImage": heroImage.asset->url
}`;

// Both the list and nav merge in bespoke, code-rendered writings (see
// lib/writings/local.ts), re-sorted by number so they interleave with Sanity docs.
export async function getWritingsNav(): Promise<WritingNav[]> {
  const sanity = await sanityClient.fetch<(WritingNav & { number?: string })[]>(WRITINGS_NAV_QUERY, {}, CACHE);
  const local = LOCAL_WRITINGS.map(({ slug, title, number }) => ({ slug, title, number }));
  return mergeLocalWritings(sanity, local).map(({ slug, title }) => ({ slug, title }));
}

export async function getWritingsList(): Promise<WritingListItem[]> {
  const sanity = await sanityClient.fetch<WritingListItem[]>(WRITINGS_LIST_QUERY, {}, CACHE);
  return mergeLocalWritings(sanity, LOCAL_WRITINGS);
}

export function getWritingSlugs() {
  return sanityClient.fetch<string[]>(WRITING_SLUGS_QUERY);
}

interface RawWriting extends Omit<Writing, 'body'> {
  body?: PortableTextBlock[];
}

export async function getWriting(slug: string): Promise<Writing | null> {
  const doc = await sanityClient.fetch<RawWriting | null>(WRITING_QUERY, { slug }, CACHE);
  if (!doc) return null;
  return {
    ...doc,
    references: doc.references ?? [],
    // Flatten Portable Text blocks to plain paragraphs (writings body is prose).
    body: (doc.body ?? []).map((block) => {
      const children = (block as { children?: { text?: string }[] }).children ?? [];
      return children.map((c) => c.text ?? '').join('');
    }),
  };
}
