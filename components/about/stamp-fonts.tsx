import type { StampFont } from '@/lib/guestbook/greetings';

// Which font can actually set a greeting is a glyph-coverage fact, shared by every
// stamp design — see lib/guestbook/greetings.ts for the measurements behind the
// tiers. Extracted here so the postal, passport and globe styles agree.
// Per-tier type for the greeting ring. `family` is a full stack, `tracking` is
// letter-spacing in viewBox units, and `scale` multiplies the fitted font size.
//
// Letter-spacing is 0 for the Indic, Thai and Arabic tiers on purpose: those
// scripts shape into conjuncts and cursive joins, and spacing the clusters apart
// visibly breaks them.
//
// `scale` is >1 for every system tier. Geist Pixel fills its em box completely,
// while the Noto/system faces sit smaller and lighter inside theirs, so at an
// identical font-size the native scripts read visibly weaker next to the Latin
// ones. Measured against the arc's ~126-unit capacity, there's ample room: the
// widest greeting (こんにちは) only used 43 units before scaling.
export const PIXEL = "'Geist Pixel', var(--font-pixel), monospace";
// Checked every place name in GREETINGS against Geist Pixel's cmap: it covers
// all of them except Vietnamese Ệ. Left alone the browser falls back for that
// one glyph, mixing two faces inside "VIỆT NAM", so the whole ring switches to
// Geist Sans (100% Vietnamese) when a name needs it. Extend if a new country
// introduces another gap.
export const PIXEL_GAPS = /[ỆệẸẹ]/;
export const SANS = "var(--font-geist-sans), 'Geist', system-ui, sans-serif";

export const SCRIPT_FONTS: Record<StampFont, { family: string; tracking: number; scale: number; rtl?: boolean }> = {
  pixel: { family: PIXEL, tracking: 1.1, scale: 1 },
  sans: { family: SANS, tracking: 1, scale: 0.95 },
  devanagari: {
    family: "'Noto Sans Devanagari', 'Devanagari Sangam MN', 'Nirmala UI', 'Mangal', sans-serif",
    tracking: 0,
    scale: 1.22,
  },
  bengali: {
    family: "'Noto Sans Bengali', 'Bangla Sangam MN', 'Nirmala UI', 'Vrinda', sans-serif",
    tracking: 0,
    scale: 1.22,
  },
  sinhala: {
    family: "'Noto Sans Sinhala', 'Sinhala Sangam MN', 'Iskoola Pota', sans-serif",
    tracking: 0,
    scale: 1.12,
  },
  japanese: {
    family:
      "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif",
    tracking: 0.4,
    scale: 1.05,
  },
  han: {
    family: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    tracking: 0.6,
    scale: 1.1,
  },
  hangul: {
    family: "'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    tracking: 0.3,
    scale: 1.02,
  },
  thai: {
    family: "'Noto Sans Thai', Thonburi, 'Leelawadee UI', sans-serif",
    tracking: 0,
    scale: 1.2,
  },
  hebrew: {
    family: "'Noto Sans Hebrew', 'Arial Hebrew', David, sans-serif",
    tracking: 0.5,
    scale: 1.18,
    rtl: true,
  },
  arabic: {
    family: "'Noto Sans Arabic', 'Geeza Pro', 'Segoe UI', Tahoma, sans-serif",
    tracking: 0,
    scale: 1.18,
    rtl: true,
  },
  greek: {
    family: "'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
    tracking: 0.9,
    scale: 1.0,
  },
};

