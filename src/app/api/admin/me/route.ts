import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isAdminEmail } from '@/lib/admin'

export async function GET() {
  const session = await auth()
  return NextResponse.json({ isAdmin: await isAdminEmail(session?.user?.email) })
}
