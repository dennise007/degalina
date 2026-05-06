'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  photo_url: string | null
  is_read: boolean
  created_at: string
}

export default function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
        const unread = data.filter((m) => !m.is_read && m.sender_id !== currentUserId)
        if (unread.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unread.map((m) => m.id))
        }
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [conversationId, currentUserId, supabase])

  const sendMessage = async (content: string | null, photoUrl: string | null) => {
    setError(null)
    if (!content && !photoUrl) return

    const { error: insertError, data: newMsg } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
        photo_url: photoUrl,
      })
      .select()
      .single()

    if (insertError) {
      setError('Mesaj gonderilemedi: ' + insertError.message)
      return
    }

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    await sendMessage(text.trim(), null)
    setText('')
    setSending(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError(null)

    try {
      const compressed = await compressImage(file, 1280)
      const ext = 'jpg'
      const fileName = currentUserId + '/' + conversationId + '_' + Date.now() + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('message-photos')
        .upload(fileName, compressed, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        setError('Fotograf yuklenemedi: ' + uploadError.message)
        setUploadingPhoto(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('message-photos')
        .getPublicUrl(fileName)

      await sendMessage(null, publicUrl)
    } catch (err: any) {
      setError('Hata: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="flex-1 space-y-3 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-300 bg-stone-50">
              <p className="font-mono text-sm text-stone-600">
                Sohbete bir mesaj yazarak baslayin.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId
              return (
                <div key={msg.id} className={'flex ' + (isMine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={
                      'border-2 ' +
                      (isMine
                        ? 'bg-red-700 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-900 border-stone-900')
                    }
                    style={{ maxWidth: '280px' }}
                  >
                    {msg.photo_url ? (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(msg.photo_url)}
                        className="block w-full"
                        style={{ padding: 0, border: 'none', background: 'none' }}
                      >
                        <img
                          src={msg.photo_url}
                          alt=""
                          style={{
                            width: '100%',
                            maxWidth: '280px',
                            maxHeight: '280px',
                            objectFit: 'cover',
                            display: 'block',
                            cursor: 'zoom-in',
                          }}
                        />
                      </button>
                    ) : null}
                    {msg.content ? (
                      <p className="px-3 py-2 font-mono text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    ) : null}
                    <p className={'px-3 pb-1 font-mono text-[9px] ' + (isMine ? 'text-red-200' : 'text-stone-500')}>
                      {new Date(msg.created_at).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isMine && msg.is_read ? ' · okundu' : ''}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <div className="border-2 border-red-700 bg-red-50 text-red-900 p-2 font-mono text-xs mb-2">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex gap-2 sticky bottom-0 bg-stone-100 pt-2 pb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto || sending}
            className="bg-stone-50 border-2 border-stone-900 px-3 font-mono text-sm hover:bg-stone-900 hover:text-stone-50 transition disabled:opacity-50"
            aria-label="Fotograf ekle"
          >
            {uploadingPhoto ? '...' : '📷'}
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mesaj yaz..."
            disabled={sending || uploadingPhoto}
            className="flex-1 bg-white border-2 border-stone-900 px-3 py-2 font-mono text-sm focus:outline-none focus:border-red-700 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || uploadingPhoto || !text.trim()}
            className="bg-red-700 text-white px-4 font-black text-sm uppercase tracking-wider hover:bg-stone-900 transition disabled:opacity-50"
          >
            {sending ? '...' : 'Gonder'}
          </button>
        </form>
      </main>

      {lightboxUrl ? (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxUrl(null)
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white border-2 border-stone-900 font-black text-2xl flex items-center justify-center hover:bg-red-700 hover:text-white transition"
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      ) : null}
    </>
  )
}

async function compressImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas error'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob error'))
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}