'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchChainMemos } from '@/lib/supabase'
import type { ChainMemo } from '@/types'

export default function ChainMemosPage() {
  const [memos, setMemos] = useState<ChainMemo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChainMemos()
      .then(setMemos)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-stone-400 hover:text-stone-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-stone-800">困ったときメモ</h1>
              <p className="text-xs text-stone-400">チェーン店の対応情報まとめ</p>
            </div>
          </div>
          <Link
            href="/chain-memos/new"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            追加
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        {/* ヒントバナー */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3 mb-5">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-0.5">使い方のヒント</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              対応は店舗・時期・地域によって異なります。必ず事前に確認してから利用してください。あくまで「参考ヒント」です。
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : memos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-stone-500 text-sm mb-4">まだメモがありません</p>
            <Link href="/chain-memos/new" className="text-emerald-600 text-sm font-medium hover:underline">
              最初のメモを追加する →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {memos.map((memo) => (
              <div key={memo.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                {/* カードヘッダー */}
                <Link href={`/chain-memos/${memo.id}`} className="block px-4 pt-4 pb-3 hover:bg-stone-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="font-bold text-stone-800">{memo.name}</h2>
                    {memo.confirmed_at && (
                      <span className="text-xs text-stone-400 shrink-0 mt-0.5 whitespace-nowrap">
                        {new Date(memo.confirmed_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })}確認
                      </span>
                    )}
                  </div>
                  {/* 対応内容 - メインコンテンツ */}
                  <div className="bg-emerald-50 rounded-xl px-3 py-2.5 mb-2">
                    <p className="text-xs font-semibold text-emerald-600 mb-1">✅ 使える対応</p>
                    <p className="text-sm text-emerald-900 leading-relaxed line-clamp-3">
                      {memo.accommodations}
                    </p>
                  </div>
                  {memo.caveats && (
                    <div className="flex gap-1.5 items-start">
                      <span className="text-amber-400 text-xs mt-0.5 shrink-0">⚠️</span>
                      <p className="text-xs text-amber-700 leading-relaxed line-clamp-2">{memo.caveats}</p>
                    </div>
                  )}
                </Link>
                {/* アクションバー */}
                <div className="border-t border-stone-100 flex">
                  <Link
                    href={`/chain-memos/${memo.id}`}
                    className="flex-1 py-2.5 text-center text-xs text-stone-500 hover:text-emerald-600 hover:bg-stone-50 transition-colors font-medium"
                  >
                    詳細
                  </Link>
                  <div className="w-px bg-stone-100" />
                  <Link
                    href={`/chain-memos/${memo.id}/edit`}
                    className="flex-1 py-2.5 text-center text-xs text-stone-500 hover:text-emerald-600 hover:bg-stone-50 transition-colors font-medium"
                  >
                    編集
                  </Link>
                  <div className="w-px bg-stone-100" />
                  <DeleteButton memoId={memo.id} sessionId={memo.session_id} onDeleted={() => setMemos(prev => prev.filter(m => m.id !== memo.id))} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteButton({ memoId, sessionId, onDeleted }: { memoId: string; sessionId: string; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('このメモを削除しますか？')) return
    setDeleting(true)
    try {
      const { deleteChainMemo } = await import('@/lib/supabase')
      await deleteChainMemo(memoId, sessionId)
      onDeleted()
    } catch {
      alert('削除に失敗しました')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex-1 py-2.5 text-center text-xs text-stone-500 hover:text-rose-500 hover:bg-rose-50 transition-colors font-medium disabled:opacity-40"
    >
      {deleting ? '…' : '削除'}
    </button>
  )
}
