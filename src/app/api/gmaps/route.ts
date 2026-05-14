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

  // 緯度経度を抽出
  let coords = extractCoords(url)

  // 店名を抽出
  const name = extractName(url)

  // 座標がない場合、店名でジオコーディングを試みる
  if (!coords) {
    if (name) {
      coords = await geocodeByName(name)
    }
    if (!coords) {
      return NextResponse.json({ error: 'URLに座標情報が含まれていません。地図上でお店を選択した後のURLをコピーしてください。' }, { status: 422 })
    }
  }

  // 逆ジオコーディングで住所取得
  const address = await reverseGeocode(coords.lat, coords.lng)

  return NextResponse.json({
    name: name ?? '',
    address: address ?? '',
    lat: coords.lat,
    lng: coords.lng,
  })
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
}

async function resolveShortUrl(url: string): Promise<string | null> {
  // 1. redirect: 'follow' で最終URLを取得
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' })
    if (res.url?.includes('google.com/maps')) return res.url
  } catch { /* fall through */ }

  // 2. redirect: 'manual' で Location ヘッダーを取得
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'manual' })
    const loc = res.headers.get('location')
    if (loc?.includes('google.com/maps')) return loc
    // Location が別の短縮URLの場合、もう一段階追跡
    if (loc) {
      const res2 = await fetch(loc, { headers: BROWSER_HEADERS, redirect: 'follow' })
      if (res2.url?.includes('google.com/maps')) return res2.url
    }
  } catch { /* fall through */ }

  // 3. レスポンスHTMLから Google Maps URLを抽出
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' })
    const text = await res.text()
    const m = text.match(/https:\/\/(?:www\.)?google\.com\/maps\/[^"'\s\\]+/)
    if (m) return decodeURIComponent(m[0])
  } catch { /* fall through */ }

  return null
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  // @LAT,LNG,ZOOMz パターン
  const m1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m1) return { lat: parseFloat(m1[1]), lng: parseFloat(m1[2]) }
  // ll=LAT,LNG クエリパラメータ
  try {
    const u = new URL(url)
    const ll = u.searchParams.get('ll') ?? u.searchParams.get('sll')
    if (ll) {
      const [lat, lng] = ll.split(',').map(parseFloat)
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    // q=LAT,LNG の場合
    const q = u.searchParams.get('q')
    if (q) {
      const m2 = q.match(/^(-?\d+\.\d+),(-?\d+\.\d+)$/)
      if (m2) return { lat: parseFloat(m2[1]), lng: parseFloat(m2[2]) }
    }
  } catch { /* ignore */ }
  return null
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

async function geocodeByName(name: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&countrycodes=jp`,
      { headers: { 'User-Agent': 'FreefulMap/1.0' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // HeartRails Geo API（日本住所に最適化、丁目レベルまで取得可能）
  try {
    const res = await fetch(
      `https://geoapi.heartrails.com/api/json?method=searchByGeoPoint&x=${lng}&y=${lat}`,
      { headers: { 'User-Agent': 'FreefulMap/1.0' } }
    )
    if (res.ok) {
      const data = await res.json()
      const loc = data?.response?.location?.[0]
      if (loc?.prefecture) {
        return `${loc.prefecture}${loc.city}${loc.town ?? ''}`
      }
    }
  } catch { /* fall through */ }

  // Nominatim フォールバック
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
      a.city_district ?? a.suburb ?? a.quarter ?? a.neighbourhood,
      a.house_number,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join('') : (data.display_name as string | null)
  } catch {
    return null
  }
}
