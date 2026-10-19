import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

async function notifySlack(fb: {
  name?: string | null
  contact?: string | null
  message: string
  pageUrl?: string | null
  imageUrl?: string | null
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return
  try {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const sender = `*${esc(fb.name ?? '（名前なし）')}*${fb.contact ? `（${esc(fb.contact)}）` : ''}`
    const quoted = esc(fb.message.slice(0, 2800)).replace(/^/gm, '> ')
    const footer = [
      fb.pageUrl ? `送信元の画面：${esc(fb.pageUrl)}` : null,
    ].filter(Boolean)

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `フィードバックが届きました：${fb.message.slice(0, 50)}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${sender} さんからフィードバックが届きました\n${quoted}`,
            },
          },
          ...(fb.imageUrl
            ? [{ type: 'image', image_url: fb.imageUrl, alt_text: '添付画像' }]
            : []),
          ...(footer.length
            ? [{ type: 'context', elements: [{ type: 'mrkdwn', text: footer.join('　') }] }]
            : []),
        ],
      }),
    })
    if (!res.ok) console.error('Slack通知失敗', res.status, await res.text())
  } catch (err) {
    console.error('Slack通知失敗', err)
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, contact, message, pageUrl, imageUrl } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'メッセージは必須です' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO feedback (name, contact, message, page_url, image_url)
    VALUES (${name?.trim() || null}, ${contact?.trim() || null}, ${message.trim()}, ${pageUrl || null}, ${imageUrl || null})
    RETURNING id
  `

  await notifySlack({ name, contact, message, pageUrl, imageUrl })

  return NextResponse.json({ id: rows[0].id }, { status: 201 })
}
