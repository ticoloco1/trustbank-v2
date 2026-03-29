'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';
import { Zap, TrendingUp } from 'lucide-react';

const A = '#818cf8';

export default function JackpotPage() {
  const { t } = useLang();
  const [pot, setPot] = useState(0);
  const [top, setTop] = useState<any[]>([]);

  useEffect(() => {
    (supabase as any).from('site_boosts').select('amount')
      .then(({ data }: any) => {
        const total = (data || []).reduce((a: number, b: any) => a + (b.amount || 0), 0);
        setPot(total * 0.5);
      });
    supabase.from('mini_sites').select('slug,site_name,avatar_url,boost_rank')
      .gt('boost_rank', 0).order('boost_rank', { ascending: false }).limit(10)
      .then(({ data }) => setTop(data || []));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:700, margin:'0 auto', padding:'60px 24px', textAlign:'center' }}>
        <div style={{ fontSize:60, marginBottom:16 }}>⚡</div>
        <h1 style={{ fontSize:'clamp(32px,6vw,56px)', fontWeight:900, marginBottom:8 }}>Jackpot</h1>
        <p style={{ fontSize:16, color:'rgba(241,245,249,0.5)', marginBottom:40 }}>
          20% of all boosts go to the jackpot. Top boosted site wins weekly.
        </p>
        <div style={{ padding:32, borderRadius:24, background:`linear-gradient(135deg,${A}20,rgba(99,102,241,0.1))`, border:`0.5px solid ${A}40`, marginBottom:40 }}>
          <p style={{ fontSize:12, fontWeight:700, color:A, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Current Jackpot</p>
          <p style={{ fontSize:'clamp(40px,8vw,72px)', fontWeight:900, color:'#4ade80', margin:0, lineHeight:1 }}>
            ${pot.toFixed(2)} <span style={{ fontSize:20, color:'rgba(241,245,249,0.4)' }}>USDC</span>
          </p>
        </div>
        {top.length > 0 && (
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>🏆 Top Boosted</p>
            {top.map((s, i) => (
              <div key={s.slug} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', marginBottom:8 }}>
                <span style={{ fontSize:18, fontWeight:900, color:i===0?'#f59e0b':i===1?'#94a3b8':i===2?'#b45309':'rgba(241,245,249,0.3)', minWidth:28 }}>{i+1}</span>
                {s.avatar_url
                  ? <img src={s.avatar_url} style={{ width:36,height:36,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/>
                  : <div style={{ width:36,height:36,borderRadius:'50%',background:`${A}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:A,flexShrink:0 }}>{(s.site_name||'?')[0]}</div>
                }
                <span style={{ flex:1, fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{s.site_name || s.slug}</span>
                <span style={{ fontSize:12, color:A, fontWeight:700 }}><Zap size={12} style={{ display:'inline',marginRight:2 }}/>{s.boost_rank}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
