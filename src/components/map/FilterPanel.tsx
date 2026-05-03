'use client'

import type { FilterState, RestaurantStatus } from '@/types'
import { STATUS_CONFIG } from '@/utils/constants'

const ALL_STATUSES: RestaurantStatus[] = ['want_to_visit', 'visited']

interface FilterPanelProps {
  filter: FilterState
  onChange: (filter: FilterState) => void
}

export default function FilterPanel({ filter, onChange }: FilterPanelProps) {
  const allSelected = filter.status.length === ALL_STATUSES.length

  const toggle = (s: RestaurantStatus) => {
    const next = filter.status.includes(s)
      ? filter.status.filter((x) => x !== s)
      : [...filter.status, s]
    if (next.length === 0) return
    onChange({ status: next })
  }

  return (
    <div className="flex items-center gap-2">
      {ALL_STATUSES.map((s) => {
        const c = STATUS_CONFIG[s]
        const active = filter.status.includes(s)
        return (
          <button
            key={s}
            onClick={() => toggle(s)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border shadow-sm transition-all ${
              active
                ? `${c.bgColor} ${c.textColor} border-transparent`
                : 'bg-white text-stone-400 border-stone-200'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active ? c.color : '#d6d3d1' }} />
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
