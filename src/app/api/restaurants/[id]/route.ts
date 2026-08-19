import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`SELECT * FROM restaurants WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = req.headers.get('x-session-id') ?? ''

  const existing = await sql`SELECT session_id FROM restaurants WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].session_id !== sessionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    name, address, lat, lng, comment, memo_public, memo_private,
    has_storefront, status, tags,
  } = body

  const rows = await sql`
    UPDATE restaurants SET
      name = ${name},
      address = ${address},
      lat = ${lat},
      lng = ${lng},
      comment = ${comment ?? null},
      memo_public = ${memo_public ?? null},
      memo_private = ${memo_private ?? null},
      has_storefront = ${has_storefront ?? true},
      status = ${status},
      tags = ${tags ?? []},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = req.headers.get('x-session-id') ?? ''

  const existing = await sql`SELECT session_id FROM restaurants WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].session_id !== sessionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await sql`DELETE FROM restaurants WHERE id = ${id}`
  return new NextResponse(null, { status: 204 })
}
