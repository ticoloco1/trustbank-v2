import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
export const metadata = { title: 'Dashboard | TrustBank', robots: 'noindex' };
export default function Page() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
