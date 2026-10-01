import { describe, expect, it } from 'vitest';
import { issueTicket, verifyTicket } from './ticket';

const V = 'a1b2c3d4e5f60718';
const T0 = 1_750_000_000_000;

describe('tickets', () => {
  it('accepts a genuine run', () => {
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 10_000)).toBe('ok');
  });
  it('rejects runs shorter than 9s and older than 2 min', () => {
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 8_999)).toBe('too-early');
    expect(verifyTicket(issueTicket(V, T0), V, T0 + 120_001)).toBe('expired');
  });
  it('rejects another visitor’s ticket', () => {
    expect(verifyTicket(issueTicket(V, T0), 'ffffffffffffffff', T0 + 10_000)).toBe('bad-signature');
  });
  it('rejects a moved timestamp', () => {
    const [, sig] = issueTicket(V, T0).split('.');
    expect(verifyTicket(`${T0 - 60_000}.${sig}`, V, T0 + 10_000)).toBe('bad-signature');
  });
  it('rejects junk', () => {
    for (const t of [undefined, 42, '', 'abc', `${T0}.short`]) expect(verifyTicket(t, V, T0 + 10_000)).toBe('malformed');
  });
});
