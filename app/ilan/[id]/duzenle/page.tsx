import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from './EditListingForm'

export default async function IlanDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id, title, price, description, condition, status')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  if (listing.user_id !== user.id) {
    redirect('/ilan/' + id)
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-3xl font-black text-red-700 tracking-tight">
            DEGALINA
          </Link>
          <Link href={'/ilan/' + id} className="font-mono text-xs text-stone-700 hover:text-red-700">
            Iptal / Geri Don
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
            // Ilani Duzenle
          </p>
          <h1 className="text-3xl font-black uppercase">{listing.title}</h1>
        </div>

        <EditListingForm
          listingId={listing.id}
          initialPrice={String(listing.price)}
          initialDescription={listing.description || ''}
          initialCondition={listing.condition}
          initialStatus={listing.status}
        />
      </main>
    </div>
  )
}