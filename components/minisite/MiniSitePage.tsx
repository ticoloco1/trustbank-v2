'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import MiniSiteClient from './MiniSiteClient';
import { Loader2 } from 'lucide-react';

export function MiniSitePage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Allow owner to preview even if unpublished
    supabase.from('mini_sites').select('*').eq('slug', slug).maybeSingle()
      .then(({ data }) => {
        if (data && (data.published || data.user_id === user?.id)) {
          setProfile(data);
        } else if (data) {
          setNotFound(true); // exists but not published and not owner
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug, user?.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#818cf8" className="animate-spin" />
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Mini site not found</h2>
      <p style={{ color: 'rgba(241,245,249,0.4)', marginBottom: 24 }}>{slug}.trustbank.xyz does not exist yet</p>
      <a href="/slugs" style={{ padding: '12px 24px', borderRadius: 10, background: '#818cf8', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Get this slug</a>
    </div>
  );

  return <MiniSiteClient profile={profile} />;
}
