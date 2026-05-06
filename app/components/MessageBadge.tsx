'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MessageBadge() {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const checkUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoggedIn(false)
        return
      }
      setIsLoggedIn(true)

      // Kullanıcının dahil olduğu konuşmaları bul
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)

      if (!convos || convos.length === 0) {
        setUnreadCount(0)
        return
      }

      const convoIds = convos.map((c) => c.id)

      // Okunmamış + benim göndermediğim mesajları say
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convoIds)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      setUnreadCount(count || 0)
    }

    checkUnread()

    // Her 30 saniyede bir kontrol et
    const interval = setInterval(checkUnread, 30000)
    return () => clearInterval(interval)
  }, [supabase])

  if (isLoggedIn !== true) return null

  return (
    <Link
      href="/profil/mesajlar"
      className="relative inline-flex items-center justify-center w-10 h-10 bg-stone-50 border-2 border-stone-900 hover:border-red-700 hover:bg-red-50 transition"
      aria-label="Mesajlar"
      title="Mesajlarim"
    >
      <span className="text-lg leading-none">💬</span>
      {unreadCount > 0 ? (
        <span
          className="absolute -top-2 -right-2 bg-red-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-stone-50 min-w-[20px] text-center leading-tight"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}