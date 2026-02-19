import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'VakmanApp — Werkbon & Factuur App voor Nederlandse Vakmannen',
    template: '%s | VakmanApp',
  },
  description: 'De Nederlandse job management app voor loodgieters, elektriciens, schilders en installateurs. Digitale werkbonnen, iDEAL facturen, planning — alles in één app.',
  keywords: ['vakman app NL', 'werkbon app loodgieter', 'opdrachten app installateur', 'factureren vakman Nederland', 'job management software NL', 'digitale werkbon', 'iDEAL factuur'],
  authors: [{ name: 'AIOW BV' }],
  creator: 'AIOW BV',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vakmanapp.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://vakmanapp.nl',
    title: 'VakmanApp — Job Management voor Nederlandse Vakmannen',
    description: 'Digitale werkbonnen, snelfactuur met iDEAL, planning en klantbeheer. Speciaal voor NL vakmannen.',
    siteName: 'VakmanApp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VakmanApp — Job Management voor Nederlandse Vakmannen',
    description: 'Digitale werkbonnen, snelfactuur met iDEAL, planning en klantbeheer.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-text antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,30,0.95)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  )
}
