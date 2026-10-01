// ISO country code → flag emoji via regional indicator symbols. Windows shows
// the two letters instead of a flag, which is fine.
export function flagEmoji(cc: string): string {
  const code = cc.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return '';
  return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
