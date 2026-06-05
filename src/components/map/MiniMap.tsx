'use client'

import { useEffect, useRef } from 'react'

interface MiniMapProps {
  lat: number
  lng: number
  onMove?: (lat: number, lng: number) => void
  className?: string
}

export default function MiniMap({ lat, lng, onMove, className }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const onMoveRef = useRef(onMove)
  useEffect(() => { onMoveRef.current = onMove }, [onMove])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const init = async () => {
      const L = (await import('leaflet')).default

      const map = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 17,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
        <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26S32 27 32 16C32 7.2 24.8 0 16 0z"
          fill="#10b981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
      </svg>`

      const icon = L.divIcon({
        html: svgIcon,
        className: 'freeful-map-pin',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      })

      const marker = L.marker([lat, lng], { icon, draggable: !!onMove }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onMoveRef.current?.(pos.lat, pos.lng)
      })

      mapRef.current = map
      markerRef.current = marker
    }

    init()

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 座標が変わったらピンと中心を更新
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return
    markerRef.current.setLatLng([lat, lng])
    mapRef.current.setView([lat, lng], 17)
  }, [lat, lng])

  return <div ref={containerRef} className={className ?? 'w-full h-48 rounded-xl overflow-hidden'} />
}
