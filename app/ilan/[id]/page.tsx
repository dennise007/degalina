import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from '@/app/components/FavoriteButton'
import PhotoGallery from '@/app/components/PhotoGallery'
import StartChatButton from '@/app/components/StartChatButton'
import SiteHeader from '@/app/components/SiteHeader'

export default async function IlanDetayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  const { data: photos } = await supabase
    .from('listing_photos')
    .select('photo_url, position')
    .eq('listing_id', id)
    .order('position', { ascending: true })

  let profile = null
  if (listing) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, city')
      .eq('id', listing.user_id)
      .single()
    profile = profileData
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-stone-100">
        <SiteHeader isLoggedIn={!!user} />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-black">Ilan bulunamadi</h1>
        </main>
      </div>
    )
  }

  const isOwner = user && user.id === listing.user_id

  return (
    <div className="min-h-screen bg-stone-100">
      <SiteHeader isLoggedIn={!!user} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Link href="/" className="font-mono text-xs text-stone-700 hover:text-red-700 mb-4 inline-block">
          ← Ana Sayfa
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mt-2">
          <PhotoGallery photos={photos || []} alt={listing.title} />

          <div className="space-y-4">
            {isOwner ? (
              <div className="bg-amber-100 border-2 border-amber-700 p-3 flex items-center justify-between">
                <p className="font-mono text-xs text-amber-900">
                  // Bu senin ilanin
                </p>
                <Link href={'/ilan/' + listing.id + '/duzenle'} className="bg-stone-900 text-stone-50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-red-700 transition">
                  Duzenle
                </Link>
              </div>
            ) : null}

            {listing.status !== 'active' ? (
              <div className="bg-red-100 border-2 border-red-700 p-3">
                <p className="font-mono text-xs text-red-900 uppercase font-black">
                  {listing.status === 'sold' ? 'Satildi' : 'Yayindan kaldirildi'}
                </p>
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-1">
                  {listing.series} - {listing.condition}
                </p>
                <h1 className="text-3xl font-black leading-tight">{listing.title}</h1>
              </div>
              {!isOwner ? (
                <FavoriteButton listingId={listing.id} size="lg" />
              ) : null}
            </div>

            <p className="text-5xl font-black text-red-700">
              {Number(listing.price).toLocaleString('tr-TR')} TL
            </p>

            <div className="border-2 border-stone-900 bg-stone-50">
              {listing.casting ? <SpecRow label="Casting" value={listing.casting} /> : null}
              {listing.series_year ? <SpecRow label="Yil" value={String(listing.series_year)} /> : null}
              {listing.car_color ? <SpecRow label="Renk" value={listing.car_color} /> : null}
              {listing.wheel_type ? <SpecRow label="Tekerlek" value={listing.wheel_type} /> : null}
              <SpecRow label="Sehir" value={listing.city} />
              <SpecRow label="Satici" value={'@' + (profile && profile.username ? profile.username : 'kullanici')} />
            </div>

            {listing.description ? (
              <div className="border-2 border-stone-900 bg-stone-50 p-4">
                <p className="font-mono text-xs text-stone-600 uppercase tracking-wider mb-2">
                  Aciklama
                </p>
                <p className="font-mono text-sm whitespace-pre-wrap">{listing.description}</p>
              </div>
            ) : null}

            {!isOwner && listing.status === 'active' ? (
              <div className="space-y-2">
                <StartChatButton
                  listingId={listing.id}
                  sellerId={listing.user_id}
                  isLoggedIn={!!user}
                />
                <p className="font-mono text-[10px] text-stone-500 text-center">
                  // Guvenligin icin tum iletisim site uzerinden saglanir
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b-2 border-stone-900 last:border-b-0">
      <div className="w-1/3 bg-stone-900 text-stone-50 px-3 py-2 font-mono text-xs uppercase tracking-wider">
        {label}
      </div>
      <div className="flex-1 px-3 py-2 font-mono text-sm">{value}</div>
    </div>
  )
}