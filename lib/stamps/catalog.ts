import type { BrandColor } from '@/lib/brand';
import type { StampFont } from '@/lib/guestbook/greetings';

// One stamp per country — the 100 countries with the most internet users
// (ranked from DataReportal's Digital 2025 country figures, rounded where
// neighbours are within a few hundred thousand of each other).
//
// Each design is a combination of five independent choices, so no two countries
// share the same stamp: the silhouette, its border, how the content is laid out,
// a motif drawn for that country, and the Latin typeface. The greeting itself is
// always set in the country's own script — see SCRIPT_FONTS for the tiers.
//
// Reviewed in /admin/stamp-review before anything here reaches the guestbook.

export type StampShape =
  | 'circle'
  | 'oval'
  | 'rect'
  | 'tall'
  | 'square'
  | 'rounded'
  | 'octagon'
  | 'hexagon'
  | 'diamond'
  | 'shield'
  | 'arch'
  | 'seal'
  | 'postage'
  | 'ticket';

export type StampBorder = 'single' | 'double' | 'heavy' | 'dashed' | 'beaded' | 'ticks';

// ring      text runs round the edge, motif in the middle — round shapes only
// emblem    place, big motif, greeting, date stacked down the middle
// stack     text-led: small motif, place, big greeting between rules, date
// banner    a solid ink band with the greeting knocked out of it
// grid      passport box: header row, motif cell, greeting cell, footer row
// port      airport entry stamp built round the IATA code
// postmark  postal cancellation: a dated ring with wavy lines trailing off it
export type StampLayout = 'ring' | 'emblem' | 'stack' | 'banner' | 'grid' | 'port' | 'postmark';

export type StampFace = 'pixel' | 'praktikal' | 'wide' | 'condensed' | 'serif';

export interface CountryStamp {
  code: string;
  rank: number;
  /** Greeting in the country's own script. */
  hello: string;
  /** Latin place name, usually the endonym. */
  place: string;
  /** Full phrase; the stamp's accessible label. */
  line: string;
  font: StampFont;
  /** IATA code of the main international airport. */
  port: string;
  shape: StampShape;
  border: StampBorder;
  layout: StampLayout;
  motif: string;
  face: StampFace;
  ink: BrandColor;
}

type Row = [
  code: string,
  hello: string,
  place: string,
  line: string,
  font: StampFont,
  port: string,
  shape: StampShape,
  border: StampBorder,
  layout: StampLayout,
  motif: string,
  face: StampFace,
  ink: BrandColor,
];

