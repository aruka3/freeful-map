'use client'

import { useEffect, useRef } from 'react'
import type { Restaurant } from '@/types'
import { STATUS_CONFIG, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/utils/constants'

interface MapViewProps {
  restaurants: Restaurant[]
  onPinClick: (restaurant: Restaurant) => void
  center?: [number, number]
}

export default function MapView({ restaurants, onPinClick, center }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current!, {
        center: center || DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      restaurants.forEach((restaurant) => {
        const config = STATUS_CONFIG[restaurant.status]
        const color = config.color

        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26S32 27 32 16C32 7.2 24.8 0 16 0z"
              fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
          </svg>
        `
        const icon = L.divIcon({
          html: svgIcon,
          className: '',
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
    }

    updateMarkers()
  }, [restaurants, onPinClick])

  useEffect(() => {
    if (!mapInstanceRef.current || !center) return
    mapInstanceRef.current.setView(center, DEFAULT_ZOOM)
  }, [center])

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ minHeight: '100%' }}
    />
  )
}
