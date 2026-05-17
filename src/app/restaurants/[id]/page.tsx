'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, deleteRestaurant } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { STATUS_CONFIG, TAG_CONFIG } from '@/utils/constants'
import type { Restaurant } from '@/types'

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchRestaurant(id)
      .then(setRestaurant)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleDelete = async () => {
    if (!restaurant) return
    if (!confirm('このお店の記録を削除しますか？')) return
    setDeleting(true)
    await deleteRestaurant(id, restaurant.session_id)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!restaurant) return null

  const statusConfig = STATUS_CONFIG[restaurant.status]
  const isOwner = restaurant.session_id === getSessionId()
  const memoPublic = restaurant.memo_public ?? restaurant.comment
  const memoPrivate = restaurant.memo_private

  return (
    <div className="min-h-screen bg-stone-50 pb-safe">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="shrink-0 text-stone-400 hover:text-stone-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-bold text-stone-800 truncate">{restaurant.name}</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/restaurants/${id}/edit`}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {deleting ? '削除中…' : '削除'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-stone-800">{restaurant.name}</h2>
            <div className="flex items-center gap-1.5 shrink-0">
              {restaurant.has_storefront === false && (
                <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">実店舗なし</span>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <p className="text-sm text-stone-500 flex items-start gap-1.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {restaurant.address}
          </p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=&center=${restaurant.lat},${restaurant.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Googleマップで開く・経路を調べる
          </a>

          {restaurant.tags?.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {TAG_CONFIG[tag]?.short ?? tag}
                </span>
              ))}
            </div>
          )}

          {memoPublic && (
            <div className="mt-4">
              <p className="text-xs text-stone-400 mb-1.5">共有メモ</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                {memoPublic}
              </p>
            </div>
          )}

          {isOwner && memoPrivate && (
            <div className="mt-3">
              <p className="text-xs text-stone-400 mb-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                自分メモ（自分だけに表示）
              </p>
              <p className="text-sm text-stone-700 bg-amber-50 border border-amber-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                {memoPrivate}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-stone-400 text-center">
          {new Date(restaurant.updated_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 更新
        </p>

        <Link href="/" className="block text-center text-sm text-stone-500 hover:text-stone-700 py-2">
          ← 地図に戻る
        </Link>
      </div>
    </div>
  )
}
