import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { LangProvider } from '@/hooks/useLang';
import { CartProvider } from '@/hooks/useCart';

export const metadata: Metadata = {
  title: 'TrustBank — Mini Sites · Slugs · USDC',
  description: 'Create your mini site, own your slug, get paid in USDC on Polygon.',
  metadataBase: new URL('https://trustbank.xyz'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LangProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
