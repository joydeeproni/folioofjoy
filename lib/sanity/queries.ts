import type { PortableTextBlock } from '@portabletext/react';
import { sanityClient } from './client';

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
  return sanityClient.fetch<AboutDoc | null>(ABOUT_QUERY);
}

export function getInspiration() {
  return sanityClient.fetch<InspirationItem[] | null>(INSPIRATION_QUERY);
}
