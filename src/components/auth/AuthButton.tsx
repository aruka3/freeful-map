'use client'

import { useEffect, useState } from 'react'

interface UserInfo {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function AuthButton() {
  const [user, setUser] = useState<UserInfo | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  if (user === undefined) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.image && (
          <img src={user.image} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
        )}
        <span className="text-xs text-stone-500 hidden sm:block truncate max-w-[120px]">{user.name}</span>
        <a
          href="/api/auth/signout?callbackUrl=/"
          className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
        >
          ログアウト
        </a>
      </div>
    )
  }

  return (
    <a
      href="/login"
      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-200"
    >
      ログイン
    </a>
  )
}
