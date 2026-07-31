// Configuração do Next.js: build standalone (para Docker) e headers de segurança
// aplicados a toda rota (helmet equivalente do lado do front-end).
import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'
const geoApiUrl = process.env.NEXT_PUBLIC_GEO_API_URL ?? ''

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // connect-src precisa liberar a API Fastify (apiUrl) — sem isso o
            // browser bloqueia as chamadas de fetch feitas pelo authClient/services
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ${apiUrl}${
              geoApiUrl
? ` ${geoApiUrl}`
: ''
            }`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
