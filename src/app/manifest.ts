import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Depósito Pro - Gestión de Stock',
    short_name: 'Depósito Pro',
    description: 'Aplicación de gestión de inventario y escaneo de códigos QR',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    orientation: 'portrait',
    scope: '/',
  };
}