import { Inter } from 'next/font/google';
import { AdminPlaceholder } from '@/components/admin/admin-placeholder';
import { StampReview } from '@/components/admin/stamp-review/stamp-review';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--jds-inter' });

// Local-only review of the 100 country stamps. Same gate as the stamp lab:
// outside `next dev` the route renders the placeholder, and the comments API
// refuses to write.
export const metadata = { title: 'Country stamps', robots: { index: false, follow: false } };

export default function StampReviewPage() {
  if (process.env.NODE_ENV !== 'development') return <AdminPlaceholder />;
  return (
    <div className={inter.variable}>
      <StampReview />
    </div>
  );
}
