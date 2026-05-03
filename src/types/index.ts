export type DietaryLevel = 'full' | 'partial' | 'unknown'

export type CheckLevel = 'main_food' | 'main_dish' | 'seasoning' | 'unchecked'

export type RestaurantStatus =
  | 'want_to_visit'
  | 'visited_safe'
  | 'need_check'
  | 'not_compatible'
  | 'closed'

export interface Restaurant {
  id: string
  created_at: string
  updated_at: string

  // 基本情報
  name: string
  address: string
  lat: number
  lng: number
  comment: string | null

  // ステータス
  status: RestaurantStatus

  // 3項目評価
  gluten_free: DietaryLevel
  casein_free: DietaryLevel
  sugar_free: DietaryLevel

  // 確認レベル
  check_level: CheckLevel

  // 記録項目
  foods_ok: string | null
  foods_ng: string | null
  confirmed_details: string | null
  shop_response: string | null
  changes_made: string | null
  staff_memo: string | null
  safety_level: number | null
  can_consult_next: boolean | null
  notes: string | null

  // ユーザー識別
  session_id: string
}

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>

export interface FilterState {
  status: RestaurantStatus[]
  gluten_free: DietaryLevel[]
  casein_free: DietaryLevel[]
  sugar_free: DietaryLevel[]
}
