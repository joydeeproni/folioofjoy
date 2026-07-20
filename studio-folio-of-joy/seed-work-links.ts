import {getCliClient} from 'sanity/cli'

// One-time: populate each Work item's `links` with a "View Live" link for the
// project it belongs to (inferred from the caption), so the links then live in
// Sanity and you can add/remove/fix them in the Studio.
//
// Run from this folder:  npx sanity exec seed-work-links.ts --with-user-token
//
// NOTE: Composyte is intentionally NOT auto-assigned (its projects aren't
// identifiable from captions) — add those in the Studio. Existing links are
// preserved; a matching "View Live" is only added if not already present.
const client = getCliClient()

const RULES: {url: string; test: RegExp}[] = [
  {url: 'https://insiderone.com/', test: /email platform|\brfm\b|newsletter|contact list|champions or loyal|audience estimate/i},
  {url: 'https://cassihome.com/', test: /\bcassi\b|home[- ]?management|home maintenance|home app|home operations|welcome home|seasonal calendar|home concierge|property manager|maintenance plan/i},
  {url: 'https://www.battalion.com/', test: /proptech|property (analytics|intelligence|price)|real estate|\bneighborhood\b|\brealtor\b|zoning|\bbroker|lender|lending|\bloan\b|scatter plot|address search|value driver|historical value/i},
]
const liveUrl = (c: string): string | null => RULES.find((r) => r.test.test(c || ''))?.url ?? null

async function run() {
  const doc = await client.fetch(`*[_type == "work"][0]{_id, items}`)
  if (!doc?._id) throw new Error('No work document found')
  let added = 0
  let n = 0
  const items = (doc.items || []).map((it: any) => {
    const url = liveUrl(it.caption)
    if (!url) return it
    const links = it.links || []
    if (links.some((l: any) => l.url === url)) return it
    added++
    return {...it, links: [...links, {_key: `vl${n++}${Date.now().toString(36)}`, _type: 'link', label: 'View Live', url}]}
  })
  await client.patch(doc._id).set({items}).commit()
  console.log(`Added "View Live" to ${added} work items. Fine-tune (incl. Composyte) in the Studio.`)
}

run().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})
