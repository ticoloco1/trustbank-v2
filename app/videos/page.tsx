'use client';
import { Navbar } from '@/components/layout/Navbar';
export default function Page() {
  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:800, margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:16 }}>Coming Soon</h1>
        <p style={{ color:'rgba(241,245,249,0.4)' }}>This page is under construction.</p>
      </div>
    </div>
  );
}
