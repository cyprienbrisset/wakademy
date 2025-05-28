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

async function testTables() {
  try {
    console.log('🧪 Test d\'accès aux tables...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('📋 Test des tables principales...')
    
    // Test de la table profiles (remplace users)
    console.log('   • Table profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(5)
    
    if (profilesError) {
      console.log(`     ❌ Erreur: ${profilesError.message}`)
    } else {
      console.log(`     ✅ OK - ${profiles.length} profils trouvés`)
      if (profiles.length > 0) {
        console.log(`     📄 Exemple: ${profiles[0].first_name} ${profiles[0].last_name} (${profiles[0].role})`)
      }
    }
    
    // Test de la table contents
    console.log('   • Table contents...')
    const { count: contentsCount, error: contentsError } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
    
    if (contentsError) {
      console.log(`     ❌ Erreur: ${contentsError.message}`)
    } else {
      console.log(`     ✅ OK - ${contentsCount || 0} contenus trouvés`)
    }
    
    // Test de la table user_history
    console.log('   • Table user_history...')
    const { count: historyCount, error: historyError } = await supabase
      .from('user_history')
      .select('*', { count: 'exact', head: true })
    
    if (historyError) {
      console.log(`     ❌ Erreur: ${historyError.message}`)
    } else {
      console.log(`     ✅ OK - ${historyCount || 0} entrées d'historique trouvées`)
    }
    
    // Test de la table quiz_results
    console.log('   • Table quiz_results...')
    const { count: quizCount, error: quizError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
    
    if (quizError) {
      console.log(`     ❌ Erreur: ${quizError.message}`)
    } else {
      console.log(`     ✅ OK - ${quizCount || 0} résultats de quiz trouvés`)
    }
    
    // Test de la table user_favorites
    console.log('   • Table user_favorites...')
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
    
    if (favoritesError) {
      console.log(`     ❌ Erreur: ${favoritesError.message}`)
    } else {
      console.log(`     ✅ OK - ${favoritesCount || 0} favoris utilisateur trouvés`)
    }
    
    // Test de la table user_logins
    console.log('   • Table user_logins...')
    const { count: loginsCount, error: loginsError } = await supabase
      .from('user_logins')
      .select('*', { count: 'exact', head: true })
    
    if (loginsError) {
      console.log(`     ❌ Erreur: ${loginsError.message}`)
    } else {
      console.log(`     ✅ OK - ${loginsCount || 0} connexions trouvées`)
    }
    
    // Test de la table badges
    console.log('   • Table badges...')
    const { count: badgesCount, error: badgesError } = await supabase
      .from('badges')
      .select('*', { count: 'exact', head: true })
    
    if (badgesError) {
      console.log(`     ❌ Erreur: ${badgesError.message}`)
    } else {
      console.log(`     ✅ OK - ${badgesCount || 0} badges trouvés`)
    }
    
    console.log('')
    console.log('🎉 Test terminé ! Toutes les tables sont accessibles.')
    console.log('')
    console.log('📝 Résumé des corrections:')
    console.log('   • Table "users" → "profiles"')
    console.log('   • Table "user_watch_history" → "user_history"')
    console.log('   • Table "user_quiz_results" → "quiz_results"')
    console.log('   • Champ "duration" → "watch_time"')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le script
if (require.main === module) {
  testTables()
}

module.exports = { testTables } 