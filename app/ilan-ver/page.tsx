'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/app/components/Logo'
import MessageBadge from '@/app/components/MessageBadge'

const SERIES_OPTIONS = [
  'Mainline',
  'Treasure Hunt',
  'Super Treasure Hunt',
  'Premium',
  'Car Culture',
  'Fast & Furious',
  'Vintage',
  'Diğer',
]

const CONDITION_OPTIONS = [
  { value: 'MOC', label: 'MOC · Kartında Mint' },
  { value: 'MIB', label: 'MIB · Kutusunda' },
  { value: 'Loose', label: 'Loose · Kartsız' },
]

const WHEEL_OPTIONS = [
  { value: 'BW', label: 'Basic Wheels (BW)' },
  { value: 'RR', label: 'Real Riders (RR)' },
  { value: '5SP', label: '5-Spoke (5SP)' },
  { value: 'Diğer', label: 'Diğer' },
]

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Kayseri', 'Eskişehir',
  'Diğer',
]

export default function IlanVerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [casting, setCasting] = useState('')
  const [series, setSeries] = useState('Mainline')
  const [seriesYear, setSeriesYear] = useState('')
  const [condition, setCondition] = useState('MOC')
  const [wheelType, setWheelType] = useState('BW')
  const [carColor, setCarColor] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('İstanbul')
  const [contactPhone, setContactPhone] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 8)
      setPhotos(files)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Önce giriş yapman lazım')
        setLoading(false)
        return
      }

      const { data: listing, error: insertError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title,
          casting,
          series,
          series_year: seriesYear ? parseInt(seriesYear) : null,
          condition,
          wheel_type: wheelType,
          car_color: carColor,
          price: parseFloat(price),
          city,
          contact_phone: contactPhone,
          description,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const ext = photo.name.split('.').pop()
        const fileName = `${listing.id}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(fileName)

        await supabase.from('listing_photos').insert({
          listing_id: listing.id,
          photo_url: publicUrl,
          position: i,
        })
      }

      router.push(`/ilan/${listing.id}`)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-50 border-b-4 border-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <MessageBadge />
            <Link href="/" className="font-mono text-xs text-stone-700 hover:text-red-700">
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 pb-3 border-b-2 border-stone-900">
          <p className="font-mono text-xs text-red-700 uppercase tracking-widest mb-2">
            // Yeni İlan
          </p>
          <h1 className="text-3xl font-black uppercase">İlan Ver</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              Başlık <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: '67 Camaro STH 2023 Spectraflame Mavi"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Casting (Model)
              </label>
              <input
                type="text"
                value={casting}
                onChange={(e) => setCasting(e.target.value)}
                placeholder="'67 Camaro"
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Yıl
              </label>
              <input
                type="number"
                min="1968"
                max="2030"
                value={seriesYear}
                onChange={(e) => setSeriesYear(e.target.value)}
                placeholder="2023"
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              Seri
            </label>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            >
              {SERIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Durum <span className="text-red-700">*</span>
              </label>
              <select
                required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              >
                {CONDITION_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Tekerlek
              </label>
              <select
                value={wheelType}
                onChange={(e) => setWheelType(e.target.value)}
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              >
                {WHEEL_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              Renk
            </label>
            <input
              type="text"
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              placeholder="Spectraflame Mavi"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Fiyat (₺) <span className="text-red-700">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350"
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider mb-1">
                Şehir <span className="text-red-700">*</span>
              </label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              WhatsApp Numarası <span className="text-red-700">*</span>
            </label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
            <p className="font-mono text-[10px] text-stone-500 mt-1">
              Alıcılar bu numaradan WhatsApp ile sana ulaşacak
            </p>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              Açıklama
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kart durumu, blister hasarı, özel notlar..."
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1">
              Fotoğraflar <span className="text-red-700">*</span> (max 8)
            </label>
            <input
              type="file"
              required
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="w-full bg-white border-2 border-stone-900 px-3 py-2 font-mono text-xs file:mr-3 file:bg-stone-900 file:text-white file:border-0 file:px-3 file:py-1 file:font-mono file:text-xs file:cursor-pointer"
            />
            {photos.length > 0 && (
              <p className="font-mono text-xs text-stone-700 mt-1">
                {photos.length} fotoğraf seçildi
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-700 text-red-900 p-3 font-mono text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || photos.length === 0}
            className="w-full bg-red-700 text-white py-4 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50"
          >
            {loading ? 'Yayınlanıyor...' : 'İlanı Yayınla →'}
          </button>
        </form>
      </main>
    </div>
  )
}