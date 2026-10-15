import WritingPost from '@/app/writings/[slug]/page'

export { generateStaticParams } from '@/app/writings/[slug]/page'

export default function DiveWritingPost(props: { params: Promise<{ slug: string }> }) {
  return <WritingPost {...props} />
}
