import { isAdminEmail } from '@/lib/admin'

export async function canEditChainMemo(email: string | null | undefined, owner: string | null | undefined) {
  if (!email) return false
  if (owner && owner.toLowerCase() === email.toLowerCase()) return true
  return isAdminEmail(email)
}

export function toPublicMemo(row: Record<string, unknown>, canEdit: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_email, session_id, ...rest } = row
  return { ...rest, can_edit: canEdit }
}
