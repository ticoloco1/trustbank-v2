import { MiniSiteClient } from '@/components/minisite/MiniSiteClient';

export default function MiniSitePage({ params }: { params: { slug: string } }) {
  return <MiniSiteClient slug={params.slug} />;
}
