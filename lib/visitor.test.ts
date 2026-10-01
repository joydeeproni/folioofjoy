import { describe, expect, it } from 'vitest';
import { countryOf, visitorHash } from './visitor';

const req = (headers: Record<string, string>) => new Request('http://localhost/', { headers });

describe('countryOf', () => {
  it('prefers the Vercel geo header, uppercased', () => {
    expect(countryOf(req({ 'x-vercel-ip-country': 'dk', 'accept-language': 'en-US' }))).toBe('DK');
  });
  it('falls back to the Accept-Language region subtag', () => {
    expect(countryOf(req({ 'accept-language': 'da-DK,da;q=0.9' }))).toBe('DK');
  });
  it('returns empty string when it cannot tell', () => {
    expect(countryOf(req({ 'accept-language': 'en' }))).toBe('');
    expect(countryOf(req({}))).toBe('');
  });
});

describe('visitorHash', () => {
  it('is 16 hex chars and stable for the same IP', () => {
    const a = visitorHash(req({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }));
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(visitorHash(req({ 'x-forwarded-for': '1.2.3.4' }))).toBe(a);
  });
  it('differs for different IPs', () => {
    expect(visitorHash(req({ 'x-forwarded-for': '1.2.3.4' }))).not.toBe(visitorHash(req({ 'x-forwarded-for': '5.6.7.8' })));
  });
});
