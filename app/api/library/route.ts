import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { performanceCache } from "@/lib/performance/cache"

// Cache des colonnes pour éviter de les récupérer à chaque requête
let cachedColumns: string[] | null = null
let columnsCacheTime = 0
const COLUMNS_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function getCachedColumns(supabase: any): Promise<string[]> {
  const now = Date.now()
  
  // Utiliser le cache si disponible et valide
  if (cachedColumns && now - columnsCacheTime < COLUMNS_CACHE_TTL) {
    return cachedColumns
  }

  try {
    const { data: columns, error } = await supabase
      .from('contents')
      .select('*')
      .limit(1)

    if (error) throw error

    if (columns && columns.length > 0) {
      cachedColumns = Object.keys(columns[0])
      columnsCacheTime = now
      return cachedColumns
    }
  } catch (error) {
    console.error('Error fetching columns:', error)
  }

  // Fallback vers les colonnes connues
  cachedColumns = ['id', 'title', 'description', 'type', 'author', 'duration', 'category', 'thumbnail', 'created_at', 'views']
  columnsCacheTime = now
  return cachedColumns
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "0 min"
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes} min`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    console.log('=== API Library Debug ===')
    console.log('Type requested:', type)
    console.log('Limit:', limit)

    // Créer une clé de cache unique basée sur les paramètres
    const cacheKey = `library:${type}:${limit}:${search}:${category}`
    const cachedData = performanceCache.get(cacheKey)
    
    if (cachedData) {
      console.log('✅ Données library récupérées depuis le cache')
      return NextResponse.json({ 
        ...cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    const supabase = await createClient()

    console.log('Environment variables:')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')

    console.log('Creating Supabase client with service key...')
    console.log('Supabase client created:', !!supabase)

    // Récupérer les colonnes disponibles avec cache
    const availableColumns = await getCachedColumns(supabase)

    // Sélectionner seulement les colonnes nécessaires pour optimiser
    const selectColumns = [
      'id', 'title', 'description', 'type', 'author', 
      'duration', 'category', 'created_at', 'views'
    ].filter(col => availableColumns.includes(col))

    // Ajouter thumbnail seulement si disponible
    if (availableColumns.includes('thumbnail')) {
      selectColumns.push('thumbnail')
    } else if (availableColumns.includes('thumbnail_url')) {
      selectColumns.push('thumbnail_url')
    }

    // Construire la requête selon le type
    let query = supabase.from('contents').select(selectColumns.join(', '))

    // Appliquer les filtres selon le type
    switch (type) {
      case 'all':
        console.log('Fetching all content...')
        break
      case 'trending':
        query = query.order('views', { ascending: false })
        break
      case 'new':
        query = query.order('created_at', { ascending: false })
        break
      case 'podcasts':
        query = query.eq('type', 'podcast')
        break
      case 'videos':
        query = query.eq('type', 'video')
        break
      case 'documents':
        query = query.eq('type', 'document')
        break
      default:
        console.log('Using default ordering...')
    }

    // Appliquer le filtre de recherche si fourni
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author.ilike.%${search}%`)
    }

    // Appliquer le filtre de catégorie si fourni
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Ordre par défaut si pas spécifié
    if (type === 'all' || (!type.includes('trending') && !type.includes('new'))) {
      query = query.order('created_at', { ascending: false })
    }

    // Limiter les résultats
    query = query.limit(Math.min(limit, 100)) // Maximum 100 pour éviter les requêtes trop lourdes

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        data: []
      }, { status: 500 })
    }

    console.log('Library query result:', { data, error })

    // Formater les données pour optimiser la réponse
    const formattedData = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      author: item.author,
      duration: formatDuration(item.duration),
      category: item.category,
      thumbnailUrl: item.thumbnail || item.thumbnail_url || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(item.title || 'Content')}`,
      createdAt: item.created_at,
      views: item.views || 0
    }))

    console.log(`Successfully fetched ${formattedData.length} items for type: ${type}`)

    const responseData = { 
      data: formattedData,
      cached: false,
      timestamp: new Date().toISOString(),
      total: formattedData.length
    }

    // Mettre en cache la réponse (cache plus court pour les recherches)
    const cacheTTL = search || category ? 60 * 1000 : 5 * 60 * 1000
    performanceCache.set(cacheKey, responseData, cacheTTL)

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: []
    }, { status: 500 })
  }
} 