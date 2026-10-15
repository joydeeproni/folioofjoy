import { describe, expect, it } from 'vitest';
import { reviewBase, stripBase, withBase } from './review-path';

describe('reviewBase', () => {
  it('is /dive for the review copy and its subpages', () => {
    expect(reviewBase('/dive')).toBe('/dive');
    expect(reviewBase('/dive/work/cassi')).toBe('/dive');
  });

  it('is empty for the public site, including look-alike paths', () => {
    expect(reviewBase('/')).toBe('');
    expect(reviewBase('/work/cassi')).toBe('');
    expect(reviewBase('/diver')).toBe('');
    expect(reviewBase(null)).toBe('');
  });
});

describe('withBase', () => {
  it('leaves hrefs alone on the public site', () => {
    expect(withBase('/about', '')).toBe('/about');
    expect(withBase('/', '')).toBe('/');
  });

  it('prefixes internal paths in the review copy', () => {
    expect(withBase('/', '/dive')).toBe('/dive');
    expect(withBase('/about', '/dive')).toBe('/dive/about');
    expect(withBase('/work/cassi', '/dive')).toBe('/dive/work/cassi');
    expect(withBase('/writings?tab=cases', '/dive')).toBe('/dive/writings?tab=cases');
  });

  it('keeps external, protocol-relative and hash links untouched', () => {
    expect(withBase('https://cassihome.com/', '/dive')).toBe('https://cassihome.com/');
    expect(withBase('//cdn.example.com/x', '/dive')).toBe('//cdn.example.com/x');
    expect(withBase('#top', '/dive')).toBe('#top');
  });

  it('does not double-prefix', () => {
    expect(withBase('/dive/about', '/dive')).toBe('/dive/about');
    expect(withBase('/dive', '/dive')).toBe('/dive');
  });
});

describe('stripBase', () => {
  it('maps a review path back to its public equivalent', () => {
    expect(stripBase('/dive')).toBe('/');
    expect(stripBase('/dive/preview')).toBe('/preview');
    expect(stripBase('/preview')).toBe('/preview');
    expect(stripBase('/diver')).toBe('/diver');
  });
});
