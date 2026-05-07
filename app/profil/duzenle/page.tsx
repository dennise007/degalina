import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import SiteHeader from '@/app/components/SiteHeader'

export default async function ProfilDuzenlePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/giris')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-stone-100">
      <SiteHeader isLoggedIn={true} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <Link href="/profil" className="font-mono text-xs text-stone-700 hover:text-red-700 mb-2 inline-block">
            ← Profilime Don
          </Link>
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2 mt-2">
            // Profil Duzenle
          </p>
          <h1 className="text-3xl font-black uppercase">Bilgilerim</h1>
        </div>

        <ProfileForm
          email={user.email || ''}
          initialUsername={profile?.username || ''}
          initialFullName={profile?.full_name || ''}
          initialPhone={profile?.phone || ''}
          initialWhatsapp={profile?.whatsapp || ''}
          initialCity={profile?.city || ''}
          initialBio={profile?.bio || ''}
        />
      </main>
    </div>
  )
}