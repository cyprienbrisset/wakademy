"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Liste des tables principales à vérifier
const REQUIRED_TABLES = [
  { name: "profiles", description: "Profils utilisateurs" },
  { name: "categories", description: "Catégories" },
  { name: "tags", description: "Tags" },
  { name: "contents", description: "Contenus" },
  { name: "content_tags", description: "Liaison contenus-tags" },
  { name: "content_ai_jobs", description: "Jobs de traitement IA" },
  { name: "user_favorites", description: "Favoris utilisateurs" },
  { name: "user_history", description: "Historique de visionnage" },
  { name: "playlists", description: "Playlists" },
  { name: "playlist_contents", description: "Contenus des playlists" },
  { name: "notifications", description: "Notifications" },
  { name: "app_settings", description: "Paramètres de l'application" },
  { name: "comments", description: "Commentaires" },
  { name: "ratings", description: "Évaluations" },
  { name: "quiz_results", description: "Résultats de quiz" },
  { name: "user_logins", description: "Historique de connexions" },
  { name: "badges", description: "Système de badges" },
]

// Type pour le statut d'une table
export type TableStatus = {
  name: string
  description: string
  exists: boolean
  rowCount?: number
}

// Type pour le statut global de la base de données
export type DatabaseStatus = {
  isInitialized: boolean
  tablesStatus: TableStatus[]
  missingTables: string[]
  totalTables: number
  existingTables: number
}

// Type pour le résultat de réparation
export type RepairResult = {
  success: boolean
  message: string
  repairedTables: string[]
  failedTables: string[]
  details?: string
}

// Type pour le statut du bucket
export type BucketStatus = {
  exists: boolean
  name: string
}

// Cache pour éviter de vérifier le bucket trop souvent
let bucketStatusCache: BucketStatus | null = null
let bucketCacheTimestamp = 0
const CACHE_TTL = 60000 // 1 minute en millisecondes

// Fonction pour vérifier l'existence des tables
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const supabase = await createClient()
    const tablesStatus: TableStatus[] = []

    // Vérifier chaque table
    for (const table of REQUIRED_TABLES) {
      try {
        // Vérifier si la table existe en essayant de compter les lignes
        const { count, error } = await supabase.from(table.name).select("*", { count: "exact", head: true })

        if (error) {
          // Si erreur, vérifier le type d'erreur
          if (error.message && (
            error.message.includes('relation') && error.message.includes('does not exist') ||
            error.message.includes('table') && error.message.includes('does not exist') ||
            error.message.includes('not found')
          )) {
            // La table n'existe pas
            tablesStatus.push({
              name: table.name,
              description: table.description,
              exists: false,
            })
          } else {
            // Autre type d'erreur (permissions, etc.) - considérer que la table existe mais n'est pas accessible
            console.warn(`Erreur d'accès à la table ${table.name}:`, error.message)
            tablesStatus.push({
              name: table.name,
              description: table.description,
              exists: true,
              rowCount: 0,
            })
          }
        } else {
          // La table existe
          tablesStatus.push({
            name: table.name,
            description: table.description,
            exists: true,
            rowCount: count || 0,
          })
        }
      } catch (err: any) {
        // En cas d'erreur de réseau ou autre, considérer que la table n'existe pas
        console.warn(`Erreur lors de la vérification de la table ${table.name}:`, err.message)
        tablesStatus.push({
          name: table.name,
          description: table.description,
          exists: false,
        })
      }
    }

    const existingTables = tablesStatus.filter((t) => t.exists).length
    const missingTables = tablesStatus.filter((t) => !t.exists).map((t) => t.name)
    const isInitialized = existingTables === REQUIRED_TABLES.length

    console.log(`📊 État de la base de données: ${existingTables}/${REQUIRED_TABLES.length} tables`)
    if (missingTables.length > 0) {
      console.log(`❌ Tables manquantes: ${missingTables.join(', ')}`)
    } else {
      console.log(`✅ Toutes les tables sont présentes`)
    }

    return {
      isInitialized,
      tablesStatus,
      missingTables,
      totalTables: REQUIRED_TABLES.length,
      existingTables,
    }
  } catch (error: any) {
    console.error("Erreur lors de la vérification de la base de données:", error)
    throw new Error(`Erreur lors de la vérification: ${error.message}`)
  }
}

