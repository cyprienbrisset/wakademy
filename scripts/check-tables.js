const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Charger les variables d'environnement depuis .env
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  
  if (!fs.existsSync(envPath)) {
    throw new Error('Fichier .env non trouvé')
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      }
    }
  })
  
  return envVars
}

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables existantes...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Vérifier spécifiquement les tables attendues en essayant de les interroger
    const expectedTables = [
      'profiles', 'categories', 'tags', 'contents', 'content_tags',
      'content_ai_jobs', 'user_favorites', 'user_watch_history', 'playlists',
      'playlist_contents', 'notifications', 'app_settings', 'comments',
      'ratings', 'quiz_results', 'user_logins', 'badges'
    ]
    
    console.log('🎯 Vérification des tables attendues:')
    console.log('=' .repeat(50))
    
    const existingTables = []
    const missingTables = []
    
    for (const expectedTable of expectedTables) {
      try {
        // Essayer de compter les lignes pour vérifier si la table existe
        const { count, error } = await supabase
          .from(expectedTable)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${expectedTable} - ${error.message}`)
          missingTables.push(expectedTable)
        } else {
          console.log(`✅ ${expectedTable} - ${count || 0} lignes`)
          existingTables.push(expectedTable)
        }
      } catch (e) {
        console.log(`❌ ${expectedTable} - Erreur: ${e.message}`)
        missingTables.push(expectedTable)
      }
    }
    
    console.log('=' .repeat(50))
    console.log(`✅ Tables existantes: ${existingTables.length}`)
    console.log(`❌ Tables manquantes: ${missingTables.length}`)
    
    if (missingTables.length > 0) {
      console.log('\n📋 Tables manquantes:')
      missingTables.forEach(table => console.log(`  - ${table}`))
    }
    
    if (existingTables.length > 0) {
      console.log('\n📋 Tables existantes:')
      existingTables.forEach(table => console.log(`  - ${table}`))
    }
    
    // Vérifier aussi la table schema_migrations
    console.log('\n🔍 Vérification de la table schema_migrations:')
    try {
      const { data: migrations, error: migError } = await supabase
        .from('schema_migrations')
        .select('version, executed_at')
        .order('version')
      
      if (migError) {
        console.log(`❌ schema_migrations - ${migError.message}`)
      } else {
        console.log(`✅ schema_migrations - ${migrations.length} migrations exécutées`)
        if (migrations.length > 0) {
          console.log('   Migrations:')
          migrations.forEach(mig => {
            console.log(`   - ${mig.version} (${new Date(mig.executed_at).toLocaleString()})`)
          })
        }
      }
    } catch (e) {
      console.log(`❌ schema_migrations - Erreur: ${e.message}`)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter le script
if (require.main === module) {
  checkTables()
}

module.exports = { checkTables } 