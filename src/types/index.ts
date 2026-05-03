export type RestaurantStatus = 'want_to_visit' | 'visited'

export interface Restaurant {
  id: string
  created_at: string
  updated_at: string
  name: string
  address: string
  lat: number
  lng: number
  comment: string | null
  status: RestaurantStatus
  session_id: string
}

export type RestaurantInsert = Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>

export interface FilterState {
  status: RestaurantStatus[]
}
