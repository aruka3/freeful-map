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
              <h1 className="font-bold text-stone-800 text-base">困ったときメモ</h1>
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

      {/* 注意書き */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
          <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            チェーン店の対応は店舗・時期・地域によって異なる場合があります。
            必ず事前に確認してからご利用ください。あくまで"ヒント"としてお使いください。
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
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
              <Link
                key={memo.id}
                href={`/chain-memos/${memo.id}`}
                className="block bg-white rounded-2xl border border-stone-100 p-4 hover:border-emerald-200 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h2 className="font-bold text-stone-800 text-sm">{memo.name}</h2>
                  {memo.confirmed_at && (
                    <span className="text-xs text-stone-400 shrink-0">
                      {new Date(memo.confirmed_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })}確認
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-700 font-medium leading-relaxed line-clamp-2">
                  {memo.accommodations}
                </p>
                {memo.caveats && (
                  <p className="text-xs text-amber-600 mt-1.5 line-clamp-1">⚠️ {memo.caveats}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
