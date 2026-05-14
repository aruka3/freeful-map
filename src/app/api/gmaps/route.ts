import { NextRequest, NextResponse } from 'next/server'

// Google Maps URLから店名・座標を抽出し、住所を逆ジオコーディングで取得
export async function GET(request: NextRequest) {
  const inputUrl = request.nextUrl.searchParams.get('url')
  if (!inputUrl?.trim()) {
    return NextResponse.json({ error: 'URLを入力してください' }, { status: 400 })
  }

  try {
    // 短縮URLをリダイレクト追跡して最終URLを取得
    const finalUrl = await resolveUrl(inputUrl.trim())

    // 緯度経度を抽出
    const coords = extractCoords(finalUrl)
    if (!coords) {
      return NextResponse.json({ error: '座標を取得できませんでした。URLを確認してください。' }, { status: 422 })
    }

    // 店名を抽出（URLパスの /place/NAME/ 部分）
    const name = extractName(finalUrl)

    // 逆ジオコーディングで住所取得（Nominatim）
    const address = await reverseGeocode(coords.lat, coords.lng)

    return NextResponse.json({
      name: name ?? '',
      address: address ?? '',
      lat: coords.lat,
      lng: coords.lng,
    })
  } catch (e) {
    console.error('gmaps fetch error:', e)
    return NextResponse.json({ error: 'URLの読み込みに失敗しました。' }, { status: 500 })
  }
}

async function resolveUrl(url: string): Promise<string> {
  // google.com/maps の場合はそのまま
  if (url.includes('google.com/maps')) return url

  // 短縮URL（maps.app.goo.gl, goo.gl/maps）をリダイレクト追跡
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  return res.url
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  // @LAT,LNG,ZOOM または @LAT,LNG パターン
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (!m) return null
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
}

function extractName(url: string): string | null {
  try {
    const u = new URL(url)
    // /maps/place/NAME/@... のパターン
    const match = u.pathname.match(/\/place\/([^/@]+)/)
    if (!match) return null
    const decoded = decodeURIComponent(match[1]).replace(/\+/g, ' ')
    // Google が付けるゴミ文字除去
    return decoded.replace(/^[^a-zA-Z　-鿿＀-￯]+/, '').trim() || null
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

    // 日本語住所を組み立て（都道府県→市区町村→町名→番地）
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
