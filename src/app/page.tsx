'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { fetchRestaurants } from '@/lib/supabase'
import FilterPanel from '@/components/map/FilterPanel'
import RestaurantPopup from '@/components/map/RestaurantPopup'
import type { Restaurant, FilterState, RestaurantStatus } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

const ALL_STATUSES: RestaurantStatus[] = ['want_to_visit', 'visited']

const DEFAULT_FILTER: FilterState = { status: [...ALL_STATUSES] }

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => setError('データの取得に失敗しました。Supabaseの設定を確認してください。'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => restaurants.filter((r) => filter.status.includes(r.status)),
    [restaurants, filter]
  )

  const handlePinClick = useCallback((r: Restaurant) => setSelected(r), [])

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-stone-100 z-10 shrink-0">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 text-xl">🌿</span>
            <h1 className="font-bold text-stone-800 text-base">Freeful Map</h1>
            <span className="hidden sm:block text-xs text-stone-400 ml-1">
              安心して食べられるお店を記録する地図
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowList(!showList)}
              className="sm:hidden text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {showList ? '地図' : 'リスト'}
            </button>
            <Link
              href="/chain-memos"
              className="sm:hidden text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              📝
            </Link>
            <Link
              href="/chain-memos"
              className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors font-medium hidden sm:block"
            >
              📝 困ったときメモ
            </Link>
            <Link
              href="/restaurants/new"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              記録する
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 地図エリア */}
        <div className={`relative flex-1 ${showList ? 'hidden sm:block' : ''}`}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-stone-500">地図を読み込んでいます…</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100 p-6">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg text-center">
                <div className="text-4xl mb-3">⚙️</div>
                <h2 className="font-bold text-stone-800 mb-2">Supabase設定が必要です</h2>
                <p className="text-sm text-stone-600 mb-4">{error}</p>
                <div className="bg-stone-50 rounded-xl p-4 text-left text-xs text-stone-600 font-mono">
                  <p className="mb-1">.env.local に設定：</p>
                  <p className="text-emerald-600">NEXT_PUBLIC_SUPABASE_URL=...</p>
                  <p className="text-emerald-600">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
                </div>
                <p className="text-xs text-stone-400 mt-3">
                  supabase/schema.sql をSupabaseで実行してください
                </p>
              </div>
            </div>
          ) : (
            <MapView restaurants={filtered} onPinClick={handlePinClick} />
          )}

          {selected && (
            <RestaurantPopup restaurant={selected} onClose={() => setSelected(null)} />
          )}

          {!loading && !error && (
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
              <div className="pointer-events-auto">
                <FilterPanel filter={filter} onChange={setFilter} />
              </div>
              <div className="ml-auto pointer-events-auto">
                <span className="bg-white/90 backdrop-blur-sm text-xs text-stone-600 px-3 py-2 rounded-full shadow-sm border border-stone-100">
                  {filtered.length} 件
                </span>
              </div>
            </div>
          )}
        </div>

        {/* サイドバーリスト */}
        <div className={`${showList ? 'block' : 'hidden'} sm:block w-full sm:w-80 xl:w-96 bg-white border-l border-stone-100 overflow-y-auto shrink-0`}>
          <div className="p-4 border-b border-stone-100 sticky top-0 bg-white z-10">
            <p className="text-sm font-semibold text-stone-700">{filtered.length} 件のお店</p>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-stone-400 text-sm">お店がまだ登録されていません</p>
              <Link href="/restaurants/new" className="mt-3 inline-block text-xs text-emerald-600 font-medium hover:underline">
                最初のお店を記録する →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {filtered.map((r) => {
                const c = STATUS_CONFIG[r.status]
                return (
                  <Link
                    key={r.id}
                    href={`/restaurants/${r.id}`}
                    className="block w-full text-left p-4 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: c.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{r.name}</p>
                        <p className="text-xs text-stone-400 truncate mt-0.5">{r.address}</p>
                        {r.comment && (
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1">{r.comment}</p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
