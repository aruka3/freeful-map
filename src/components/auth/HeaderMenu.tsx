'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface UserInfo {
  name?: string | null
  email?: string | null
  image?: string | null
}

const itemClass =
  'flex items-center gap-3 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap'

export default function HeaderMenu() {
  const [user, setUser] = useState<UserInfo | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="メニュー"
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
          {user?.name && (
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
              {user.email && <p className="text-xs text-stone-400 truncate">{user.email}</p>}
            </div>
          )}
          <Link href="/chain-memos" className={itemClass} onClick={() => setOpen(false)}>
            <span>📝</span>困ったときメモ
          </Link>
          <Link href="/feedback" className={itemClass} onClick={() => setOpen(false)}>
            <span>💬</span>フィードバックを送る
          </Link>
          {isAdmin && (
            <Link href="/admin/feedback" className={itemClass} onClick={() => setOpen(false)}>
              <span>📥</span>フィードバック受信箱
            </Link>
          )}
          <div className="border-t border-stone-100">
            {user ? (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a href="/api/auth/signout?callbackUrl=/" className={`${itemClass} text-stone-500`}>
                <span>🚪</span>ログアウト
              </a>
            ) : (
              <a href="/login" className={`${itemClass} text-emerald-600 font-medium`}>
                <span>🔑</span>ログイン
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
