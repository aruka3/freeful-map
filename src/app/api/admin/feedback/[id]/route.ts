import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!(await isAdminEmail(session?.user?.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const { resolved } = await req.json()
  await sql`UPDATE feedback SET resolved_at = ${resolved ? new Date().toISOString() : null} WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
