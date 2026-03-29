import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#f1f5f9' }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Page not found</h2>
      <p style={{ color: 'rgba(241,245,249,0.4)', marginBottom: 24 }}>This page does not exist.</p>
      <Link href="/" style={{ padding: '12px 24px', borderRadius: 10, background: '#818cf8', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Go Home</Link>
    </div>
  );
}
