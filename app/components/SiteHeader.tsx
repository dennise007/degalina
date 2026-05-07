'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MessageBadge from './MessageBadge'

type Props = {
  isLoggedIn: boolean
}

export default function SiteHeader({ isLoggedIn }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    checkSize()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkSize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkSize)
    }
  }, [])

  return (
    <header
      className="bg-stone-900 sticky top-0 z-30 border-b-4 border-red-700 transition-all duration-300 notranslate"
      translate="no"
      style={{ paddingTop: scrolled ? 6 : 12, paddingBottom: scrolled ? 6 : 12 }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 12, paddingRight: 12 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          <Link href="/" style={{ flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="DS Diecast Satis"
              style={{
                height: scrolled ? 40 : (isMobile ? 60 : 80),
                width: 'auto',
                display: 'block',
                maxWidth: '60vw',
                objectFit: 'contain',
                transition: 'all 0.3s ease',
              }}
            />
          </Link>

          {!isMobile ? (
            <p
              translate="no"
              className="notranslate"
              style={{
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#fbbf24',
                flex: 1,
                fontSize: scrolled ? 11 : 14,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.3s ease',
              }}
            >
              // Türkiye'nin Diecast Pazarı
            </p>
          ) : null}

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {isLoggedIn ? (
              <>
                <Link
                  href="/ilan-ver"
                  style={{
                    background: '#b91c1c',
                    color: 'white',
                    padding: isMobile ? '6px 8px' : '8px 12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    border: '2px solid #b91c1c',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMobile ? '+ İLAN' : '+ İLAN VER'}
                </Link>
                <MessageBadge />
                <Link
                  href="/profil"
                  style={{
                    fontFamily: 'monospace',
                    color: '#d1d5db',
                    fontSize: 11,
                    padding: '0 4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Profilim
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  style={{
                    fontFamily: 'monospace',
                    color: '#d1d5db',
                    fontSize: 11,
                    padding: '0 4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  style={{
                    background: '#b91c1c',
                    color: 'white',
                    padding: isMobile ? '6px 8px' : '8px 12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMobile ? 'Kayıt' : 'Kayıt Ol'}
                </Link>
              </>
            )}
          </nav>
        </div>

        {isMobile && !scrolled ? (
          <p
            translate="no"
            className="notranslate"
            style={{
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#fbbf24',
              fontSize: 10,
              margin: '4px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            // Türkiye'nin Diecast Pazarı
          </p>
        ) : null}

      </div>
    </header>
  )
}