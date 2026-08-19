import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT * FROM restaurants ORDER BY created_at DESC
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    name, address, lat, lng, comment, memo_public, memo_private,
    has_storefront, status, tags, session_id,
  } = body

  const rows = await sql`
    INSERT INTO restaurants
      (name, address, lat, lng, comment, memo_public, memo_private,
       has_storefront, status, tags, session_id)
    VALUES
      (${name}, ${address}, ${lat}, ${lng}, ${comment ?? null},
       ${memo_public ?? null}, ${memo_private ?? null},
       ${has_storefront ?? true}, ${status}, ${tags ?? []}, ${session_id})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
