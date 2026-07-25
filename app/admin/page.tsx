import { AdminIndex } from '@/components/admin/admin-index';
import { AdminPlaceholder } from '@/components/admin/admin-placeholder';

export default function AdminPage() {
  if (process.env.NODE_ENV !== 'development') return <AdminPlaceholder />;
  return <AdminIndex />;
}
