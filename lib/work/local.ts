import type { WorkItem, WorkLinkItem } from '@/lib/content/types'

// Vercel Blob store used across the site for large media (audio, covers, work).
const BLOB = 'https://yqyhl5b6mya2r8ci.public.blob.vercel-storage.com/work'

// These items live in code (not Sanity), so their links live here too. The
// Cassi screens all link to the live site; Sanity items' links are managed in
// the Studio.
const CASSI: WorkLinkItem[] = [{ label: 'View Live', url: 'https://cassihome.com/' }]
const INSIDER: WorkLinkItem[] = [{ label: 'View Live', url: 'https://insiderone.com/product-demo-hub/?filters=CHANNEL%3DEmail#get_demo' }]

// Bespoke Work items hosted outside Sanity (uploaded to Vercel Blob). Prepended
// to the Sanity-fed Work list so they lead the Work Preview.
export const LOCAL_WORK: WorkItem[] = [
  { src: `${BLOB}/canvas-stickynote.mp4`, caption: "A draggable sticky-note canvas — an infinite whiteboard minus the ceremony.", category: 'SVC', links: [] },
  { src: `${BLOB}/property-listing-02.png`, caption: "Cassi — a home's full profile from just an address: value, flood-zone risk, the works.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/mortgage-upload-01.png`, caption: "Cassi — a mortgage assistant that reads your terms and says, plainly, whether to refinance.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/fact-card-01.png`, caption: "Cassi — did-you-know cards that surface a home fact before you thought to ask.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/game-result-01.png`, caption: "Mini Parkering — a game about issuing as many parking tickets as humanly possible.", category: 'JOY', links: [] },
  { src: `${BLOB}/game-over-01.png`, caption: "Mini Parkering — game over: the lot's overloaded, but you made $230 doing it.", category: 'JOY', links: [] },
  { src: `${BLOB}/media-player-01.png`, caption: "Media player redesign — the before and after, down to the volume slider.", category: 'JOY', links: [] },
  { src: `${BLOB}/onboarding-flow-01.png`, caption: "Cassi — the onboarding flow mapped out, from 'home intelligence' score to your first insurance upload.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/upload-progress-01.png`, caption: "Cassi — the uploading-documents flow in five frames, because the in-between states matter.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/claude-usage.png`, caption: "My Claude usage as a terminal stat card — 86.7M tokens, roughly 243 copies of Crime and Punishment.", category: 'JOY', links: [] },
  { src: `${BLOB}/tactile-deck.mp4`, caption: "Tactile — an internal sprint deck, because I love making decks too.", category: 'BIZ', links: [] },
  { src: `${BLOB}/cassi-fundraising-deck.mp4`, caption: 'Cassi fundraising deck — the pitch that helped land their first VC round', category: 'BIZ', links: [] },
  { src: `${BLOB}/cassi-carousel.mp4`, caption: 'Cassi — animated home-condition cards, each property scored at a glance', category: 'SVC', links: CASSI },

  // Motion walkthroughs (2026): re-encoded exports on Blob.
  { src: `${BLOB}/tc-refine-interaction.mp4`, caption: 'Tactile Create — a border-beam on the refine-prompt field, back before everyone did it.', category: 'JOY', links: [] },
  { src: `${BLOB}/cassi-maintenance-flow.mp4`, caption: "Cassi — a maintenance flow that hands you a seasonal checklist before the season turns.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/notes-for-lazy-demo.mp4`, caption: 'Notes for Lazy — jot something and download it as .txt; it stores nothing.', category: 'JOY', links: [{ label: 'View Live', url: 'https://notesforlazy.vercel.app' }] },
  { src: `${BLOB}/cassi-onboarding-splash.mp4`, caption: "Cassi — onboarding splash screens that feel like a deep breath, not a signup.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/unity-launcher-responsive.mp4`, caption: "Unity launcher — a responsive pass where the actions tuck into a kebab when space gets tight.", category: 'DTY', links: [] },
  { src: `${BLOB}/releases-dashboard-handoff.mp4`, caption: 'Dev handoffs be like — the releases dashboard.', category: 'DTY', links: [] },
  { src: `${BLOB}/cassi-error-reporting.mp4`, caption: "Cassi — reporting a problem and watching it get fixed, no ticket number required.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/cassi-assistant-speaking.mp4`, caption: "Talking to Cassi out loud — the assistant listening, then answering back.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/cassi-home-dashboard-concept.mp4`, caption: "Cassi — a home dashboard concept: everything about the house in one calm view.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/cassi-bathroom-maintenance-video.mp4`, caption: "Cassi — booking bathroom maintenance by just walking it through on video.", category: 'SVC', links: CASSI },
  { src: `${BLOB}/spice-label-maker.mp4`, caption: "A minimalist spice-label maker, because the pantry deserves good type too.", category: 'JOY', links: [] },

  // Tactile tooling + client work (2025–26 exports).
  { src: `${BLOB}/tactile-build-server-toggle.gif`, caption: "Tactile Build Server — a toggle that exposes options progressively rather than cluttering the page.", category: 'DTY', links: [] },
  { src: `${BLOB}/tactile-core-tools.mp4`, caption: "A preview of Tactile Core Tools — the tools I designed that run game-dev operations behind the scenes.", category: 'DTY', links: [] },
  { src: `${BLOB}/rug-brand-landing.mp4`, caption: "Editorial-style landing page for a designer rug brand from India.", category: 'BIZ', links: [] },
  { src: `${BLOB}/tactile-releases-dashboard.png`, caption: "Managing app releases in the Tactile Releases Dashboard — builds organized across production, staged rollouts, managed publishing.", category: 'DTY', links: [] },
  { src: `${BLOB}/game-canvas-panel.png`, caption: "All-in-one panel to manage your game, liveops, events and build configurations.", category: 'DTY', links: [] },

  // Personal bits + palette-cleansers scattered through the preview. The paintings
  // aren't my work — winter paintings that calm me, credited to their artists.
  { src: `${BLOB}/painting-christmas-window.jpg`, caption: 'Christmas Window — Elena Sokolova. A winter palette-cleanser.', category: 'JOY', links: [] },
  { src: `${BLOB}/painting-pomegranate.jpg`, caption: 'Pomegranate — Wendy Keller. A winter painting that calms me.', category: 'JOY', links: [] },
  { src: `${BLOB}/painting-home-alone.jpg`, caption: 'Home Alone, in oil — Mr. Meville. Winter comfort.', category: 'JOY', links: [] },
  { src: `${BLOB}/notes-palette.png`, caption: 'The colour palette I picked for Notes for Lazy, my notes app.', category: 'JOY', links: [{ label: 'View Live', url: 'https://notesforlazy.vercel.app' }] },
  { src: `${BLOB}/books-2024.png`, caption: 'Books I read in 2024.', category: 'JOY', links: [] },

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
  { src: `${BLOB}/9fea1259bd47c7c73aa9dcd564340e8f43b06f86-1280x568.png`, caption: "Platform illustration — abstract enough for a landing page, specific enough to hint at the product.", category: 'JOY', links: INSIDER },
  { src: `${BLOB}/52fea9e5df569f33954637a87f8da833e34826be-1920x1200.png`, caption: "Lender-broker message centre — threaded by property, because that matters more than timestamps.", category: 'SVC', links: [] },
  { src: `${BLOB}/7d7fb44c3b7243052b407cc751e2e3497df17490-640x498.png`, caption: "Zoning overlay — shows what is getting built nearby before the construction noise does.", category: 'SVC', links: [] },
  { src: `${BLOB}/c6d70989d9b47432bca4f2c6ee8c712392ccc949-1769x1326.png`, caption: "Onboarding cards for a datamarts tool — naming conventions and dimensions, illustrated so dry content lands.", category: 'DTY', links: [] },
  { src: `${BLOB}/1c1ccbb1a16f8994c36c90838a496c49d1cb8f99.mp4`, caption: "Dashboard loader animation — a looping motion study for a KCS analytics dashboard.", category: 'SVC', links: [] },
  { src: `${BLOB}/2bc3d726b69b603e16a87ff0e20d5316d5407e9d-1929x1653.png`, caption: "AI home concierge — \"What do you want today?\" with maintenance, providers, and a talk-to-Cassi prompt.", category: 'SVC', links: [] },
  { src: `${BLOB}/4d2027a7bf3523823a884fb859da762c5041bcb0-1929x939.png`, caption: "Home maintenance screens — seasonal calendar, asset detail, and a welcome-home dashboard.", category: 'SVC', links: [] },
  { src: `${BLOB}/574310b7cec0a7709455629df96fb81dab904c24-1929x1597.png`, caption: "Onboarding for the home app — a gradient welcome flow that introduces Cassi before asking for anything.", category: 'SVC', links: [], caseStudy: 'cassi' },
  { src: `${BLOB}/ebcbe3e8d21b64ecc3e4a3aec005fe0f32cfe1e2-1929x1444.png`, caption: "The design system in Figma — chat interface states, components, and the annotations engineering actually read.", category: 'DTY', links: [] },
  { src: `${BLOB}/f835ab854689260af49cdc29fb9d34aa1a2a274e-1824x1822.png`, caption: "Lending dashboard — borrower details and a credit-score gauge that reads at a glance.", category: 'BIZ', links: [] },
  { src: `${BLOB}/11af0c9cd13f04e65feca8149963374fa4c16470-1824x2719.png`, caption: "Mobile document collection for a loan — upload progress and lender checklists, minus the paperwork dread.", category: 'BIZ', links: [] },
  { src: `${BLOB}/1dba04ef8696b6385de4005988f61a73dba9e54e-2457x1407.png`, caption: "RFM segmentation — pick Champions or Loyal Customers and watch the audience estimate update live.", category: 'SVC', links: INSIDER },
  { src: `${BLOB}/b69f71df224fa490ade5309709bf25dffe36ccdd-2457x1989.png`, caption: "Contact list manager — upload states, tags, and counts for millions of records without the clutter.", category: 'DTY', links: [] },
  { src: `${BLOB}/6c3293fa2ea4d08c34d286423348a3a8083cd217-2457x1477.png`, caption: "Newsletter setup flow — a calm \"here's what we're working on\" that keeps onboarding unhurried.", category: 'SVC', links: [] },
  { src: `${BLOB}/961f6a54c82e76db8fce8dbcb4ec89648edd1095-2457x1509.png`, caption: "Setup checklist — \"you're all set up\" with a satisfying green all-clear.", category: 'SVC', links: [] },
  { src: `${BLOB}/2b92ccb1a684f606d4e32c4eac32e1592cde9c48-2457x1842.png`, caption: "Illustration set for an email platform — one visual language across every empty state.", category: 'BIZ', links: INSIDER },
  { src: `${BLOB}/def2f904068bf508129457fa6b1f1bf152a06e98-1824x1365.png`, caption: "Build pipeline for a Unity game — every step green before the store build ships.", category: 'JOY', links: [] },
  { src: `${BLOB}/13c06a52226574bf93030a47cecb1de00eec3c3a.mp4`, caption: "Modular digital speed gauge design system", category: 'JOY', links: [{ label: "Explore", url: "https://garagekit.vercel.app/" }] },
]
