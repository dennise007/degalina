'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MessageBadge from './MessageBadge'

type Props = {
  isLoggedIn: boolean
}

export default function SiteHeader({ isLoggedIn }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="bg-stone-900 sticky top-0 z-30 border-b-4 border-red-700 transition-all duration-300"
      style={{ paddingTop: scrolled ? 6 : 12, paddingBottom: scrolled ? 6 : 12 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          <Link href="/" className="flex-shrink-0 logo-flame">
            <div style={{ transition: 'all 0.3s ease', height: scrolled ? 64 : 128 }}>
              <img
                src="/logo.png"
                alt="DS Diecast Satis"
                style={{ height: '100%', width: 'auto', display: 'block' }}
              />
            </div>
          </Link>

          <div className="hidden sm:block min-w-0 flex-1">
            <p
              className="font-mono uppercase tracking-widest text-amber-400 truncate transition-all duration-300"
              style={{ fontSize: scrolled ? 11 : 16 }}
            >
              // Türkiye'nin Diecast Pazarı
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 flex-shrink-0">
          {isLoggedIn ? (
            <>
              <Link
                href="/ilan-ver"
                className="bg-red-700 text-white px-3 py-2 font-bold uppercase tracking-wider hover:bg-red-600 transition border-2 border-red-700 hover:border-red-500 whitespace-nowrap"
                style={{ fontSize: 11 }}
              >
                <span className="hidden sm:inline">+ İLAN VER</span>
                <span className="sm:hidden">+ İLAN</span>
              </Link>
              <MessageBadge />
              <Link
                href="/profil"
                className="font-mono text-stone-300 hover:text-red-500 px-2 whitespace-nowrap"
                style={{ fontSize: 11 }}
              >
                Profilim
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/giris"
                className="font-mono text-stone-300 hover:text-red-500 px-2 whitespace-nowrap"
                style={{ fontSize: 11 }}
              >
                Giriş
              </Link>
              <Link
                href="/kayit"
                className="bg-red-700 text-white px-3 py-2 font-bold uppercase tracking-wider hover:bg-red-600 transition whitespace-nowrap"
                style={{ fontSize: 11 }}
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}