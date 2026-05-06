import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/app/components/Logo'
import FavoriteButton from '@/app/components/FavoriteButton'
import MessageBadge from '@/app/components/MessageBadge'

export default async function FavorilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: favorites } = await supabase
    .from('favorites')
    .select('listing_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listingIds = (favorites || []).map((f) => f.listing_id)

  let listings: any[] = []
  if (listingIds.length > 0) {
    const { data } = await supabase
      .from('listings')
      .select('id, title, price, series, condition, city, status, listing_photos (photo_url)')
      .in('id', listingIds)
    listings = data || []
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
        <div className="flex items-center gap-3">
  <MessageBadge />
  <Link href="/profil" className="font-mono text-xs text-stone-700 hover:text-red-700">
    Profilim
  </Link>
</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 pb-4 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
            // Favorilerim
          </p>
          <h1 className="text-3xl font-black uppercase mb-2">
            Begendigim Ilanlar
          </h1>
          <p className="font-mono text-xs text-stone-600">
            {listings.length} ilan
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-300 bg-stone-50">
            <p className="font-mono text-sm text-stone-600 mb-4">
              Henuz favori ilanin yok.
            </p>
            <p className="font-mono text-xs text-stone-500 mb-4">
              Begendigin ilanlari kalp ikonuyla favorilere ekle.
            </p>
            <Link href="/" className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
              Ilanlara Goz At
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => {
              const firstPhoto = listing.listing_photos?.[0]?.photo_url
              return (
                <div key={listing.id} className="group bg-stone-50 border-2 border-stone-900 hover:border-red-700 transition hover:-translate-y-1 relative">
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton listingId={listing.id} initialIsFavorite={true} size="sm" />
                  </div>
                  <Link href={'/ilan/' + listing.id} className="block">
                    <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
                      {firstPhoto ? (
                        <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-mono">
                          Fotograf yok
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-black text-sm truncate">{listing.title}</h3>
                      <p className="font-mono text-xs text-stone-600 truncate mt-1">
                        {listing.series} - {listing.condition}
                      </p>
                      {listing.status !== 'active' ? (
                        <p className="font-mono text-[10px] text-red-700 font-black uppercase mt-1">
                          {listing.status === 'sold' ? 'Satildi' : 'Yayinda degil'}
                        </p>
                      ) : null}
                      <div className="flex items-end justify-between mt-2 pt-2 border-t border-stone-300">
                        <p className="text-2xl font-black text-red-700 leading-none">
                          {Number(listing.price).toLocaleString('tr-TR')}
                          <span className="text-sm ml-0.5">TL</span>
                        </p>
                        <p className="font-mono text-[10px] text-stone-500">{listing.city}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}