// Loader d'images personnalisé pour CDN
// Optimise les images avec un CDN externe ou un service d'optimisation

export default function imageLoader({ src, width, quality }) {
  // Configuration CDN (à adapter selon votre CDN)
  const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.wakademy.com'
  
  // Si l'image est déjà une URL complète, la retourner telle quelle
  if (src.startsWith('http')) {
    return src
  }
  
  // Si c'est un placeholder, le retourner tel quel
  if (src.includes('placeholder.svg')) {
    return src
  }
  
  // Construire l'URL CDN avec optimisations
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality || 75).toString(),
    f: 'webp', // Format préféré
    auto: 'compress', // Compression automatique
  })
  
  return `${CDN_BASE_URL}/optimize?${params.toString()}`
}

// Fonction utilitaire pour précharger les images critiques
export function preloadCriticalImages(imageUrls) {
  if (typeof window === 'undefined') return
  
  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.type = 'image/webp'
    document.head.appendChild(link)
  })
} 