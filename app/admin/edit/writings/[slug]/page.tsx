import { notFound } from 'next/navigation';
import { readArticleOverlay, type EditableArticle } from '@/lib/content/editable';
import { getWriting } from '@/lib/content';
import { ArticleEditor } from '@/components/admin/article-editor';

export default async function EditArticle({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const { slug } = await params;

  const overlay = await readArticleOverlay(slug);
  let initial: EditableArticle;
  if (overlay) {
    initial = overlay;
  } else {
    const doc = getWriting(slug); // existing coded doc, if any
    initial = {
      slug,
      title: doc?.title ?? slug,
      titled: doc?.titled ?? '',
      subhead: doc?.subhead ?? '',
      postedOn: doc?.postedOn ?? '',
      type: doc?.type,
      number: doc?.number,
      heroImage: doc?.heroImage ?? '',
      body: Array.isArray(doc?.body) ? doc!.body.join('\n\n') : '',
      references: doc?.references ?? [],
    };
  }
  return <ArticleEditor initial={initial} />;
}
