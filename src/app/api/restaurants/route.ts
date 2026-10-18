import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  const userEmail = session?.user?.email ?? null

  const rows = await sql`SELECT * FROM restaurants ORDER BY created_at DESC`

  const sanitized = rows.map((r: Record<string, unknown>) => ({
    ...r,
    memo_private: r.user_email && r.user_email === userEmail ? r.memo_private : null,
  }))

  return NextResponse.json(sanitized)
}

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json()
  const {
    name, address, lat, lng, comment, memo_public, memo_private,
    has_storefront, status, tags, session_id,
  } = body

  const userEmail = session?.user?.email ?? null

  const rows = await sql`
    INSERT INTO restaurants
      (name, address, lat, lng, comment, memo_public, memo_private,
       has_storefront, status, tags, session_id, user_email)
    VALUES
      (${name}, ${address}, ${lat}, ${lng}, ${comment ?? null},
       ${memo_public ?? null}, ${memo_private ?? null},
       ${has_storefront ?? true}, ${status}, ${tags ?? []}, ${session_id}, ${userEmail})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
