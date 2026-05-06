'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CONDITIONS = ['MOC', 'MIB', 'Loose']
const STATUSES = [
  { value: 'active', label: 'Aktif (Yayinda)' },
  { value: 'sold', label: 'Satildi' },
  { value: 'paused', label: 'Duraklatildi' },
]

type Props = {
  listingId: string
  initialPrice: string
  initialDescription: string
  initialCondition: string
  initialStatus: string
}

export default function EditListingForm({
  listingId,
  initialPrice,
  initialDescription,
  initialCondition,
  initialStatus,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [price, setPrice] = useState(initialPrice)
  const [description, setDescription] = useState(initialDescription)
  const [condition, setCondition] = useState(initialCondition)
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: 'error', text: 'Gecerli bir fiyat gir.' })
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('listings')
      .update({
        price: priceNum,
        description,
        condition,
        status,
      })
      .eq('id', listingId)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'Ilan guncellendi.' })
    setLoading(false)
    router.refresh()

    setTimeout(() => {
      router.push('/ilan/' + listingId)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className={'border-2 p-3 font-mono text-xs ' + (message.type === 'success' ? 'bg-green-50 border-green-700 text-green-900' : 'bg-red-50 border-red-700 text-red-900')}>
          {message.text}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 bg-stone-50 border-2 border-stone-900 p-6">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Fiyat (TL)</label>
          <input
            type="number"
            required
            min="1"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Durum</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          >
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="font-mono text-[10px] text-stone-500 mt-1">
            MOC = Mint on Card, MIB = Mint in Box, Loose = Acilmis
          </p>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Yayin Durumu</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <p className="font-mono text-[10px] text-stone-500 mt-1">
            Satildi seceneginde ilan listede gozukmez ama profilinde kalir.
          </p>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider mb-1">Aciklama</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Urun hakkinda detay..."
            className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href={'/ilan/' + listingId}
            className="flex-1 bg-stone-200 text-stone-900 py-3 text-center font-black text-sm uppercase tracking-wider hover:bg-stone-300 transition border-2 border-stone-900"
          >
            Iptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-700 text-white py-3 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50 border-2 border-red-700 hover:border-stone-900"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}