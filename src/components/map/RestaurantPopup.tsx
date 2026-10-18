'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Restaurant, RestaurantStatus } from '@/types'
import { STATUS_CONFIG, TAG_CONFIG } from '@/utils/constants'

interface RestaurantPopupProps {
  restaurant: Restaurant
  onClose: () => void
  userEmail: string | null
  onStatusChange: (id: string, status: RestaurantStatus) => void
}

export default function RestaurantPopup({ restaurant, onClose, userEmail, onStatusChange }: RestaurantPopupProps) {
  const [saving, setSaving] = useState(false)

  const handleStatus = async (status: RestaurantStatus) => {
    if (saving) return
    setSaving(true)
    await onStatusChange(restaurant.id, status)
    setSaving(false)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-3 pb-4 pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden pointer-events-auto max-w-sm mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors z-10"
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 pr-12">
          <h2 className="text-base font-bold text-stone-800 leading-tight mb-1">{restaurant.name}</h2>
          <p className="text-xs text-stone-500 mb-3">{restaurant.address}</p>

          {restaurant.tags?.length > 0 && (
            <div className="flex gap-1 mb-3">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {TAG_CONFIG[tag]?.short ?? tag}
                </span>
              ))}
            </div>
          )}

          {userEmail ? (
            <div className="flex gap-2 mb-3">
              {(['want_to_visit', 'visited'] as RestaurantStatus[]).map((s) => {
                const c = STATUS_CONFIG[s]
                const active = restaurant.user_status === s
                return (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={saving}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
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
          ) : (
            restaurant.user_status && (
              <div className="mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CONFIG[restaurant.user_status].bgColor} ${STATUS_CONFIG[restaurant.user_status].textColor}`}>
                  {STATUS_CONFIG[restaurant.user_status].label}
                </span>
              </div>
            )
          )}

          <Link
            href={`/restaurants/${restaurant.id}`}
            onClick={onClose}
            className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"
          >
            詳細を見る
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
