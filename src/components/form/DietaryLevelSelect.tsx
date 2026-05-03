'use client'

import type { DietaryLevel } from '@/types'

interface Option {
  value: DietaryLevel
  label: string
  emoji: string
}

const GF_CF_OPTIONS: Option[] = [
  { value: 'full', label: '完全対応', emoji: '✅' },
  { value: 'partial', label: '一部対応', emoji: '🔶' },
  { value: 'unknown', label: '要確認', emoji: '❓' },
]

const SF_OPTIONS: Option[] = [
  { value: 'full', label: '完全対応', emoji: '✅' },
  { value: 'partial', label: '一部対応', emoji: '🔶' },
  { value: 'unknown', label: '気にしていない／不明', emoji: '➖' },
]

interface DietaryLevelSelectProps {
  value: DietaryLevel
  onChange: (v: DietaryLevel) => void
  sugarMode?: boolean
}

export default function DietaryLevelSelect({
  value,
  onChange,
  sugarMode = false,
}: DietaryLevelSelectProps) {
  const options = sugarMode ? SF_OPTIONS : GF_CF_OPTIONS

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
            value === opt.value
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <span className="text-xl">{opt.emoji}</span>
          <span
            className={`text-xs font-medium leading-tight ${
              value === opt.value ? 'text-emerald-700' : 'text-stone-500'
            }`}
          >
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}
