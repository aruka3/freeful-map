import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`SELECT * FROM chain_memos WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = req.headers.get('x-session-id') ?? ''

  const existing = await sql`SELECT session_id FROM chain_memos WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].session_id !== sessionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, accommodations, caveats, confirmed_at, official_url, memo } = body

  const rows = await sql`
    UPDATE chain_memos SET
      name = ${name},
      accommodations = ${accommodations ?? ''},
      caveats = ${caveats ?? null},
      confirmed_at = ${confirmed_at ?? null},
      official_url = ${official_url ?? null},
      memo = ${memo ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sessionId = req.headers.get('x-session-id') ?? ''

  const existing = await sql`SELECT session_id FROM chain_memos WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].session_id !== sessionId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await sql`DELETE FROM chain_memos WHERE id = ${id}`
  return new NextResponse(null, { status: 204 })
}
