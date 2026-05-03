// セッションIDによる簡易ユーザー識別（MVP用、将来はSupabase Authに移行）
const SESSION_KEY = 'freeful_map_session_id'

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function isOwner(sessionId: string): boolean {
  return sessionId === getSessionId()
}
