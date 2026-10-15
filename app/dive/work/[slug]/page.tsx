import CaseStudyPage from '@/app/work/[slug]/page'

export { generateStaticParams } from '@/app/work/[slug]/page'

export default function DiveCaseStudy(props: { params: Promise<{ slug: string }> }) {
  return <CaseStudyPage {...props} />
}
