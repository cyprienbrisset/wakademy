#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('🗄️  Application des Optimisations de Base de Données')
console.log('==================================================\n')

async function applyDatabaseOptimizations() {
  try {
    // Vérifier les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables d\'environnement Supabase manquantes')
    }

    console.log('🔗 Connexion à Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Lire le script SQL d'optimisation
    const sqlPath = path.join(__dirname, 'optimize-database.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Diviser le script en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    console.log(`📝 Exécution de ${commands.length} commandes SQL...\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      // Ignorer les commentaires
      if (command.startsWith('--') || command.length < 10) {
        continue
      }

      try {
        console.log(`⚡ Commande ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: command })
        
        if (error) {
          // Certaines erreurs sont acceptables (index déjà existant, etc.)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`⚠️  Avertissement: ${error.message}`)
          } else {
            console.error(`❌ Erreur: ${error.message}`)
            errorCount++
          }
        } else {
          console.log(`✅ Succès`)
          successCount++
        }
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution: ${error.message}`)
        errorCount++
      }
    }

    console.log('\n📊 Résumé des optimisations:')
    console.log(`✅ Commandes réussies: ${successCount}`)
    console.log(`❌ Commandes échouées: ${errorCount}`)

    if (errorCount === 0) {
      console.log('\n🎉 Toutes les optimisations ont été appliquées avec succès!')
    } else {
      console.log('\n⚠️  Certaines optimisations ont échoué. Vérifiez les erreurs ci-dessus.')
    }

    // Vérifier les index créés
    console.log('\n🔍 Vérification des index créés...')
    await checkIndexes(supabase)

  } catch (error) {
    console.error('❌ Erreur lors de l\'application des optimisations:', error.message)
    process.exit(1)
  }
}

async function checkIndexes(supabase) {
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('tablename, indexname')
      .in('tablename', ['contents', 'user_watch_history', 'user_favorites', 'user_watch_later'])

    if (error) {
      console.log('⚠️  Impossible de vérifier les index:', error.message)
      return
    }

    if (data && data.length > 0) {
      console.log('📋 Index trouvés:')
      const groupedIndexes = data.reduce((acc, index) => {
        if (!acc[index.tablename]) {
          acc[index.tablename] = []
        }
        acc[index.tablename].push(index.indexname)
        return acc
      }, {})

      Object.entries(groupedIndexes).forEach(([table, indexes]) => {
        console.log(`  📊 ${table}: ${indexes.length} index(es)`)
        indexes.forEach(index => {
          console.log(`    - ${index}`)
        })
      })
    } else {
      console.log('⚠️  Aucun index trouvé pour les tables spécifiées')
    }

  } catch (error) {
    console.log('⚠️  Erreur lors de la vérification des index:', error.message)
  }
}

// Alternative si la fonction exec_sql n'existe pas
async function applyOptimizationsAlternative() {
  console.log('\n🔄 Tentative avec méthode alternative...')
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Essayer de créer quelques index essentiels
    const essentialIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_contents_views ON contents(views DESC)',
      'CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type)',
      'CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category)'
    ]

    console.log('📝 Application des index essentiels...')
    
    for (const indexSQL of essentialIndexes) {
      try {
        // Utiliser une requête directe si possible
        const { error } = await supabase.rpc('exec', { sql: indexSQL })
        
        if (error) {
          console.log(`⚠️  ${indexSQL}: ${error.message}`)
        } else {
          console.log(`✅ Index créé avec succès`)
        }
      } catch (error) {
        console.log(`⚠️  Impossible de créer l'index: ${error.message}`)
      }
    }

    console.log('\n💡 Pour appliquer toutes les optimisations, exécutez le script SQL manuellement:')
    console.log('   1. Connectez-vous à votre dashboard Supabase')
    console.log('   2. Allez dans l\'éditeur SQL')
    console.log('   3. Copiez et exécutez le contenu de scripts/optimize-database.sql')

  } catch (error) {
    console.error('❌ Erreur avec la méthode alternative:', error.message)
  }
}

async function main() {
  try {
    await applyDatabaseOptimizations()
  } catch (error) {
    console.log('\n🔄 La méthode principale a échoué, tentative alternative...')
    await applyOptimizationsAlternative()
  }
  
  console.log('\n🚀 Script d\'optimisation terminé!')
}

main() 