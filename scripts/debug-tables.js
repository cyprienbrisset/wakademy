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

async function debugTables() {
  try {
    console.log('🔍 Debug des tables...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('📋 Requête SQL directe pour lister les tables...')
    
    // Utiliser la fonction exec_sql pour lister les tables
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    })
    
    if (error) {
      console.log(`❌ Erreur SQL: ${error.message}`)
      
      // Essayer une approche alternative
      console.log('\n🔄 Tentative alternative avec les métadonnées Supabase...')
      
      // Tester quelques tables une par une
      const testTables = ['profiles', 'contents', 'user_history', 'categories']
      
      for (const tableName of testTables) {
        try {
          const { count, error: testError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (testError) {
            console.log(`❌ ${tableName}: ${testError.message}`)
          } else {
            console.log(`✅ ${tableName}: ${count || 0} lignes`)
          }
        } catch (e) {
          console.log(`❌ ${tableName}: Exception - ${e.message}`)
        }
      }
      
    } else {
      console.log('✅ Tables trouvées:')
      if (data && data.length > 0) {
        data.forEach(row => {
          console.log(`   - ${row.table_name}`)
        })
        console.log(`\n📊 Total: ${data.length} tables`)
      } else {
        console.log('   Aucune table trouvée')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter le script
if (require.main === module) {
  debugTables()
}

module.exports = { debugTables } 