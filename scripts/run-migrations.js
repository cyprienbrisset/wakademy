// Charger les variables d'environnement depuis le fichier .env
const fs = require('fs')
const path = require('path')

// Fonction pour charger le fichier .env
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          // Supprimer les guillemets si présents
          const cleanValue = value.replace(/^["']|["']$/g, '')
          process.env[key.trim()] = cleanValue
        }
      }
    })
  } catch (error) {
    console.warn('⚠️ Impossible de charger le fichier .env:', error.message)
  }
}

// Charger les variables d'environnement
loadEnvFile()

const { createClient } = require('@supabase/supabase-js')
const { readFileSync, readdirSync } = require('fs')
const { join } = require('path')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Variables d\'environnement:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Définie' : '❌ Manquante')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('\n💡 Assurez-vous que votre fichier .env contient ces variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('🚀 Début de l\'exécution des migrations...')
  
  try {
    // Lire tous les fichiers de migration
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort() // Tri par ordre alphabétique (ordre numérique)
    
    console.log(`📁 ${migrationFiles.length} fichiers de migration trouvés`)
    
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
      console.error('❌ Erreur lors de la création de la table schema_migrations:', createTableError)
      return
    }
    
    // Vérifier quelles migrations ont déjà été exécutées
    const { data: executedMigrations, error: fetchError } = await supabase
      .from('schema_migrations')
      .select('version')
    
    if (fetchError) {
      console.warn('⚠️ Impossible de vérifier les migrations déjà exécutées:', fetchError)
    }
    
    const executedVersions = new Set(executedMigrations?.map(m => m.version) || [])
    
    // Exécuter chaque migration
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '')
      
      if (executedVersions.has(version)) {
        console.log(`⏭️ Migration ${version} déjà exécutée, ignorée`)
        continue
      }
      
      console.log(`🔄 Exécution de la migration: ${file}`)
      
      try {
        // Lire le contenu du fichier
        const migrationPath = join(migrationsDir, file)
        const sqlContent = readFileSync(migrationPath, 'utf-8')
        
        // Diviser en plusieurs requêtes si nécessaire
        const statements = sqlContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0)
        
        // Exécuter chaque statement
        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await supabase.rpc('exec_sql', {
              sql_query: statement + ';'
            })
            
            if (error) {
              console.error(`❌ Erreur dans la migration ${file}:`, error)
              throw error
            }
          }
        }
        
        // Marquer la migration comme exécutée
        const { error: insertError } = await supabase
          .from('schema_migrations')
          .insert({ version })
        
        if (insertError) {
          console.warn(`⚠️ Impossible de marquer la migration ${version} comme exécutée:`, insertError)
        }
        
        console.log(`✅ Migration ${file} exécutée avec succès`)
        
      } catch (error) {
        console.error(`❌ Échec de la migration ${file}:`, error)
        process.exit(1)
      }
    }
    
    console.log('🎉 Toutes les migrations ont été exécutées avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    process.exit(1)
  }
}

// Exécuter les migrations
runMigrations() 