import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const SECRET = 'freeful-check-2026'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rows = await sql`
    SELECT name, session_id, memo_private IS NOT NULL as has_memo, memo_private
    FROM restaurants
    ORDER BY name
  `

  return NextResponse.json(rows)
}
