import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from './components/FavoriteButton'
import SiteHeader from './components/SiteHeader'

const SERIES_OPTIONS = ['Hepsi', 'Mainline', 'Treasure Hunt', 'Super Treasure Hunt', 'Premium', 'Car Culture', 'Fast & Furious', 'Vintage']
const CONDITIONS = ['Hepsi', 'MOC', 'MIB', 'Loose']

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; series?: string; condition?: string; sort?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const series = params.series || 'Hepsi'
  const condition = params.condition || 'Hepsi'
  const sort = params.sort || 'newest'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('listings')
    .select('id, title, price, casting, series, condition, city, created_at, listing_photos (photo_url)')
    .eq('status', 'active')

  if (q) {
    query = query.or('title.ilike.%' + q + '%,casting.ilike.%' + q + '%')
  }
  if (series !== 'Hepsi') {
    query = query.eq('series', series)
  }
  if (condition !== 'Hepsi') {
    query = query.eq('condition', condition)
  }

  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: listings } = await query.limit(24)

  return (
    <div className="min-h-screen bg-stone-100">
      <SiteHeader isLoggedIn={!!user} />

      <section className="bg-stone-50 border-b-2 border-stone-900 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-mono text-xs text-stone-600 mb-3">
            <span className="text-red-700 font-bold">{listings?.length ?? 0}</span> aktif ilan
          </p>
          <form action="/" method="GET" className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Ara: '67 Camaro, STH, Datsun..."
                className="flex-1 bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
              <button type="submit" className="bg-stone-900 text-stone-50 px-6 font-black text-sm uppercase tracking-wider hover:bg-red-700 transition">
                Ara
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select name="series" defaultValue={series} className="bg-white border-2 border-stone-900 px-2 py-2 font-mono text-xs focus:outline-none focus:border-red-700">
                {SERIES_OPTIONS.map((s) => <option key={s} value={s}>{s === 'Hepsi' ? 'Tum seriler' : s}</option>)}
              </select>
              <select name="condition" defaultValue={condition} className="bg-white border-2 border-stone-900 px-2 py-2 font-mono text-xs focus:outline-none focus:border-red-700">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c === 'Hepsi' ? 'Tum durumlar' : c}</option>)}
              </select>
              <select name="sort" defaultValue={sort} className="bg-white border-2 border-stone-900 px-2 py-2 font-mono text-xs focus:outline-none focus:border-red-700">
                <option value="newest">En yeni</option>
                <option value="price_asc">Fiyat artan</option>
                <option value="price_desc">Fiyat azalan</option>
              </select>
            </div>
          </form>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-900">
          <h2 className="text-xl font-black uppercase">
            {q ? 'Arama Sonuçları' : 'Son İlanlar'}
          </h2>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-300 bg-stone-50">
            <p className="font-mono text-sm text-stone-600 mb-4">
              {q ? 'Aradigin kriterlere uygun ilan bulunamadi.' : 'Henuz ilan yok. Ilk ilani sen ver!'}
            </p>
            {user ? (
              <Link href="/ilan-ver" className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
                + Ilan Ver
              </Link>
            ) : (
              <Link href="/kayit" className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
                Once Kayit Ol
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => {
              const firstPhoto = listing.listing_photos?.[0]?.photo_url
              return (
                <div key={listing.id} className="group bg-stone-50 border-2 border-stone-900 hover:border-red-700 transition hover:-translate-y-1 relative">
                  <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton listingId={listing.id} size="sm" />
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

      <footer className="bg-stone-900 text-stone-300 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-mono text-xs">
            (c) 2026 DS Diecast Satis - Turkiye'nin Diecast Pazari
          </p>
        </div>
      </footer>
    </div>
  )
}