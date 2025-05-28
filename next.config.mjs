/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimisations de performance
  experimental: {
    // Optimiser les bundles
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Optimisations du compilateur
  compiler: {
    // Supprimer les console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuration de la compression avancée
  compress: true,
  // Optimisations diverses
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
}

export default nextConfig
