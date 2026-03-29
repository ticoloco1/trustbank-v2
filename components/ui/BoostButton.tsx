'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { Zap, X, Loader2 } from 'lucide-react';

interface Props {
  siteId: string;
  slug: string;
  accent?: string;
  compact?: boolean;
}

export function BoostButton({ siteId, slug, accent = '#818cf8', compact }: Props) {
  const { user } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    (supabase as any).from('site_boosts').select('amount').eq('site_id', siteId)
      .then(({ data }: any) => {
        if (data) {
          setScore(data.reduce((a: number, b: any) => a + (b.amount || 0), 0));
          setCount(data.length);
        }
      });
  }, [siteId]);

  const positions = amount * 2;
  const price = (amount * 0.5).toFixed(2);

  const boost = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    await (supabase as any).from('site_boosts').insert({ site_id: siteId, user_id: user.id, amount, slug });
    setScore(s => s + amount);
    setCount(c => c + 1);
    setDone(true);
    setLoading(false);
    setTimeout(() => { setDone(false); setOpen(false); }, 2000);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: compact ? '5px 10px' : '8px 14px',
        borderRadius: 8, border: `0.5px solid ${accent}40`,
        background: `${accent}10`, color: accent,
        cursor: 'pointer', fontSize: compact ? 12 : 13, fontWeight: 700,
        transition: 'all 0.15s',
      }}>
        <Zap size={compact ? 12 : 14} />
        Boost {score > 0 && <span style={{ opacity: 0.7 }}>({score})</span>}
      </button>

      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
        >
          <div style={{ background:'#0d1117', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, width:'100%', maxWidth:380, position:'relative' }}>
            <button onClick={() => setOpen(false)} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}>
              <X size={18} />
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <Zap size={20} color={accent} />
              <div>
                <p style={{ fontWeight:900, color:'#f1f5f9', fontSize:18, margin:0 }}>Boost</p>
                <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', margin:0 }}>{slug}.trustbank.xyz</p>
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:16, marginBottom:20, textAlign:'center' }}>
              <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Boost Score</p>
              <p style={{ fontSize:40, fontWeight:900, color:accent, margin:0, lineHeight:1 }}>{score}</p>
              <p style={{ fontSize:11, color:'rgba(241,245,249,0.3)', margin:'4px 0 0' }}>{count} boosts received</p>
            </div>

            <div style={{ fontSize:12, color:'rgba(241,245,249,0.5)', marginBottom:20, lineHeight:1.8 }}>
              <span style={{ color:accent, fontWeight:700 }}>$0.50</span> = +1 ranking position · stays <span style={{ fontWeight:700 }}>7 days</span> then drops 150 · anyone can boost you
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>
                  Positions: <span style={{ color:accent }}>+{positions}</span>
                </span>
                <span style={{ fontSize:14, fontWeight:700, color:'#4ade80' }}>${price} USDC</span>
              </div>
              <input type="range" min={1} max={2000} value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                style={{ width:'100%', accentColor:accent }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(241,245,249,0.3)', marginTop:4 }}>
                <span>+1 ($0.50)</span><span>+2,000 ($1,000)</span>
              </div>
            </div>

            {done ? (
              <div style={{ padding:14, borderRadius:12, background:'rgba(74,222,128,0.1)', border:'0.5px solid rgba(74,222,128,0.3)', textAlign:'center', color:'#4ade80', fontWeight:700 }}>
                ⚡ Boosted +{positions} positions!
              </div>
            ) : (
              <button onClick={boost} disabled={loading} style={{
                width:'100%', padding:14, background:`linear-gradient(135deg, ${accent}, ${accent}bb)`,
                border:'none', borderRadius:12, cursor:loading?'not-allowed':'pointer',
                color:'#fff', fontWeight:800, fontSize:15,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                opacity:loading?0.7:1,
              }}>
                {loading ? <Loader2 size={18} /> : <Zap size={18} />}
                Boost +{positions} for ${price} USDC
              </button>
            )}
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(241,245,249,0.25)', marginTop:8, marginBottom:0 }}>
              Paid in USDC · Polygon · Anyone can boost
            </p>
          </div>
        </div>
      )}
    </>
  );
}
