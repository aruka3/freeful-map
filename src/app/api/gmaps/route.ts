import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const inputUrl = request.nextUrl.searchParams.get('url')
  if (!inputUrl?.trim()) {
    return NextResponse.json({ error: 'URLを入力してください' }, { status: 400 })
  }

  let url = inputUrl.trim()

  // 短縮URLは追跡して解決を試みる
  if (url.includes('goo.gl') || url.includes('maps.app')) {
    const resolved = await resolveShortUrl(url)
    if (!resolved) {
      return NextResponse.json({
        error: '短縮URLの解決に失敗しました。Safariのアドレスバーに表示されるURLをそのままコピーして貼り付けてください。',
        hint: true,
      }, { status: 422 })
    }
    url = resolved
  }

  // google.com/maps 以外は不可
  if (!url.includes('google.com/maps')) {
    return NextResponse.json({ error: 'GoogleマップのURLを入力してください。' }, { status: 422 })
  }

  // 緯度経度を抽出（@LAT,LNG,ZOOMz パターン）
  const coords = extractCoords(url)
  if (!coords) {
    return NextResponse.json({ error: 'URLに座標情報が含まれていません。地図上でお店を選択した後のURLをコピーしてください。' }, { status: 422 })
  }

  // 店名を抽出
  const name = extractName(url)

  // 逆ジオコーディングで住所取得
  const address = await reverseGeocode(coords.lat, coords.lng)

  return NextResponse.json({
    name: name ?? '',
    address: address ?? '',
    lat: coords.lat,
    lng: coords.lng,
  })
}

async function resolveShortUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    })
    if (res.url && res.url.includes('google.com/maps')) {
      return res.url
    }
    return null
  } catch {
    return null
  }
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (!m) return null
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
}

function extractName(url: string): string | null {
  try {
    const u = new URL(url)
    const match = u.pathname.match(/\/place\/([^/@]+)/)
    if (!match) return null
    const decoded = decodeURIComponent(match[1]).replace(/\+/g, ' ').trim()
    return decoded || null
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'User-Agent': 'FreefulMap/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const a = data.address as Record<string, string>
    if (!a) return null
    const parts = [
      a.state,
      a.city ?? a.county ?? a.town,
      a.suburb ?? a.quarter ?? a.neighbourhood,
      a.road,
      a.house_number,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join('') : (data.display_name as string | null)
  } catch {
    return null
  }
}
