'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FavoriteButton({
  listingId,
  initialIsFavorite = false,
  size = 'md',
}: {
  listingId: string
  initialIsFavorite?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)
  const [hasUser, setHasUser] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasUser(!!user)
      if (user) {
        supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .maybeSingle()
          .then(({ data }) => {
            setIsFavorite(!!data)
          })
      }
    })
  }, [listingId, supabase])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasUser === false) {
      router.push('/giris')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)

      if (!error) setIsFavorite(false)
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId })

      if (!error) setIsFavorite(true)
    }

    setLoading(false)
    router.refresh()
  }

  const sizes = {
    sm: { btn: 'w-7 h-7', icon: 14 },
    md: { btn: 'w-10 h-10', icon: 20 },
    lg: { btn: 'w-12 h-12', icon: 24 },
  }
  const s = sizes[size]

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorite ? 'Favorilerden cikar' : 'Favorilere ekle'}
      className={'flex items-center justify-center ' + s.btn + ' bg-white border-2 border-stone-900 hover:bg-red-50 transition disabled:opacity-50'}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill={isFavorite ? '#DC2626' : 'none'}
        stroke={isFavorite ? '#DC2626' : '#1C1917'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}