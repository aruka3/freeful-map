'use client'

import Link from 'next/link'
import type { Restaurant } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'

interface RestaurantPopupProps {
  restaurant: Restaurant
  onClose: () => void
}

export default function RestaurantPopup({ restaurant, onClose }: RestaurantPopupProps) {
  const statusConfig = STATUS_CONFIG[restaurant.status]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 pb-safe">
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-lg font-bold text-stone-800 leading-tight">{restaurant.name}</h2>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>

        <p className="text-sm text-stone-500 mb-3">{restaurant.address}</p>

        {restaurant.comment && (
          <p className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3 mb-4 line-clamp-4 leading-relaxed">
            {restaurant.comment}
          </p>
        )}

        <Link
          href={`/restaurants/${restaurant.id}`}
          className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
          onClick={onClose}
        >
          詳細を見る
        </Link>
      </div>
    </div>
  )
}
