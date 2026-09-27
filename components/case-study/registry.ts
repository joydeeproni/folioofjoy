import type { ComponentType } from 'react';
import { Cassi } from './cassi';
import { Knobs } from './knobs';
import { Canvas } from './canvas';
import { Insider, FolioOfJoy, Pitzsa } from './stubs';
import { TactileCore } from './tactile-core';
import { Deterge } from './deterge';
import { Verizon } from './verizon';
import { TactileCreate } from './tactile-create';
import { ConveyHealth } from './convey-health';
import { LegoHmi } from './lego-hmi';
import { MedForce } from './medforce';
import { Fortna } from './fortna';
import { SellCrowd } from './sellcrowd';
import { SXchange } from './sxchange';
import { Ursula } from './ursula';
import { WinnowPro } from './winnowpro';
import { Fido } from './fido';
import { Foovy } from './foovy';
import { TeenHealthPlanner } from './teen-health-planner';
import { Nikai } from './nikai';

// Slug → case study. Bespoke, code-rendered case studies (like the writings
// LOCAL_ARTICLES map) rather than Sanity content. Add new studies here.
// Entries backed by ./stubs are scaffolds awaiting content.
type CaseStudy = { title: string; Component: ComponentType };

export const CASE_STUDIES: Record<string, CaseStudy> = {
  'tactile-create': { title: 'Tactile Create', Component: TactileCreate },
  cassi: { title: 'Cassi', Component: Cassi },
  knobs: { title: 'Toggles, switches, knobs', Component: Knobs },
  canvas: { title: 'Create Canvas', Component: Canvas },
  insider: { title: 'Insider', Component: Insider },
  'tactile-core': { title: 'Tactile Core', Component: TactileCore },
  'folio-of-joy': { title: 'Folio of Joy', Component: FolioOfJoy },
  pitzsa: { title: 'Pitzsa', Component: Pitzsa },
  deterge: { title: 'Deterge', Component: Deterge },
  verizon: { title: 'Verizon', Component: Verizon },
  'lego-moulding': { title: 'LEGO Moulding', Component: LegoHmi },
  'convey-health': { title: 'Convey Health', Component: ConveyHealth },
  medforce: { title: 'MedForce', Component: MedForce },
  fortna: { title: 'Fortna WES', Component: Fortna },
  sellcrowd: { title: 'SellCrowd', Component: SellCrowd },
  sxchange: { title: 'SXchange', Component: SXchange },
  ursula: { title: 'Ursula', Component: Ursula },
  winnowpro: { title: 'WinnowPro', Component: WinnowPro },
  fido: { title: 'Fido', Component: Fido },
  foovy: { title: 'Foovy', Component: Foovy },
  'teen-health-planner': { title: 'Teen Health Planner', Component: TeenHealthPlanner },
  nikai: { title: 'Nikai Egypt', Component: Nikai },
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES[slug];
}

export function getCaseStudySlugs(): string[] {
  return Object.keys(CASE_STUDIES);
}
