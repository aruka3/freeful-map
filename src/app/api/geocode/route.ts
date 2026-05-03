import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ error: '住所を入力してください' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=ja&countrycodes=jp`,
      {
        headers: {
          'User-Agent': 'FreefulMap/1.0 (dietary-restaurant-map)',
          'Accept-Language': 'ja',
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: '座標サービスに接続できませんでした' }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '座標の取得に失敗しました' }, { status: 500 })
  }
}
