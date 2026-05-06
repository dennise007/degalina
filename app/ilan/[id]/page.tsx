import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/app/components/Logo'

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
      <div style={{ padding: 40 }}>
        <h1>Ilan bulunamadi</h1>
      </div>
    )
  }

  const isOwner = user && user.id === listing.user_id

  const phoneClean = listing.contact_phone ? listing.contact_phone.replace(/\D/g, '') : ''
  let whatsappLink = ''
  if (phoneClean) {
    const intl = phoneClean.startsWith('0') ? '90' + phoneClean.slice(1) : phoneClean
    const text = encodeURIComponent('Merhaba, ' + listing.title + ' ilani hakkinda bilgi almak istiyorum.')
    whatsappLink = 'https://wa.me/' + intl + '?text=' + text
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Link href="/" className="font-mono text-xs text-stone-700 hover:text-red-700">
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          {photos && photos.length > 0 ? (
            <div className="aspect-square border-2 border-stone-900 bg-stone-200 overflow-hidden">
              <img src={photos[0].photo_url} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square border-2 border-stone-900 bg-stone-200 flex items-center justify-center font-mono text-xs text-stone-500">
              Fotograf yok
            </div>
          )}

          {photos && photos.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(1).map(function(p, i) {
                return (
                  <div key={i} className="aspect-square border-2 border-stone-900 bg-stone-200 overflow-hidden">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

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

          <div>
            <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-1">
              {listing.series} - {listing.condition}
            </p>
            <h1 className="text-3xl font-black leading-tight">{listing.title}</h1>
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

          {whatsappLink && listing.status === 'active' ? (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-white py-4 text-center font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
              WhatsApp ile Iletisime Gec
            </a>
          ) : null}
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