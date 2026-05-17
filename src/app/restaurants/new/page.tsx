'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'
import { createRestaurant } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { TAG_CONFIG, ALL_TAGS } from '@/utils/constants'
import type { RestaurantStatus } from '@/types'

const DEFAULT_LAT = 35.6762
const DEFAULT_LNG = 139.6503

export default function NewRestaurantPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(DEFAULT_LAT)
  const [lng, setLng] = useState(DEFAULT_LNG)
  const [status, setStatus] = useState<RestaurantStatus>('want_to_visit')
  const [hasStorefront, setHasStorefront] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [memoPublic, setMemoPublic] = useState('')
  const [memoPrivate, setMemoPrivate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMsg, setGeoMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [error, setError] = useState('')

  const geocode = async () => {
    if (!address.trim()) return
    setGeoLoading(true)
    setGeoMsg(null)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setGeoMsg({ type: 'error', text: '住所から座標を取得できませんでした。都道府県から入力するか、手動で入力してください。' })
        return
      }
      setLat(data.lat)
      setLng(data.lng)
      setGeoMsg({ type: 'ok', text: `座標を取得しました（${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}）` })
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
      const restaurant = await createRestaurant({
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
        session_id: getSessionId(),
      })
      router.push(`/restaurants/${restaurant.id}`)
    } catch (e) {
      setError('登録に失敗しました。Supabaseの設定を確認してください。')
      console.error(e)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">お店を記録する</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}

          {/* 店名 */}
          <div>
            <FieldLabel required>店名</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ナチュラルカフェ 森の音"
              autoFocus
            />
          </div>

          {/* 住所 */}
          <div>
            <FieldLabel required>住所</FieldLabel>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setGeoMsg(null)
                }}
                placeholder="例: 大阪市中央区島町2丁目2-3"
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                ) : '座標取得'}
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
              <div className="mt-2 bg-amber-50 text-amber-700 text-xs rounded-lg p-3">
                <p>{geoMsg.text}</p>
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="mt-1 underline"
                >
                  手動で緯度・経度を入力する
                </button>
              </div>
            )}
            {showManual && (
              <div className="mt-2 flex gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-stone-400 mb-1">緯度</p>
                  <Input type="number" step="0.0001" value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || DEFAULT_LAT)} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-stone-400 mb-1">経度</p>
                  <Input type="number" step="0.0001" value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || DEFAULT_LNG)} />
                </div>
              </div>
            )}
          </div>

          {/* 実店舗 */}
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
            <p className="text-xs text-stone-400 mt-1.5">実店舗なしの場合は地図に表示されません。イベント・オンライン販売などは共有メモに記入してください。</p>
          </div>

          {/* ステータス */}
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

          {/* タグ */}
          <div>
            <FieldLabel>
              対応タグ
              <span className="text-stone-400 font-normal text-xs ml-2">任意・複数選択可</span>
            </FieldLabel>
            <div className="flex gap-2">
              {ALL_TAGS.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags(active ? tags.filter((t) => t !== tag) : [...tags, tag])
                    }
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

          {/* 共有メモ */}
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

          {/* 自分メモ */}
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
            disabled={submitting || !name.trim() || (hasStorefront && !address.trim())}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-bold transition-colors"
          >
            {submitting ? '登録中…' : '記録する'}
          </button>
        </div>
      </form>
    </div>
  )
}
