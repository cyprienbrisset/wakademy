"use client"

// Gestionnaire de Service Worker pour Wakademy
// Gère l'enregistrement, les mises à jour et la communication avec le SW

interface CacheStatus {
  [cacheName: string]: number
}

interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>
  unregister: () => Promise<boolean>
  getCacheStatus: () => Promise<CacheStatus>
  clearCache: () => Promise<boolean>
  checkForUpdates: () => Promise<boolean>
}

class ServiceWorkerManagerImpl implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('🚫 Service Worker non supporté')
      return null
    }

    try {
      console.log('🔧 Enregistrement du Service Worker...')
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('✅ Service Worker enregistré:', this.registration.scope)

      // Écouter les mises à jour
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Mise à jour du Service Worker détectée')
        this.handleUpdate()
      })

      // Vérifier s'il y a déjà une mise à jour en attente
      if (this.registration.waiting) {
        this.updateAvailable = true
        this.showUpdateNotification()
      }

      // Écouter les changements d'état
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Nouveau Service Worker actif')
        window.location.reload()
      })

      return this.registration

    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error)
      return null
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const result = await this.registration.unregister()
      console.log('🗑️ Service Worker désenregistré')
      return result
    } catch (error) {
      console.error('❌ Erreur lors du désenregistrement:', error)
      return false
    }
  }

  async getCacheStatus(): Promise<CacheStatus> {
    if (!navigator.serviceWorker.controller) {
      return {}
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      navigator.serviceWorker.controller!.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      )
    })
  }

  async clearCache(): Promise<boolean> {
    if (!navigator.serviceWorker.controller) {
      return false
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }

      navigator.serviceWorker.controller!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.update()
      return this.updateAvailable
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des mises à jour:', error)
      return false
    }
  }

  private handleUpdate() {
    if (!this.registration) return

    const newWorker = this.registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.updateAvailable = true
        this.showUpdateNotification()
      }
    })
  }

  private showUpdateNotification() {
    // Afficher une notification de mise à jour
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sw-update-available', {
        detail: { registration: this.registration }
      })
      window.dispatchEvent(event)
    }
  }

  activateUpdate() {
    if (!this.registration || !this.registration.waiting) return

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

// Instance singleton
export const swManager = new ServiceWorkerManagerImpl()

// Hook React pour utiliser le Service Worker
export function useServiceWorker() {
  const [isSupported, setIsSupported] = React.useState(false)
  const [isRegistered, setIsRegistered] = React.useState(false)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [cacheStatus, setCacheStatus] = React.useState<CacheStatus>({})

  React.useEffect(() => {
    setIsSupported('serviceWorker' in navigator)

    if ('serviceWorker' in navigator) {
      // Enregistrer le Service Worker
      swManager.register().then(registration => {
        setIsRegistered(!!registration)
      })

      // Écouter les mises à jour
      const handleUpdate = () => setUpdateAvailable(true)
      window.addEventListener('sw-update-available', handleUpdate)

      // Obtenir le statut du cache
      const updateCacheStatus = async () => {
        const status = await swManager.getCacheStatus()
        setCacheStatus(status)
      }

      updateCacheStatus()
      const interval = setInterval(updateCacheStatus, 30000) // Toutes les 30s

      return () => {
        window.removeEventListener('sw-update-available', handleUpdate)
        clearInterval(interval)
      }
    }
  }, [])

  const activateUpdate = () => {
    swManager.activateUpdate()
    setUpdateAvailable(false)
  }

  const clearCache = async () => {
    const success = await swManager.clearCache()
    if (success) {
      setCacheStatus({})
    }
    return success
  }

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    cacheStatus,
    activateUpdate,
    clearCache,
    checkForUpdates: swManager.checkForUpdates.bind(swManager)
  }
}

// Fonction utilitaire pour précharger des ressources critiques
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Précharger les polices
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-italic.woff2'
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = font
    document.head.appendChild(link)
  })

  // Précharger les CSS critiques
  const criticalCSS = [
    '/_next/static/css/app.css'
  ]

  criticalCSS.forEach(css => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = css
    document.head.appendChild(link)
  })
}

// Import React pour le hook
import React from 'react' 