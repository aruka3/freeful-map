'use client'

import Link from 'next/link'
import type { Restaurant } from '@/types'
import { STATUS_CONFIG, TAG_CONFIG } from '@/utils/constants'

interface RestaurantPopupProps {
  restaurant: Restaurant
  onClose: () => void
}

export default function RestaurantPopup({ restaurant, onClose }: RestaurantPopupProps) {
  const statusConfig = STATUS_CONFIG[restaurant.status]

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-3 pb-4 pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden pointer-events-auto max-w-sm mx-auto">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors z-10"
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Link href={`/restaurants/${restaurant.id}`} onClick={onClose} className="block p-4 pr-12">
          <div className="flex items-start gap-2 mb-1">
            <h2 className="text-base font-bold text-stone-800 leading-tight flex-1">{restaurant.name}</h2>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>

          <p className="text-xs text-stone-500 mb-2">{restaurant.address}</p>

          {restaurant.tags?.length > 0 && (
            <div className="flex gap-1 mb-2">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {TAG_CONFIG[tag]?.short ?? tag}
                </span>
              ))}
            </div>
          )}

          {restaurant.comment && (
            <p className="text-xs text-stone-600 bg-stone-50 rounded-xl px-3 py-2 mb-3 line-clamp-2 leading-relaxed">
              {restaurant.comment}
            </p>
          )}

          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            詳細・編集を見る
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
