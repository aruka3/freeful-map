'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StepIndicator from '@/components/form/StepIndicator'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'
import DietaryLevelSelect from '@/components/form/DietaryLevelSelect'
import StatusSelect from '@/components/form/StatusSelect'
import { createRestaurant } from '@/lib/supabase'
import { getSessionId } from '@/lib/session'
import { CHECK_LEVEL_CONFIG } from '@/utils/constants'
import type { RestaurantInsert, DietaryLevel, RestaurantStatus, CheckLevel } from '@/types'

const STEP_LABELS = ['基本情報', '体験メモ', '食事対応', '詳細記録']
const TOTAL_STEPS = 4

type FormData = Omit<RestaurantInsert, 'session_id'>

const DEFAULT_LAT = 35.6762
const DEFAULT_LNG = 139.6503

const initialForm: FormData = {
  name: '',
  address: '',
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  comment: '',
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
  const [geoError, setGeoError] = useState('')
  const [geoSuccess, setGeoSuccess] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const hasCustomCoords = form.lat !== DEFAULT_LAT || form.lng !== DEFAULT_LNG

  const geocodeAddress = async () => {
    if (!form.address.trim()) return
    setAddressLoading(true)
    setGeoError('')
    setGeoSuccess(false)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(form.address)}`)
      const data = await res.json()
      if (!res.ok) {
        setGeoError(data.error || '座標の取得に失敗しました')
        return
      }
      if (Array.isArray(data) && data.length > 0) {
        set('lat', parseFloat(data[0].lat))
        set('lng', parseFloat(data[0].lon))
        setGeoSuccess(true)
      } else {
        setGeoError('住所から座標を取得できませんでした。別の表記で試すか、下の欄に手動入力してください。')
      }
    } catch {
      setGeoError('座標の取得に失敗しました。ネットワーク接続を確認してください。')
    }
    setAddressLoading(false)
  }

  const [showManual, setShowManual] = useState(false)

  const canNext = () => {
    if (step === 0) return form.name.trim() !== '' && form.address.trim() !== ''
    return true
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setSubmitError('店名と住所は必須です。')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const restaurant = await createRestaurant({
        ...form,
        comment: form.comment || null,
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
      setSubmitError('登録に失敗しました。Supabaseの設定を確認してください。')
      console.error(e)
    }
    setSubmitting(false)
  }

  const nextButtonLabel = () => {
    if (step === 1) return '次へ（詳細入力へ）'
    if (step === TOTAL_STEPS - 1) return submitting ? '登録中…' : '✓ 登録する'
    return '次へ →'
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
          <h1 className="font-bold text-stone-800">お店を登録</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-8">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
        </div>

        {submitError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 mb-4">
            {submitError}
          </div>
        )}

        {/* Step 0: 基本情報 */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <FieldLabel required>店名</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="例: ナチュラルカフェ 森の音"
                autoFocus
              />
            </div>

            <div>
              <FieldLabel required>住所</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={form.address}
                  onChange={(e) => {
                    set('address', e.target.value)
                    setGeoSuccess(false)
                    setGeoError('')
                  }}
                  placeholder="例: 東京都渋谷区神宮前1-2-3"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={addressLoading || !form.address.trim()}
                  className="shrink-0 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-600 text-xs font-medium px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                >
                  {addressLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                      </svg>
                      取得中
                    </span>
                  ) : '座標取得'}
                </button>
              </div>

              {/* 座標取得成功 */}
              {geoSuccess && (
                <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  座標を取得しました（{form.lat.toFixed(4)}, {form.lng.toFixed(4)}）
                </p>
              )}

              {/* エラー表示 */}
              {geoError && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
                  <p>{geoError}</p>
                  <button
                    type="button"
                    onClick={() => setShowManual(true)}
                    className="mt-1 underline text-amber-700 hover:text-amber-800"
                  >
                    手動で緯度・経度を入力する
                  </button>
                </div>
              )}

              {/* 手動入力（任意） */}
              {(showManual || hasCustomCoords) && !geoSuccess && (
                <div className="mt-2 flex gap-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-stone-400 mb-1">緯度</p>
                    <Input
                      type="number"
                      step="0.0001"
                      value={form.lat}
                      onChange={(e) => set('lat', parseFloat(e.target.value) || DEFAULT_LAT)}
                      placeholder="35.6762"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-stone-400 mb-1">経度</p>
                    <Input
                      type="number"
                      step="0.0001"
                      value={form.lng}
                      onChange={(e) => set('lng', parseFloat(e.target.value) || DEFAULT_LNG)}
                      placeholder="139.6503"
                    />
                  </div>
                </div>
              )}

              {!geoSuccess && !geoError && !showManual && (
                <p className="text-xs text-stone-400 mt-1.5">
                  住所を入力後「座標取得」を押してください
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1: 体験メモ */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <FieldLabel>体験メモ</FieldLabel>
              <Textarea
                value={form.comment ?? ''}
                onChange={(e) => set('comment', e.target.value)}
                rows={5}
                placeholder="アレルギー対応に積極的なお店です。スタッフさんが丁寧に確認してくれました。雰囲気も落ち着いていて、また来たいと思いました。"
                autoFocus
              />
              <p className="text-xs text-stone-400 mt-1.5">
                訪問した感想、雰囲気、気づいたことなど自由に書いてください
              </p>
            </div>

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
                    onClick={() => set('safety_level', form.safety_level === n ? null : n)}
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
              <p className="text-xs text-stone-400 mt-1.5">タップで選択・もう一度タップで解除</p>
            </div>
          </div>
        )}

        {/* Step 2: 食事対応 */}
        {step === 2 && (
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

        {/* Step 3: 詳細記録 */}
        {step === 3 && (
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
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-bold transition-colors"
            >
              {nextButtonLabel()}
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
