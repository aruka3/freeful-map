'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

const MAX_IMAGES = 5

async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85))
    return blob ?? file
  } catch {
    return file
  }
}

function fromPath() {
  const from = new URLSearchParams(window.location.search).get('from')
  return from && from.startsWith('/') && !from.startsWith('//') ? from : null
}

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [sentImages, setSentImages] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const room = MAX_IMAGES - images.length
    const added = picked.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages([...images, ...added])
    if (picked.length > room) setError(`画像は${MAX_IMAGES}枚までです。`)
    else setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(images[i].preview)
    setImages(images.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const imageUrls: string[] = []
      for (const { file } of images) {
        const fd = new FormData()
        fd.append('file', await shrinkImage(file), 'photo.jpg')
        const up = await fetch('/api/feedback/upload', { method: 'POST', body: fd })
        if (!up.ok) {
          const data = await up.json().catch(() => ({}))
          setError(`画像のアップロードに失敗しました。${data.error ?? ''}`)
          setSubmitting(false)
          return
        }
        imageUrls.push((await up.json()).url)
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          message,
          imageUrls,
          pageUrl: fromPath() ? window.location.origin + fromPath() : null,
        }),
      })
      if (!res.ok) throw new Error()
      setSentImages(imageUrls.length)
      setDone(true)
    } catch {
      setError('送信に失敗しました。しばらくしてからもう一度お試しください。')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">フィードバック</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {done ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-4xl">🌿</p>
            <p className="font-bold text-stone-800">ありがとうございます！</p>
            <p className="text-sm text-stone-500">
              フィードバックを受け取りました。{sentImages > 0 && `（画像${sentImages}枚つき）`}
            </p>
            <Link href="/" className="inline-block mt-4 text-sm text-emerald-600 hover:underline">
              地図に戻る →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-stone-500">
              使い勝手のご意見・ご要望・不具合の報告など、お気軽にどうぞ。
            </p>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                お名前
                <span className="text-rose-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: はるか"
                required
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                連絡先
                <span className="text-stone-400 font-normal text-xs ml-2">任意・返信が必要な場合</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="メールアドレスや SNS アカウントなど"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                内容
                <span className="text-rose-400 ml-1">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="気になったこと、使いにくかった点、こんな機能がほしいなど…"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                画像
                <span className="text-stone-400 font-normal text-xs ml-2">任意・最大{MAX_IMAGES}枚</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={img.preview} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="w-full h-full object-cover rounded-xl border border-stone-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="画像を削除"
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >✕</button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-500 transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                  >
                    <span className="text-xl">＋</span>画像を追加
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim() || !message.trim()}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-bold transition-colors"
            >
              {submitting ? '送信中…' : '送信する'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
