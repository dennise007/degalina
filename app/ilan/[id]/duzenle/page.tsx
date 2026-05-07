import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from './EditListingForm'
import SiteHeader from '@/app/components/SiteHeader'

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
      <SiteHeader isLoggedIn={true} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <Link href={'/ilan/' + id} className="font-mono text-xs text-stone-700 hover:text-red-700 mb-2 inline-block">
            ← Iptal
          </Link>
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2 mt-2">
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