'use client'

import { useEffect, useRef, useState } from 'react'
import type { Restaurant } from '@/types'
import { STATUS_CONFIG, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/utils/constants'

interface MapViewProps {
  restaurants: Restaurant[]
  onPinClick: (restaurant: Restaurant) => void
}

export default function MapView({ restaurants, onPinClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // 地図初期化
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default

      const map = L.map(mapRef.current!, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true) // 初期化完了を通知
    }

    initMap()

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // ピン追加（地図準備完了後に実行される）
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      restaurants.forEach((restaurant) => {
        const config = STATUS_CONFIG[restaurant.status]
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26S32 27 32 16C32 7.2 24.8 0 16 0z"
              fill="${config.color}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
          </svg>`

        const icon = L.divIcon({
          html: svgIcon,
          className: 'freeful-map-pin',
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42],
        })

        const marker = L.marker([restaurant.lat, restaurant.lng], { icon })
          .addTo(mapInstanceRef.current!)
          .bindTooltip(restaurant.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -44],
            className: 'leaflet-tooltip-custom',
          })
          .on('click', () => onPinClick(restaurant))

        markersRef.current.push(marker)
      })

      // 登録済みのピンが1件以上あれば、全ピンが見えるようにズーム
      if (restaurants.length > 0 && mapInstanceRef.current) {
        const bounds = L.latLngBounds(restaurants.map((r) => [r.lat, r.lng]))
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: restaurants.length === 1 ? 15 : 13,
        })
      }
    }

    updateMarkers()
  }, [restaurants, onPinClick, mapReady])

  return <div ref={mapRef} className="w-full h-full" />
}
