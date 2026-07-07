export interface WritingPost {
  slug: string;
  number: string; // e.g. "01"
  title: string;
  postedOn: string; // human date
  titled: string; // short label under "TITLED"
  references: { label: string; href: string }[];
  body: string[]; // paragraphs
  subhead: string; // bold intro subhead
  heroImage?: string;
}

export const WRITINGS: WritingPost[] = [
  {
    slug: 'weight-of-a-button',
    number: '01',
    title: 'The Weight of a Button',
    postedOn: 'December 14th, 2025',
    titled: 'On why a button should feel expensive',
    subhead: 'Some interfaces are quiet',
    references: [
      { label: 'The cost of one more tap', href: '#' },
      { label: 'Affordances, revisited', href: '#' },
      { label: 'Motion as a promise', href: '#' },
    ],
    body: [
      'A button is the smallest contract a product makes with a person. Press here and something happens — reliably, quickly, without drama. When that contract is honoured, nobody notices. When it is broken, everybody does, and the whole thing starts to feel cheap in a way that is hard to name and easy to feel.',
      'Weight is the sum of a hundred small decisions: the radius, the shadow that says the surface can be pressed, the hundred-millisecond delay before the ripple, the way the label sits dead-centre no matter the language. None of these is visible on its own. Together they are the difference between software you trust and software you tolerate.',
      'The craft is in refusing to round any of them off. A button that feels expensive is not decorated — it is resolved. Every value has been argued for. That is the whole job, most days: arguing quietly for the values nobody will ever see.',
    ],
  },
  {
    slug: 'the-cms-cycle',
    number: '02',
    title: 'The CMS Cycle',
    postedOn: 'November 2nd, 2025',
    titled: 'A short field guide to shipping content',
    subhead: 'So, an organization spends',
    references: [
      { label: 'Problems your CMS will not solve', href: '#' },
      { label: 'Stop site degradation', href: '#' },
    ],
    body: [
      'So, an organization spends tens of thousands of dollars to build a website upon a full-access content management system. Over the coming months every department head is issued a login, and the careful thing that was launched begins, slowly, to become something else entirely.',
      'The cycle is always the same. A clean template meets a real deadline, and the template loses. Then the next deadline, and the next, until the homepage is a museum of exceptions nobody remembers agreeing to.',
      'The fix is not more governance. It is fewer, better decisions made once, early, and defended. A system is only as calm as the constraints you were willing to keep.',
    ],
  },
  {
    slug: 'notes-for-the-lazy',
    number: '03',
    title: 'Notes for the Lazy',
    postedOn: 'October 9th, 2025',
    titled: 'In praise of doing less, better',
    subhead: 'Laziness, done well',
    references: [
      { label: 'The joy of a small surface', href: '#' },
    ],
    body: [
      'Laziness, done well, is just taste with the boring parts removed. It is the instinct to delete the feature before you build the settings page for the feature. It is the refusal to solve problems you do not have yet.',
      'The lazy designer ships the smallest thing that could possibly be loved, then watches. Everything after that is earned. Most roadmaps would be shorter, and most products better, if we were all a little more honest about how little we actually need to add.',
    ],
  },
];

export function getWriting(slug: string): WritingPost | undefined {
  return WRITINGS.find((w) => w.slug === slug);
}
