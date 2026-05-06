'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StartChatButton({
  listingId,
  sellerId,
  isLoggedIn,
}: {
  listingId: string
  sellerId: string
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push('/giris')
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }

    // Mevcut sohbet var mı kontrol et
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .maybeSingle()

    if (existing) {
      router.push('/mesajlar/' + existing.id)
      return
    }

    // Yeni sohbet oluştur
    const { data: newConvo, error: insertError } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select('id')
      .single()

    if (insertError) {
      setError('Sohbet baslatilamadi: ' + insertError.message)
      setLoading(false)
      return
    }

    if (newConvo) {
      router.push('/mesajlar/' + newConvo.id)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="block w-full bg-stone-900 text-stone-50 py-4 text-center font-black text-sm uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? 'Baglaniyor...' : '💬 Saticiya Mesaj Gonder'}
      </button>
      {error ? (
        <p className="font-mono text-xs text-red-700 mt-2">{error}</p>
      ) : null}
    </>
  )
}