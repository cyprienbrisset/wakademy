// Script pour tester un contenu spécifique
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
          const cleanValue = value.replace(/^["']|["']$/g, '')
          process.env[key.trim()] = cleanValue
        }
      }
    })
  } catch (error) {
    console.warn('⚠️ Impossible de charger le fichier .env:', error.message)
  }
}

loadEnvFile()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testContent(contentId) {
  console.log(`🔍 Test du contenu: ${contentId}`)
  
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single()
    
    if (error) {
      console.error('❌ Erreur:', error)
      return
    }
    
    if (!data) {
      console.log('❌ Contenu non trouvé')
      return
    }
    
    console.log('✅ Contenu trouvé:')
    console.log('📝 Titre:', data.title)
    console.log('👤 Auteur:', data.author)
    console.log('🎯 Type:', data.type)
    console.log('🔗 File URL:', data.file_url || 'Non définie')
    console.log('🖼️ Thumbnail:', data.thumbnail || 'Non définie')
    console.log('⭐ Rating:', data.rating || 'Non définie')
    console.log('👨‍💼 Curator:', data.curator || 'Non défini')
    console.log('🏆 TopCream:', data.is_topcream_content ? 'Oui' : 'Non')
    console.log('🆔 External ID:', data.external_id || 'Non défini')
    console.log('📁 File Path:', data.file_path || 'Non défini')
    console.log('📊 Metadata:', data.metadata ? 'Présent' : 'Absent')
    
    if (data.metadata) {
      console.log('📊 Metadata détails:', JSON.stringify(data.metadata, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Utiliser l'ID passé en argument ou un ID par défaut
const contentId = process.argv[2] || '8d47620c-ca28-41e0-8003-69f8484b7151'
testContent(contentId) 