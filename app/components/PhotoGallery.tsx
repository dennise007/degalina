'use client'

import { useState } from 'react'

type Photo = { photo_url: string; position: number }

export default function PhotoGallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-square border-2 border-stone-900 bg-stone-200 flex items-center justify-center font-mono text-xs text-stone-500">
        Fotograf yok
      </div>
    )
  }

  const mainPhoto = photos[selectedIndex]

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="block w-full aspect-square border-2 border-stone-900 bg-stone-200 overflow-hidden cursor-zoom-in hover:border-red-700 transition"
        >
          <img
            src={mainPhoto.photo_url}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </button>

        {photos.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {photos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={'aspect-square border-2 bg-stone-200 overflow-hidden transition ' + (i === selectedIndex ? 'border-red-700 ring-2 ring-red-700 ring-offset-2' : 'border-stone-900 hover:border-red-700 opacity-70 hover:opacity-100')}
              >
                <img
                  src={p.photo_url}
                  alt={alt + ' - ' + (i + 1)}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isLightboxOpen ? (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsLightboxOpen(false)
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white border-2 border-stone-900 font-black text-2xl flex items-center justify-center hover:bg-red-700 hover:text-white transition"
            aria-label="Kapat"
          >
            ×
          </button>

          <img
            src={mainPhoto.photo_url}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain cursor-default"
          />

          {photos.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur p-2 border-2 border-white/30">
              {photos.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(i)
                  }}
                  className={'w-16 h-16 border-2 overflow-hidden transition ' + (i === selectedIndex ? 'border-red-500 opacity-100' : 'border-white/50 opacity-60 hover:opacity-100')}
                >
                  <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          {photos.length > 1 ? (
            <p className="absolute top-4 left-4 bg-white/10 backdrop-blur text-white font-mono text-xs px-3 py-2 border-2 border-white/30">
              {selectedIndex + 1} / {photos.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}