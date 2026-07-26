import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Annotation, Focus } from '@/components/case-study/types';

// ---- Visuals (case studies use all of these; articles only use image/video) ----
const focusSchema: z.ZodType<Focus> = z.object({ x: z.number(), y: z.number(), scale: z.number() });
const annotationSchema: z.ZodType<Annotation> = z.object({
  id: z.string(), x: z.number(), y: z.number(), label: z.string(),
  side: z.enum(['top', 'bottom', 'left', 'right']).optional(),
});

export const editableVisualSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('image'), src: z.string(), alt: z.string(), fit: z.enum(['contain', 'cover']).optional() }),
  z.object({ kind: z.literal('video'), src: z.string(), poster: z.string().optional(), alt: z.string().optional() }),
  z.object({ kind: z.literal('zoom'), src: z.string(), alt: z.string(), focus: focusSchema.optional(), annotations: z.array(annotationSchema).optional() }),
  z.object({ kind: z.literal('bento'), columns: z.union([z.literal(2), z.literal(3)]).optional(), images: z.array(z.object({ file: z.string(), alt: z.string().optional() })) }),
  z.object({ kind: z.literal('coded'), ref: z.string() }),
  z.object({ kind: z.literal('ascii'), art: z.string() }),
]);
export type EditableVisual = z.infer<typeof editableVisualSchema>;

export const editableSectionSchema = z.object({
  id: z.string(),
  act: z.string().optional(),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  caption: z.string().optional(),
  body: z.string(), // markdown
  visual: editableVisualSchema,
});
export type EditableSection = z.infer<typeof editableSectionSchema>;

export const editableCaseStudySchema = z.object({
  slug: z.string(),
  title: z.string(),
  header: z.object({ title: z.string(), lede: z.string(), meta: z.string() }),
  sections: z.array(editableSectionSchema),
  footer: z.object({ headline: z.string(), note: z.string() }).optional(),
});
export type EditableCaseStudy = z.infer<typeof editableCaseStudySchema>;

export const editableArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  titled: z.string().optional(),
  subhead: z.string().optional(),
  postedOn: z.string().optional(),
  type: z.string().optional(),
  number: z.string().optional(),
  heroImage: z.string().optional(),
  body: z.string(), // markdown
  references: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});
export type EditableArticle = z.infer<typeof editableArticleSchema>;

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Strip anything that isn't a slug char so an attacker-influenced route param
// can't escape the content dir on the (production) read path — mirrors the
// write API's sanitization.
const safeSlug = (slug: string) => slug.replace(/[^a-z0-9-]/gi, '');

export async function readArticleOverlay(slug: string): Promise<EditableArticle | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, 'writings', `${safeSlug(slug)}.json`), 'utf8');
    return editableArticleSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function readCaseStudyOverlay(slug: string): Promise<EditableCaseStudy | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, 'work', `${safeSlug(slug)}.json`), 'utf8');
    return editableCaseStudySchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
