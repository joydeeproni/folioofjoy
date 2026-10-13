import { z } from 'zod';

// Joy's verdicts from /admin/stamp-review, one per country code. Saved to
// content/stamp-review.json so the next pass at the designs can read them.
export const REVIEW_STATUSES = ['open', 'changes', 'approved'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const reviewEntrySchema = z.object({
  status: z.enum(REVIEW_STATUSES),
  comment: z.string().max(4000),
  updatedAt: z.string(),
});
export type ReviewEntry = z.infer<typeof reviewEntrySchema>;

export const reviewFileSchema = z.record(z.string().regex(/^[A-Z]{2}$/), reviewEntrySchema);
export type ReviewFile = z.infer<typeof reviewFileSchema>;
