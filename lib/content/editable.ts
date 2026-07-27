import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// Editable article (writings) overlays. Case studies are NOT overlay-editable —
// they render from their bespoke coded components (see components/case-study).

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
