import type { Restaurant, RestaurantInsert, ChainMemo, ChainMemoInsert } from '@/types'

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res
}

// --- Restaurants ---

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await apiFetch('/api/restaurants')
  return res.json()
}

export async function fetchRestaurant(id: string): Promise<Restaurant | null> {
  const res = await fetch(`/api/restaurants/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function createRestaurant(restaurant: RestaurantInsert): Promise<Restaurant> {
  const res = await apiFetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(restaurant),
  })
  return res.json()
}

export async function updateRestaurant(
  id: string,
  updates: Partial<RestaurantInsert>
): Promise<Restaurant> {
  const res = await apiFetch(`/api/restaurants/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': updates.session_id ?? '',
    },
    body: JSON.stringify(updates),
  })
  return res.json()
}

export async function deleteRestaurant(id: string, sessionId: string): Promise<void> {
  await apiFetch(`/api/restaurants/${id}`, {
    method: 'DELETE',
    headers: { 'x-session-id': sessionId },
  })
}

// --- Chain Memos ---

export async function fetchChainMemos(): Promise<ChainMemo[]> {
  const res = await apiFetch('/api/chain-memos')
  return res.json()
}

export async function fetchChainMemo(id: string): Promise<ChainMemo | null> {
  const res = await fetch(`/api/chain-memos/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function createChainMemo(memo: ChainMemoInsert): Promise<ChainMemo> {
  const res = await apiFetch('/api/chain-memos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memo),
  })
  return res.json()
}

export async function updateChainMemo(
  id: string,
  updates: Partial<ChainMemoInsert>
): Promise<ChainMemo> {
  const res = await apiFetch(`/api/chain-memos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': updates.session_id ?? '',
    },
    body: JSON.stringify(updates),
  })
  return res.json()
}

export async function deleteChainMemo(id: string, sessionId: string): Promise<void> {
  await apiFetch(`/api/chain-memos/${id}`, {
    method: 'DELETE',
    headers: { 'x-session-id': sessionId },
  })
}
