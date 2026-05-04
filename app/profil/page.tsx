import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteListingButton from './DeleteListingButton'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myListings } = await supabase
    .from('listings')
    .select('id, title, price, city, status, created_at, listing_photos (photo_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black text-red-700 tracking-tight">
            DEGALINA
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/ilan-ver" className="bg-red-700 text-white px-4 py-2 font-bold text-sm uppercase tracking-wider hover:bg-stone-900 transition border-2 border-red-700 hover:border-stone-900">
              + Ilan Ver
            </Link>
            <form action="/auth/cikis" method="POST">
              <button className="font-mono text-xs text-stone-700 hover:text-red-700">
                Cikis
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 pb-4 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
            // Profilim
          </p>
          <h1 className="text-4xl font-black uppercase mb-2">
            @{profile?.username || 'kullanici'}
          </h1>
          <p className="font-mono text-xs text-stone-600">
            {user.email} - {myListings?.length ?? 0} aktif ilan
          </p>
          <div className="mt-3">
            <Link href="/profil/duzenle" className="inline-block bg-stone-900 text-stone-50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider hover:bg-red-700 transition">
              Profili Duzenle
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-black uppercase mb-4">Ilanlarim</h2>
          {!myListings || myListings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-stone-300 bg-stone-50">
              <p className="font-mono text-sm text-stone-600 mb-4">
                Henuz ilan vermedin
              </p>
              <Link href="/ilan-ver" className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
                + Ilk Ilanini Ver
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myListings.map((listing) => {
                const firstPhoto = listing.listing_photos?.[0]?.photo_url
                return (
                  <div key={listing.id} className="bg-stone-50 border-2 border-stone-900 flex">
                    <Link href={'/ilan/' + listing.id} className="w-32 h-32 bg-stone-200 flex-shrink-0 overflow-hidden">
                      {firstPhoto ? (
                        <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px] font-mono">
                          Fotograf yok
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <Link href={'/ilan/' + listing.id}>
                          <h3 className="font-black text-sm leading-tight hover:text-red-700 transition">
                            {listing.title}
                          </h3>
                        </Link>
                        <p className="font-mono text-[10px] text-stone-500 mt-1">
                          {listing.city} - {listing.status}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-xl font-black text-red-700 leading-none">
                          {Number(listing.price).toLocaleString('tr-TR')} TL
                        </p>
                        <DeleteListingButton listingId={listing.id} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}