import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Freeful Map',
    short_name: 'Freeful',
    description: '安心して食べられるお店を記録する地図',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f4',
    theme_color: '#059669',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
    ],
  }
}
