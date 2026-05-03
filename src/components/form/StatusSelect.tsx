'use client'

import type { RestaurantStatus } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'

const STATUSES: RestaurantStatus[] = [
  'want_to_visit',
  'visited_safe',
  'need_check',
  'not_compatible',
  'closed',
]

interface StatusSelectProps {
  value: RestaurantStatus
  onChange: (v: RestaurantStatus) => void
}

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {STATUSES.map((s) => {
        const c = STATUS_CONFIG[s]
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
              value === s
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: c.color }}
            />
            <span
              className={`text-sm font-medium ${
                value === s ? 'text-emerald-700' : 'text-stone-600'
              }`}
            >
              {c.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
