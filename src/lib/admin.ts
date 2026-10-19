import { sql } from '@/lib/db'

export async function isAdminEmail(email?: string | null) {
  if (!email) return false
  const rows = await sql`SELECT 1 FROM admins WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`
  return rows.length > 0
}
