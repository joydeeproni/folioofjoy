import { createHmac, timingSafeEqual } from 'node:crypto';
import { TICKET_MAX_AGE_MS, TICKET_MIN_AGE_MS } from './rules';

// A run ticket is "<startedAt>.<hmac>", issued when a run starts and required
// to submit its score. It can't stop a scripted tapper, but it does stop a
// one-line POST of a made-up score: the score must arrive from this visitor,
// at least a run's length after the server saw the run begin.
export type TicketCheck = 'ok' | 'malformed' | 'bad-signature' | 'too-early' | 'expired';

const secret = () => process.env.BLOB_READ_WRITE_TOKEN ?? 'folioofjoy';
const sign = (visitor: string, startedAt: number) =>
  createHmac('sha256', secret()).update(`swing:${visitor}.${startedAt}`).digest('base64url');

export function issueTicket(visitor: string, now = Date.now()): string {
  return `${now}.${sign(visitor, now)}`;
}

export function verifyTicket(ticket: unknown, visitor: string, now = Date.now()): TicketCheck {
  if (typeof ticket !== 'string') return 'malformed';
  const m = /^(\d{10,16})\.([A-Za-z0-9_-]{43})$/.exec(ticket);
  if (!m) return 'malformed';
  const startedAt = Number(m[1]);
  // Both sides are always 43 bytes (the regex pins it), so this never throws.
  if (!timingSafeEqual(Buffer.from(sign(visitor, startedAt)), Buffer.from(m[2]))) return 'bad-signature';
  const age = now - startedAt;
  if (age < TICKET_MIN_AGE_MS) return 'too-early';
  if (age > TICKET_MAX_AGE_MS) return 'expired';
  return 'ok';
}
