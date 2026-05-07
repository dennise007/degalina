import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://diecastsatis.com'),
  title: {
    default: 'DS Diecast Satış · Türkiye\'nin Diecast Pazarı',
    template: '%s | DS Diecast Satış',
  },
  description: 'Hot Wheels, Matchbox ve diecast koleksiyonun değer bulduğu yer. Türkiye\'nin diecast alış-satış platformu. STH, Premium, Treasure Hunt ve daha fazlası.',
  keywords: ['hot wheels', 'diecast', 'koleksiyon', 'sth', 'super treasure hunt', 'matchbox', 'tomica', 'hot wheels türkiye', 'diecast satış', 'diecast türkiye', 'oyuncak araba', 'die cast'],
  authors: [{ name: 'DS Diecast Satış' }],
  creator: 'DS Diecast Satış',
  publisher: 'DS Diecast Satış',
  applicationName: 'DS Diecast Satış',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo-square.png', type: 'image/png' },
    ],
    apple: '/logo-square.png',
    shortcut: '/logo-square.png',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://diecastsatis.com',
    siteName: 'DS Diecast Satış',
    title: 'DS Diecast Satış · Türkiye\'nin Diecast Pazarı',
    description: 'Hot Wheels, Matchbox ve diecast koleksiyonun değer bulduğu yer. Türkiye\'nin diecast alış-satış platformu.',
    images: [
      {
        url: 'https://diecastsatis.com/logo-square.png',
        width: 1200,
        height: 630,
        alt: 'DS Diecast Satış',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DS Diecast Satış · Türkiye\'nin Diecast Pazarı',
    description: 'Hot Wheels koleksiyonun değer bulduğu yer.',
    images: ['https://diecastsatis.com/logo-square.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://diecastsatis.com',
  },
  category: 'shopping',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body className="notranslate">{children}</body>
    </html>
  )
}