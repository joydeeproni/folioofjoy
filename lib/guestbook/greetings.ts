// Country code → how the stamp greets you, in that country's own script.
//
// `hello` is set around the stamp's top ring in the original writing system —
// नमस्ते, こんにちは, 你好, שלום — never a Latin transliteration. `place` stays
// Latin on the bottom ring so the country always reads, and `line` is the full
// phrase used as the stamp's accessible label and hover title.
//
// FONT TIERS. Which font can actually set `hello` is a glyph-coverage fact, not
// a preference, so each entry declares it. Measured from the shipped files:
//
//   'pixel'  Geist Pixel — 421 codepoints, Latin only. Covers every Latin
//            greeting here except Vietnamese Ệ. This is the on-brand default.
//   'sans'   Geist Sans — 728 codepoints: Latin + 100% Vietnamese + 52%
//            Cyrillic. Verified to cover ПРИВЕТ / ПРИВІТ / ЗДРАВЕЙ / ЗДРАВО
//            and XIN CHÀO, so Cyrillic and Vietnamese go here.
//   everything else
//            Neither Geist has a single glyph for Devanagari, Bengali, Sinhala,
//            Han, Kana, Hangul, Thai, Hebrew or Arabic — and only 4% of Greek.
//            Those tiers name a per-script system stack instead; see
//            SCRIPT_FONTS in components/about/guestbook-stamp.tsx. The greeting
//            renders in the visitor's platform face, which is the only way to
//            show the original script at all.
export type StampFont =
  | 'pixel'
  | 'sans'
  | 'devanagari'
  | 'bengali'
  | 'sinhala'
  | 'japanese'
  | 'han'
  | 'hangul'
  | 'thai'
  | 'hebrew'
  | 'arabic'
  | 'greek';

export interface Greeting {
  hello: string;
  place: string;
  line: string;
  font: StampFont;
}

