import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'

export const dynamic = 'force-dynamic'

type Feedback = {
  id: string
  name: string | null
  contact: string | null
  message: string
  page_url: string | null
  image_url: string | null
  image_urls: string[] | null
  created_at: string
}

function imagesOf(r: Feedback) {
  if (r.image_urls?.length) return r.image_urls
  return r.image_url ? [r.image_url] : []
}

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')
  if (!(await isAdminEmail(session.user.email))) redirect('/')

  const rows = (await sql`
    SELECT id, name, contact, message, page_url, image_url, image_urls, created_at
    FROM feedback ORDER BY created_at DESC LIMIT 200
  `) as Feedback[]

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-stone-800">フィードバック受信箱</h1>
          <span className="text-xs text-stone-400">{rows.length} 件</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {rows.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-16">まだフィードバックはありません</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-stone-800">
                  {r.name || '（名前なし）'}
                  {r.contact && <span className="ml-2 text-xs font-normal text-stone-500">{r.contact}</span>}
                </p>
                <time className="text-xs text-stone-400 shrink-0">
                  {new Date(r.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                </time>
              </div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap break-words">{r.message}</p>
              {imagesOf(r).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagesOf(r).map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="添付画像" className="w-full h-40 object-cover rounded-xl border border-stone-200" />
                    </a>
                  ))}
                </div>
              )}
              {r.page_url && <p className="text-xs text-stone-400 break-all">送信元：{r.page_url}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
