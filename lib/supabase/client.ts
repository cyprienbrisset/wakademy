import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

// Pool de connexions pour optimiser les performances
class SupabaseConnectionPool {
  private clients: Map<string, SupabaseClient> = new Map()
  private readonly maxConnections = 5
  private connectionCount = 0

  getClient(key: string = 'default'): SupabaseClient {
    // Réutiliser une connexion existante si disponible
    if (this.clients.has(key)) {
      return this.clients.get(key)!
    }

    // Vérifier que les variables d'environnement sont définies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies",
      )
    }

    // Limiter le nombre de connexions
    if (this.connectionCount >= this.maxConnections) {
      // Retourner une connexion existante si on atteint la limite
      const existingClient = Array.from(this.clients.values())[0]
      if (existingClient) {
        return existingClient
      }
    }

    // Créer un nouveau client avec des options optimisées
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        fetch: (...args) => fetch(...args),
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes de cache
        }
      },
      db: {
        schema: "public",
      }
    })

    this.clients.set(key, client)
    this.connectionCount++

    return client
  }

  // Nettoyer les connexions inutilisées
  cleanup() {
    if (this.clients.size > this.maxConnections) {
      const keysToRemove = Array.from(this.clients.keys()).slice(this.maxConnections)
      keysToRemove.forEach(key => {
        this.clients.delete(key)
        this.connectionCount--
      })
    }
  }

  // Obtenir des statistiques sur le pool
  getStats() {
    return {
      activeConnections: this.clients.size,
      maxConnections: this.maxConnections,
      connectionCount: this.connectionCount
    }
  }
}

// Instance singleton du pool de connexions
const connectionPool = new SupabaseConnectionPool()

// Fonction principale pour créer/récupérer un client
export function createClient(key?: string) {
  return connectionPool.getClient(key)
}

// Client optimisé pour les requêtes en lecture seule
export function createReadOnlyClient() {
  return connectionPool.getClient('readonly')
}

// Client optimisé pour les requêtes d'écriture
export function createWriteClient() {
  return connectionPool.getClient('write')
}

// Nettoyage automatique du pool toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    connectionPool.cleanup()
  }, 5 * 60 * 1000)
}

// Fonction pour obtenir les statistiques du pool
export function getConnectionStats() {
  return connectionPool.getStats()
}

// Cache pour les requêtes fréquentes
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Fonction wrapper pour les requêtes avec cache
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes par défaut
): Promise<T> {
  const now = Date.now()
  const cached = queryCache.get(cacheKey)

  // Vérifier si on a une version en cache valide
  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data as T
  }

  // Exécuter la requête et mettre en cache
  const data = await queryFn()
  queryCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl
  })

  return data
}

// Nettoyer le cache des requêtes expirées
function cleanupQueryCache() {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      queryCache.delete(key)
    }
  }
}

// Nettoyage automatique du cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupQueryCache, 10 * 60 * 1000)
}
