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

async function checkAdminProfile() {
  try {
    console.log('🔍 Vérification du profil administrateur...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('📋 Vérification des utilisateurs d\'authentification...')
    
    // Lister tous les utilisateurs d'authentification
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log(`❌ Erreur auth: ${authError.message}`)
    } else {
      console.log(`✅ ${authUsers.users.length} utilisateurs d'authentification trouvés:`)
      authUsers.users.forEach(user => {
        console.log(`   - ID: ${user.id}`)
        console.log(`     Email: ${user.email}`)
        console.log(`     Confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`)
        console.log(`     Créé: ${new Date(user.created_at).toLocaleString()}`)
        console.log('')
      })
    }
    
    console.log('📋 Vérification des profils...')
    
    // Lister tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.log(`❌ Erreur profiles: ${profilesError.message}`)
    } else {
      console.log(`✅ ${profiles.length} profils trouvés:`)
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}`)
        console.log(`     Nom: ${profile.first_name} ${profile.last_name}`)
        console.log(`     Rôle: ${profile.role}`)
        console.log(`     Email: ${profile.email || 'Non défini'}`)
        console.log(`     Statut: ${profile.status}`)
        console.log('')
      })
    }
    
    console.log('🔗 Vérification des correspondances...')
    
    // Vérifier les correspondances entre auth.users et profiles
    if (authUsers && profiles) {
      const adminEmail = 'admin@wakademy.local'
      
      // Trouver l'utilisateur d'authentification admin
      const authAdmin = authUsers.users.find(user => user.email === adminEmail)
      
      if (authAdmin) {
        console.log(`✅ Utilisateur d'authentification admin trouvé:`)
        console.log(`   ID: ${authAdmin.id}`)
        console.log(`   Email: ${authAdmin.email}`)
        
        // Trouver le profil correspondant
        const profileAdmin = profiles.find(profile => profile.id === authAdmin.id)
        
        if (profileAdmin) {
          console.log(`✅ Profil admin correspondant trouvé:`)
          console.log(`   ID: ${profileAdmin.id}`)
          console.log(`   Nom: ${profileAdmin.first_name} ${profileAdmin.last_name}`)
          console.log(`   Rôle: ${profileAdmin.role}`)
          console.log(`   Statut: ${profileAdmin.status}`)
          
          if (profileAdmin.role === 'admin') {
            console.log(`🎉 Tout est correct ! L'admin peut se connecter.`)
          } else {
            console.log(`⚠️ Problème: Le rôle n'est pas 'admin' mais '${profileAdmin.role}'`)
          }
        } else {
          console.log(`❌ Aucun profil trouvé pour l'ID ${authAdmin.id}`)
          console.log(`💡 Solution: Créer un profil avec cet ID`)
        }
      } else {
        console.log(`❌ Aucun utilisateur d'authentification trouvé pour ${adminEmail}`)
        console.log(`💡 Solution: Créer l'utilisateur d'authentification`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter le script
if (require.main === module) {
  checkAdminProfile()
}

module.exports = { checkAdminProfile } 