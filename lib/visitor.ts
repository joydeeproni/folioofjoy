import { createHash } from 'node:crypto';

// Where the visitor is. On Vercel this is the edge's own geo header; locally
// there is no such header, so we fall back to the region subtag of
// Accept-Language (da-DK -> DK), which is the closest honest guess a dev box
// can make. Returns '' rather than a fake country when we truly can't tell.
export function countryOf(req: Request): string {
  const vercel = req.headers.get('x-vercel-ip-country');
  if (vercel) return vercel.toUpperCase();

  const langs = req.headers.get('accept-language') ?? '';
  const region = langs.match(/[a-z]{2,3}-([A-Z]{2})/);
  return region ? region[1].toUpperCase() : '';
}

// Stable per-visitor key that isn't a stored IP. Salted with the blob token so
// the hash isn't reversible via a rainbow table of the v4 space.
export function visitorHash(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const salt = process.env.BLOB_READ_WRITE_TOKEN ?? 'folioofjoy';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16);
}
