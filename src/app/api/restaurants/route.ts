import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  const userEmail = session?.user?.email ?? null

  const rows = userEmail
    ? await sql`
        SELECT r.*, urs.status as user_status
        FROM restaurants r
        LEFT JOIN user_restaurant_status urs
          ON urs.restaurant_id = r.id AND urs.user_email = ${userEmail}
        ORDER BY r.created_at DESC
      `
    : await sql`SELECT *, NULL as user_status FROM restaurants ORDER BY created_at DESC`

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
  const newRestaurant = rows[0] as Record<string, unknown>
  if (userEmail && status) {
    await sql`
      INSERT INTO user_restaurant_status (user_email, restaurant_id, status)
      VALUES (${userEmail}, ${newRestaurant.id}, ${status})
      ON CONFLICT (user_email, restaurant_id) DO UPDATE SET status = ${status}, updated_at = now()
    `
  }
  return NextResponse.json({ ...newRestaurant, user_status: status ?? null }, { status: 201 })
}
