'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FeedbackPage() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          message,
          pageUrl: typeof window !== 'undefined' ? document.referrer || window.location.href : null,
        }),
      })
      if (!res.ok) throw new Error()
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
            <p className="text-sm text-stone-500">フィードバックを受け取りました。</p>
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
                <span className="text-stone-400 font-normal text-xs ml-2">任意</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: はるか"
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

            <button
              type="submit"
              disabled={submitting || !message.trim()}
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
