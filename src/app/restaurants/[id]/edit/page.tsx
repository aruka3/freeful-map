'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchRestaurant, updateRestaurant } from '@/lib/supabase'
import { isOwner } from '@/lib/session'
import FieldLabel, { Input, Textarea } from '@/components/form/FieldLabel'
import DietaryLevelSelect from '@/components/form/DietaryLevelSelect'
import StatusSelect from '@/components/form/StatusSelect'
import { CHECK_LEVEL_CONFIG } from '@/utils/constants'
import type { Restaurant, DietaryLevel, RestaurantStatus, CheckLevel } from '@/types'

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Partial<Restaurant>>({})

  useEffect(() => {
    fetchRestaurant(id)
      .then((r) => {
        if (!r || !isOwner(r.session_id)) {
          router.push(`/restaurants/${id}`)
          return
        }
        setForm(r)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const set = <K extends keyof Restaurant>(key: K, value: Restaurant[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim() || !form.address?.trim()) {
      setError('店名と住所は必須です。')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateRestaurant(id, {
        name: form.name,
        address: form.address,
        lat: form.lat!,
        lng: form.lng!,
        comment: form.comment || null,
        status: form.status!,
        gluten_free: form.gluten_free!,
        casein_free: form.casein_free!,
        sugar_free: form.sugar_free!,
        check_level: form.check_level!,
        foods_ok: form.foods_ok || null,
        foods_ng: form.foods_ng || null,
        confirmed_details: form.confirmed_details || null,
        shop_response: form.shop_response || null,
        changes_made: form.changes_made || null,
        staff_memo: form.staff_memo || null,
        safety_level: form.safety_level ?? null,
        can_consult_next: form.can_consult_next ?? null,
        notes: form.notes || null,
        session_id: form.session_id!,
      })
      router.push(`/restaurants/${id}`)
    } catch (e) {
      setError('更新に失敗しました。')
      console.error(e)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
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
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
              {error}
            </div>
          )}

          {/* 基本情報 */}
          <Section title="基本情報">
            <div className="space-y-4">
              <div>
                <FieldLabel required>店名</FieldLabel>
                <Input
                  value={form.name ?? ''}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <FieldLabel required>住所</FieldLabel>
                <Input
                  value={form.address ?? ''}
                  onChange={(e) => set('address', e.target.value)}
                  required
                />
              </div>
              <div>
                <FieldLabel>体験メモ</FieldLabel>
                <Textarea
                  value={form.comment ?? ''}
                  onChange={(e) => set('comment', e.target.value)}
                  rows={4}
                  placeholder="訪問した感想、雰囲気、気づいたことなど"
                />
              </div>
            </div>
          </Section>

          {/* ステータス */}
          <Section title="ステータス">
            <StatusSelect
              value={form.status as RestaurantStatus}
              onChange={(v) => set('status', v)}
            />
          </Section>

          {/* 食事対応 */}
          <Section title="食事制限への対応">
            <div className="space-y-5">
              <div>
                <FieldLabel>グルテンフリー</FieldLabel>
                <DietaryLevelSelect
                  value={form.gluten_free as DietaryLevel}
                  onChange={(v) => set('gluten_free', v)}
                />
              </div>
              <div>
                <FieldLabel>カゼインフリー</FieldLabel>
                <DietaryLevelSelect
                  value={form.casein_free as DietaryLevel}
                  onChange={(v) => set('casein_free', v)}
                />
              </div>
              <div>
                <FieldLabel>白砂糖フリー</FieldLabel>
                <DietaryLevelSelect
                  value={form.sugar_free as DietaryLevel}
                  onChange={(v) => set('sugar_free', v)}
                  sugarMode
                />
              </div>
            </div>
          </Section>

          {/* 訪問記録 */}
          <Section title="訪問記録">
            <div className="space-y-4">
              <div>
                <FieldLabel>確認範囲</FieldLabel>
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
                <FieldLabel>安心度</FieldLabel>
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
                <FieldLabel>食べられたもの</FieldLabel>
                <Textarea
                  value={form.foods_ok ?? ''}
                  onChange={(e) => set('foods_ok', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <FieldLabel>NGだったもの</FieldLabel>
                <Textarea
                  value={form.foods_ng ?? ''}
                  onChange={(e) => set('foods_ng', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <FieldLabel>確認した内容・お店の返答</FieldLabel>
                <Textarea
                  value={form.confirmed_details ?? ''}
                  onChange={(e) => set('confirmed_details', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <FieldLabel>変更してくれた内容</FieldLabel>
                <Input
                  value={form.changes_made ?? ''}
                  onChange={(e) => set('changes_made', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>店員さんの対応メモ</FieldLabel>
                <Textarea
                  value={form.staff_memo ?? ''}
                  onChange={(e) => set('staff_memo', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <FieldLabel>注意点・メモ</FieldLabel>
                <Textarea
                  value={form.notes ?? ''}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-200 text-white text-sm font-bold transition-colors"
          >
            {submitting ? '保存中…' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
      <h3 className="font-semibold text-stone-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}
