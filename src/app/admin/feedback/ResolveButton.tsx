'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResolveButton({ id, resolved }: { id: string; resolved: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: !resolved }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        resolved
          ? 'text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 disabled:opacity-50'
          : 'text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5 disabled:opacity-50'
      }
    >
      {resolved ? '未対応に戻す' : '対応済みにする'}
    </button>
  )
}
