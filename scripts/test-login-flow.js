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

async function testLoginFlow() {
  try {
    console.log('🧪 Test du flux de connexion admin...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase comme côté client (avec la clé anon)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const email = 'admin@wakademy.local'
    const password = 'AdminWakademy2025!'
    
    console.log('🔐 Tentative d\'authentification...')
    console.log(`   Email: ${email}`)
    
    // Utiliser l'authentification Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      throw new Error(`Erreur d'authentification: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Identifiants invalides. Veuillez réessayer.")
    }

    console.log('✅ Authentification réussie!')
    console.log(`   ID utilisateur: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)

    // Vérifier que l'utilisateur a un profil admin
    console.log('🔍 Vérification du profil pour l\'utilisateur:', authData.user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .eq("role", "admin")
      .single()

    console.log('📋 Résultat de la requête profil:', { profile, profileError })

    if (profileError) {
      console.error('❌ Erreur lors de la récupération du profil:', profileError)
      
      // Essayer de récupérer le profil sans filtre sur le rôle pour voir s'il existe
      const { data: anyProfile, error: anyProfileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()
      
      console.log('🔍 Profil existant (sans filtre rôle):', { anyProfile, anyProfileError })
      
      // Se déconnecter si ce n'est pas un admin
      await supabase.auth.signOut()
      throw new Error(`Erreur lors de la vérification du profil: ${profileError.message}`)
    }

    if (!profile) {
      console.log('❌ Aucun profil admin trouvé pour cet utilisateur')
      
      // Se déconnecter si ce n'est pas un admin
      await supabase.auth.signOut()
      throw new Error("Accès non autorisé. Seuls les administrateurs peuvent se connecter.")
    }

    console.log('✅ Profil admin trouvé:', profile)

    // Simuler le stockage en localStorage
    const adminData = {
      email: authData.user.email,
      role: profile.role,
      id: authData.user.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      isAuthenticated: true,
    }

    console.log('💾 Données admin à stocker:', adminData)

    // Se déconnecter pour nettoyer
    await supabase.auth.signOut()
    console.log('🚪 Déconnexion effectuée')

    console.log('')
    console.log('🎉 Test de connexion réussi !')
    console.log('L\'admin peut maintenant se connecter via l\'interface web.')
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error.message)
  }
}

// Exécuter le script
if (require.main === module) {
  testLoginFlow()
}

module.exports = { testLoginFlow } 