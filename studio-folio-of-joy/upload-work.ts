import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

// Uploads every /public/work asset to Sanity and creates the Work document.
// Run from this folder:  npx sanity exec upload-work.ts --with-user-token
const client = getCliClient()

// Pull the real WORK_ITEMS array from the app source so captions aren't retyped.
const source = readFileSync(resolve(process.cwd(), '../components/work-preview.tsx'), 'utf8')
const match = source.match(/WORK_ITEMS:\s*WorkItem\[\]\s*=\s*\[([\s\S]*?)\n\];/)
if (!match) throw new Error('Could not locate WORK_ITEMS in work-preview.tsx')
const items: {src: string; category: string; caption: string}[] = new Function('return [' + match[1] + ']')()

const isVideo = (s: string) => s.endsWith('.mp4')

let k = 0
const key = () => `w${k++}`

async function run() {
  const built: Record<string, unknown>[] = []
  for (const [i, it] of items.entries()) {
    const filePath = resolve(process.cwd(), '..', 'public', it.src.replace(/^\//, ''))
    const buf = readFileSync(filePath)
    const filename = it.src.split('/').pop() as string
    const common = {_key: key(), _type: 'workItem', caption: it.caption, category: it.category, links: []}
    if (isVideo(it.src)) {
      const asset = await client.assets.upload('file', buf, {filename})
      built.push({...common, video: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}})
    } else {
      const asset = await client.assets.upload('image', buf, {filename})
      built.push({...common, image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}}})
    }
    console.log(`(${i + 1}/${items.length}) ${filename}`)
  }
  await client.createOrReplace({_id: 'work', _type: 'work', items: built})
  console.log(`Done: work doc created with ${built.length} items`)
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err)
    process.exit(1)
  },
)
