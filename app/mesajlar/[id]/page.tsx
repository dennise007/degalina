import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatRoom from './ChatRoom'
import SiteHeader from '@/app/components/SiteHeader'

export default async function SohbetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: convo } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (!convo) notFound()

  if (convo.buyer_id !== user.id && convo.seller_id !== user.id) {
    redirect('/profil/mesajlar')
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, price, status')
    .eq('id', convo.listing_id)
    .single()

  const { data: photos } = await supabase
    .from('listing_photos')
    .select('photo_url')
    .eq('listing_id', convo.listing_id)
    .order('position', { ascending: true })
    .limit(1)

  const firstPhoto = photos && photos.length > 0 ? photos[0].photo_url : null

  const otherUserId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', otherUserId)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', id)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <SiteHeader isLoggedIn={true} />

      <div className="bg-stone-50 border-b-2 border-stone-900">
        <div className="max-w-3xl mx-auto px-4 py-2">
          <Link href="/profil/mesajlar" className="font-mono text-xs text-stone-700 hover:text-red-700">
            ← Sohbetler
          </Link>
        </div>
      </div>

      {listing ? (
        <Link
          href={'/ilan/' + listing.id}
          className="block bg-stone-50 border-b-2 border-stone-900 hover:bg-stone-100 transition"
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <div
              className="bg-stone-200 border-2 border-stone-900 flex-shrink-0 overflow-hidden"
              style={{ width: 48, height: 48 }}
            >
              {firstPhoto ? (
                <img
                  src={firstPhoto}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-stone-500">
                  Yok
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate">{listing.title}</p>
              <p className="font-mono text-[10px] text-red-700">
                {Number(listing.price).toLocaleString('tr-TR')} TL
                {listing.status !== 'active' ? (
                  <span className="ml-2 bg-stone-900 text-stone-50 px-1.5 py-0.5 uppercase">
                    {listing.status === 'sold' ? 'Satildi' : 'Yayinda degil'}
                  </span>
                ) : null}
              </p>
            </div>
            <p className="font-mono text-[10px] text-stone-600">
              @{otherProfile?.username || 'kullanici'}
            </p>
          </div>
        </Link>
      ) : null}

      <ChatRoom
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages || []}
      />
    </div>
  )
}