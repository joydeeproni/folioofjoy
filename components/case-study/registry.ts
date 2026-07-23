import type { ComponentType } from 'react';
import { Cassi } from './cassi';

// Slug → case study. Bespoke, code-rendered case studies (like the writings
// LOCAL_ARTICLES map) rather than Sanity content. Add new studies here.
type CaseStudy = { title: string; Component: ComponentType };

export const CASE_STUDIES: Record<string, CaseStudy> = {
  cassi: { title: 'Cassi', Component: Cassi },
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}

export function getCaseStudySlugs(): string[] {
  return Object.keys(CASE_STUDIES);
}
