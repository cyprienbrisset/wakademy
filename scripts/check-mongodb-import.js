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

// Script pour vérifier les données MongoDB importées
const { createClient } = require('@supabase/supabase-js')

// Variables Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Variables d\'environnement:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Définie' : '❌ Manquante')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes dans .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkImportedData() {
  console.log('🔍 Vérification des données MongoDB importées...')
  
  try {
    // Compter tous les contenus avec SQL direct
    const { data: countResult, error: countSqlError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT COUNT(*) as total FROM contents'
      })
    
    if (countSqlError) {
      console.error('❌ Erreur lors du comptage SQL:', countSqlError)
    } else {
      console.log('🔍 Résultat SQL count:', countResult)
    }
    
    // Compter tous les contenus
    const { count: totalCount, error: countError } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Erreur lors du comptage:', countError)
      return
    }
    
    console.log(`📊 Total des contenus: ${totalCount}`)
    
    // Vérifier les contenus TopCream avec SQL direct
    const { data: topCreamSqlResult, error: topCreamSqlError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT COUNT(*) as topcream_count FROM contents WHERE is_topcream_content = true'
      })
    
    if (topCreamSqlError) {
      console.error('❌ Erreur lors du comptage TopCream SQL:', topCreamSqlError)
    } else {
      console.log('🔍 Résultat SQL TopCream:', topCreamSqlResult)
    }
    
    // Récupérer tous les contenus avec les colonnes MongoDB
    const { data: allContents, error: contentsError } = await supabase
      .from('contents')
      .select('id, title, type, author, external_id, rating, curator, is_topcream_content, file_url')
      .order('created_at', { ascending: false })
    
    if (contentsError) {
      console.error('❌ Erreur lors de la récupération des contenus:', contentsError)
      return
    }
    
    console.log(`📊 Contenus trouvés: ${allContents?.length || 0}`)
    
    // Compter les contenus TopCream
    const topCreamContents = allContents?.filter(c => c.is_topcream_content) || []
    console.log(`📊 Contenus TopCream: ${topCreamContents.length}`)
    
    if (allContents && allContents.length > 0) {
      console.log('\n📋 Tous les contenus:')
      allContents.forEach((content, index) => {
        console.log(`\n${index + 1}. ${content.title} (${content.type})`)
        console.log(`   ID: ${content.id}`)
        console.log(`   Auteur: ${content.author || 'Non défini'}`)
        console.log(`   External ID: ${content.external_id || 'Non défini'}`)
        console.log(`   TopCream: ${content.is_topcream_content ? 'Oui' : 'Non'}`)
        console.log(`   Curator: ${content.curator || 'Non défini'}`)
        console.log(`   Rating: ${content.rating || 'Non défini'}`)
        console.log(`   File URL: ${content.file_url || 'Non défini'}`)
      })
    }
    
    // Statistiques par type
    const { data: typeStats, error: typeError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT type, COUNT(*) as count FROM contents GROUP BY type ORDER BY count DESC'
      })
    
    if (typeError) {
      console.error('❌ Erreur lors des statistiques par type:', typeError)
    } else if (typeStats && typeStats !== 'SUCCESS') {
      console.log('\n📈 Répartition par type:')
      if (Array.isArray(typeStats)) {
        typeStats.forEach(stat => {
          console.log(`   ${stat.type}: ${stat.count}`)
        })
      } else {
        console.log('Format de réponse inattendu:', typeStats)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter la vérification
checkImportedData().catch(console.error) 