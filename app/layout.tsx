import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DS Diecast Satis - Turkiye\'nin Diecast Pazari',
  description: 'Hot Wheels ve diecast koleksiyonun deger buldugu yer. Turkiye\'nin diecast pazaryeri.',
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
      </head>
      <body className="notranslate">{children}</body>
    </html>
  )
}