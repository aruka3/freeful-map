import type { RestaurantStatus } from '@/types'

export const STATUS_CONFIG: Record<
  RestaurantStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  want_to_visit: {
    label: '行きたい',
    color: '#f59e0b',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  visited: {
    label: '行った',
    color: '#4ade80',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
}

export const TAG_CONFIG: Record<string, { label: string; short: string }> = {
  gluten_free:  { label: 'グルテンフリー', short: 'GF' },
  casein_free:  { label: 'カゼインフリー', short: 'CF' },
  sugar_free:   { label: '白砂糖フリー',   short: 'SF' },
}

export const ALL_TAGS = ['gluten_free', 'casein_free', 'sugar_free']

export const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503]
export const DEFAULT_ZOOM = 13
