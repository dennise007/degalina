import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, price, casting, series, condition, city, created_at,
      listing_photos (photo_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black text-red-700 tracking-tight">
            DEGALINA
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/ilan-ver"
                  className="bg-red-700 text-white px-4 py-2 font-bold text-sm uppercase tracking-wider hover:bg-stone-900 transition border-2 border-red-700 hover:border-stone-900"
                >
                  + İlan Ver
                </Link>
                <Link href="/profil" className="text-sm font-mono text-stone-700 hover:text-red-700">
                  Profilim
                </Link>
              </>
            ) : (
              <>
                <Link href="/giris" className="text-sm font-mono text-stone-700 hover:text-red-700">
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className="bg-stone-900 text-stone-50 px-4 py-2 font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="bg-stone-900 text-stone-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2">
            // Türkiye'nin Diecast Pazarı
          </p>
          <h1 className="text-5xl font-black mb-4">
            Hot Wheels koleksiyonun değer bulduğu yer.
          </h1>
          <p className="font-mono text-sm text-stone-400">
            {listings?.length ?? 0} aktif ilan
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-stone-900">
          <h2 className="text-xl font-black uppercase">Son İlanlar</h2>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-300 bg-stone-50">
            <p className="font-mono text-sm text-stone-600 mb-4">
              Henüz ilan yok. İlk ilanı sen ver!
            </p>
            {user ? (
              <Link
                href="/ilan-ver"
                className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition"
              >
                + İlan Ver
              </Link>
            ) : (
              <Link
                href="/kayit"
                className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition"
              >
                Önce Kayıt Ol
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => {
              const firstPhoto = listing.listing_photos?.[0]?.photo_url
              return (
                <Link
                  key={listing.id}
                  href={`/ilan/${listing.id}`}
                  className="group bg-stone-50 border-2 border-stone-900 hover:border-red-700 transition hover:-translate-y-1 block"
                >
                  <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden relative">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-mono">
                        Fotoğraf yok
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-black text-sm truncate">{listing.title}</h3>
                    <p className="font-mono text-xs text-stone-600 truncate mt-1">
                      {listing.series} · {listing.condition}
                    </p>
                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-stone-300">
                      <p className="text-2xl font-black text-red-700 leading-none">
                        {Number(listing.price).toLocaleString('tr-TR')}
                        <span className="text-sm ml-0.5">₺</span>
                      </p>
                      <p className="font-mono text-[10px] text-stone-500">{listing.city}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <footer className="bg-stone-900 text-stone-300 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-mono text-xs">© 2026 DEGALINA · Türkiye'nin Diecast Pazarı</p>
        </div>
      </footer>
    </div>
  )
}