import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/app/components/SiteHeader'

export default async function MesajlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, listing_id, buyer_id, seller_id, last_message_at')
    .or('buyer_id.eq.' + user.id + ',seller_id.eq.' + user.id)
    .order('last_message_at', { ascending: false })

  const listingIds = (conversations || []).map((c) => c.listing_id)
  const otherUserIds = (conversations || []).map((c) =>
    c.buyer_id === user.id ? c.seller_id : c.buyer_id
  )
  const conversationIds = (conversations || []).map((c) => c.id)

  const { data: listings } = listingIds.length > 0
    ? await supabase
        .from('listings')
        .select('id, title, price')
        .in('id', listingIds)
    : { data: [] }

  const { data: photos } = listingIds.length > 0
    ? await supabase
        .from('listing_photos')
        .select('listing_id, photo_url, position')
        .in('listing_id', listingIds)
        .order('position', { ascending: true })
    : { data: [] }

  const { data: profiles } = otherUserIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username')
        .in('id', otherUserIds)
    : { data: [] }

  const { data: lastMessages } = conversationIds.length > 0
    ? await supabase
        .from('messages')
        .select('conversation_id, content, photo_url, created_at, sender_id, is_read')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const listingMap = new Map((listings || []).map((l) => [l.id, l]))
  const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

  const firstPhotoMap = new Map<string, string>()
  for (const p of photos || []) {
    if (!firstPhotoMap.has(p.listing_id)) {
      firstPhotoMap.set(p.listing_id, p.photo_url)
    }
  }

  const lastMessageByConvo = new Map<string, any>()
  const unreadCountByConvo = new Map<string, number>()
  for (const msg of lastMessages || []) {
    if (!lastMessageByConvo.has(msg.conversation_id)) {
      lastMessageByConvo.set(msg.conversation_id, msg)
    }
    if (!msg.is_read && msg.sender_id !== user.id) {
      unreadCountByConvo.set(
        msg.conversation_id,
        (unreadCountByConvo.get(msg.conversation_id) || 0) + 1
      )
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <SiteHeader isLoggedIn={true} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <Link href="/profil" className="font-mono text-xs text-stone-700 hover:text-red-700 mb-2 inline-block">
            ← Profilime Don
          </Link>
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2 mt-2">
            // Mesajlarim
          </p>
          <h1 className="text-3xl font-black uppercase">Sohbetler</h1>
          <p className="font-mono text-xs text-stone-600 mt-1">
            {conversations?.length ?? 0} sohbet
          </p>
        </div>

        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-stone-300 bg-stone-50">
            <p className="font-mono text-sm text-stone-600 mb-2">
              Henuz mesajin yok.
            </p>
            <p className="font-mono text-xs text-stone-500 mb-4">
              Bir ilana goz at ve saticiya mesaj at.
            </p>
            <Link href="/" className="inline-block bg-red-700 text-white px-6 py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition">
              Ilanlara Goz At
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              const otherUserId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id
              const otherProfile = profileMap.get(otherUserId)
              const listing = listingMap.get(convo.listing_id)
              const lastMsg = lastMessageByConvo.get(convo.id)
              const unread = unreadCountByConvo.get(convo.id) || 0
              const firstPhoto = firstPhotoMap.get(convo.listing_id)
              const isYouSender = lastMsg?.sender_id === user.id
              const isBuyer = convo.buyer_id === user.id

              return (
                <Link
                  key={convo.id}
                  href={'/mesajlar/' + convo.id}
                  className="block bg-stone-50 border-2 border-stone-900 hover:border-red-700 transition p-3"
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className="bg-stone-200 border-2 border-stone-900 flex-shrink-0 overflow-hidden"
                      style={{ width: 64, height: 64 }}
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm truncate">
                            @{otherProfile?.username || 'kullanici'}
                            <span className={'ml-2 font-mono text-[9px] px-1.5 py-0.5 uppercase ' + (isBuyer ? 'bg-stone-900 text-stone-50' : 'bg-red-700 text-white')}>
                              {isBuyer ? 'Alici' : 'Satici'}
                            </span>
                          </p>
                          <p className="font-mono text-[10px] text-stone-600 truncate">
                            {(listing as any)?.title || 'Ilan kaldirildi'}
                          </p>
                        </div>
                        {unread > 0 ? (
                          <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                            {unread}
                          </span>
                        ) : null}
                      </div>

                      {lastMsg ? (
                        <p className={'mt-1 text-xs font-mono truncate ' + (unread > 0 && !isYouSender ? 'font-bold text-stone-900' : 'text-stone-600')}>
                          {isYouSender ? 'Sen: ' : ''}
                          {lastMsg.photo_url && !lastMsg.content ? '📷 Fotograf' : (lastMsg.content || '')}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs font-mono text-stone-400 italic">
                          Henuz mesaj yok
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}