'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchChainMemo, deleteChainMemo } from '@/lib/supabase'
import type { ChainMemo } from '@/types'

function parseLines(text: string) {
  const lines = text.split('\n').filter(Boolean)
  if (lines.length > 1 && lines.every(l => l.includes('：'))) {
    return lines.map(l => {
      const idx = l.indexOf('：')
      return { name: l.slice(0, idx), desc: l.slice(idx + 1).trim() }
    })
  }
  return null
}

function AccommodationsDetail({ text }: { text: string }) {
  const rows = parseLines(text)
  if (rows) {
    return (
      <div className="space-y-0">
        {rows.map((row, i) => (
          <div key={i} className={`px-5 py-4 ${i > 0 ? 'border-t border-emerald-500' : ''}`}>
            <p className="text-xs font-bold text-emerald-200 mb-1">{row.name}</p>
            <p className="text-base leading-relaxed">{row.desc}</p>
          </div>
        ))}
      </div>
    )
  }
  return <p className="px-5 pb-5 text-base leading-relaxed">{text}</p>
}

export default function ChainMemoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [memo, setMemo] = useState<ChainMemo | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchChainMemo(id)
      .then(setMemo)
      .catch(() => router.push('/chain-memos'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleDelete = async () => {
    if (!memo) return
    if (!confirm('このメモを削除しますか？')) return
    setDeleting(true)
    await deleteChainMemo(id, memo.session_id)
    router.push('/chain-memos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!memo) return null

  return (
    <div className="min-h-screen bg-stone-50 pb-safe">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/chain-memos" className="shrink-0 text-stone-400 hover:text-stone-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-bold text-stone-800 truncate">{memo.name}</h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link href={`/chain-memos/${id}/edit`} className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors font-medium">編集</Link>
            <button onClick={handleDelete} disabled={deleting} className="text-xs text-rose-400 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors font-medium">
              {deleting ? '削除中…' : '削除'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* 使える対応 */}
        <div className="bg-emerald-600 rounded-2xl text-white shadow-sm overflow-hidden">
          <p className="text-emerald-200 text-xs font-semibold px-5 pt-4 pb-3">✅ 使える対応</p>
          <AccommodationsDetail text={memo.accommodations} />
          <div className="pb-2" />
        </div>

        {memo.caveats && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-600 mb-2">⚠️ 注意点</p>
            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{memo.caveats}</p>
          </div>
        )}

        {memo.memo && (
          <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-stone-400 mb-2">💬 メモ</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{memo.memo}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm space-y-3">
          {memo.confirmed_at && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">確認日</span>
              <span className="text-sm text-stone-700">
                {new Date(memo.confirmed_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          )}
          {memo.official_url && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-stone-400 shrink-0 mt-0.5">公式情報</span>
              <a href={memo.official_url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline break-all">
                {memo.official_url}
              </a>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-stone-50 pt-3">
            <span className="text-xs text-stone-300">登録日</span>
            <span className="text-xs text-stone-300">
              {new Date(memo.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 leading-relaxed pb-2">
          この情報は確認時点のものです。店舗・時期によって変わる場合があります。<br />
          必ず事前に確認してからご利用ください。
        </p>
      </div>
    </div>
  )
}
