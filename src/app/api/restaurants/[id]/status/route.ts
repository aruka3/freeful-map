import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userEmail = session.user.email
  const { status } = await req.json()

  if (!['want_to_visit', 'visited'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await sql`
    INSERT INTO user_restaurant_status (user_email, restaurant_id, status)
    VALUES (${userEmail}, ${id}, ${status})
    ON CONFLICT (user_email, restaurant_id)
    DO UPDATE SET status = ${status}, updated_at = now()
  `

  return NextResponse.json({ success: true })
}
