'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchChainMemo, updateChainMemo } from '@/lib/api'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'

export default function EditChainMemoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [accommodations, setAccommodations] = useState('')
  const [caveats, setCaveats] = useState('')
  const [confirmedAt, setConfirmedAt] = useState('')
  const [officialUrl, setOfficialUrl] = useState('')
  const [memo, setMemo] = useState('')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    fetchChainMemo(id)
      .then((m) => {
        if (!m) { router.push('/chain-memos'); return }
        setName(m.name)
        setAccommodations(m.accommodations)
        setCaveats(m.caveats ?? '')
        setConfirmedAt(m.confirmed_at ?? '')
        setOfficialUrl(m.official_url ?? '')
        setMemo(m.memo ?? '')
        setSessionId(m.session_id)
      })
      .catch(() => router.push('/chain-memos'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !accommodations.trim()) {
      setError('店名と使える対応は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateChainMemo(id, {
        name: name.trim(),
        accommodations: accommodations.trim(),
        caveats: caveats.trim() || null,
        confirmed_at: confirmedAt || null,
        official_url: officialUrl.trim() || null,
        memo: memo.trim() || null,
        session_id: sessionId,
      })
      router.push(`/chain-memos/${id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`更新に失敗しました: ${msg}`)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/chain-memos/${id}`} className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">メモを編集</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}

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
            {submitting ? '保存中…' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