// Fonction pour vérifier l'existence du bucket de stockage avec mise en cache
export async function checkStorageBucket(): Promise<BucketStatus> {
  try {
    // Vérifier si nous avons un cache valide
    const now = Date.now()
    if (bucketStatusCache && now - bucketCacheTimestamp < CACHE_TTL) {
      return bucketStatusCache
    }

    // Essayer d'abord avec le client standard pour éviter les problèmes de permissions
    const supabase = await createClient()
    let bucketExists = false

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (!error && buckets) {
        const contentBucket = buckets.find((bucket) => bucket.name === "content")
        bucketExists = !!contentBucket
      }
    } catch (clientError) {
      console.warn("Erreur avec le client standard:", clientError)
      // Continuer avec le client admin si le client standard échoue
    }

    // Si le bucket n'a pas été trouvé, essayer avec le client admin
    if (!bucketExists) {
      try {
        const supabaseAdmin = createAdminClient()
        const { data: adminBuckets, error: adminError } = await supabaseAdmin.storage.listBuckets()

        if (!adminError && adminBuckets) {
          const contentBucket = adminBuckets.find((bucket) => bucket.name === "content")
          bucketExists = !!contentBucket
        }
      } catch (adminError) {
        console.warn("Erreur avec le client admin:", adminError)
        // Si les deux clients échouent, considérer que le bucket n'existe pas
      }
    }

    // Mettre à jour le cache
    bucketStatusCache = {
      exists: bucketExists,
      name: "content",
    }
    bucketCacheTimestamp = now

    return bucketStatusCache
  } catch (error: any) {
    console.error("Erreur lors de la vérification du bucket:", error)
    // En cas d'erreur, retourner un statut par défaut sans mise en cache
    return { exists: false, name: "content" }
  }
}

