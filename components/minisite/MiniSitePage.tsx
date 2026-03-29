'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import MiniSiteClient from './MiniSiteClient';
import { Loader2 } from 'lucide-react';

export function MiniSitePage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Wait for auth to resolve before checking ownership
    if (authLoading) return;
    supabase.from('mini_sites').select('*').eq('slug', slug).maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        // Show if published OR if owner
        if (data.published || data.user_id === user?.id) {
          setProfile(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug, user?.id, authLoading]);

  if (loading || authLoading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} color="#818cf8" className="animate-spin" />
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#f1f5f9', fontFamily:'system-ui', gap:12 }}>
      <div style={{ fontSize:60 }}>🔍</div>
      <h2 style={{ fontSize:24, fontWeight:800, margin:0 }}>Site not found</h2>
      <p style={{ color:'rgba(241,245,249,0.4)', margin:0 }}>{slug}.trustbank.xyz</p>
      <a href="/slugs" style={{ marginTop:8, padding:'12px 24px', borderRadius:10, background:'#818cf8', color:'#fff', textDecoration:'none', fontWeight:700 }}>Get this slug</a>
    </div>
  );

  return <MiniSiteClient profile={profile} />;
}