// prettier-ignore
const ROWS: Row[] = [
  ['CN', '你好', 'ZHONGGUO', '来自中国的你好', 'han', 'PEK', 'seal', 'single', 'ring', 'panda', 'condensed', 'red'],
  ['IN', 'नमस्ते', 'INDIA', 'India se Namaste', 'devanagari', 'DEL', 'circle', 'double', 'emblem', 'taj', 'wide', 'green'],
  ['US', 'HELLO', 'USA', 'Hello from the USA', 'pixel', 'JFK', 'rect', 'double', 'port', 'liberty', 'wide', 'purple'],
  ['ID', 'HALO', 'INDONESIA', 'Halo dari Indonesia', 'pixel', 'CGK', 'rounded', 'single', 'grid', 'rice-terrace', 'praktikal', 'green'],
  ['BR', 'OLÁ', 'BRASIL', 'Olá do Brasil', 'pixel', 'GRU', 'oval', 'heavy', 'banner', 'redeemer', 'wide', 'yellow'],
  ['RU', 'ПРИВЕТ', 'ROSSIYA', 'Привет из России', 'sans', 'SVO', 'octagon', 'double', 'ring', 'onion-dome', 'condensed', 'red'],
  ['NG', 'BAWO NI', 'NIGERIA', 'Bawo ni lati Nigeria', 'pixel', 'LOS', 'hexagon', 'single', 'emblem', 'drum', 'praktikal', 'green'],
  ['JP', 'こんにちは', 'NIHON', '日本からこんにちは', 'japanese', 'NRT', 'tall', 'single', 'stack', 'torii', 'serif', 'red'],
  ['PK', 'سلام', 'PAKISTAN', 'پاکستان سے سلام', 'arabic', 'KHI', 'circle', 'ticks', 'ring', 'moon-star', 'pixel', 'green'],
  ['BD', 'নমস্কার', 'BANGLADESH', 'Bangladesh theke nomoskar', 'bengali', 'DAC', 'postage', 'single', 'banner', 'sailboat', 'condensed', 'green'],
  ['MX', 'HOLA', 'MÉXICO', 'Hola desde México', 'pixel', 'MEX', 'square', 'heavy', 'grid', 'cactus', 'wide', 'red'],
  ['PH', 'KUMUSTA', 'PILIPINAS', 'Kumusta mula sa Pilipinas', 'pixel', 'MNL', 'seal', 'double', 'emblem', 'sun-rays', 'wide', 'yellow'],
  ['VN', 'XIN CHÀO', 'VIỆT NAM', 'Xin chào từ Việt Nam', 'sans', 'SGN', 'arch', 'double', 'stack', 'conical-hat', 'condensed', 'red'],
  ['EG', 'أهلا', 'MASR', 'أهلا من مصر', 'arabic', 'CAI', 'diamond', 'single', 'emblem', 'pyramids', 'condensed', 'yellow'],
  ['DE', 'HALLO', 'DEUTSCHLAND', 'Hallo aus Deutschland', 'pixel', 'FRA', 'rect', 'single', 'grid', 'brandenburg', 'condensed', 'purple'],
  ['TR', 'MERHABA', 'TÜRKIYE', "Türkiye'den merhaba", 'pixel', 'IST', 'oval', 'double', 'port', 'tulip', 'wide', 'red'],
  ['IR', 'سلام', 'IRAN', 'سلام از ایران', 'arabic', 'IKA', 'hexagon', 'double', 'stack', 'pomegranate', 'serif', 'green'],
  ['GB', 'HELLO', 'UK', 'Hello from the UK', 'pixel', 'LHR', 'ticket', 'single', 'port', 'big-ben', 'praktikal', 'purple'],
  ['FR', 'BONJOUR', 'FRANCE', 'Bonjour de France', 'pixel', 'CDG', 'circle', 'beaded', 'postmark', 'eiffel', 'serif', 'purple'],
  ['TH', 'สวัสดี', 'THAILAND', 'สวัสดีจากประเทศไทย', 'thai', 'BKK', 'arch', 'heavy', 'emblem', 'chedi', 'condensed', 'yellow'],
  ['IT', 'CIAO', 'ITALIA', "Ciao dall'Italia", 'pixel', 'FCO', 'rounded', 'dashed', 'banner', 'colosseum', 'serif', 'green'],
  ['KR', '안녕하세요', 'HANGUK', '한국에서 안녕하세요', 'hangul', 'ICN', 'square', 'double', 'stack', 'hanok-roof', 'condensed', 'red'],
  ['ES', 'HOLA', 'ESPAÑA', 'Hola desde España', 'pixel', 'MAD', 'circle', 'heavy', 'ring', 'fan', 'wide', 'red'],
  ['ET', 'ሰላም', 'ITYOPYA', 'ሰላም ከኢትዮጵያ', 'ethiopic', 'ADD', 'shield', 'single', 'emblem', 'coffee', 'praktikal', 'green'],
  ['PL', 'CZEŚĆ', 'POLSKA', 'Cześć z Polski', 'pixel', 'WAW', 'rect', 'heavy', 'banner', 'castle', 'condensed', 'red'],
  ['AR', 'HOLA', 'ARGENTINA', 'Hola desde Argentina', 'pixel', 'EZE', 'seal', 'ticks', 'ring', 'sun-face', 'serif', 'purple'],
  ['CO', 'HOLA', 'COLOMBIA', 'Hola desde Colombia', 'pixel', 'BOG', 'oval', 'single', 'emblem', 'orchid', 'wide', 'yellow'],
  ['ZA', 'HALLO', 'SUID-AFRIKA', 'Hallo uit Suid-Afrika', 'pixel', 'JNB', 'ticket', 'double', 'grid', 'table-mountain', 'condensed', 'green'],
  ['CA', 'HELLO', 'CANADA', 'Hello from Canada', 'pixel', 'YYZ', 'postage', 'double', 'emblem', 'maple-leaf', 'serif', 'red'],
  ['UA', 'ПРИВІТ', 'UKRAINA', 'Привіт з України', 'sans', 'KBP', 'octagon', 'single', 'stack', 'wheat', 'condensed', 'yellow'],
  ['SA', 'مرحبا', 'AL SAUDIYA', 'مرحبا من السعودية', 'arabic', 'RUH', 'rounded', 'double', 'emblem', 'palm', 'wide', 'green'],
  ['MA', 'سلام', 'AL MAGHRIB', 'سلام من المغرب', 'arabic', 'CMN', 'arch', 'single', 'banner', 'lantern', 'praktikal', 'red'],
  ['MY', 'APA KHABAR', 'MALAYSIA', 'Apa khabar dari Malaysia', 'pixel', 'KUL', 'tall', 'double', 'stack', 'petronas', 'condensed', 'purple'],
  ['KE', 'JAMBO', 'KENYA', 'Jambo kutoka Kenya', 'pixel', 'NBO', 'shield', 'heavy', 'emblem', 'maasai-shield', 'wide', 'red'],
  ['DZ', 'أهلا', 'AL DJAZAIR', 'أهلا من الجزائر', 'arabic', 'ALG', 'circle', 'single', 'postmark', 'dunes', 'condensed', 'green'],
  ['IQ', 'هلا', 'AL IRAQ', 'هلا من العراق', 'arabic', 'BGW', 'square', 'single', 'emblem', 'ziggurat', 'condensed', 'yellow'],
  ['PE', 'HOLA', 'PERÚ', 'Hola desde el Perú', 'pixel', 'LIM', 'hexagon', 'heavy', 'banner', 'machu-picchu', 'wide', 'red'],
  ['UZ', 'SALOM', "O'ZBEKISTON", "O'zbekistondan salom", 'pixel', 'TAS', 'octagon', 'beaded', 'ring', 'ribbed-dome', 'praktikal', 'purple'],
  ['VE', '¡ÉPALE!', 'VENEZUELA', '¡Épale desde Venezuela!', 'pixel', 'CCS', 'rect', 'dashed', 'grid', 'waterfall', 'wide', 'yellow'],
  ['MM', 'မင်္ဂလာပါ', 'MYANMA', 'မြန်မာမှ မင်္ဂလာပါ', 'myanmar', 'RGN', 'circle', 'double', 'emblem', 'stupa', 'condensed', 'yellow'],
  ['TZ', 'HABARI', 'TANZANIA', 'Habari kutoka Tanzania', 'pixel', 'DAR', 'oval', 'heavy', 'port', 'kilimanjaro', 'condensed', 'green'],
  ['GH', 'AKWAABA', 'GHANA', 'Akwaaba from Ghana', 'pixel', 'ACC', 'seal', 'heavy', 'ring', 'black-star', 'wide', 'yellow'],
  ['AU', 'G’DAY', 'AUSTRALIA', "G'day from Australia", 'pixel', 'SYD', 'rounded', 'heavy', 'port', 'opera-house', 'wide', 'yellow'],
  ['NL', 'HALLO', 'NEDERLAND', 'Hallo uit Nederland', 'pixel', 'AMS', 'square', 'dashed', 'stack', 'windmill', 'pixel', 'purple'],
  ['KZ', 'СӘЛЕМ', 'QAZAQSTAN', 'Қазақстаннан сәлем', 'cyrillic', 'ALA', 'diamond', 'double', 'emblem', 'baiterek', 'wide', 'yellow'],
  ['TW', '你好', 'TAIWAN', '來自台灣的你好', 'han', 'TPE', 'tall', 'heavy', 'stack', 'taipei-101', 'pixel', 'green'],
  ['AF', 'سلام', 'AFGHANISTAN', 'سلام از افغانستان', 'arabic', 'KBL', 'hexagon', 'single', 'emblem', 'kite', 'serif', 'red'],
  ['SD', 'سلام', 'AS SUDAN', 'سلام من السودان', 'arabic', 'KRT', 'circle', 'ticks', 'ring', 'nile-sunset', 'condensed', 'yellow'],
  ['RO', 'SALUT', 'ROMÂNIA', 'Salut din România', 'pixel', 'OTP', 'shield', 'double', 'stack', 'church', 'serif', 'purple'],
  ['NP', 'नमस्ते', 'NEPAL', 'Nepal bata namaste', 'devanagari', 'KTM', 'diamond', 'beaded', 'emblem', 'prayer-flags', 'condensed', 'red'],
  ['CL', 'HOLA', 'CHILE', 'Hola desde Chile', 'pixel', 'SCL', 'rect', 'double', 'banner', 'moai', 'pixel', 'red'],
  ['EC', 'HOLA', 'ECUADOR', 'Hola desde Ecuador', 'pixel', 'UIO', 'oval', 'dashed', 'emblem', 'tortoise', 'pixel', 'green'],
  ['LK', 'ආයුබෝවන්', 'SRI LANKA', 'Sri Lankaven ayubowan', 'sinhala', 'CMB', 'arch', 'single', 'stack', 'tea-leaf', 'wide', 'green'],
  ['UG', 'OLI OTYA', 'UGANDA', 'Oli otya okuva Uganda', 'pixel', 'EBB', 'circle', 'heavy', 'emblem', 'crane', 'praktikal', 'yellow'],
  ['CM', 'BONJOUR', 'CAMEROUN', 'Bonjour du Cameroun', 'pixel', 'DLA', 'postage', 'double', 'grid', 'football', 'condensed', 'green'],
  ['GT', 'HOLA', 'GUATEMALA', 'Hola desde Guatemala', 'pixel', 'GUA', 'shield', 'dashed', 'emblem', 'tikal', 'serif', 'purple'],
  ['CI', 'AKWABA', "CÔTE D'IVOIRE", "Akwaba de Côte d'Ivoire", 'pixel', 'ABJ', 'ticket', 'dashed', 'port', 'cocoa', 'condensed', 'yellow'],
  ['AO', 'OLÁ', 'ANGOLA', 'Olá de Angola', 'pixel', 'LAD', 'octagon', 'heavy', 'emblem', 'diamond', 'wide', 'red'],
  ['SY', 'مرحبا', 'SURIYA', 'مرحبا من سوريا', 'arabic', 'DAM', 'circle', 'double', 'postmark', 'damask-rose', 'serif', 'red'],
  ['BE', 'HALLO', 'BELGIË', 'Hallo uit België', 'pixel', 'BRU', 'hexagon', 'dashed', 'stack', 'atomium', 'praktikal', 'yellow'],
  ['SE', 'HEJ', 'SVERIGE', 'Hej från Sverige', 'pixel', 'ARN', 'rounded', 'single', 'emblem', 'dala-horse', 'pixel', 'yellow'],
  ['CZ', 'AHOJ', 'ČESKO', 'Ahoj z Česka', 'pixel', 'PRG', 'oval', 'beaded', 'banner', 'hop', 'serif', 'red'],
  ['PT', 'OLÁ', 'PORTUGAL', 'Olá de Portugal', 'pixel', 'LIS', 'rect', 'single', 'port', 'tram', 'serif', 'yellow'],
  ['GR', 'ΓΕΙΑ ΣΟΥ', 'ELLADA', 'Γεια σου από την Ελλάδα', 'greek', 'ATH', 'square', 'heavy', 'emblem', 'amphora', 'serif', 'purple'],
  ['DO', 'HOLA', 'REP. DOMINICANA', 'Hola desde República Dominicana', 'pixel', 'SDQ', 'seal', 'beaded', 'ring', 'merengue', 'pixel', 'red'],
  ['HU', 'SZIA', 'MAGYARORSZÁG', 'Szia Magyarországról', 'pixel', 'BUD', 'rounded', 'double', 'banner', 'paprika', 'condensed', 'red'],
  ['TN', 'عسلامة', 'TUNIS', 'عسلامة من تونس', 'arabic', 'TUN', 'tall', 'double', 'emblem', 'tunis-door', 'wide', 'red'],
  ['BO', 'HOLA', 'BOLIVIA', 'Hola desde Bolivia', 'pixel', 'VVI', 'square', 'beaded', 'grid', 'wiphala', 'pixel', 'green'],
  ['AZ', 'SALAM', 'AZERBAYCAN', 'Azərbaycandan salam', 'pixel', 'GYD', 'circle', 'single', 'ring', 'flame', 'wide', 'green'],
  ['IL', 'שלום', 'ISRAEL', 'שלום מישראל', 'hebrew', 'TLV', 'rect', 'single', 'stack', 'menorah', 'condensed', 'purple'],
  ['AE', 'مرحبا', 'AL IMARAT', 'مرحبا من الإمارات', 'arabic', 'DXB', 'tall', 'dashed', 'stack', 'burj', 'condensed', 'green'],
  ['BY', 'ВІТАЮ', 'BIELARUS', 'Вітаю з Беларусі', 'sans', 'MSQ', 'octagon', 'dashed', 'emblem', 'bison', 'condensed', 'green'],
  ['AT', 'GRÜSS GOTT', 'ÖSTERREICH', 'Grüß Gott aus Österreich', 'pixel', 'VIE', 'oval', 'single', 'stack', 'piano', 'serif', 'red'],
  ['CH', 'GRÜEZI', 'SCHWEIZ', 'Grüezi us de Schweiz', 'pixel', 'ZRH', 'square', 'single', 'banner', 'matterhorn', 'wide', 'red'],
  ['SN', 'NANGA DEF', 'SÉNÉGAL', 'Nanga def ci Senegaal', 'pixel', 'DSS', 'circle', 'dashed', 'emblem', 'baobab', 'pixel', 'green'],
  ['CU', 'QUÉ BOLÁ', 'CUBA', '¿Qué bolá? desde Cuba', 'pixel', 'HAV', 'ticket', 'heavy', 'port', 'classic-car', 'serif', 'purple'],
  ['JO', 'مرحبا', 'AL URDUN', 'مرحبا من الأردن', 'arabic', 'AMM', 'arch', 'heavy', 'emblem', 'petra', 'serif', 'red'],
  ['HN', 'HOLA', 'HONDURAS', 'Hola desde Honduras', 'pixel', 'SAP', 'rounded', 'dashed', 'grid', 'reef-fish', 'pixel', 'purple'],
  ['HK', '你好', 'HONG KONG', '嚟自香港嘅你好', 'han', 'HKG', 'postage', 'single', 'stack', 'junk-boat', 'condensed', 'red'],
  ['DK', 'HEJ', 'DANMARK', 'Hej fra Danmark', 'pixel', 'CPH', 'rect', 'heavy', 'grid', 'nyhavn', 'pixel', 'red'],
  ['RS', 'ЗДРАВО', 'SRBIJA', 'Здраво из Србије', 'sans', 'BEG', 'hexagon', 'beaded', 'emblem', 'raspberry', 'condensed', 'red'],
  ['FI', 'MOI', 'SUOMI', 'Moi Suomesta', 'pixel', 'HEL', 'circle', 'single', 'postmark', 'pine', 'pixel', 'purple'],
  ['NO', 'HEI', 'NORGE', 'Hei fra Norge', 'pixel', 'OSL', 'oval', 'double', 'emblem', 'longship', 'serif', 'red'],
  ['SG', 'HELLO', 'SINGAPORE', 'Hello from Singapore', 'pixel', 'SIN', 'ticket', 'single', 'grid', 'marina-bay', 'wide', 'red'],
  ['SK', 'AHOJ', 'SLOVENSKO', 'Ahoj zo Slovenska', 'pixel', 'BTS', 'shield', 'single', 'stack', 'double-cross', 'pixel', 'purple'],
  ['IE', 'DIA DUIT', 'ÉIRE', 'Dia duit ó Éirinn', 'pixel', 'DUB', 'seal', 'single', 'emblem', 'shamrock', 'serif', 'green'],
  ['NZ', 'KIA ORA', 'AOTEAROA', 'Kia ora from Aotearoa', 'pixel', 'AKL', 'circle', 'double', 'ring', 'koru', 'pixel', 'green'],
  ['BG', 'ЗДРАВЕЙ', 'BALGARIYA', 'Здравей от България', 'sans', 'SOF', 'rounded', 'heavy', 'stack', 'rose-valley', 'condensed', 'green'],
  ['ZM', 'MULI SHANI', 'ZAMBIA', 'Muli shani ukufuma ku Zambia', 'pixel', 'LUN', 'octagon', 'single', 'banner', 'victoria-falls', 'wide', 'green'],
  ['LB', 'مرحبا', 'LUBNAN', 'مرحبا من لبنان', 'arabic', 'BEY', 'diamond', 'heavy', 'emblem', 'cedar', 'serif', 'green'],
  ['PY', "MBA'ÉICHAPA", 'PARAGUAY', "Mba'éichapa Paraguáigui", 'pixel', 'ASU', 'oval', 'ticks', 'emblem', 'harp', 'condensed', 'red'],
  ['KH', 'សួស្តី', 'KAMPUCHEA', 'សួស្តីពីកម្ពុជា', 'khmer', 'PNH', 'arch', 'dashed', 'emblem', 'angkor', 'wide', 'purple'],
  ['KG', 'САЛАМ', 'KYRGYZSTAN', 'Кыргызстандан салам', 'sans', 'FRU', 'seal', 'double', 'ring', 'tunduk', 'condensed', 'red'],
  ['YE', 'أهلاً', 'AL YAMAN', 'أهلاً من اليمن', 'arabic', 'SAH', 'tall', 'heavy', 'stack', 'shibam', 'praktikal', 'yellow'],
  ['SV', 'HOLA', 'EL SALVADOR', 'Hola desde El Salvador', 'pixel', 'SAL', 'square', 'double', 'banner', 'volcano', 'praktikal', 'purple'],
  ['HR', 'ZDRAVO', 'HRVATSKA', 'Zdravo iz Hrvatske', 'pixel', 'ZAG', 'rect', 'beaded', 'port', 'anchor', 'condensed', 'red'],
  ['CR', 'PURA VIDA', 'COSTA RICA', 'Pura vida desde Costa Rica', 'pixel', 'SJO', 'postage', 'heavy', 'emblem', 'oxcart-wheel', 'wide', 'green'],
  ['GE', 'გამარჯობა', 'SAKARTVELO', 'გამარჯობა საქართველოდან', 'georgian', 'TBS', 'hexagon', 'double', 'banner', 'wine', 'serif', 'red'],
  ['LT', 'SVEIKI', 'LIETUVA', 'Sveiki iš Lietuvos', 'pixel', 'VNO', 'circle', 'heavy', 'postmark', 'basketball', 'wide', 'yellow'],
  ['PA', 'HOLA', 'PANAMÁ', 'Hola desde Panamá', 'pixel', 'PTY', 'ticket', 'double', 'port', 'canal-ship', 'pixel', 'yellow'],
];

export const STAMP_CATALOG: CountryStamp[] = ROWS.map(
  ([code, hello, place, line, font, port, shape, border, layout, motif, face, ink], i) => ({
    code,
    rank: i + 1,
    hello,
    place,
    line,
    font,
    port,
    shape,
    border,
    layout,
    motif,
    face,
    ink,
  }),
);

const BY_CODE = new Map(STAMP_CATALOG.map((s) => [s.code, s]));

export function countryStamp(code: string): CountryStamp | undefined {
  return BY_CODE.get(code.toUpperCase());
}

// English names for the review page's captions and search — the stamps
// themselves only ever carry the endonym.
const NAMES = new Intl.DisplayNames(['en'], { type: 'region' });
const SHORT: Record<string, string> = { HK: 'Hong Kong', CI: 'Côte d’Ivoire', MM: 'Myanmar' };
export function countryName(code: string): string {
  try {
    return SHORT[code] ?? NAMES.of(code) ?? code;
  } catch {
    return code;
  }
}
