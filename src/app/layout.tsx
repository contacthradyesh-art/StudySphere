import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { PwaInit } from '@/components/pwa-init';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
// Sora carries the headings — a confident, slightly geometric display face
// (used sparingly, at heading weights only) so titles and XP/streak numbers
// read as a deliberate brand choice instead of the same system-ui look as
// the body copy. Body text stays on Inter for maximum readability.
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] });

export const metadata: Metadata = {
  title: 'StudySphere - AI Student Productivity',
  description: 'Plan, focus, and study smarter with StudySphere.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'StudySphere' }
};

export const viewport: Viewport = {
  themeColor: '#6d28d9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-center" />
          <PwaInit />
        </ThemeProvider>
      </body>
    </html>
  );
}