import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'
import ResolveButton from './ResolveButton'

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
  resolved_at: string | null
}

function imagesOf(r: Feedback) {
  if (r.image_urls?.length) return r.image_urls
  return r.image_url ? [r.image_url] : []
}


function Section({ title, items, emptyText }: { title: string; items: Feedback[]; emptyText?: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-stone-700">
        {title}（{items.length}件）
      </h2>
      {items.length === 0 && emptyText && <p className="text-sm text-stone-400">{emptyText}</p>}
      {items.map((r) => (
        <div
          key={r.id}
          className={`rounded-2xl p-4 shadow-sm border space-y-2 ${r.resolved_at ? 'bg-stone-50 border-stone-100 opacity-70' : 'bg-white border-stone-100'}`}
        >
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
          <div className="flex items-center justify-between gap-2 pt-1">
            {r.page_url ? (
              <a href={r.page_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline truncate">
                送信元の画面を開く
              </a>
            ) : (
              <span />
            )}
            <ResolveButton id={r.id} resolved={!!r.resolved_at} />
          </div>
        </div>
      ))}
    </section>
  )
}

export default async function AdminFeedbackPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')
  if (!(await isAdminEmail(session.user.email))) redirect('/')

  const rows = (await sql`
    SELECT id, name, contact, message, page_url, image_url, image_urls, created_at, resolved_at
    FROM feedback ORDER BY created_at DESC LIMIT 200
  `) as Feedback[]

  const pending = rows.filter((r) => !r.resolved_at)
  const done = rows.filter((r) => r.resolved_at)

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
          
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
        <Section title="未対応" items={pending} emptyText="未対応のフィードバックはありません。" />
        {done.length > 0 && <Section title="対応済み" items={done} />}
      </div>
    </div>
  )
}
