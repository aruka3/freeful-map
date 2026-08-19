'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createChainMemo } from '@/lib/api'
import { getSessionId } from '@/lib/session'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'

export default function NewChainMemoPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [accommodations, setAccommodations] = useState('')
  const [caveats, setCaveats] = useState('')
  const [confirmedAt, setConfirmedAt] = useState('')
  const [officialUrl, setOfficialUrl] = useState('')
  const [memo, setMemo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !accommodations.trim()) {
      setError('店名と使える対応は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const created = await createChainMemo({
        name: name.trim(),
        accommodations: accommodations.trim(),
        caveats: caveats.trim() || null,
        confirmed_at: confirmedAt || null,
        official_url: officialUrl.trim() || null,
        memo: memo.trim() || null,
        session_id: getSessionId(),
      })
      router.push(`/chain-memos/${created.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`保存に失敗しました: ${msg}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/chain-memos" className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">チェーン店メモを追加</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
            <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-700 leading-relaxed">
              対応は店舗・時期・地域によって変わる場合があります。
              "確認して使うためのヒント"として記録してください。
            </p>
          </div>

          <div>
            <FieldLabel required>店名・チェーン名</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：スターバックス、マクドナルド"
              required
            />
          </div>

          <div>
            <FieldLabel required>使える対応</FieldLabel>
            <Textarea
              value={accommodations}
              onChange={(e) => setAccommodations(e.target.value)}
              rows={3}
              placeholder="例：植物性ミルク（オーツ・アーモンド・豆乳）に変更可能。追加料金あり。"
            />
          </div>

          <div>
            <FieldLabel>
              注意点
              <span className="text-stone-400 font-normal text-xs ml-2">任意</span>
            </FieldLabel>
            <Textarea
              value={caveats}
              onChange={(e) => setCaveats(e.target.value)}
              rows={2}
              placeholder="例：一部店舗のみ対応、時期によって変わる可能性あり"
            />
          </div>

          <div>
            <FieldLabel>
              確認日
              <span className="text-stone-400 font-normal text-xs ml-2">任意</span>
            </FieldLabel>
            <input
              type="date"
              value={confirmedAt}
              onChange={(e) => setConfirmedAt(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <FieldLabel>
              公式情報URL
              <span className="text-stone-400 font-normal text-xs ml-2">任意</span>
            </FieldLabel>
            <Input
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div>
            <FieldLabel>
              メモ
              <span className="text-stone-400 font-normal text-xs ml-2">任意</span>
            </FieldLabel>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="その他、気づいたことや使い方のコツなど"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white text-sm font-bold transition-colors"
          >
            {submitting ? '保存中…' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  )
}
