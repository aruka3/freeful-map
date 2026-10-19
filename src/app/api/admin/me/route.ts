import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'

export async function GET() {
  const session = await auth()
  if (!(await isAdminEmail(session?.user?.email))) {
    return NextResponse.json({ isAdmin: false, pending: 0 })
  }
  const rows = await sql`SELECT count(*)::int AS n FROM feedback WHERE resolved_at IS NULL`
  return NextResponse.json({ isAdmin: true, pending: rows[0].n })
}
