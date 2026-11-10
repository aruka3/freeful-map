export function toPublicRestaurant(row: Record<string, unknown>, viewerEmail: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_email, session_id, memo_private, ...rest } = row
  const isOwner = !!viewerEmail && user_email === viewerEmail
  return { ...rest, memo_private: isOwner ? memo_private : null, is_owner: isOwner }
}
