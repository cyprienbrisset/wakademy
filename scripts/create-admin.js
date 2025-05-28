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

async function createAdmin() {
  try {
    console.log('👤 Création d\'un compte administrateur...')
    
    // Charger les variables d'environnement
    const env = loadEnvFile()
    
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement manquantes')
    }
    
    // Créer le client Supabase avec la clé service (pour l'admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Vérifier d'abord si un admin existe déjà
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('role', 'admin')
      .limit(1)
    
    if (checkError) {
      throw new Error(`Erreur lors de la vérification: ${checkError.message}`)
    }
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('⚠️ Un administrateur existe déjà:')
      console.log(`   Nom: ${existingAdmin[0].first_name} ${existingAdmin[0].last_name}`)
      console.log(`   ID: ${existingAdmin[0].id}`)
      return
    }
    
    // Données de l'administrateur
    const adminEmail = 'admin@wakademy.local'
    const adminPassword = 'AdminWakademy2025!'
    
    console.log('🔐 Création de l\'utilisateur d\'authentification...')
    console.log(`   Email: ${adminEmail}`)
    
    // Créer l'utilisateur d'authentification via l'API Admin
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Wakademy',
        role: 'admin'
      }
    })
    
    if (authError) {
      throw new Error(`Erreur lors de la création de l'utilisateur d'authentification: ${authError.message}`)
    }
    
    if (!authUser.user) {
      throw new Error('Aucun utilisateur créé')
    }
    
    console.log(`✅ Utilisateur d'authentification créé avec l'ID: ${authUser.user.id}`)
    
    // Données du profil administrateur
    const adminData = {
      id: authUser.user.id, // Utiliser l'ID de l'utilisateur d'authentification
      first_name: 'Admin',
      last_name: 'Wakademy',
      role: 'admin',
      status: 'active',
      department: 'Administration',
      bio: 'Compte administrateur principal de Wakademy'
    }
    
    console.log('📝 Création du profil administrateur...')
    
    // Créer le profil administrateur
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([adminData])
    
    if (profileError) {
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`)
    }
    
    console.log('✅ Profil administrateur créé avec succès!')
    console.log('')
    console.log('📋 Informations de connexion:')
    console.log('=' .repeat(50))
    console.log(`Email: ${adminEmail}`)
    console.log(`Mot de passe: ${adminPassword}`)
    console.log(`ID utilisateur: ${authUser.user.id}`)
    console.log(`Nom complet: ${adminData.first_name} ${adminData.last_name}`)
    console.log(`Rôle: ${adminData.role}`)
    console.log('')
    console.log('🎉 Compte administrateur créé avec succès!')
    console.log('Vous pouvez maintenant vous connecter avec ces identifiants.')
    console.log('')
    console.log('⚠️ Important: Changez le mot de passe après la première connexion.')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    
    // Afficher des informations d'aide en cas d'erreur
    if (error.message.includes('User already registered')) {
      console.log('')
      console.log('💡 L\'utilisateur existe déjà. Essayez de vous connecter avec:')
      console.log('   Email: admin@wakademy.local')
      console.log('   Mot de passe: AdminWakademy2025!')
    }
  }
}

// Exécuter le script
if (require.main === module) {
  createAdmin()
}

module.exports = { createAdmin } 