export const GREETINGS: Record<string, Greeting> = {
  // ---- Scripts neither Geist covers: rendered via system stacks ----
  IN: { hello: 'नमस्ते', place: 'INDIA', line: 'India se Namaste', font: 'devanagari' },
  NP: { hello: 'नमस्ते', place: 'NEPAL', line: 'Nepal bata namaste', font: 'devanagari' },
  BD: { hello: 'নমস্কার', place: 'BANGLADESH', line: 'Bangladesh theke nomoskar', font: 'bengali' },
  LK: { hello: 'ආයුබෝවන්', place: 'SRI LANKA', line: 'Sri Lankaven ayubowan', font: 'sinhala' },
  JP: { hello: 'こんにちは', place: 'NIHON', line: '日本からこんにちは', font: 'japanese' },
  CN: { hello: '你好', place: 'ZHONGGUO', line: '来自中国的你好', font: 'han' },
  TW: { hello: '你好', place: 'TAIWAN', line: '來自台灣的你好', font: 'han' },
  HK: { hello: '你好', place: 'HONG KONG', line: '嚟自香港嘅你好', font: 'han' },
  KR: { hello: '안녕하세요', place: 'HANGUK', line: '한국에서 안녕하세요', font: 'hangul' },
  TH: { hello: 'สวัสดี', place: 'THAILAND', line: 'สวัสดีจากประเทศไทย', font: 'thai' },
  IL: { hello: 'שלום', place: 'ISRAEL', line: 'שלום מישראל', font: 'hebrew' },
  AE: { hello: 'مرحبا', place: 'AL IMARAT', line: 'مرحبا من الإمارات', font: 'arabic' },
  SA: { hello: 'مرحبا', place: 'AL SAUDIYA', line: 'مرحبا من السعودية', font: 'arabic' },
  EG: { hello: 'أهلا', place: 'MASR', line: 'أهلا من مصر', font: 'arabic' },
  MA: { hello: 'سلام', place: 'AL MAGHRIB', line: 'سلام من المغرب', font: 'arabic' },
  PK: { hello: 'سلام', place: 'PAKISTAN', line: 'پاکستان سے سلام', font: 'arabic' },
  GR: { hello: 'ΓΕΙΑ ΣΟΥ', place: 'ELLADA', line: 'Γεια σου από την Ελλάδα', font: 'greek' },

  // ---- Cyrillic + Vietnamese: Geist Sans ----
  RU: { hello: 'ПРИВЕТ', place: 'ROSSIYA', line: 'Привет из России', font: 'sans' },
  UA: { hello: 'ПРИВІТ', place: 'UKRAINA', line: 'Привіт з України', font: 'sans' },
  BG: { hello: 'ЗДРАВЕЙ', place: 'BALGARIYA', line: 'Здравей от България', font: 'sans' },
  RS: { hello: 'ЗДРАВО', place: 'SRBIJA', line: 'Здраво из Србије', font: 'sans' },
  VN: { hello: 'XIN CHÀO', place: 'VIỆT NAM', line: 'Xin chào từ Việt Nam', font: 'sans' },

  // ---- Latin: Geist Pixel ----
  DK: { hello: 'HEJ', place: 'DANMARK', line: 'Hej fra Danmark', font: 'pixel' },
  SE: { hello: 'HEJ', place: 'SVERIGE', line: 'Hej från Sverige', font: 'pixel' },
  NO: { hello: 'HEI', place: 'NORGE', line: 'Hei fra Norge', font: 'pixel' },
  IS: { hello: 'HALLÓ', place: 'ÍSLAND', line: 'Halló frá Íslandi', font: 'pixel' },
  FI: { hello: 'MOI', place: 'SUOMI', line: 'Moi Suomesta', font: 'pixel' },
  DE: { hello: 'HALLO', place: 'DEUTSCHLAND', line: 'Hallo aus Deutschland', font: 'pixel' },
  AT: { hello: 'GRÜSS GOTT', place: 'ÖSTERREICH', line: 'Grüß Gott aus Österreich', font: 'pixel' },
  CH: { hello: 'GRÜEZI', place: 'SCHWEIZ', line: 'Grüezi us de Schweiz', font: 'pixel' },
  NL: { hello: 'HALLO', place: 'NEDERLAND', line: 'Hallo uit Nederland', font: 'pixel' },
  BE: { hello: 'HALLO', place: 'BELGIË', line: 'Hallo uit België', font: 'pixel' },
  FR: { hello: 'BONJOUR', place: 'FRANCE', line: 'Bonjour de France', font: 'pixel' },
  ES: { hello: 'HOLA', place: 'ESPAÑA', line: 'Hola desde España', font: 'pixel' },
  PT: { hello: 'OLÁ', place: 'PORTUGAL', line: 'Olá de Portugal', font: 'pixel' },
  IT: { hello: 'CIAO', place: 'ITALIA', line: "Ciao dall'Italia", font: 'pixel' },
  PL: { hello: 'CZEŚĆ', place: 'POLSKA', line: 'Cześć z Polski', font: 'pixel' },
  CZ: { hello: 'AHOJ', place: 'ČESKO', line: 'Ahoj z Česka', font: 'pixel' },
  SK: { hello: 'AHOJ', place: 'SLOVENSKO', line: 'Ahoj zo Slovenska', font: 'pixel' },
  HU: { hello: 'SZIA', place: 'MAGYARORSZÁG', line: 'Szia Magyarországról', font: 'pixel' },
  RO: { hello: 'SALUT', place: 'ROMÂNIA', line: 'Salut din România', font: 'pixel' },
  HR: { hello: 'ZDRAVO', place: 'HRVATSKA', line: 'Zdravo iz Hrvatske', font: 'pixel' },
  TR: { hello: 'MERHABA', place: 'TÜRKIYE', line: "Türkiye'den merhaba", font: 'pixel' },
  IE: { hello: 'DIA DUIT', place: 'ÉIRE', line: 'Dia duit ó Éirinn', font: 'pixel' },
  GB: { hello: 'HELLO', place: 'UK', line: 'Hello from the UK', font: 'pixel' },
  US: { hello: 'HELLO', place: 'USA', line: 'Hello from the USA', font: 'pixel' },
  CA: { hello: 'HELLO', place: 'CANADA', line: 'Hello from Canada', font: 'pixel' },
  MX: { hello: 'HOLA', place: 'MÉXICO', line: 'Hola desde México', font: 'pixel' },
  BR: { hello: 'OLÁ', place: 'BRASIL', line: 'Olá do Brasil', font: 'pixel' },
  AR: { hello: 'HOLA', place: 'ARGENTINA', line: 'Hola desde Argentina', font: 'pixel' },
  CL: { hello: 'HOLA', place: 'CHILE', line: 'Hola desde Chile', font: 'pixel' },
  CO: { hello: 'HOLA', place: 'COLOMBIA', line: 'Hola desde Colombia', font: 'pixel' },
  ID: { hello: 'HALO', place: 'INDONESIA', line: 'Halo dari Indonesia', font: 'pixel' },
  MY: { hello: 'APA KHABAR', place: 'MALAYSIA', line: 'Apa khabar dari Malaysia', font: 'pixel' },
  PH: { hello: 'KUMUSTA', place: 'PILIPINAS', line: 'Kumusta mula sa Pilipinas', font: 'pixel' },
  SG: { hello: 'HELLO', place: 'SINGAPORE', line: 'Hello from Singapore', font: 'pixel' },
  ZA: { hello: 'HALLO', place: 'SUID-AFRIKA', line: 'Hallo uit Suid-Afrika', font: 'pixel' },
  NG: { hello: 'BAWO NI', place: 'NIGERIA', line: 'Bawo ni lati Nigeria', font: 'pixel' },
  KE: { hello: 'JAMBO', place: 'KENYA', line: 'Jambo kutoka Kenya', font: 'pixel' },
  AU: { hello: 'G’DAY', place: 'AUSTRALIA', line: "G'day from Australia", font: 'pixel' },
  NZ: { hello: 'KIA ORA', place: 'AOTEAROA', line: 'Kia ora from Aotearoa', font: 'pixel' },
  EE: { hello: 'TERE', place: 'EESTI', line: 'Tere Eestist', font: 'pixel' },
  LV: { hello: 'SVEIKI', place: 'LATVIJA', line: 'Sveiki no Latvijas', font: 'pixel' },
  LT: { hello: 'SVEIKI', place: 'LIETUVA', line: 'Sveiki iš Lietuvos', font: 'pixel' },
};

// Falls back to English so an unmapped country still gets a real stamp.
export function greetingFor(country: string | undefined): Greeting {
  const code = (country ?? '').toUpperCase();
  return (
    GREETINGS[code] ?? {
      hello: 'HELLO',
      place: code || 'EARTH',
      line: `Hello from ${code || 'Earth'}`,
      font: 'pixel',
    }
  );
}
