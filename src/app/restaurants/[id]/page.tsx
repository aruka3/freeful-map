'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { fetchRestaurant, deleteRestaurant } from '@/lib/api'
import { STATUS_CONFIG, TAG_CONFIG } from '@/utils/constants'
import type { Restaurant, RestaurantStatus } from '@/types'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUserEmail(data?.user?.email ?? null))
      .catch(() => setUserEmail(null))
  }, [])

  useEffect(() => {
    fetchRestaurant(id)
      .then(setRestaurant)
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleStatusChange = useCallback(async (status: RestaurantStatus) => {
    if (statusSaving) return
    setStatusSaving(true)
    await fetch(`/api/restaurants/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setRestaurant((prev) => prev ? { ...prev, user_status: status } : prev)
    setStatusSaving(false)
  }, [id, statusSaving])

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

  const statusConfig = restaurant.user_status ? STATUS_CONFIG[restaurant.user_status] : null
  const isOwner = !!(userEmail && restaurant.user_email === userEmail)
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
          {userEmail && (
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
            {restaurant.has_storefront === false && (
              <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">実店舗なし</span>
            )}
          </div>

          {userEmail ? (
            <div className="flex gap-2 mb-3">
              {(['want_to_visit', 'visited'] as RestaurantStatus[]).map((s) => {
                const c = STATUS_CONFIG[s]
                const active = restaurant.user_status === s
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusSaving}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      active
                        ? `${c.bgColor} ${c.textColor} border-transparent`
                        : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {s === 'want_to_visit' ? '🔖 行きたい' : '✅ 行った'}
                  </button>
                )
              })}
            </div>
          ) : statusConfig ? (
            <div className="mb-3">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          ) : null}

          <p className="text-sm text-stone-500 flex items-start gap-1.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {restaurant.address}
          </p>

          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.name)}/@${restaurant.lat},${restaurant.lng},17z`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Googleマップで開く・経路を調べる
          </a>

          {restaurant.has_storefront !== false && (
            <div className="mt-3">
              <MiniMap
                lat={restaurant.lat}
                lng={restaurant.lng}
                className="w-full h-48 rounded-xl overflow-hidden border border-stone-100"
              />
            </div>
          )}

          {restaurant.tags?.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {TAG_CONFIG[tag]?.label ?? tag}
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

          {!userEmail && (
            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="text-xs text-stone-400 mb-3 font-medium">ログインするとできること</p>
              <div className="space-y-2 text-sm text-stone-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span>自分だけに見える「自分メモ」を書く</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span>お店の情報を編集・削除する</span>
                </div>
              </div>
              <a
                href="/login"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
              >
                Googleでログイン
              </a>
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
