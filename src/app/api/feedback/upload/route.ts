import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: '画像ファイルを選んでください' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '画像は10MBまでです' }, { status: 413 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Image upload not configured' }, { status: 503 })
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg'
  const blob = await put(`feedback/${Date.now()}-${crypto.randomUUID()}.${ext}`, file, { access: 'public' })
  return NextResponse.json({ url: blob.url })
}
