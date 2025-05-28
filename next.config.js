/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations de performance
  experimental: {
    // Optimiser les bundles
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    // Activer le cache de build incrémental
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Configuration des images pour optimiser le chargement avec CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuration CDN pour les images
    loader: process.env.NODE_ENV === 'production' ? 'custom' : 'default',
    loaderFile: process.env.NODE_ENV === 'production' ? './lib/cdn/image-loader.js' : undefined,
  },

  // Optimisations du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuration des headers pour le cache et la compression
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configuration de la compression avancée
  compress: true,

  // Optimisations du bundle
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimiser les imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }

    // Optimiser la taille du bundle
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000, // 244KB
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            maxSize: 244000,
          },
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      }

      // Optimiser les modules
      config.optimization.moduleIds = 'deterministic'
      config.optimization.chunkIds = 'deterministic'
    }

    // Optimiser les performances de build
    if (!dev) {
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Minification avancée
      config.optimization.minimize = true
    }

    return config
  },

  // Optimisations diverses
  poweredByHeader: false,
  reactStrictMode: true,

  // Configuration des redirections pour optimiser le SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configuration des rewrites pour l'API
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/trending?type=trending&limit=1',
      },
    ]
  },

  // Configuration de génération statique pour les pages critiques
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig 