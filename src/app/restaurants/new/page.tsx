'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StepIndicator from '@/components/form/StepIndicator'
import FieldLabel, { Input, Textarea, Select } from '@/components/form/FieldLabel'
import DietaryLevelSelect from '@/components/form/DietaryLevelSelect'
import StatusSelect from '@/components/form/StatusSelect'
import { createRestaurant } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { GENRE_OPTIONS, CHECK_LEVEL_CONFIG } from '@/utils/constants'
import type { RestaurantInsert, DietaryLevel, RestaurantStatus, CheckLevel } from '@/types'

const STEP_LABELS = ['基本情報', '食事対応', '訪問記録', 'ステータス']
const TOTAL_STEPS = 4

type FormData = Omit<RestaurantInsert, 'session_id'>

const initialForm: FormData = {
  name: '',
  address: '',
  lat: 35.6762,
  lng: 139.6503,
  genre: '',
  comment: '',
  photo_url: '',
  status: 'want_to_visit',
  gluten_free: 'unknown',
  casein_free: 'unknown',
  sugar_free: 'unknown',
  check_level: 'unchecked',
  foods_ok: '',
  foods_ng: '',
  confirmed_details: '',
  shop_response: '',
  changes_made: '',
  staff_memo: '',
  safety_level: null,
  can_consult_next: null,
  notes: '',
}

export default function NewRestaurantPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const geocodeAddress = async () => {
    if (!form.address.trim()) return
    setAddressLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}&limit=1&accept-language=ja`
      )
      const data = await res.json()
      if (data.length > 0) {
        set('lat', parseFloat(data[0].lat))
        set('lng', parseFloat(data[0].lon))
      } else {
        setError('住所から座標を取得できませんでした。住所を確認してください。')
      }
    } catch {
      setError('座標の取得に失敗しました。')
    }
    setAddressLoading(false)
  }

  const canNext = () => {
    if (step === 0) return form.name.trim() !== '' && form.address.trim() !== ''
    return true
  }

  const handleNext = async () => {
    if (step === 0 && form.lat === initialForm.lat && form.lng === initialForm.lng) {
      await geocodeAddress()
    }
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setError('店名と住所は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const restaurant = await createRestaurant({
        ...form,
        genre: form.genre || null,
        comment: form.comment || null,
        photo_url: form.photo_url || null,
        foods_ok: form.foods_ok || null,
        foods_ng: form.foods_ng || null,
        confirmed_details: form.confirmed_details || null,
        shop_response: form.shop_response || null,
        changes_made: form.changes_made || null,
        staff_memo: form.staff_memo || null,
        notes: form.notes || null,
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
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">お店を登録</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-8">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {/* Step 0: 基本情報 */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <FieldLabel required>店名</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="例: ナチュラルカフェ 森の音"
              />
            </div>

            <div>
              <FieldLabel required>住所</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="例: 東京都渋谷区神宮前1-2-3"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={addressLoading}
                  className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  {addressLoading ? '取得中…' : '座標取得'}
                </button>
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                緯度: {form.lat.toFixed(4)} / 経度: {form.lng.toFixed(4)}
              </p>
            </div>

            <div>
              <FieldLabel>ジャンル</FieldLabel>
              <Select value={form.genre ?? ''} onChange={(e) => set('genre', e.target.value)}>
                <option value="">選択してください</option>
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <FieldLabel>写真URL</FieldLabel>
              <Input
                value={form.photo_url ?? ''}
                onChange={(e) => set('photo_url', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div>
              <FieldLabel>コメント（お店の雰囲気など）</FieldLabel>
              <Textarea
                value={form.comment ?? ''}
                onChange={(e) => set('comment', e.target.value)}
                rows={3}
                placeholder="アレルギー対応に積極的なお店です。スタッフさんが丁寧に確認してくれました。"
              />
            </div>
          </div>
        )}

        {/* Step 1: 食事対応 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <FieldLabel>グルテンフリー対応</FieldLabel>
              <DietaryLevelSelect
                value={form.gluten_free as DietaryLevel}
                onChange={(v) => set('gluten_free', v)}
              />
            </div>
            <div>
              <FieldLabel>カゼインフリー対応</FieldLabel>
              <DietaryLevelSelect
                value={form.casein_free as DietaryLevel}
                onChange={(v) => set('casein_free', v)}
              />
            </div>
            <div>
              <FieldLabel>白砂糖フリー対応</FieldLabel>
              <DietaryLevelSelect
                value={form.sugar_free as DietaryLevel}
                onChange={(v) => set('sugar_free', v)}
                sugarMode
              />
            </div>
          </div>
        )}

        {/* Step 2: 訪問記録 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <FieldLabel>どこまで確認したか</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(CHECK_LEVEL_CONFIG) as [CheckLevel, { label: string }][]).map(
                  ([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('check_level', key)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        form.check_level === key
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {val.label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <FieldLabel>食べられたもの</FieldLabel>
              <Textarea
                value={form.foods_ok ?? ''}
                onChange={(e) => set('foods_ok', e.target.value)}
                rows={2}
                placeholder="ざる蕎麦、天ぷら（塩のみ）"
              />
            </div>

            <div>
              <FieldLabel>NGだったもの</FieldLabel>
              <Textarea
                value={form.foods_ng ?? ''}
                onChange={(e) => set('foods_ng', e.target.value)}
                rows={2}
                placeholder="つゆ（グルテン含む）、デザート類"
              />
            </div>

            <div>
              <FieldLabel>確認した内容・お店の返答</FieldLabel>
              <Textarea
                value={form.confirmed_details ?? ''}
                onChange={(e) => set('confirmed_details', e.target.value)}
                rows={3}
                placeholder="小麦アレルギーの旨を伝えたところ、つゆなしで対応していただけました。"
              />
            </div>

            <div>
              <FieldLabel>変更してくれた内容</FieldLabel>
              <Input
                value={form.changes_made ?? ''}
                onChange={(e) => set('changes_made', e.target.value)}
                placeholder="つゆ抜き、薬味別添え"
              />
            </div>

            <div>
              <FieldLabel>店員さんの対応メモ</FieldLabel>
              <Textarea
                value={form.staff_memo ?? ''}
                onChange={(e) => set('staff_memo', e.target.value)}
                rows={2}
                placeholder="店長さんが直接確認してくれて、とても親切でした。"
              />
            </div>
          </div>
        )}

        {/* Step 3: ステータス */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <FieldLabel>ステータス</FieldLabel>
              <StatusSelect
                value={form.status as RestaurantStatus}
                onChange={(v) => set('status', v)}
              />
            </div>

            <div>
              <FieldLabel>安心度（1〜5）</FieldLabel>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set('safety_level', n)}
                    className={`w-12 h-12 rounded-full text-sm font-bold transition-all ${
                      form.safety_level === n
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>次回も相談しやすいか</FieldLabel>
              <div className="flex gap-3">
                {[
                  { label: 'はい', value: true },
                  { label: 'どちらとも', value: null },
                  { label: 'むずかしい', value: false },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => set('can_consult_next', opt.value)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.can_consult_next === opt.value
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>注意点・メモ</FieldLabel>
              <Textarea
                value={form.notes ?? ''}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="土日は混むため事前に電話で確認を推奨。お昼のランチメニューのみ対応。"
              />
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
            >
              戻る
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext()}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-bold transition-colors"
            >
              次へ →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white text-sm font-bold transition-colors"
            >
              {submitting ? '登録中…' : '✓ 登録する'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
