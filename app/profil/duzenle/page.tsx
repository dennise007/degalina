import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'
import Logo from '@/app/components/Logo'

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
      <header className="bg-stone-50 border-b-4 border-stone-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Link href="/profil" className="font-mono text-xs text-stone-700 hover:text-red-700">
            Profilim
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
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