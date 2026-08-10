import { AdminPlaceholder } from '@/components/admin/admin-placeholder';
import { StampLab } from '@/components/admin/stamp-lab';

// Local-only design surface for the guestbook stamps + notebook. Gated the same
// way /admin is: anywhere but `next dev` this renders the placeholder, so the
// route exists in the bundle but shows nothing on the deployed site.
export const metadata = { title: 'Stamp lab', robots: { index: false, follow: false } };

export default function StampLabPage() {
  if (process.env.NODE_ENV !== 'development') return <AdminPlaceholder />;
  return <StampLab />;
}
