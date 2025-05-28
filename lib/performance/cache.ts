// Système de cache avancé pour optimiser les performances de Wakademy

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class PerformanceCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes par défaut

  // Méthode pour définir un élément dans le cache
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, item)
  }

  // Méthode pour récupérer un élément du cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Méthode pour supprimer un élément du cache
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Méthode pour vider le cache
  clear(): void {
    this.cache.clear()
  }

  // Méthode pour nettoyer les éléments expirés
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Méthode pour obtenir des statistiques du cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instance singleton du cache
export const performanceCache = new PerformanceCache()

// Fonction wrapper pour les requêtes avec cache
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Essayer de récupérer depuis le cache
  const cached = performanceCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Si pas en cache, exécuter la fonction et mettre en cache
  const data = await fetcher()
  performanceCache.set(key, data, ttl)
  return data
}

// Cache spécialisé pour les contenus
export class ContentCache {
  private static readonly CONTENT_TTL = 10 * 60 * 1000 // 10 minutes
  private static readonly TRENDING_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly LIBRARY_TTL = 3 * 60 * 1000 // 3 minutes

  static async getTrendingContent(type: string, limit: number = 10) {
    const key = `trending:${type}:${limit}`
    return withCache(key, async () => {
      // Cette fonction sera remplacée par l'appel API réel
      const response = await fetch(`/api/trending?type=${type}&limit=${limit}`)
      return response.json()
    }, this.TRENDING_TTL)
  }

  static async getLibraryContent(type: string, limit: number = 20) {
    const key = `library:${type}:${limit}`
    return withCache(key, async () => {
      const response = await fetch(`/api/library?type=${type}&limit=${limit}`)
      return response.json()
    }, this.LIBRARY_TTL)
  }

  static async getContentById(id: string) {
    const key = `content:${id}`
    return withCache(key, async () => {
      const response = await fetch(`/api/content/${id}`)
      return response.json()
    }, this.CONTENT_TTL)
  }

  static invalidateContent(id?: string) {
    if (id) {
      performanceCache.delete(`content:${id}`)
    } else {
      // Invalider tous les caches de contenu
      const stats = performanceCache.getStats()
      stats.keys.forEach(key => {
        if (key.startsWith('content:') || key.startsWith('trending:') || key.startsWith('library:')) {
          performanceCache.delete(key)
        }
      })
    }
  }
}

// Nettoyage automatique du cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceCache.cleanup()
  }, 10 * 60 * 1000)
} 