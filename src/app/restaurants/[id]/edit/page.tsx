'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { fetchRestaurant, updateRestaurant } from '@/lib/api'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'
import { TAG_CONFIG, ALL_TAGS } from '@/utils/constants'
import type { RestaurantStatus } from '@/types'

const MiniMap = dynamic(() => import('@/components/map/MiniMap'), { ssr: false })

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [status, setStatus] = useState<RestaurantStatus>('want_to_visit')
  const [hasStorefront, setHasStorefront] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [memoPublic, setMemoPublic] = useState('')
  const [memoPrivate, setMemoPrivate] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMsg, setGeoMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchRestaurant(id)
      .then((r) => {
        if (!r) { router.push('/'); return }
        setName(r.name)
        setAddress(r.address)
        setLat(r.lat)
        setLng(r.lng)
        setStatus(r.status)
        setHasStorefront(r.has_storefront ?? true)
        setTags(r.tags ?? [])
        setMemoPublic(r.memo_public ?? r.comment ?? '')
        setMemoPrivate(r.memo_private ?? '')
        setSessionId(r.session_id)
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  const geocode = async () => {
    if (!address.trim()) return
    setGeoLoading(true)
    setGeoMsg(null)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setGeoMsg({ type: 'error', text: '座標を取得できませんでした。手動で確認してください。' })
        return
      }
      setLat(data.lat)
      setLng(data.lng)
      setGeoMsg({ type: 'ok', text: `座標を更新しました（${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}）` })
    } catch {
      setGeoMsg({ type: 'error', text: '座標の取得に失敗しました。' })
    }
    setGeoLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || (hasStorefront && !address.trim())) {
      setError(hasStorefront ? '店名と住所は必須です。' : '店名は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateRestaurant(id, {
        name: name.trim(),
        address: address.trim(),
        lat,
        lng,
        comment: null,
        memo_public: memoPublic.trim() || null,
        memo_private: memoPrivate.trim() || null,
        has_storefront: hasStorefront,
        status,
        tags,
        session_id: sessionId,
      })
      router.push(`/restaurants/${id}`)
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(`更新に失敗しました: ${msg}`)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/restaurants/${id}`} className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">記録を編集</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}

          <div>
            <FieldLabel required>店名</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* 住所＋座標取得 */}
          <div>
            <FieldLabel required>住所</FieldLabel>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => { setAddress(e.target.value); setGeoMsg(null) }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={geocode}
                disabled={geoLoading || !address.trim()}
                className="shrink-0 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                {geoLoading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                ) : '座標再取得'}
              </button>
            </div>
            {geoMsg?.type === 'ok' && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {geoMsg.text}
              </p>
            )}
            {geoMsg?.type === 'error' && (
              <p className="text-xs text-amber-600 mt-1.5">{geoMsg.text}</p>
            )}
            {!geoMsg && lat !== 0 && (
              <p className="text-xs text-stone-400 mt-1.5">
                住所を変更した場合は「座標再取得」を押してください
              </p>
            )}
            {lat !== 0 && (
              <div className="mt-3">
                <p className="text-xs text-stone-400 mb-1.5">ピンをドラッグして位置を微調整できます</p>
                <MiniMap
                  lat={lat}
                  lng={lng}
                  onMove={(newLat, newLng) => { setLat(newLat); setLng(newLng) }}
                  className="w-full h-52 rounded-xl overflow-hidden border border-stone-200"
                />
                <p className="text-xs text-stone-400 mt-1">現在の座標: {lat.toFixed(5)}, {lng.toFixed(5)}</p>
              </div>
            )}
          </div>

          <div>
            <FieldLabel>実店舗</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: true, label: '実店舗あり', emoji: '🏪' },
                { value: false, label: '実店舗なし', emoji: '🛒' },
              ] as { value: boolean; label: string; emoji: string }[]).map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setHasStorefront(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    hasStorefront === opt.value
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${hasStorefront === opt.value ? 'text-emerald-700' : 'text-stone-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-1.5">実店舗なしの場合は地図に表示されません。</p>
          </div>

          <div>
            <FieldLabel>ステータス</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'want_to_visit', label: '行ってみたい', emoji: '🔖' },
                { value: 'visited', label: '行った', emoji: '✅' },
              ] as { value: RestaurantStatus; label: string; emoji: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    status === opt.value
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${status === opt.value ? 'text-emerald-700' : 'text-stone-600'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>
              対応タグ
              <span className="text-stone-400 font-normal text-xs ml-2">複数選択可</span>
            </FieldLabel>
            <div className="flex gap-2">
              {ALL_TAGS.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTags(active ? tags.filter((t) => t !== tag) : [...tags, tag])}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      active
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 bg-white text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    {TAG_CONFIG[tag].short}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-stone-400 mt-1.5">GF: グルテンフリー　CF: カゼインフリー　SF: 白砂糖フリー</p>
          </div>

          <div>
            <FieldLabel>
              共有メモ
              <span className="text-stone-400 font-normal text-xs ml-2">任意・他のユーザーにも表示</span>
            </FieldLabel>
            <Textarea
              value={memoPublic}
              onChange={(e) => setMemoPublic(e.target.value)}
              rows={4}
              placeholder="植物性ミルクあり、米粉スイーツあり、相談しやすかった、副菜変更対応してくれた…"
            />
          </div>

          <div>
            <FieldLabel>
              自分メモ
              <span className="text-stone-400 font-normal text-xs ml-2">任意・自分だけに表示</span>
            </FieldLabel>
            <Textarea
              value={memoPrivate}
              onChange={(e) => setMemoPrivate(e.target.value)}
              rows={4}
              placeholder="味濃いめ、また行きたい、雰囲気好き、個人的に好みだった…"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white text-sm font-bold transition-colors"
          >
            {submitting ? '保存中…' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
