import type { WorkItem, WorkLinkItem } from '@/lib/content/types'

// Vercel Blob store used across the site for large media (audio, covers, work).
const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work'

// These items live in code (not Sanity), so their links live here too. The
// Cassi screens all link to the live site; Sanity items' links are managed in
// the Studio.
const CASSI: WorkLinkItem[] = [{ label: 'View Live', url: 'https://cassihome.com/' }]

// Bespoke Work items hosted outside Sanity (uploaded to Vercel Blob). Prepended
// to the Sanity-fed Work list so they lead the Work Preview.
export const LOCAL_WORK: WorkItem[] = [
  { src: `${BLOB}/canvas-stickynote.mp4`, caption: 'Draggable sticky-note canvas', category: 'SVC', links: [] },
  { src: `${BLOB}/property-listing-02.png`, caption: 'Cassi — property listing', category: 'SVC', links: CASSI },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: 'Cassi — mortgage assistant', category: 'SVC', links: CASSI },
  { src: `${BLOB}/home-dashboard-03.png`, caption: 'Cassi — home dashboard', category: 'SVC', links: CASSI },
  { src: `${BLOB}/fact-card-01.png`, caption: 'Cassi — did-you-know card', category: 'SVC', links: CASSI },
  { src: `${BLOB}/game-result-01.png`, caption: 'Mini Parkering', category: 'JOY', links: [] },
  { src: `${BLOB}/game-over-01.png`, caption: 'Mini Parkering — game over', category: 'JOY', links: [] },
  { src: `${BLOB}/property-dashboard-01.png`, caption: 'Cassi — property dashboard', category: 'SVC', links: CASSI },
  { src: `${BLOB}/media-player-01.png`, caption: 'Media player redesign', category: 'JOY', links: [] },
  { src: `${BLOB}/maintenance-plan-01.png`, caption: 'Cassi — maintenance plan', category: 'SVC', links: CASSI },
  { src: `${BLOB}/ftue-onboarding-04.png`, caption: 'Cassi — first-run onboarding', category: 'SVC', links: CASSI },
  { src: `${BLOB}/onboarding-flow-01.png`, caption: 'Cassi — onboarding flow', category: 'SVC', links: CASSI },
  { src: `${BLOB}/upload-progress-01.png`, caption: 'Cassi — uploading documents', category: 'SVC', links: CASSI },
  { src: `${BLOB}/claude-usage.png`, caption: 'My Claude usage', category: 'JOY', links: [] },
  { src: `${BLOB}/tactile-deck.mp4`, caption: 'Tactile — internal sprint deck', category: 'BIZ', links: [] },
  { src: `${BLOB}/cassi-fundraising-deck.mp4`, caption: 'Cassi fundraising deck — the pitch that helped land their first VC round', category: 'BIZ', links: [] },

  // Migrated off Sanity (2026-07): these were the Studio-managed Work items,
  // re-hosted on Vercel Blob so all Work now lives in code. orderWork() rainbow-
  // sorts and de-dupes the whole list, so array order here doesn't matter.
  { src: `${BLOB}/8d7b7a5f5fe367ef046a37a53704a2d248b37b9b-1600x1200.png`, caption: "Pitched the visual identity and shipped the marketing site in three weeks flat.", category: 'BIZ', links: [] },
  { src: `${BLOB}/c69c48730b9aa548c100fb67abff65593631a723-1600x1200.png`, caption: "Internal tool for content ops — made the upload queue something people stopped complaining about.", category: 'DTY', links: [] },
  { src: `${BLOB}/6db2a2bb880db9f0c289466f6026a17bbb915f20-1654x862.png`, caption: "Property analytics platform — a lot of data on a map without making anyone squint.", category: 'SVC', links: [] },
  { src: `${BLOB}/ce1d5a7a91466672d01eb5a624a8d500bef8b421-3588x2691.jpg`, caption: "Scatter plots that tell you what a neighborhood is worth before the realtor does.", category: 'SVC', links: [] },
  { src: `${BLOB}/77860b1008c9000567d1e816035c6f7b3354b273-1920x1200.png`, caption: "Address search that autocompletes faster than you can second-guess your zip code.", category: 'DTY', links: [] },
  { src: `${BLOB}/bf0ed67c38cf669b355a43d1acff792a9dcb8773-4539x3405.jpg`, caption: "Schema management for game events — backend config that feels like a product, not a spreadsheet.", category: 'DTY', links: [] },
  { src: `${BLOB}/d9a0487d244e530a90cea8b88b6001ec24aa3fb1-3588x2691.jpg`, caption: "Neighborhood stats dashboard — donut charts that actually earned their keep.", category: 'SVC', links: [] },
  { src: `${BLOB}/c7706e0406c9c38b744a4efd191105a428b02ab1-2967x2226.jpg`, caption: "Release changelog — what broke and what got better, at a glance.", category: 'DTY', links: [] },
  { src: `${BLOB}/e4c153a46a8629b4bb2f4857d1a18dcdd1748f20-1710x1284.jpg`, caption: "Feature flag cards — dark and light mode, because designers have opinions about both.", category: 'DTY', links: [] },
  { src: `${BLOB}/ecfee3613b465884c8748e32d86936ceae604872-1555x1148.png`, caption: "Tactile Create home page — illustrated shortcut cards so starting a GDD or storyboard feels like picking from a shelf.", category: 'JOY', links: [] },
  { src: `${BLOB}/9597a37ba94932ed6ff01020674f19bd3078cdd2-1315x1092.png`, caption: "Same page, light mode — everything untitled on purpose because scrappy docs come first, names come later.", category: 'JOY', links: [] },
  { src: `${BLOB}/40a7cf22dd5d3d193808bb85995966759e156480-1600x1200.png`, caption: "Verizon stock management app — scan, pick a rack off the store map, log it, back on the floor.", category: 'SVC', links: [] },
  { src: `${BLOB}/971476cea5640af74b5eedf11d9a719af274fbc6-640x813.png`, caption: "Value drivers — what pushes a property price up and what drags it down, no guessing required.", category: 'SVC', links: [] },
  { src: `${BLOB}/8ac3066476ce26f880ec29b70d21872ccedf0077-640x753.png`, caption: "Historical value prediction — current price, last year, next year, and a chart that outpaces the Zestimate.", category: 'SVC', links: [] },
  { src: `${BLOB}/47498dbcf4ec237d03ef1bc1c55ba3c1960fa914-4000x4000.png`, caption: "Marketing illustration for an email platform — clean enough to sit on a hero without stealing focus.", category: 'BIZ', links: [] },
  { src: `${BLOB}/9cf7a07ac435ac70d1fa54cfd5c0002219f305bc-1600x1200.png`, caption: "Module picker for a Danish manufacturing app — color-coded progress, zero ambiguity.", category: 'SVC', links: [] },
  { src: `${BLOB}/3d5cc95970afbcce845ea42b1460469b102853d0-2058x1544.png`, caption: "Real estate analytics widgets — three chart types, one visual language, no infighting.", category: 'SVC', links: [] },
  { src: `${BLOB}/a3bba9628b7131f2cecb98c38a477e2aec1c80b0-2967x2226.jpg`, caption: "Hotel concierge widgets — room status and food ordering that feel native to the stay.", category: 'SVC', links: [] },
  { src: `${BLOB}/65e1f609c1ee3df69605542a51eb3e4ef220edc0-4569x3426.jpg`, caption: "Carbon emissions dashboard — spend, footprint per head, and charts that make the CFO read the ESG report.", category: 'SVC', links: [] },
  { src: `${BLOB}/ff5323ccdc1f53b07e731cacdc5cbed012fe0d0d-1600x1200.png`, caption: "Branding for an Australian carbon accounting firm — the green grid that shipped everywhere.", category: 'BIZ', links: [] },
  { src: `${BLOB}/2d679f29576573a9ae456fbd4797acd755dec630-1600x1200.png`, caption: "CarbonDash logo system — five weights, one mark, the exploration that made the final pick obvious.", category: 'BIZ', links: [] },
  { src: `${BLOB}/26956a15eb692a3378d5ffc5cd8628322e54f5f2-1600x1200.png`, caption: "Framer site for the same carbon firm — dark theme, full scroll from hero to integrations footer.", category: 'BIZ', links: [] },
  { src: `${BLOB}/c6bd6c294a9c728a77d2fb7ca66f1293fa6f6fde-1840x1000.png`, caption: "Property intelligence platform — the map view that made brokers close their spreadsheets.", category: 'SVC', links: [] },
  { src: `${BLOB}/42c318e4e3e01132b1472f7ef56a3a96ba5da253-1840x1000.png`, caption: "Proptech hero — isometric buildings, a search bar, enough personality to not look like every other SaaS.", category: 'BIZ', links: [] },
  { src: `${BLOB}/9fea1259bd47c7c73aa9dcd564340e8f43b06f86-1280x568.png`, caption: "Platform illustration — abstract enough for a landing page, specific enough to hint at the product.", category: 'JOY', links: [] },
  { src: `${BLOB}/52fea9e5df569f33954637a87f8da833e34826be-1920x1200.png`, caption: "Lender-broker message centre — threaded by property, because that matters more than timestamps.", category: 'SVC', links: [] },
  { src: `${BLOB}/7d7fb44c3b7243052b407cc751e2e3497df17490-640x498.png`, caption: "Zoning overlay — shows what is getting built nearby before the construction noise does.", category: 'SVC', links: [] },
  { src: `${BLOB}/c6d70989d9b47432bca4f2c6ee8c712392ccc949-1769x1326.png`, caption: "Onboarding cards for a datamarts tool — naming conventions and dimensions, illustrated so dry content lands.", category: 'DTY', links: [] },
  { src: `${BLOB}/1c1ccbb1a16f8994c36c90838a496c49d1cb8f99.mp4`, caption: "Dashboard loader animation — a looping motion study for a KCS analytics dashboard.", category: 'SVC', links: [] },
  { src: `${BLOB}/2bc3d726b69b603e16a87ff0e20d5316d5407e9d-1929x1653.png`, caption: "AI home concierge — \"What do you want today?\" with maintenance, providers, and a talk-to-Cassi prompt.", category: 'SVC', links: [] },
  { src: `${BLOB}/4d2027a7bf3523823a884fb859da762c5041bcb0-1929x939.png`, caption: "Home maintenance screens — seasonal calendar, asset detail, and a welcome-home dashboard.", category: 'SVC', links: [] },
  { src: `${BLOB}/574310b7cec0a7709455629df96fb81dab904c24-1929x1597.png`, caption: "Onboarding for the home app — a gradient welcome flow that introduces Cassi before asking for anything.", category: 'SVC', links: [] },
  { src: `${BLOB}/415d743552571723b4eb276fd05417a8acc089c1-1929x1444.png`, caption: "Pitch deck for a native-AI home operations platform — one system replacing fifteen disconnected tools.", category: 'BIZ', links: [] },
  { src: `${BLOB}/ebcbe3e8d21b64ecc3e4a3aec005fe0f32cfe1e2-1929x1444.png`, caption: "The design system in Figma — chat interface states, components, and the annotations engineering actually read.", category: 'DTY', links: [] },
  { src: `${BLOB}/f835ab854689260af49cdc29fb9d34aa1a2a274e-1824x1822.png`, caption: "Lending dashboard — borrower details and a credit-score gauge that reads at a glance.", category: 'BIZ', links: [] },
  { src: `${BLOB}/11af0c9cd13f04e65feca8149963374fa4c16470-1824x2719.png`, caption: "Mobile document collection for a loan — upload progress and lender checklists, minus the paperwork dread.", category: 'BIZ', links: [] },
  { src: `${BLOB}/1dba04ef8696b6385de4005988f61a73dba9e54e-2457x1407.png`, caption: "RFM segmentation — pick Champions or Loyal Customers and watch the audience estimate update live.", category: 'SVC', links: [] },
  { src: `${BLOB}/b69f71df224fa490ade5309709bf25dffe36ccdd-2457x1989.png`, caption: "Contact list manager — upload states, tags, and counts for millions of records without the clutter.", category: 'DTY', links: [] },
  { src: `${BLOB}/6c3293fa2ea4d08c34d286423348a3a8083cd217-2457x1477.png`, caption: "Newsletter setup flow — a calm \"here's what we're working on\" that keeps onboarding unhurried.", category: 'SVC', links: [] },
  { src: `${BLOB}/961f6a54c82e76db8fce8dbcb4ec89648edd1095-2457x1509.png`, caption: "Setup checklist — \"you're all set up\" with a satisfying green all-clear.", category: 'SVC', links: [] },
  { src: `${BLOB}/2b92ccb1a684f606d4e32c4eac32e1592cde9c48-2457x1842.png`, caption: "Illustration set for an email platform — one visual language across every empty state.", category: 'BIZ', links: [] },
  { src: `${BLOB}/def2f904068bf508129457fa6b1f1bf152a06e98-1824x1365.png`, caption: "Build pipeline for a Unity game — every step green before the store build ships.", category: 'JOY', links: [] },
  { src: `${BLOB}/13c06a52226574bf93030a47cecb1de00eec3c3a.mp4`, caption: "Modular digital speed gauge design system", category: 'JOY', links: [{ label: "Explore", url: "https://dashkit-omega.vercel.app/" }] },
]
