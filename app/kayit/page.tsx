'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'

export default function KayitPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/profil')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Link href="/giris" className="font-mono text-xs text-stone-700 hover:text-red-700">
            Giris
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
            // Yeni Hesap
          </p>
          <h1 className="text-3xl font-black uppercase">Kayit Ol</h1>
        </div>

        {error ? (
          <div className="border-2 border-red-700 bg-red-50 text-red-900 p-3 font-mono text-xs mb-4">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 bg-stone-50 border-2 border-stone-900 p-6">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">Kullanici Adi</label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="dieyast_kralı"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">Sifre</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50"
          >
            {loading ? 'Kayit yapiliyor...' : 'Kayit Ol'}
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-center text-stone-600">
          Zaten hesabin var mi?{' '}
          <Link href="/giris" className="text-red-700 hover:underline">
            Giris yap
          </Link>
        </p>
      </main>
    </div>
  )
}