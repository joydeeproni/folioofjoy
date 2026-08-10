import { BRAND } from '@/lib/brand';
import type { AboutDoc, InspirationItem } from './types';

const TACTILE_INTERVIEW =
  'https://tactilegames.com/2-years-of-joy-an-interview-with-joydeep-sengupta-our-product-designer/';

// The About essay + inspiration rail, migrated from Sanity (2026-07) into code.
export const ABOUT: AboutDoc = {
  lede: "Hello, I’m Joy.",
  subLede: "First of all, thanks for stopping by.",
  intro: [
    "This website changes every other month, so I’m not sure which version you’re seeing — or if you’re one of the unlucky ones to catch an avant-garde version of it.",
    [
      "My name is Joy, product designer based in Copenhagen, Denmark",
      { icon: "denmark", label: "Danish flag" },
      ", designing creative tools for artists, designers and game programmers at ",
      { text: "Tactile", href: TACTILE_INTERVIEW },
      { icon: "tactile", label: "Tactile logo" },
      ". Currently looking for interesting opportunities in web SaaS products, creative tools or consumer mobile apps, of companies that are design mature and not caught up in design bureaucracies.",
    ],
  ],
  thesis: {
    title: "Design Thesis",
    paras: [
      "It’s a state of mind. It’s a process of communicating solutions and showing people how things can be done to achieve their goals. I was a designer as a kid, trying to organize my dad’s old computer desktop so it’d be easy for him to find things, or my mom’s spice rack so it’d be accessible to her. I just didn’t know what it was called, but the idea was the same. I watched them use it, fixed it, and then iterated.",
      "Today I do the same, except now with more elaborate Figma files and Claude Code prototypes to explain how something can be made easy and simple to use. And I’d still be a designer even if the job “UX designer” didn’t exist tomorrow.",
    ],
  },
  quote: "I slept and dreamt that life was joy. I awoke and saw that life was service. I acted and behold, service was joy.",
  quoteAttribution: "Rabindranath Tagore",
  outro: [
    "That’s how I think of design — a service, and that service brings me joy.",
    "I can be annoying sometimes at dinner parties, when I’m trying to tell people why their app feels off, why their landing page doesn’t convert, and why their app looks like slop and is still hard to use.",
    "The world is full of optimizations and people trying to optimize everything. Trying to make money, careers, goals, dreams, numbers out of all. I think we have forgotten to have fun with what we do or what we create. That’s what I aspire to do. Creating something fun that provides joy, not because I need to objectively reach some number.",
    [
      "I have been a designer for almost a decade. It’s usually hard for me to focus on one thing (not because I have a low attention span), it’s because I have too many interests. I don’t go to a restaurant that has a bad menu design, I am obsessed with metro maps and public signage.",
      { icon: "metro", label: "Pixel metro sign" },
    ],
  ],
  // One brand colour each, in BRAND_ORDER — green on Fun & Joy since it's the
  // site's primary accent.
  values: [
    {
      title: "Fun & Joy",
      color: BRAND.green,
      body: "Creating something that provides joy and fun to make. Not optimizing too much for numbers but optimizing it for inherent fun. So even if the clients don’t like my work, at least I have fun making it.",
    },
    {
      title: "Aesthetics",
      color: BRAND.yellow,
      body: "Big believer of the aesthetic usability principle. Nothing is ever complete if it doesn’t look good. Whether it’s food, clothes or designs, aesthetics is important and not ‘nice-to-have’. So form meets function meets feeling.",
    },
    {
      title: "Care",
      color: BRAND.red,
      body: "Every action I take is deliberate and conscious. Regardless of others’ concern or indifference, or even my client’s, what’s important is that I am dedicated. From this dedication springs a meticulous regard for particulars, and ensuring these particulars are attended to.",
    },
    {
      title: "Economics",
      color: BRAND.purple,
      body: "As designers, we are often likened to artists, seemingly unconcerned with the financial and commercial aspects of design. However, I don’t fit that mold. I regard both the monetary value and the business significance of design just as highly as the craftsmanship involved.",
    },
  ],
  kitLede: "These are the things that help me create:",
  kit: [
    {
      name: "M5 MacBook Pro 14 inch",
      note: "can’t trust anything else",
      image: "/kit/macbook-pro-14.png",
    },
    {
      name: "NuPhy Air60 V2",
      note: "my colleagues hate this",
      image: "/kit/nuphy-air60-v2.png",
    },
    {
      name: "Aiaiai TMA-2",
      note: "low key great sounding headphones",
      image: "/kit/aiaiai-tma-2.png",
    },
    {
      name: "Pen and mishmash planner",
      note: "better than Jira and any todo app",
      image: "/kit/pen-mishmash-planner.png",
    },
    { name: "M2 iPad Air", note: "my doodling partner", image: "/kit/ipad-air-m2.png" },
    {
      name: "Fujifilm XT-1",
      note: "12 years old, this baby is",
      image: "/kit/fujifilm-xt1.png",
    },
    {
      name: "24Bottles Clima",
      note: "I don’t drink tea or coffee, so only water",
      image: "/kit/24bottles-clima.png",
    },
    {
      name: "Xbox Series S",
      note: "yes I am in the Xbox ecosystem, only for Forza",
      image: "/kit/xbox-series-s.png",
    },
    {
      name: "Claude Code Max",
      note: "to bring my weird visions to reality",
      image: "/kit/claude-code-max.png",
    },
    { name: "Figma", note: "the old trusty companion", image: "/kit/figma.png" },
  ],
};

