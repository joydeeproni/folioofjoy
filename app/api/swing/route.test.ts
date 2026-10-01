import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/swing-game/store', () => ({
  readRanked: vi.fn(async () => []),
  writeBest: vi.fn(async (_v: string, score: number) => ({ best: score, improved: true })),
}));

import { readRanked, writeBest } from '@/lib/swing-game/store';
import { issueTicket } from '@/lib/swing-game/ticket';
import { visitorHash } from '@/lib/visitor';
import { GET, POST } from './route';
import { POST as START } from './start/route';

const HEADERS = { 'x-forwarded-for': '1.2.3.4', 'x-vercel-ip-country': 'DK', 'content-type': 'application/json' };
const me = visitorHash(new Request('http://x/', { headers: HEADERS }));
const post = (body: unknown) =>
  POST(new Request('http://x/api/swing', { method: 'POST', headers: HEADERS, body: JSON.stringify(body) }));
const goodTicket = () => issueTicket(me, Date.now() - 10_000);

beforeEach(() => vi.clearAllMocks());

describe('POST /api/swing/start', () => {
  it('issues a ticket', async () => {
    const res = await START(new Request('http://x/api/swing/start', { method: 'POST', headers: HEADERS }));
    expect(res.status).toBe(200);
    expect((await res.json()).ticket).toMatch(/^\d+\.[A-Za-z0-9_-]{43}$/);
  });
});

describe('GET /api/swing', () => {
  it('returns the board view for this visitor', async () => {
    const res = await GET(new Request('http://x/api/swing', { headers: HEADERS }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ top: [], me: null, total: 0, player: { country: 'DK' } });
  });
  it('500s when the store fails', async () => {
    vi.mocked(readRanked).mockRejectedValueOnce(new Error('blob down'));
    expect((await GET(new Request('http://x/api/swing', { headers: HEADERS }))).status).toBe(500);
  });
});

describe('POST /api/swing', () => {
  it('400s on invalid json and invalid scores', async () => {
    const bad = await POST(new Request('http://x/api/swing', { method: 'POST', headers: HEADERS, body: '{' }));
    expect(bad.status).toBe(400);
    for (const score of [-1, 251, 3.5, '40', null]) expect((await post({ ticket: goodTicket(), score })).status).toBe(400);
    expect(writeBest).not.toHaveBeenCalled();
  });
  it('403s on a ticket from another visitor or one too young', async () => {
    expect((await post({ ticket: issueTicket('ffffffffffffffff', Date.now() - 10_000), score: 40 })).status).toBe(403);
    expect((await post({ ticket: issueTicket(me, Date.now()), score: 40 })).status).toBe(403);
    expect(writeBest).not.toHaveBeenCalled();
  });
  it('saves a valid run with the request country', async () => {
    const res = await post({ ticket: goodTicket(), score: 40 });
    expect(res.status).toBe(200);
    expect(writeBest).toHaveBeenCalledWith(me, 40, 'DK');
    expect((await res.json()).improved).toBe(true);
  });
  it('reports improved:false when the score does not beat the best', async () => {
    vi.mocked(writeBest).mockResolvedValueOnce({ best: 90, improved: false });
    expect((await (await post({ ticket: goodTicket(), score: 12 })).json()).improved).toBe(false);
  });
  it('does not write a zero score but still returns the board', async () => {
    const res = await post({ ticket: goodTicket(), score: 0 });
    expect(res.status).toBe(200);
    expect(writeBest).not.toHaveBeenCalled();
  });
});
