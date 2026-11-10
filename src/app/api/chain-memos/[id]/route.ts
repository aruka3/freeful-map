import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { auth } from '@/auth'
import { canEditChainMemo, toPublicMemo } from '@/lib/chainMemoAccess'

type Params = { params: Promise<{ id: string }> }

async function loadWithAccess(id: string) {
  const session = await auth()
  const email = session?.user?.email ?? null
  const rows = await sql`SELECT * FROM chain_memos WHERE id = ${id}`
  if (!rows.length) return { email, row: null, canEdit: false }
  return { email, row: rows[0], canEdit: await canEditChainMemo(email, rows[0].user_email) }
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const { row, canEdit } = await loadWithAccess(id)
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(toPublicMemo(row, canEdit))
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const { email, row, canEdit } = await loadWithAccess(id)
  if (!email) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canEdit) return NextResponse.json({ error: '編集できるのは書いた本人と管理者だけです' }, { status: 403 })

  const { name, accommodations, caveats, confirmed_at, official_url, memo } = await req.json()
  const rows = await sql`
    UPDATE chain_memos SET
      name = ${name},
      accommodations = ${accommodations ?? ''},
      caveats = ${caveats ?? null},
      confirmed_at = ${confirmed_at ?? null},
      official_url = ${official_url ?? null},
      memo = ${memo ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return NextResponse.json(toPublicMemo(rows[0], true))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { email, row, canEdit } = await loadWithAccess(id)
  if (!email) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canEdit) return NextResponse.json({ error: '削除できるのは書いた本人と管理者だけです' }, { status: 403 })

  await sql`DELETE FROM chain_memos WHERE id = ${id}`
  return new NextResponse(null, { status: 204 })
}
