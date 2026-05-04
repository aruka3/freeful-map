import { createClient } from '@supabase/supabase-js'
import type { Restaurant, RestaurantInsert, ChainMemo, ChainMemoInsert } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Restaurant[]
}

export async function fetchRestaurant(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Restaurant
}

export async function createRestaurant(restaurant: RestaurantInsert): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single()

  if (error) throw error
  return data as Restaurant
}

export async function updateRestaurant(
  id: string,
  updates: Partial<RestaurantInsert>
): Promise<Restaurant> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-session-id': updates.session_id ?? '' } },
  })
  const { data, error } = await client
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Restaurant
}

export async function deleteRestaurant(id: string, sessionId: string): Promise<void> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-session-id': sessionId } },
  })
  const { error } = await client.from('restaurants').delete().eq('id', id)
  if (error) throw error
}

// --- Chain Memos ---

export async function fetchChainMemos(): Promise<ChainMemo[]> {
  const { data, error } = await supabase
    .from('chain_memos')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data as ChainMemo[]
}

export async function fetchChainMemo(id: string): Promise<ChainMemo | null> {
  const { data, error } = await supabase
    .from('chain_memos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as ChainMemo
}

export async function createChainMemo(memo: ChainMemoInsert): Promise<ChainMemo> {
  const { data, error } = await supabase
    .from('chain_memos')
    .insert(memo)
    .select()
    .single()
  if (error) throw error
  return data as ChainMemo
}

export async function updateChainMemo(
  id: string,
  updates: Partial<ChainMemoInsert>
): Promise<ChainMemo> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-session-id': updates.session_id ?? '' } },
  })
  const { data, error } = await client
    .from('chain_memos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ChainMemo
}

export async function deleteChainMemo(id: string, sessionId: string): Promise<void> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-session-id': sessionId } },
  })
  const { error } = await client.from('chain_memos').delete().eq('id', id)
  if (error) throw error
}
