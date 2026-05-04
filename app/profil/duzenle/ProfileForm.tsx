'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  email: string
  initialUsername: string
  initialFullName: string
  initialPhone: string
  initialWhatsapp: string
  initialCity: string
  initialBio: string
}

export default function ProfileForm({
  email,
  initialUsername,
  initialFullName,
  initialPhone,
  initialWhatsapp,
  initialCity,
  initialBio,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState(initialUsername)
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp)
  const [city, setCity] = useState(initialCity)
  const [bio, setBio] = useState(initialBio)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage({ type: 'error', text: 'Oturum sona erdi, tekrar giris yap.' })
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        phone,
        whatsapp,
        city,
        bio,
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'Profil guncellendi.' })
    setLoading(false)
    router.refresh()
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Sifre en az 6 karakter olmali.' })
      return
    }
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'Sifre guncellendi.' })
    setNewPassword('')
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {message ? (
        <div className={'border-2 p-3 font-mono text-xs ' + (message.type === 'success' ? 'bg-green-50 border-green-700 text-green-900' : 'bg-red-50 border-red-700 text-red-900')}>
          {message.text}
        </div>
      ) : null}

      <form onSubmit={handleProfileSubmit} className="space-y-4 bg-stone-50 border-2 border-stone-900 p-6">
        <div>
          <p className="font-mono text-xs text-stone-600 uppercase tracking-wider mb-1">Email (degisemez)</p>
          <p className="font-mono text-sm text-stone-500">{email}</p>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Kullanici Adi</label>
          <input
            type="text"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">WhatsApp</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Sehir</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Istanbul"
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Koleksiyonum hakkinda kisa bilgi..."
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-700 text-white py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
        </button>
      </form>

      <form onSubmit={handlePasswordChange} className="space-y-4 bg-stone-50 border-2 border-stone-900 p-6">
        <p className="font-mono text-xs text-red-700 uppercase tracking-wider">// Sifre Degistir</p>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Yeni Sifre</label>
          <input
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="En az 6 karakter"
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword}
          className="w-full bg-stone-900 text-stone-50 py-3 font-black text-sm uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Guncelleniyor...' : 'Sifreyi Degistir'}
        </button>
      </form>
    </div>
  )
}