// Fonction pour créer le bucket de stockage
export async function createStorageBucket() {
  try {
    // Vérifier d'abord si le bucket existe
    const { exists } = await checkStorageBucket()

    if (exists) {
      // Invalider le cache pour forcer une mise à jour lors de la prochaine vérification
      bucketStatusCache = null

      return {
        success: true,
        message: "Le bucket de stockage existe déjà",
        alreadyExists: true,
      }
    }

    // Utiliser le client admin pour contourner les politiques RLS
    const supabaseAdmin = createAdminClient()

    // Créer le bucket
    const { data, error } = await supabaseAdmin.storage.createBucket("content", {
      public: true,
      fileSizeLimit: 52428800, // 50MB,
      allowedMimeTypes: [
        "video/*",
        "audio/*",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/*",
        "text/*",
      ],
    })

    if (error) {
      console.error("Erreur lors de la création du bucket:", error)

      // Si le bucket existe déjà (malgré notre vérification)
      if (error.message && error.message.includes("already exists")) {
        // Invalider le cache pour forcer une mise à jour lors de la prochaine vérification
        bucketStatusCache = null

        return {
          success: true,
          message: "Le bucket de stockage existe déjà",
          alreadyExists: true,
        }
      }

      // Si l'erreur est liée aux permissions ou à la RLS
      if (
        error.message.includes("permission") ||
        error.message.includes("not authorized") ||
        error.message.includes("violates row-level security")
      ) {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires pour créer un bucket. Veuillez le créer manuellement.",
          requiresManualSetup: true,
        }
      }

      return {
        success: false,
        message: error.message || "Une erreur s'est produite lors de la création du bucket",
      }
    }

    // Configurer les politiques d'accès public
    // Note: Les politiques de stockage doivent être configurées manuellement dans Supabase Dashboard
    console.log("Bucket créé. Configurez les politiques d'accès dans le Dashboard Supabase si nécessaire.")

    // Invalider le cache
    bucketStatusCache = null

    return {
      success: true,
      message: "Bucket de stockage créé avec succès",
    }
  } catch (error: any) {
    console.error("Erreur lors de la création du bucket:", error)

    // Si l'erreur indique que le bucket existe déjà
    if (error.message && error.message.includes("already exists")) {
      // Invalider le cache pour forcer une mise à jour lors de la prochaine vérification
      bucketStatusCache = null

      return {
        success: true,
        message: "Le bucket de stockage existe déjà",
        alreadyExists: true,
      }
    }

    // Si l'erreur semble être liée à l'API, aux permissions ou à la RLS
    if (
      error.message &&
      (error.message.includes("permission") ||
        error.message.includes("not authorized") ||
        error.message.includes("not implemented") ||
        error.message.includes("method not allowed") ||
        error.message.includes("violates row-level security"))
    ) {
      return {
        success: false,
        message: "La création automatique du bucket n'est pas disponible. Veuillez le créer manuellement.",
        requiresManualSetup: true,
      }
    }

    return {
      success: false,
      message: error.message || "Une erreur s'est produite lors de la création du bucket",
    }
  }
}

// Mapping des tables aux scripts SQL
const TABLE_SCRIPTS: Record<string, string> = {
  users: `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  profiles: `
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  categories: `
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  tags: `
  CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  contents: `
  CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'podcast', 'document')),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    thumbnail_path TEXT,
    author TEXT,
    language TEXT DEFAULT 'fr',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived', 'error')),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector
  );
`,
  content_tags: `
  CREATE TABLE IF NOT EXISTS content_tags (
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
  );
`,
  content_ai_jobs: `
  CREATE TABLE IF NOT EXISTS content_ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('summary', 'transcription', 'categorization', 'audio_extraction', 'thumbnail_generation', 'tagging')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    result_path TEXT,
    result_data JSONB,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
  );
`,
  user_favorites: `
  CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );
`,
  user_history: `
  CREATE TABLE IF NOT EXISTS user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    watch_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );
`,
  playlists: `
  CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    thumbnail_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  playlist_contents: `
  CREATE TABLE IF NOT EXISTS playlist_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, content_id)
  );
`,
  notifications: `
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
  );
`,
  app_settings: `
  CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  comments: `
  CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
  ratings: `
  CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, user_id)
  );
`,
  content_progress: `
  CREATE TABLE IF NOT EXISTS content_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    current_position FLOAT DEFAULT 0,
    duration FLOAT DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );
  
  CREATE INDEX IF NOT EXISTS content_progress_user_id_idx ON content_progress(user_id);
  CREATE INDEX IF NOT EXISTS content_progress_content_id_idx ON content_progress(content_id);
  CREATE INDEX IF NOT EXISTS content_progress_last_watched_idx ON content_progress(last_watched_at);
`,
}

// Dépendances entre les tables
const TABLE_DEPENDENCIES: Record<string, string[]> = {
  profiles: ["users"],
  contents: ["categories", "users"],
  content_tags: ["contents", "tags"],
  content_ai_jobs: ["contents"],
  user_favorites: ["users", "contents"],
  user_history: ["users", "contents"],
  playlists: ["users"],
  playlist_contents: ["playlists", "contents"],
  notifications: ["users"],
  comments: ["users", "contents"],
  ratings: ["users", "contents"],
  content_progress: ["users", "contents"],
}

// Fonction pour s'assurer que exec_sql existe
async function ensureExecSqlFunction() {
  const supabase = await createClient()
  
  // Essayer d'abord d'exécuter une requête simple pour tester si exec_sql existe
  const { error: testError } = await supabase.rpc('exec_sql', {
    sql_query: 'SELECT 1;'
  })
  
  // Si la fonction n'existe pas, la créer
  if (testError && testError.message && testError.message.includes('Could not find the function')) {
    console.log('🔧 Création de la fonction exec_sql...')
    
    // Utiliser une requête SQL directe pour créer la fonction
    const { error: createError } = await supabase
      .from('_dummy_table_that_does_not_exist')
      .select('*')
      .limit(0)
    
    // Comme cette approche ne fonctionne pas, nous devons utiliser une autre méthode
    // Créer la fonction via l'interface Supabase SQL Editor ou via l'API REST
    throw new Error(`
      La fonction exec_sql n'existe pas sur votre serveur Supabase.
      
      Veuillez exécuter cette requête SQL dans l'éditeur SQL de votre dashboard Supabase :
      
      CREATE OR REPLACE FUNCTION public.exec_sql(sql_query TEXT)
      RETURNS TEXT AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN 'SUCCESS';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
      GRANT EXECUTE ON FUNCTION public.exec_sql TO service_role;
      GRANT EXECUTE ON FUNCTION public.exec_sql TO anon;
      
      Puis réessayez la réparation des tables.
    `)
  }
  
  if (testError && !testError.message.includes('Could not find the function')) {
    throw new Error(`Erreur lors du test de la fonction exec_sql: ${testError.message}`)
  }
  
  console.log('✅ Fonction exec_sql disponible')
}

async function executeSQL(sql: string) {
  const supabase = await createClient()

  // Diviser le script en plusieurs requêtes si nécessaire
  const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

  for (const statement of statements) {
    if (statement.trim()) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: statement.trim() + ";" })
      if (error) {
        console.error("Erreur SQL:", error)
        throw new Error(`Erreur lors de l'exécution du script SQL: ${error.message}`)
      }
    }
  }

  return { success: true }
}

// Fonction pour réparer uniquement les tables manquantes en utilisant les migrations
export async function repairMissingTables(): Promise<RepairResult> {
  try {
    // Vérifier d'abord l'état actuel
    const status = await checkDatabaseStatus()

    if (status.isInitialized) {
      return {
        success: true,
        message: "Toutes les tables sont déjà présentes",
        repairedTables: [],
        failedTables: [],
      }
    }

    // S'assurer que la fonction exec_sql existe
    try {
      await ensureExecSqlFunction()
    } catch (error: any) {
      return {
        success: false,
        message: "Fonction exec_sql manquante",
        repairedTables: [],
        failedTables: [],
        details: error.message,
      }
    }

    const { readFileSync, readdirSync } = require('fs')
    const { join } = require('path')
    
    console.log('🔧 Début de la réparation des tables manquantes...')
    
    // Lire tous les fichiers de migration
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    let migrationFiles: string[]
    
    try {
      migrationFiles = readdirSync(migrationsDir)
        .filter((file: string) => file.endsWith('.sql'))
        .sort() // Tri par ordre alphabétique (ordre numérique)
    } catch (dirError) {
      throw new Error('Répertoire de migrations non trouvé. Assurez-vous que le dossier supabase/migrations existe.')
    }
    
    console.log(`📁 ${migrationFiles.length} fichiers de migration trouvés`)
    
    const supabase = await createClient()
    
    // Créer la table de suivi des migrations si elle n'existe pas
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createTableError) {
      throw new Error(`Erreur lors de la création de la table schema_migrations: ${createTableError.message}`)
    }
    
    // Vérifier quelles migrations ont déjà été exécutées
    const { data: executedMigrations, error: fetchError } = await supabase
      .from('schema_migrations')
      .select('version')
    
    if (fetchError) {
      console.warn('⚠️ Impossible de vérifier les migrations déjà exécutées:', fetchError)
    }
    
    const executedVersions = new Set(executedMigrations?.map((m: any) => m.version) || [])
    const repairedTables: string[] = []
    const failedTables: string[] = []
    const logs: string[] = []
    
    logs.push(`Tables manquantes détectées: ${status.missingTables.join(', ')}`)
    
    // Exécuter seulement les migrations non exécutées
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '')
      
      if (executedVersions.has(version)) {
        logs.push(`⏭️ Migration ${version} déjà exécutée, ignorée`)
        continue
      }
      
      logs.push(`🔄 Exécution de la migration: ${file}`)
      
      try {
        // Lire le contenu du fichier
        const migrationPath = join(migrationsDir, file)
        const sqlContent = readFileSync(migrationPath, 'utf-8')
        
        // Diviser en plusieurs requêtes si nécessaire
        const statements = sqlContent
          .split(';')
          .map((stmt: string) => stmt.trim())
          .filter((stmt: string) => stmt.length > 0)
        
        // Exécuter chaque statement
        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await supabase.rpc('exec_sql', {
              sql_query: statement + ';'
            })
            
            if (error) {
              logs.push(`❌ Erreur dans la migration ${file}: ${error.message}`)
              throw error
            }
          }
        }
        
        // Marquer la migration comme exécutée
        const { error: insertError } = await supabase
          .from('schema_migrations')
          .insert({ version })
        
        if (insertError) {
          logs.push(`⚠️ Impossible de marquer la migration ${version} comme exécutée: ${insertError.message}`)
        }
        
        repairedTables.push(version)
        logs.push(`✅ Migration ${file} exécutée avec succès`)
        
      } catch (error: any) {
        logs.push(`❌ Échec de la migration ${file}: ${error.message}`)
        failedTables.push(file)
        // Continuer avec les autres migrations au lieu de s'arrêter
        console.error(`Erreur dans la migration ${file}:`, error)
      }
    }
    
    logs.push('🎉 Réparation des tables terminée!')
    
    return {
      success: repairedTables.length > 0 && failedTables.length === 0,
      message: failedTables.length === 0 
        ? `${repairedTables.length} migrations exécutées avec succès`
        : `${repairedTables.length} migrations réussies, ${failedTables.length} échecs`,
      repairedTables,
      failedTables,
      details: logs.join('\n'),
    }
    
  } catch (error: any) {
    console.error('❌ Erreur générale lors de la réparation:', error)
    return {
      success: false,
      message: error.message || 'Une erreur s\'est produite lors de la réparation',
      repairedTables: [],
      failedTables: [],
      details: error.stack,
    }
  }
}

// Scripts SQL pour l'initialisation complète (gardés identiques)
const SQL_SCRIPTS = {
  // Tables principales
  createMainTables: `
  -- Activer les extensions nécessaires
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Table des utilisateurs (mise à jour)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table des profils utilisateurs (mise à jour)
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table des catégories
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table des tags
  CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,

  // Table des contenus
  createContentsTable: `
  -- Table des contenus
  CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'podcast', 'document')),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    duration INTEGER,
    thumbnail_path TEXT,
    author TEXT,
    language TEXT DEFAULT 'fr',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived', 'error')),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
  );

  -- Ajouter la colonne search_vector si elle n'existe pas
  DO $$ 
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'contents' AND column_name = 'search_vector') THEN
          ALTER TABLE contents ADD COLUMN search_vector tsvector;
      END IF;
  END $$;
`,

  // Tables secondaires
  createSecondaryTables: `
  -- Table de liaison contenus-tags (many-to-many)
  CREATE TABLE IF NOT EXISTS content_tags (
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
  );

  -- Table des jobs de traitement IA
  CREATE TABLE IF NOT EXISTS content_ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('summary', 'transcription', 'categorization', 'audio_extraction', 'thumbnail_generation', 'tagging')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    result_path TEXT,
    result_data JSONB,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
  );

  -- Table des favoris utilisateurs
  CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );

  -- Table de l'historique de visionnage
  CREATE TABLE IF NOT EXISTS user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    watch_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );

  -- Table des playlists utilisateurs
  CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    thumbnail_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table de liaison playlists-contenus
  CREATE TABLE IF NOT EXISTS playlist_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, content_id)
  );

  -- Table des notifications
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
  );

  -- Table des paramètres de l'application
  CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table des commentaires
  CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Table des évaluations/notes
  CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, user_id)
  );
  
  -- Table de progression des contenus
  CREATE TABLE IF NOT EXISTS content_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    current_position FLOAT DEFAULT 0,
    duration FLOAT DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
  );
  
  CREATE INDEX IF NOT EXISTS content_progress_user_id_idx ON content_progress(user_id);
  CREATE INDEX IF NOT EXISTS content_progress_content_id_idx ON content_progress(content_id);
  CREATE INDEX IF NOT EXISTS content_progress_last_watched_idx ON content_progress(last_watched_at);
`,

  // Index et fonctions
  createIndexesAndFunctions: `
  -- Index pour les recherches
  CREATE INDEX IF NOT EXISTS contents_search_idx ON contents USING GIN(search_vector);
  CREATE INDEX IF NOT EXISTS contents_type_idx ON contents(type);
  CREATE INDEX IF NOT EXISTS contents_status_idx ON contents(status);
  CREATE INDEX IF NOT EXISTS contents_category_idx ON contents(category_id);
  CREATE INDEX IF NOT EXISTS contents_created_by_idx ON contents(created_by);
  CREATE INDEX IF NOT EXISTS contents_published_at_idx ON contents(published_at);

  -- Fonction pour mettre à jour le timestamp updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Triggers pour updated_at
  DO $$ 
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contents_updated_at') THEN
          CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
          CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
          CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
  END $$;

  -- Fonction pour mettre à jour le search_vector
  CREATE OR REPLACE FUNCTION update_content_search_vector()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.search_vector := to_tsvector('french', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.author, ''));
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Trigger pour la recherche full-text
  DO $$ 
  BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_search_vector_trigger') THEN
          CREATE TRIGGER update_content_search_vector_trigger
          BEFORE INSERT OR UPDATE ON contents
          FOR EACH ROW EXECUTE FUNCTION update_content_search_vector();
      END IF;
  END $$;
`,

  // Données initiales
  insertInitialData: `
  -- Catégories par défaut
  INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Business', 'business', 'Contenus liés au monde des affaires', '#3B82F6', 'briefcase'),
  ('Formation', 'formation', 'Contenus de formation et apprentissage', '#10B981', 'graduation-cap'),
  ('Marketing', 'marketing', 'Stratégies et techniques marketing', '#F59E0B', 'megaphone'),
  ('Finance', 'finance', 'Gestion financière et investissements', '#EF4444', 'dollar-sign'),
  ('Leadership', 'leadership', 'Développement du leadership', '#8B5CF6', 'users'),
  ('Technologie', 'technologie', 'Innovations et outils technologiques', '#06B6D4', 'cpu')
  ON CONFLICT (slug) DO NOTHING;

  -- Tags par défaut
  INSERT INTO tags (name, slug, color) VALUES
  ('Débutant', 'debutant', '#10B981'),
  ('Intermédiaire', 'intermediaire', '#F59E0B'),
  ('Avancé', 'avance', '#EF4444'),
  ('Stratégie', 'strategie', '#3B82F6'),
  ('Pratique', 'pratique', '#8B5CF6'),
  ('Théorie', 'theorie', '#6B7280')
  ON CONFLICT (slug) DO NOTHING;

  -- Paramètres par défaut de l'application
  INSERT INTO app_settings (key, value, description, category, is_public) VALUES
  ('app_name', '"Wakademy"', 'Nom de l''application', 'general', true),
  ('app_description', '"Plateforme d''apprentissage et de partage de contenu"', 'Description de l''application', 'general', true),
  ('default_language', '"fr"', 'Langue par défaut', 'general', true),
  ('max_file_size', '104857600', 'Taille maximale des fichiers en bytes (100MB)', 'upload', false),
  ('allowed_file_types', '["mp4", "mp3", "pdf", "docx", "wav", "mov"]', 'Types de fichiers autorisés', 'upload', false),
  ('ai_processing_enabled', 'true', 'Traitement IA activé', 'ai', false),
  ('auto_categorization', 'true', 'Catégorisation automatique', 'ai', false),
  ('auto_transcription', 'false', 'Transcription automatique', 'ai', false)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
`,
}

// Fonction pour exécuter les migrations Supabase
export async function runMigrations(): Promise<RepairResult> {
  try {
    const { readFileSync, readdirSync } = require('fs')
    const { join } = require('path')
    
    console.log('🚀 Début de l\'exécution des migrations...')
    
    // Lire tous les fichiers de migration
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    let migrationFiles: string[]
    
    try {
      migrationFiles = readdirSync(migrationsDir)
        .filter((file: string) => file.endsWith('.sql'))
        .sort() // Tri par ordre alphabétique (ordre numérique)
    } catch (dirError) {
      throw new Error('Répertoire de migrations non trouvé. Assurez-vous que le dossier supabase/migrations existe.')
    }
    
    console.log(`📁 ${migrationFiles.length} fichiers de migration trouvés`)
    
    const supabase = await createClient()
    
    // Créer la table de suivi des migrations si elle n'existe pas
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (createTableError) {
      throw new Error(`Erreur lors de la création de la table schema_migrations: ${createTableError.message}`)
    }
    
    // Vérifier quelles migrations ont déjà été exécutées
    const { data: executedMigrations, error: fetchError } = await supabase
      .from('schema_migrations')
      .select('version')
    
    if (fetchError) {
      console.warn('⚠️ Impossible de vérifier les migrations déjà exécutées:', fetchError)
    }
    
    const executedVersions = new Set(executedMigrations?.map((m: any) => m.version) || [])
    const repairedTables: string[] = []
    const failedTables: string[] = []
    const logs: string[] = []
    
    // Exécuter chaque migration
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '')
      
      if (executedVersions.has(version)) {
        logs.push(`⏭️ Migration ${version} déjà exécutée, ignorée`)
        continue
      }
      
      logs.push(`🔄 Exécution de la migration: ${file}`)
      
      try {
        // Lire le contenu du fichier
        const migrationPath = join(migrationsDir, file)
        const sqlContent = readFileSync(migrationPath, 'utf-8')
        
        // Diviser en plusieurs requêtes si nécessaire
        const statements = sqlContent
          .split(';')
          .map((stmt: string) => stmt.trim())
          .filter((stmt: string) => stmt.length > 0)
        
        // Exécuter chaque statement
        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await supabase.rpc('exec_sql', {
              sql_query: statement + ';'
            })
            
            if (error) {
              logs.push(`❌ Erreur dans la migration ${file}: ${error.message}`)
              throw error
            }
          }
        }
        
        // Marquer la migration comme exécutée
        const { error: insertError } = await supabase
          .from('schema_migrations')
          .insert({ version })
        
        if (insertError) {
          logs.push(`⚠️ Impossible de marquer la migration ${version} comme exécutée: ${insertError.message}`)
        }
        
        repairedTables.push(version)
        logs.push(`✅ Migration ${file} exécutée avec succès`)
        
      } catch (error: any) {
        logs.push(`❌ Échec de la migration ${file}: ${error.message}`)
        failedTables.push(file)
        // Ne pas arrêter complètement, continuer avec les autres migrations
      }
    }
    
    logs.push('🎉 Exécution des migrations terminée!')
    
    return {
      success: repairedTables.length > 0 && failedTables.length === 0,
      message: failedTables.length === 0 
        ? `${repairedTables.length} migrations exécutées avec succès`
        : `${repairedTables.length} migrations réussies, ${failedTables.length} échecs`,
      repairedTables,
      failedTables,
      details: logs.join('\n'),
    }
    
  } catch (error: any) {
    console.error('❌ Erreur générale lors des migrations:', error)
    return {
      success: false,
      message: error.message || 'Une erreur s\'est produite lors de l\'exécution des migrations',
      repairedTables: [],
      failedTables: [],
      details: error.stack,
    }
  }
}

// Fonction pour initialiser la base de données (mise à jour pour utiliser les migrations)
export async function initializeDatabase() {
  try {
    // Vérifier d'abord l'état actuel
    const status = await checkDatabaseStatus()

    if (status.isInitialized) {
      return {
        success: true,
        message: "Base de données déjà initialisée",
        alreadyInitialized: true,
      }
    }

    // Utiliser les migrations Supabase au lieu des anciens scripts
    const migrationResult = await runMigrations()
    
    if (migrationResult.success) {
      return {
        success: true,
        message: "Base de données initialisée avec succès via les migrations",
        alreadyInitialized: false,
        details: migrationResult.details,
      }
    } else {
      return {
        success: false,
        message: migrationResult.message,
        details: migrationResult.details,
      }
    }
  } catch (error: any) {
    console.error("Erreur d'initialisation de la base de données:", error)
    return {
      success: false,
      message: error.message || "Une erreur s'est produite lors de l'initialisation de la base de données",
    }
  }
}

// Fonction pour créer un utilisateur administrateur
export async function createAdminUser(userData: {
  email: string
  firstName: string
  lastName: string
  password?: string
}): Promise<RepairResult> {
  try {
    const supabase = await createClient()
    
    // Vérifier d'abord si un admin existe déjà dans la table profiles
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'admin')
      .limit(1)
    
    if (checkError) {
      throw new Error(`Erreur lors de la vérification des administrateurs existants: ${checkError.message}`)
    }
    
    if (existingAdmin && existingAdmin.length > 0) {
      return {
        success: false,
        message: `Un administrateur existe déjà: ${existingAdmin[0].first_name} ${existingAdmin[0].last_name}`,
        repairedTables: [],
        failedTables: ['admin_creation'],
        details: 'Un compte administrateur est déjà configuré pour cette instance.',
      }
    }
    
    // Générer un UUID pour l'administrateur
    const adminId = crypto.randomUUID()
    
    // Créer le profil administrateur directement dans la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: adminId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: 'admin',
          status: 'active',
        },
      ])
    
    if (profileError) {
      throw new Error(`Erreur lors de la création du profil administrateur: ${profileError.message}`)
    }
    
    return {
      success: true,
      message: `Administrateur créé avec succès: ${userData.firstName} ${userData.lastName}`,
      repairedTables: ['profiles'],
      failedTables: [],
      details: `Profil administrateur créé avec l'ID: ${adminId}. Note: Vous devrez créer le compte d'authentification séparément via l'interface Supabase.`,
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'administrateur:', error)
    return {
      success: false,
      message: error.message || 'Une erreur s\'est produite lors de la création de l\'administrateur',
      repairedTables: [],
      failedTables: ['admin_creation'],
      details: error.stack,
    }
  }
}

// Fonction pour vérifier si un administrateur existe
export async function checkAdminExists(): Promise<{ exists: boolean; email?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'admin')
      .limit(1)
    
    if (error) {
      return {
        exists: false,
        error: `Erreur lors de la vérification: ${error.message}`,
      }
    }
    
    return {
      exists: data && data.length > 0,
      email: data && data.length > 0 ? `${data[0].first_name} ${data[0].last_name}` : undefined,
    }
    
  } catch (error: any) {
    return {
      exists: false,
      error: error.message || 'Erreur lors de la vérification de l\'administrateur',
    }
  }
}
