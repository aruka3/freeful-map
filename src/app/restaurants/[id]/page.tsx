'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, deleteRestaurant } from '@/lib/supabase'
import { isOwner } from '@/lib/session'
import {
  STATUS_CONFIG,
  DIETARY_LEVEL_CONFIG,
  SUGAR_FREE_CONFIG,
  CHECK_LEVEL_CONFIG,
} from '@/utils/constants'
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

  if (loading) return <LoadingScreen />
  if (!restaurant) return null

  const statusConfig = STATUS_CONFIG[restaurant.status]
  const owner = isOwner(restaurant.session_id)

  return (
    <div className="min-h-screen bg-stone-50 pb-safe">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-stone-400 hover:text-stone-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-bold text-stone-800 truncate">{restaurant.name}</h1>
          </div>
          {owner && (
            <div className="flex gap-2">
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
        {/* 写真 */}
        {restaurant.photo_url && (
          <img
            src={restaurant.photo_url}
            alt={restaurant.name}
            className="w-full h-52 object-cover rounded-2xl"
          />
        )}

        {/* 基本情報カード */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xl font-bold text-stone-800">{restaurant.name}</h2>
              {restaurant.genre && (
                <p className="text-sm text-stone-500 mt-0.5">{restaurant.genre}</p>
              )}
            </div>
            <span
              className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-stone-600 flex items-start gap-1.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {restaurant.address}
          </p>
          {restaurant.comment && (
            <p className="mt-3 text-sm text-stone-600 bg-stone-50 rounded-xl p-3">
              {restaurant.comment}
            </p>
          )}
        </Card>

        {/* 食事対応カード */}
        <Card title="食事制限への対応">
          <div className="space-y-3">
            <DietRow label="グルテンフリー" value={restaurant.gluten_free} config={DIETARY_LEVEL_CONFIG} />
            <DietRow label="カゼインフリー" value={restaurant.casein_free} config={DIETARY_LEVEL_CONFIG} />
            <DietRow label="白砂糖フリー" value={restaurant.sugar_free} config={SUGAR_FREE_CONFIG} />
          </div>
        </Card>

        {/* 訪問記録カード */}
        {(restaurant.check_level !== 'unchecked' ||
          restaurant.foods_ok ||
          restaurant.foods_ng ||
          restaurant.safety_level != null) && (
          <Card title="訪問記録">
            <div className="space-y-3">
              <InfoRow label="確認範囲" value={CHECK_LEVEL_CONFIG[restaurant.check_level]?.label} />
              {restaurant.safety_level != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">安心度</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full ${
                          i < restaurant.safety_level! ? 'bg-emerald-400' : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {restaurant.can_consult_next != null && (
                <InfoRow
                  label="次回も相談しやすい"
                  value={restaurant.can_consult_next ? 'はい ✓' : 'むずかしい'}
                />
              )}
              {restaurant.foods_ok && <TextBlock label="食べられたもの" value={restaurant.foods_ok} color="emerald" />}
              {restaurant.foods_ng && <TextBlock label="NGだったもの" value={restaurant.foods_ng} color="rose" />}
              {restaurant.confirmed_details && <TextBlock label="確認した内容" value={restaurant.confirmed_details} />}
              {restaurant.shop_response && <TextBlock label="お店の返答" value={restaurant.shop_response} />}
              {restaurant.changes_made && <TextBlock label="変更してくれた内容" value={restaurant.changes_made} color="emerald" />}
              {restaurant.staff_memo && <TextBlock label="店員さんの対応" value={restaurant.staff_memo} />}
              {restaurant.notes && <TextBlock label="注意点・メモ" value={restaurant.notes} color="amber" />}
            </div>
          </Card>
        )}

        {/* 地図へ戻る */}
        <Link
          href="/"
          className="block text-center text-sm text-stone-500 hover:text-stone-700 py-2"
        >
          ← 地図に戻る
        </Link>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
      {title && <h3 className="font-semibold text-stone-700 mb-3">{title}</h3>}
      {children}
    </div>
  )
}

function DietRow({
  label,
  value,
  config,
}: {
  label: string
  value: string
  config: Record<string, { label: string; bgColor: string }>
}) {
  const c = config[value] || config['unknown']
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-600">{label}</span>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.bgColor}`}>
        {c.label}
      </span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-medium text-stone-700">{value}</span>
    </div>
  )
}

function TextBlock({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: 'emerald' | 'rose' | 'amber'
}) {
  const bg =
    color === 'emerald'
      ? 'bg-emerald-50'
      : color === 'rose'
      ? 'bg-rose-50'
      : color === 'amber'
      ? 'bg-amber-50'
      : 'bg-stone-50'
  return (
    <div>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className={`text-sm text-stone-700 rounded-xl p-3 ${bg}`}>{value}</p>
    </div>
  )
}
