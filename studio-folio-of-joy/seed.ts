import {getCliClient} from 'sanity/cli'

// Seeds the About + Inspiration singletons with the site's current content.
// Run from this folder:  npx sanity exec seed.ts --with-user-token
const client = getCliClient()

let n = 0
const key = () => `k${n++}`

const span = (text: string, marks: string[] = []) => ({_type: 'span', _key: key(), text, marks})
const p = (text: string) => ({_type: 'block', _key: key(), style: 'normal', markDefs: [], children: [span(text)]})

const intro = [
  p('This website changes every other month, so I’m not sure which version you’re seeing — or if you’re one of the unlucky ones to catch an avant-garde version of it.'),
  p('I am a designer. Just a designer. Product, UI, UX, digital interface, interaction, visual; senior, junior, staff, principal — I’m not sure which one fully applies, because design is beyond a rank or a job.'),
  p('It’s a state of mind. It’s a process of communicating solutions and showing people how things can be done to achieve their goals. I was a designer as a kid, trying to organize my dad’s old computer desktop so it’d be easy for him to find things, or my mom’s spice rack so it’d be accessible to her. I just didn’t know what it was called, but the idea was the same. I watched them use it, fixed it, and then iterated.'),
  p('Today I do the same, except now with more elaborate Figma files and Claude Code prototypes to explain how something can be made easy and simple to use. And I’d still be a designer even if the job “UX designer” didn’t exist tomorrow.'),
]

const photoBlock = {
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [{_type: 'link', _key: 'insta', href: 'https://www.instagram.com/joyingntravelling/'}],
  children: [
    span('I also take photos that make me feel calm and mellow — 35mm street photography with my XT1 (iykyk). You can see them '),
    span('here', ['insta']),
    span('.'),
  ],
}

const outro = [
  p('That’s how I think of design — a service, and that service brings me joy.'),
  p('I can be annoying sometimes at dinner parties, when I’m trying to tell people why their app feels off, why their landing page doesn’t convert, and why their AI app looks like a GPT wrapper.'),
  p('But this isn’t all I’m about. I produce amateur Bollywood mixes with my keyboards and spend a lot of time tinkering with my PO-33.'),
  photoBlock,
  p('I’m also a HUGE typography nerd, and I want to learn how to make my own fonts — something I’m slowly learning to do.'),
  p('The world is full of optimizations, and people trying to optimize everything: money, careers, goals, dreams, numbers out of it all. I think we’ve forgotten to have fun with what we do or what we create. That’s what I aspire to do — create something fun that provides joy, not because I need to objectively hit some number.'),
  p('I’ve been a designer for almost a decade. It’s usually hard for me to focus on one thing — not because I have a short attention span, but because I have too many interests. I don’t go to restaurants with badly designed menus, I’m obsessed with metro maps and public signage, I love typography, and I’m probably one of the few designers who doesn’t use an iPhone.'),
  p('These are the things and people who inspire me to create, every day.'),
]

const about = {
  _id: 'about',
  _type: 'about',
  lede: 'Hello, I’m Joy.',
  subLede: 'First of all, thanks for stopping by.',
  intro,
  quote: 'I slept and dreamt that life was joy. I awoke and saw that life was service. I acted and behold, service was joy.',
  quoteAttribution: 'Rabindranath Tagore',
  outro,
}

const raw: [string, string, string][] = [
  ['Creatives', 'Edvard R. Tufte', 'Nobody can design complex data viz than him'],
  ['Creatives', 'Harish S', 'He turns everything into gold, whether it’s CRED or Agam'],
  ['Creatives', 'Mick Champayne', 'Illustrator, mentor and a friend only lucky ones can have'],
  ['Creatives', 'Philip Linnemann', 'Someone whose portfolio is all over public places in Denmark'],
  ['Creatives', 'Matt D. Smith', 'His videos turned me into a designer'],
  ['Creatives', 'Gawx', 'You don’t need time, space & equipment to create'],
  ['Companies', 'March Tee', 'Small non-luxury boutique t-shirt company, who aren’t sellouts'],
  ['Companies', 'Pigeon & Co', 'They know how to have fun in their work'],
  ['Companies', 'Xiaomi', 'Very underrated tech company, often judged and overlooked'],
  ['Companies', 'reMarkable', 'How to be successful with just one product'],
  ['Companies', 'On Running', 'How to be successful with one ugly shoe'],
  ['Companies', 'Teenage Engineering', 'Apple of musical instruments'],
  ['Companies', 'LEGO', 'Every child should grow up with'],
  ['Artists', 'Arijit Singh', 'How to stay grounded while being a god'],
  ['Artists', 'Jeremy Hindle', 'Production designer of Severance'],
  ['Artists', 'Indian Ocean', 'The sound of India'],
  ['Artists', 'Tanmay Bhat', 'Only successful person whose story I saw from start to finish'],
  ['Artists', 'Edvard Munch', 'Favourite painter of all time'],
  ['Artists', 'Marius Bauer', 'The style of painting I like'],
  ['Artists', 'Satyajit Ray', 'Non-designer who was a great designer'],
  ['Style', 'Wes Anderson', 'The whole vibe'],
  ['Style', 'The War Kitchen', 'Instagram page all about retro vintage'],
  ['Style', 'Cyberpunk 2077', 'Game that reimagined what the future could be like'],
  ['Style', 'Flower Mountain', 'How to make colourful shoes look nice'],
  ['Style', 'RAINS', 'Rainproof apparel made cool again'],
]

const inspiration = {
  _id: 'inspiration',
  _type: 'inspiration',
  items: raw.map(([category, name, note]) => ({_key: key(), _type: 'item', category, name, note})),
}

async function run() {
  await client.createOrReplace(about)
  await client.createOrReplace(inspiration)
  console.log(`Seeded: about + inspiration (${inspiration.items.length} items)`)
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