export const INSPIRATION: InspirationItem[] = [
  { category: "Creatives", name: "Edvard R. Tufte", note: "Nobody can design complex data viz than him" },
  { category: "Creatives", name: "Harish S", note: "He turns everything into gold, whether it’s CRED or Agam" },
  { category: "Creatives", name: "Mick Champayne", note: "Illustrator, mentor and a friend only lucky ones can have" },
  { category: "Creatives", name: "Philip Linnemann", note: "Someone whose portfolio is all over public places in Denmark" },
  { category: "Creatives", name: "Matt D. Smith", note: "His videos turned me into a designer" },
  { category: "Creatives", name: "Gawx", note: "You don’t need time, space & equipment to create" },
  { category: "Companies", name: "March Tee", note: "Small non-luxury boutique t-shirt company, who aren’t sellouts" },
  { category: "Companies", name: "Pigeon & Co", note: "They know how to have fun in their work" },
  { category: "Companies", name: "Xiaomi", note: "Very underrated tech company, often judged and overlooked" },
  { category: "Companies", name: "reMarkable", note: "How to be successful with just one product" },
  { category: "Companies", name: "On Running", note: "How to be successful with one ugly shoe" },
  { category: "Companies", name: "Teenage Engineering", note: "Apple of musical instruments" },
  { category: "Companies", name: "LEGO", note: "Every child should grow up with" },
  { category: "Artists", name: "Arijit Singh", note: "How to stay grounded while being a god" },
  { category: "Artists", name: "Jeremy Hindle", note: "Production designer of Severance" },
  { category: "Artists", name: "Indian Ocean", note: "The sound of India" },
  { category: "Artists", name: "Tanmay Bhat", note: "Only successful person whose story I saw from start to finish" },
  { category: "Artists", name: "Edvard Munch", note: "Favourite painter of all time" },
  { category: "Artists", name: "Marius Bauer", note: "The style of painting I like" },
  { category: "Artists", name: "Satyajit Ray", note: "Non-designer who was a great designer" },
  { category: "Style", name: "Wes Anderson", note: "The whole vibe" },
  { category: "Style", name: "The War Kitchen", note: "Instagram page all about retro vintage" },
  { category: "Style", name: "Cyberpunk 2077", note: "Game that reimagined what the future could be like" },
  { category: "Style", name: "Flower Mountain", note: "How to make colourful shoes look nice" },
  { category: "Style", name: "RAINS", note: "Rainproof apparel made cool again" },
];
