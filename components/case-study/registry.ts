import type { ComponentType } from 'react';
import { Cassi } from './cassi';
import { Knobs } from './knobs';
import { Canvas } from './canvas';
import { Insider, MeraBills, FolioOfJoy, Pitzsa } from './stubs';
import { Deterge } from './deterge';
import { Verizon } from './verizon';

// Slug → case study. Bespoke, code-rendered case studies (like the writings
// LOCAL_ARTICLES map) rather than Sanity content. Add new studies here.
// Entries backed by ./stubs are scaffolds awaiting content.
type CaseStudy = { title: string; Component: ComponentType };

export const CASE_STUDIES: Record<string, CaseStudy> = {
  cassi: { title: 'Cassi', Component: Cassi },
  knobs: { title: 'Toggles, switches, knobs', Component: Knobs },
  canvas: { title: 'Create Canvas', Component: Canvas },
  insider: { title: 'Insider', Component: Insider },
  merabills: { title: 'MeraBills', Component: MeraBills },
  'folio-of-joy': { title: 'Folio of Joy', Component: FolioOfJoy },
  pitzsa: { title: 'Pitzsa', Component: Pitzsa },
  deterge: { title: 'Deterge', Component: Deterge },
  verizon: { title: 'Verizon', Component: Verizon },
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}

export function getCaseStudySlugs(): string[] {
  return Object.keys(CASE_STUDIES);
}
