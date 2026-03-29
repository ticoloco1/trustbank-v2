import { MiniSitePage } from '@/components/minisite/MiniSitePage';

export default function Page({ params }: { params: { slug: string } }) {
  return <MiniSitePage slug={params.slug} />;
}

export const dynamic = 'force-dynamic';
