'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function GirisPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <header className="bg-stone-50 border-b-4 border-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-3xl font-black text-red-700 tracking-tight">
            DEGALINA
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-50 border-2 border-stone-900 p-8">
          <h1 className="text-3xl font-black uppercase mb-2">Giriş Yap</h1>
          <p className="font-mono text-xs text-stone-600 mb-6">
            // Tekrar hoş geldin
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@adresin.com"
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Şifre
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-700 text-red-900 p-3 font-mono text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 text-white py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-stone-600 mt-6">
            Hesabın yok mu?{' '}
            <Link href="/kayit" className="text-red-700 hover:underline font-bold">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}