import type { AboutDoc, InspirationItem } from './types';

// The About essay + inspiration rail, migrated from Sanity (2026-07) into code.
export const ABOUT: AboutDoc = {
  lede: "Hello, I’m Joy.",
  subLede: "First of all, thanks for stopping by.",
  intro: [
    "This website changes every other month, so I’m not sure which version you’re seeing — or if you’re one of the unlucky ones to catch an avant-garde version of it.",
    "I am a designer. Just a designer. Product, UI, UX, digital interface, interaction, visual; senior, junior, staff, principal — I’m not sure which one fully applies, because design is beyond a rank or a job.",
    "It’s a state of mind. It’s a process of communicating solutions and showing people how things can be done to achieve their goals. I was a designer as a kid, trying to organize my dad’s old computer desktop so it’d be easy for him to find things, or my mom’s spice rack so it’d be accessible to her. I just didn’t know what it was called, but the idea was the same. I watched them use it, fixed it, and then iterated.",
    "Today I do the same, except now with more elaborate Figma files and Claude Code prototypes to explain how something can be made easy and simple to use. And I’d still be a designer even if the job “UX designer” didn’t exist tomorrow.",
  ],
  quote: "I slept and dreamt that life was joy. I awoke and saw that life was service. I acted and behold, service was joy.",
  quoteAttribution: "Rabindranath Tagore",
  outro: [
    "That’s how I think of design — a service, and that service brings me joy.",
    "I can be annoying sometimes at dinner parties, when I’m trying to tell people why their app feels off, why their landing page doesn’t convert, and why their AI app looks like a GPT wrapper.",
    "But this isn’t all I’m about. I produce amateur Bollywood mixes with my keyboards and spend a lot of time tinkering with my PO-33.",
    ["I also take photos that make me feel calm and mellow — 35mm street photography with my XT1 (iykyk). You can see them ", { text: "here", href: "https://www.instagram.com/joyingntravelling/" }, "."],
    "I’m also a HUGE typography nerd, and I want to learn how to make my own fonts — something I’m slowly learning to do.",
    "The world is full of optimizations, and people trying to optimize everything: money, careers, goals, dreams, numbers out of it all. I think we’ve forgotten to have fun with what we do or what we create. That’s what I aspire to do — create something fun that provides joy, not because I need to objectively hit some number.",
    "I’ve been a designer for almost a decade. It’s usually hard for me to focus on one thing — not because I have a short attention span, but because I have too many interests. I don’t go to restaurants with badly designed menus, I’m obsessed with metro maps and public signage, I love typography, and I’m probably one of the few designers who doesn’t use an iPhone.",
    "These are the things and people who inspire me to create, every day.",
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
