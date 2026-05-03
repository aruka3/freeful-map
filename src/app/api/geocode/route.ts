import { NextRequest, NextResponse } from 'next/server'

// 国土地理院 住所検索API（日本語住所に最適、APIキー不要）
const GSI_URL = 'https://msearch.gsi.go.jp/address-search/AddressSearch'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ error: '住所を入力してください' }, { status: 400 })
  }

  try {
    const res = await fetch(`${GSI_URL}?q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'FreefulMap/1.0' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: '座標サービスに接続できませんでした' }, { status: 502 })
    }

    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: '見つかりませんでした' }, { status: 404 })
    }

    // GSI APIのレスポンス: coordinates は [lng, lat] の順
    const [lng, lat] = data[0].geometry.coordinates
    const title: string = data[0].properties?.title ?? ''

    return NextResponse.json({ lat, lng, title })
  } catch {
    return NextResponse.json({ error: '座標の取得に失敗しました' }, { status: 500 })
  }
}
