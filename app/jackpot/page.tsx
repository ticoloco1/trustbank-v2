'use client';
import { Navbar } from '@/components/layout/Navbar';
export default function Page() {
  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'80px 24px', textAlign:'center' }}>
        <h1 style={{ fontSize:40, fontWeight:900 }}>Coming Soon</h1>
        <p style={{ color:'rgba(241,245,249,0.4)', marginTop:12 }}>This page is under construction</p>
      </div>
    </div>
  );
}
