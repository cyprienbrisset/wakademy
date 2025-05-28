// Système de préchargement pour optimiser les performances

import { ContentCache } from './cache'

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low'
  delay?: number
}

class PerformancePreloader {
  private preloadQueue: Array<{ url: string; config: PreloadConfig }> = []
  private isProcessing = false

  // Précharger les contenus essentiels
  async preloadEssentialContent() {
    const essentialUrls = [
      { url: '/api/trending?type=trending&limit=10', config: { priority: 'high' as const } },
      { url: '/api/library?type=all&limit=20', config: { priority: 'high' as const } },
      { url: '/api/trending?type=new&limit=5', config: { priority: 'medium' as const } },
      { url: '/api/trending?type=podcasts&limit=5', config: { priority: 'medium' as const } }
    ]

    this.addToQueue(essentialUrls)
    this.processQueue()
  }

  // Ajouter des URLs à la queue de préchargement
  addToQueue(items: Array<{ url: string; config: PreloadConfig }>) {
    this.preloadQueue.push(...items)
    this.sortQueueByPriority()
  }

  // Trier la queue par priorité
  private sortQueueByPriority() {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    this.preloadQueue.sort((a, b) => 
      priorityOrder[a.config.priority] - priorityOrder[b.config.priority]
    )
  }

  // Traiter la queue de préchargement
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()
      if (!item) break

      try {
        // Attendre le délai si spécifié
        if (item.config.delay) {
          await new Promise(resolve => setTimeout(resolve, item.config.delay))
        }

        // Précharger l'URL
        await this.preloadUrl(item.url)
      } catch (error) {
        console.warn(`Erreur lors du préchargement de ${item.url}:`, error)
      }
    }

    this.isProcessing = false
  }

  // Précharger une URL spécifique
  private async preloadUrl(url: string) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300' // 5 minutes
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Préchargé: ${url} (${data.data?.length || 0} éléments)`)
      }
    } catch (error) {
      console.warn(`❌ Échec préchargement: ${url}`, error)
    }
  }

  // Précharger les images importantes
  preloadImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
      if (url && !url.includes('placeholder.svg')) {
        const img = new Image()
        img.src = url
      }
    })
  }

  // Précharger les contenus liés
  async preloadRelatedContent(contentId: string, category?: string) {
    const relatedUrls = [
      { 
        url: `/api/related-content?id=${contentId}&category=${category || ''}`, 
        config: { priority: 'medium' as const, delay: 1000 } 
      }
    ]

    this.addToQueue(relatedUrls)
    this.processQueue()
  }

  // Précharger selon la navigation de l'utilisateur
  preloadByUserBehavior(currentPage: string) {
    const preloadMap: Record<string, Array<{ url: string; config: PreloadConfig }>> = {
      '/': [
        { url: '/api/trending?type=trending&limit=10', config: { priority: 'high' } },
        { url: '/api/library?type=all&limit=10', config: { priority: 'medium', delay: 500 } }
      ],
      '/dashboard': [
        { url: '/api/trending?type=new&limit=5', config: { priority: 'high' } },
        { url: '/api/trending?type=podcasts&limit=5', config: { priority: 'medium' } }
      ],
      '/library': [
        { url: '/api/library?type=trending&limit=20', config: { priority: 'high' } },
        { url: '/api/library?type=podcasts&limit=10', config: { priority: 'medium', delay: 300 } },
        { url: '/api/library?type=videos&limit=10', config: { priority: 'medium', delay: 600 } }
      ]
    }

    const urlsToPreload = preloadMap[currentPage]
    if (urlsToPreload) {
      this.addToQueue(urlsToPreload)
      this.processQueue()
    }
  }
}

// Instance singleton
export const preloader = new PerformancePreloader()

// Hook pour précharger automatiquement au chargement de la page
export function usePreloader() {
  if (typeof window !== 'undefined') {
    // Précharger les contenus essentiels après un court délai
    setTimeout(() => {
      preloader.preloadEssentialContent()
    }, 1000)

    // Précharger selon la page actuelle
    const currentPath = window.location.pathname
    setTimeout(() => {
      preloader.preloadByUserBehavior(currentPath)
    }, 2000)
  }
}

// Fonction pour précharger les ressources critiques
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Précharger les polices importantes
    const fontUrls = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-latin.woff2'
    ]

    fontUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = url
      document.head.appendChild(link)
    })

    // Précharger les icônes importantes
    const iconUrls = [
      '/icons/play.svg',
      '/icons/pause.svg',
      '/icons/heart.svg',
      '/icons/bookmark.svg'
    ]

    iconUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }
} 