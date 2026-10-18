import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const SECRET = 'freeful-dedupe-2026'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const before = await sql`SELECT COUNT(*) as count FROM restaurants`

  await sql`
    DELETE FROM restaurants
    WHERE id IN (
      SELECT DISTINCT ON (name) id
      FROM restaurants
      ORDER BY name, created_at ASC
    )
  `

  const after = await sql`SELECT COUNT(*) as count FROM restaurants`

  return NextResponse.json({
    before: before[0].count,
    after: after[0].count,
    deleted: Number(before[0].count) - Number(after[0].count),
  })
}
