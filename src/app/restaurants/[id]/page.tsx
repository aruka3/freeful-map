'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, deleteRestaurant } from '@/lib/supabase'
import { isOwner } from '@/lib/session'
import { STATUS_CONFIG } from '@/utils/constants'
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
    if (!confirm('このお店の記録を削除しますか？')) return
    setDeleting(true)
    await deleteRestaurant(id)
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
  const owner = isOwner(restaurant.session_id)

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
          {owner && (
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
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-stone-800">{restaurant.name}</h2>
            <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>

          <p className="text-sm text-stone-500 flex items-start gap-1.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {restaurant.address}
          </p>

          {restaurant.comment && (
            <div className="mt-4">
              <p className="text-xs text-stone-400 mb-1.5">体験メモ</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                {restaurant.comment}
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
