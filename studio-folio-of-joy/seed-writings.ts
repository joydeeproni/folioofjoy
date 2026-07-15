import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

// Seeds the Writings collection from the app's lib/writings.ts.
// Run from this folder:  npx sanity exec seed-writings.ts --with-user-token
const client = getCliClient()

const source = readFileSync(resolve(process.cwd(), '../lib/writings.ts'), 'utf8')
const match = source.match(/WRITINGS:\s*WritingPost\[\]\s*=\s*(\[[\s\S]*?\n\]);/)
if (!match) throw new Error('Could not locate WRITINGS array')
const writings: Array<{
  slug: string
  number: string
  title: string
  postedOn: string
  titled: string
  subhead: string
  references: {label: string; href: string}[]
  body: string[]
}> = new Function('return ' + match[1])()

let k = 0
const key = () => `k${k++}`
const block = (text: string) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})

async function run() {
  for (const w of writings) {
    await client.createOrReplace({
      _id: `writing-${w.slug}`,
      _type: 'writing',
      title: w.title,
      slug: {_type: 'slug', current: w.slug},
      number: w.number,
      postedOn: w.postedOn,
      titled: w.titled,
      subhead: w.subhead,
      body: (w.body || []).map(block),
      references: (w.references || []).map((r) => ({_key: key(), label: r.label, href: r.href})),
    })
    console.log(`seeded ${w.slug}`)
  }
  console.log(`Done: ${writings.length} writings`)
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
