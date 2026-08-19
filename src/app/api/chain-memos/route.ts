import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`SELECT * FROM chain_memos ORDER BY name ASC`
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    name, accommodations, caveats, confirmed_at, official_url, memo, session_id,
  } = body

  const rows = await sql`
    INSERT INTO chain_memos
      (name, accommodations, caveats, confirmed_at, official_url, memo, session_id)
    VALUES
      (${name}, ${accommodations ?? ''}, ${caveats ?? null},
       ${confirmed_at ?? null}, ${official_url ?? null}, ${memo ?? null}, ${session_id})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
