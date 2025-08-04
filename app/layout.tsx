import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { OrganizationProvider } from "@/lib/providers/organization-provider"
import "./globals.css"
import { headers } from "next/headers"

export const metadata = {
  title: "Wakademy - Plateforme d'Apprentissage",
  description: "Plateforme de formation et contenu éducatif avec vidéos, podcasts et documents",
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['formation', 'éducation', 'apprentissage', 'vidéos', 'podcasts', 'wakademy'],
  authors: [{ name: 'Wakademy Team' }],
  creator: 'Wakademy',
  publisher: 'Wakademy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wakademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Wakademy - Plateforme d\'Apprentissage',
    description: 'Plateforme de formation et contenu éducatif avec vidéos, podcasts et documents',
    url: 'https://wakademy.com',
    siteName: 'Wakademy',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wakademy - Plateforme d\'Apprentissage',
    description: 'Plateforme de formation et contenu éducatif avec vidéos, podcasts et documents',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname =  headersList.get("x-pathname") || "/"
  const isHomePage = pathname === "/"

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Préchargement des ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="Wakademy" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wakademy" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Splash Screens pour iOS */}
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-2048-2732.jpg" sizes="2048x2732" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1668-2224.jpg" sizes="1668x2224" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1536-2048.jpg" sizes="1536x2048" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1125-2436.jpg" sizes="1125x2436" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1242-2208.jpg" sizes="1242x2208" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-750-1334.jpg" sizes="750x1334" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-640-1136.jpg" sizes="640x1136" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="wakademy-theme">
          <OrganizationProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Nous ne réservons plus d'espace ici car c'est géré dans les layouts enfants */}
              {children}
            </div>
          </OrganizationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
