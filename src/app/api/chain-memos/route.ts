import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/admin'
import { toPublicMemo } from '@/lib/chainMemoAccess'

export async function GET() {
  const session = await auth()
  const email = session?.user?.email ?? null
  const admin = await isAdminEmail(email)
  const rows = await sql`SELECT * FROM chain_memos ORDER BY name ASC`
  return NextResponse.json(
    rows.map((r) => toPublicMemo(r, !!email && (admin || r.user_email === email))),
  )
}

export async function POST(req: Request) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })

  const body = await req.json()
  const { name, accommodations, caveats, confirmed_at, official_url, memo } = body
  if (!name?.trim() || !accommodations?.trim()) {
    return NextResponse.json({ error: '店名と使える対応は必須です' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO chain_memos
      (name, accommodations, caveats, confirmed_at, official_url, memo, session_id, user_email)
    VALUES
      (${name}, ${accommodations}, ${caveats ?? null},
       ${confirmed_at ?? null}, ${official_url ?? null}, ${memo ?? null}, '', ${email})
    RETURNING *
  `
  return NextResponse.json(toPublicMemo(rows[0], true), { status: 201 })
}
