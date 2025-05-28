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

// Script pour vérifier la structure de la table contents
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

async function checkTableStructure() {
  console.log('🔍 Vérification de la structure de la table contents...')
  
  try {
    // Vérifier la structure de la table
    const { data: columns, error: structureError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'contents' 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `
      })
    
    if (structureError) {
      console.error('❌ Erreur lors de la récupération de la structure:', structureError)
      return
    }
    
    console.log('🔍 Réponse brute:', columns)
    console.log('🔍 Type de la réponse:', typeof columns)
    
    console.log('\n📋 Structure de la table contents:')
    if (columns && Array.isArray(columns) && columns.length > 0) {
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
        if (col.column_default) {
          console.log(`   Default: ${col.column_default}`)
        }
      })
    } else {
      console.log('❌ Aucune colonne trouvée ou format inattendu')
      console.log('Données reçues:', JSON.stringify(columns, null, 2))
    }
    
    // Vérifier quelques contenus existants
    const { data: sampleContents, error: sampleError } = await supabase
      .from('contents')
      .select('id, title, type, status')
      .limit(3)
    
    if (sampleError) {
      console.error('❌ Erreur lors de la récupération des échantillons:', sampleError)
    } else {
      console.log('\n📊 Échantillons de contenus:')
      if (sampleContents && sampleContents.length > 0) {
        sampleContents.forEach((content, index) => {
          console.log(`${index + 1}. ${content.title} (${content.type}) - ${content.status}`)
        })
      } else {
        console.log('Aucun contenu trouvé')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter la vérification
checkTableStructure().catch(console.error) 