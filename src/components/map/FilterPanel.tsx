'use client'

import { useState } from 'react'
import type { FilterState, RestaurantStatus, DietaryLevel } from '@/types'
import { STATUS_CONFIG, DIETARY_LEVEL_CONFIG, SUGAR_FREE_CONFIG } from '@/utils/constants'

interface FilterPanelProps {
  filter: FilterState
  onChange: (filter: FilterState) => void
}

const ALL_STATUSES: RestaurantStatus[] = [
  'want_to_visit',
  'visited_safe',
  'need_check',
  'not_compatible',
  'closed',
]
const ALL_LEVELS: DietaryLevel[] = ['full', 'partial', 'unknown']

export default function FilterPanel({ filter, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  const totalActive =
    (filter.status.length < ALL_STATUSES.length ? 1 : 0) +
    (filter.gluten_free.length < ALL_LEVELS.length ? 1 : 0) +
    (filter.casein_free.length < ALL_LEVELS.length ? 1 : 0) +
    (filter.sugar_free.length < ALL_LEVELS.length ? 1 : 0)

  const toggleStatus = (s: RestaurantStatus) => {
    const next = filter.status.includes(s)
      ? filter.status.filter((x) => x !== s)
      : [...filter.status, s]
    if (next.length === 0) return
    onChange({ ...filter, status: next })
  }

  const toggleDietary = (key: 'gluten_free' | 'casein_free' | 'sugar_free', v: DietaryLevel) => {
    const cur = filter[key]
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    if (next.length === 0) return
    onChange({ ...filter, [key]: next })
  }

  const reset = () =>
    onChange({
      status: [...ALL_STATUSES],
      gluten_free: [...ALL_LEVELS],
      casein_free: [...ALL_LEVELS],
      sugar_free: [...ALL_LEVELS],
    })

  return (
    <>
      {/* フィルターボタン */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2.5 text-sm font-medium text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6" />
        </svg>
        絞り込み
        {totalActive > 0 && (
          <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {totalActive}
          </span>
        )}
      </button>

      {/* フィルタードロワー */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full rounded-t-2xl shadow-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-stone-800">絞り込み</h3>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="text-sm text-stone-500 hover:text-stone-700 underline"
                >
                  リセット
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  完了
                </button>
              </div>
            </div>

            <FilterSection label="ステータス">
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => {
                  const c = STATUS_CONFIG[s]
                  const active = filter.status.includes(s)
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                        active
                          ? `${c.bgColor} ${c.textColor} border-transparent`
                          : 'bg-white text-stone-400 border-stone-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            <FilterSection label="グルテンフリー (GF)">
              <DietaryLevelButtons
                values={filter.gluten_free}
                config={DIETARY_LEVEL_CONFIG}
                onToggle={(v) => toggleDietary('gluten_free', v)}
              />
            </FilterSection>

            <FilterSection label="カゼインフリー (CF)">
              <DietaryLevelButtons
                values={filter.casein_free}
                config={DIETARY_LEVEL_CONFIG}
                onToggle={(v) => toggleDietary('casein_free', v)}
              />
            </FilterSection>

            <FilterSection label="白砂糖フリー (SF)">
              <DietaryLevelButtons
                values={filter.sugar_free}
                config={SUGAR_FREE_CONFIG}
                onToggle={(v) => toggleDietary('sugar_free', v)}
              />
            </FilterSection>
          </div>
        </div>
      )}
    </>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  )
}

function DietaryLevelButtons({
  values,
  config,
  onToggle,
}: {
  values: DietaryLevel[]
  config: Record<string, { label: string; bgColor: string }>
  onToggle: (v: DietaryLevel) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(config) as DietaryLevel[]).map((v) => {
        const c = config[v]
        const active = values.includes(v)
        return (
          <button
            key={v}
            onClick={() => onToggle(v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              active ? `${c.bgColor} border-transparent` : 'bg-white text-stone-400 border-stone-200'
            }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
