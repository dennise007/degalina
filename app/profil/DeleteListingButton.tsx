'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu ilani silmek istediginden emin misin?')) return
    setLoading(true)

    // Önce fotoğrafları storage'dan sil
    const { data: photos } = await supabase
      .from('listing_photos')
      .select('photo_url')
      .eq('listing_id', listingId)

    if (photos) {
      const paths = photos.map((p) => {
        const url = p.photo_url
        const idx = url.indexOf('listing-photos/')
        return idx >= 0 ? url.slice(idx + 'listing-photos/'.length) : null
      }).filter(Boolean) as string[]

      if (paths.length > 0) {
        await supabase.storage.from('listing-photos').remove(paths)
      }
    }

    // Sonra ilanı sil (cascade ile photos otomatik gider)
    const { error } = await supabase.from('listings').delete().eq('id', listingId)

    if (error) {
      alert('Hata: ' + error.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="font-mono text-[10px] text-stone-500 hover:text-red-700 underline disabled:opacity-50"
    >
      {loading ? 'siliniyor...' : 'sil'}
    </button>
  )
}