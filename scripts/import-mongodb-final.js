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

// Script final pour importer les données MongoDB TopCream
const { MongoClient } = require('mongodb')
const { createClient } = require('@supabase/supabase-js')

// Configuration MongoDB avec authentification
const MONGODB_URI = 'mongodb://admin:secret@192.168.10.6:27017/topcream_scrapping?authSource=admin'
const MONGODB_DB = 'topcream_scrapping'
const MONGODB_COLLECTION = 'contents'

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

// Fonction pour parser la durée
function parseDuration(duration) {
  if (!duration) return 0
  const parts = duration.split(':')
  if (parts.length !== 3) return 0
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const seconds = parseInt(parts[2], 10) || 0
  return hours * 3600 + minutes * 60 + seconds
}

// Fonction pour déterminer le type de contenu
function getContentType(mediaType) {
  if (!mediaType) return 'video'
  const type = mediaType.toLowerCase()
  if (type.includes('mp4') || type.includes('video')) return 'video'
  if (type.includes('mp3') || type.includes('audio')) return 'podcast'
  return 'document'
}

// Fonction principale d'importation
async function importFromMongoDB() {
  console.log('🚀 Début de l\'importation MongoDB → Supabase (API standard)')
  console.log('📡 Connexion à MongoDB avec authentification admin/secret...')
  
  let mongoClient
  let importedCount = 0
  let errorCount = 0
  
  try {
    // Test de connexion Supabase d'abord
    console.log('🔍 Test de connexion Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('contents')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError)
      return
    }
    console.log('✅ Connexion Supabase OK')
    
    // Connexion MongoDB avec authentification
    mongoClient = new MongoClient(MONGODB_URI, {
      authSource: 'admin'
    })
    await mongoClient.connect()
    console.log('✅ Connexion MongoDB réussie')
    
    const db = mongoClient.db(MONGODB_DB)
    const collection = db.collection(MONGODB_COLLECTION)
    
    // Compter les documents
    const totalCount = await collection.countDocuments()
    console.log(`📊 ${totalCount} contenus trouvés dans la collection`)
    
    if (totalCount === 0) {
      console.log('⚠️ Aucun contenu trouvé dans la collection')
      return
    }
    
    // Récupérer et traiter chaque document (limiter à 20 nouveaux contenus)
    const cursor = collection.find({}).skip(300).limit(20)
    
    while (await cursor.hasNext()) {
      const mongoDoc = await cursor.next()
      
      try {
        console.log(`🔄 Traitement: ${mongoDoc.name}`)
        
        // Vérifier si déjà importé par external_id
        const { data: existing } = await supabase
          .from('contents')
          .select('id')
          .eq('external_id', mongoDoc.id)
          .single()
        
        if (existing) {
          console.log(`⏭️ Déjà importé (external_id): ${mongoDoc.name}`)
          continue
        }
        
        // Extraire les données
        const fileUrl = mongoDoc.contentMedia?.contentMediaURL?.[0]?.url || null
        const thumbnailUrl = mongoDoc.contentMedia?.contentMediaURL?.[0]?.thumbnailURL || null
        
        // Préparer les données pour Supabase (colonnes de base uniquement)
        const contentData = {
          title: mongoDoc.name || 'Sans titre',
          description: mongoDoc.fullSummary || mongoDoc.shortSummary || '',
          type: getContentType(mongoDoc.contentMedia?.mediaType),
          duration: parseDuration(mongoDoc.duration),
          thumbnail: thumbnailUrl,
          author: mongoDoc.curator || 'Auteur inconnu',
          external_id: mongoDoc.id,
          rating: mongoDoc.rating || null,
          curator: mongoDoc.curator,
          is_topcream_content: true,
          file_url: fileUrl
        }
        
        // Insérer dans Supabase
        const { data: insertedData, error } = await supabase
          .from('contents')
          .insert(contentData)
          .select()
        
        if (error) {
          console.error(`❌ Erreur pour ${mongoDoc.name}:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Importé: ${mongoDoc.name}`)
          console.log(`   ID Supabase: ${insertedData[0]?.id}`)
          console.log(`   External ID: ${mongoDoc.id}`)
          console.log(`   File URL: ${fileUrl || 'Non définie'}`)
          importedCount++
        }
        
      } catch (error) {
        console.error(`❌ Erreur traitement ${mongoDoc.name}:`, error.message)
        errorCount++
      }
    }
    
    console.log('🎉 Importation terminée!')
    console.log(`📊 Résultats: ${importedCount} importés, ${errorCount} erreurs`)
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    if (error.message.includes('Authentication failed')) {
      console.error('💡 Vérifiez les identifiants MongoDB (admin/secret)')
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Vérifiez que MongoDB est accessible sur 192.168.10.6:27017')
    }
  } finally {
    if (mongoClient) {
      await mongoClient.close()
      console.log('📡 Connexion MongoDB fermée')
    }
  }
}

// Exécuter le script
importFromMongoDB().catch(console.error) 