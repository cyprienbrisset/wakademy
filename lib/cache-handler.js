// Gestionnaire de cache personnalisé pour Next.js
// Optimise les performances en utilisant un cache en mémoire

class CustomCacheHandler {
  constructor(options) {
    this.cache = new Map()
    this.maxSize = options?.maxSize || 1000
    this.defaultTTL = options?.defaultTTL || 5 * 60 * 1000 // 5 minutes
  }

  async get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Vérifier si l'élément a expiré
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return {
      value: item.value,
      lastModified: item.lastModified,
    }
  }

  async set(key, data, ctx) {
    // Nettoyer le cache si il devient trop grand
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const ttl = ctx?.revalidate ? ctx.revalidate * 1000 : this.defaultTTL
    const expires = Date.now() + ttl

    this.cache.set(key, {
      value: data,
      lastModified: Date.now(),
      expires,
    })
  }

  async revalidateTag(tag) {
    // Invalider tous les éléments avec ce tag
    for (const [key, item] of this.cache.entries()) {
      if (item.tags && item.tags.includes(tag)) {
        this.cache.delete(key)
      }
    }
  }

  cleanup() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Supprimer les éléments expirés
    entries.forEach(([key, item]) => {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    })

    // Si encore trop d'éléments, supprimer les plus anciens
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].lastModified - b[1].lastModified)
      
      const toDelete = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2))
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }
}

module.exports = CustomCacheHandler 