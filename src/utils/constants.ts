import type { RestaurantStatus, DietaryLevel, CheckLevel } from '@/types'

export const STATUS_CONFIG: Record<
  RestaurantStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  want_to_visit: {
    label: '行ってみたい',
    color: '#94a3b8',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  visited_safe: {
    label: '訪問済み・安心',
    color: '#4ade80',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  need_check: {
    label: '要確認',
    color: '#fbbf24',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  not_compatible: {
    label: '現在は非対応',
    color: '#f87171',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
  },
  closed: {
    label: '閉店／情報古い',
    color: '#9ca3af',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
  },
}

export const DIETARY_LEVEL_CONFIG: Record<
  DietaryLevel,
  { label: string; color: string; bgColor: string }
> = {
  full: { label: '完全対応', color: '#4ade80', bgColor: 'bg-emerald-100 text-emerald-700' },
  partial: { label: '一部対応', color: '#fbbf24', bgColor: 'bg-amber-100 text-amber-700' },
  unknown: { label: '要確認', color: '#94a3b8', bgColor: 'bg-slate-100 text-slate-500' },
}

export const SUGAR_FREE_CONFIG: Record<
  DietaryLevel,
  { label: string; color: string; bgColor: string }
> = {
  full: { label: '完全対応', color: '#4ade80', bgColor: 'bg-emerald-100 text-emerald-700' },
  partial: { label: '一部対応', color: '#fbbf24', bgColor: 'bg-amber-100 text-amber-700' },
  unknown: {
    label: '気にしていない／不明',
    color: '#94a3b8',
    bgColor: 'bg-slate-100 text-slate-500',
  },
}

export const CHECK_LEVEL_CONFIG: Record<CheckLevel, { label: string }> = {
  main_food: { label: '主食のみ' },
  main_dish: { label: 'メインまで' },
  seasoning: { label: '調味料まで' },
  unchecked: { label: '未確認' },
}

export const GENRE_OPTIONS = [
  '和食',
  '洋食',
  '中華',
  'イタリアン',
  'フレンチ',
  '居酒屋',
  'カフェ',
  'ラーメン',
  'そば・うどん',
  '焼肉・BBQ',
  '寿司',
  'ベジタリアン・ヴィーガン',
  'グルテンフリー専門',
  'カレー',
  'その他',
]

export const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503] // 東京
export const DEFAULT_ZOOM = 13
