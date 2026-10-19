import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { resolvePrefecture } from '@/lib/prefecture'
import { auth } from '@/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userEmail = session?.user?.email ?? null

  const rows = userEmail
    ? await sql`
        SELECT r.*, urs.status as user_status
        FROM restaurants r
        LEFT JOIN user_restaurant_status urs
          ON urs.restaurant_id = r.id AND urs.user_email = ${userEmail}
        WHERE r.id = ${id}
      `
    : await sql`SELECT *, NULL as user_status FROM restaurants WHERE id = ${id}`

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const r = rows[0] as Record<string, unknown>
  return NextResponse.json({
    ...r,
    memo_private: r.user_email && r.user_email === userEmail ? r.memo_private : null,
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userEmail = session?.user?.email ?? null
  const sessionId = req.headers.get('x-session-id') ?? ''

  const existing = await sql`SELECT id, user_email FROM restaurants WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].user_email && existing[0].user_email !== userEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    name, address, lat, lng, comment, memo_public, memo_private,
    has_storefront, status, tags,
  } = body
  const prefecture = await resolvePrefecture(address, lat, lng, has_storefront ?? true)

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
      prefecture = ${prefecture},
      session_id = ${sessionId || body.session_id || ''},
      user_email = COALESCE(${userEmail}, user_email),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  if (userEmail && body.status) {
    await sql`
      INSERT INTO user_restaurant_status (user_email, restaurant_id, status)
      VALUES (${userEmail}, ${id}, ${body.status})
      ON CONFLICT (user_email, restaurant_id) DO UPDATE SET status = ${body.status}, updated_at = now()
    `
  }

  return NextResponse.json(rows[0])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userEmail = session?.user?.email ?? null

  const existing = await sql`SELECT id, user_email FROM restaurants WHERE id = ${id}`
  if (!existing.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing[0].user_email && existing[0].user_email !== userEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await sql`DELETE FROM restaurants WHERE id = ${id}`
  return new NextResponse(null, { status: 204 })
}
