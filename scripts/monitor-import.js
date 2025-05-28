#!/usr/bin/env node

// Charger les variables d'environnement
const fs = require('fs')
const path = require('path')

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

async function monitorImport() {
  console.log('📊 Monitoring de l\'import MongoDB...\n')
  
  try {
    // Compter le total des contenus
    const { count: totalCount, error: countError } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Erreur:', countError)
      return
    }
    
    // Compter les contenus TopCream
    const { count: topcreamCount, error: topcreamError } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
      .eq('is_topcream_content', true)
    
    if (topcreamError) {
      console.error('❌ Erreur TopCream:', topcreamError)
      return
    }
    
    // Compter les contenus standards
    const standardCount = totalCount - topcreamCount
    
    // Calculer la progression (objectif: 12 635 contenus TopCream)
    const targetCount = 12635
    const progressPercent = ((topcreamCount / targetCount) * 100).toFixed(2)
    
    console.log('📈 État actuel de l\'import:')
    console.log(`   📊 Total contenus: ${totalCount}`)
    console.log(`   🏆 Contenus TopCream: ${topcreamCount}`)
    console.log(`   📝 Contenus standards: ${standardCount}`)
    console.log(`   🎯 Objectif TopCream: ${targetCount}`)
    console.log(`   📊 Progression: ${progressPercent}%`)
    console.log(`   ⏳ Restant à importer: ${Math.max(0, targetCount - topcreamCount)}`)
    
    // Estimation du temps restant (basé sur 50 contenus par lot, 200ms de pause)
    const remainingContent = Math.max(0, targetCount - topcreamCount)
    const batchSize = 50
    const batchTime = 200 // ms de pause + temps de traitement estimé à ~1s par lot
    const remainingBatches = Math.ceil(remainingContent / batchSize)
    const estimatedTimeMs = remainingBatches * (batchTime + 1000) // 1s de traitement par lot
    const estimatedTimeMin = Math.ceil(estimatedTimeMs / 60000)
    
    if (remainingContent > 0) {
      console.log(`   ⏱️  Temps estimé restant: ~${estimatedTimeMin} minutes`)
    } else {
      console.log('   ✅ Import terminé!')
    }
    
    // Afficher les derniers contenus importés
    const { data: latestContent, error: latestError } = await supabase
      .from('contents')
      .select('title, author, type, created_at')
      .eq('is_topcream_content', true)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (!latestError && latestContent?.length > 0) {
      console.log('\n📋 Derniers contenus importés:')
      latestContent.forEach((content, index) => {
        const time = new Date(content.created_at).toLocaleTimeString('fr-FR')
        console.log(`   ${index + 1}. ${content.title} (${content.type}) - ${content.author} [${time}]`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur de monitoring:', error)
  }
}

// Exécuter le monitoring
monitorImport()
  .then(() => {
    console.log('\n💡 Utilisez "npm run monitor-import" pour rafraîchir les statistiques')
  })
  .catch(console.error) 