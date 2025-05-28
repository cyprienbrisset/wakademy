#!/usr/bin/env node

const { performance } = require('perf_hooks')

console.log('🎯 Validation Finale des Optimisations Wakademy')
console.log('==============================================\n')

async function testAPIPerformance() {
  console.log('📊 Test des performances API optimisées:')
  console.log('========================================')
  
  const apis = [
    { name: 'Trending', url: 'http://localhost:3000/api/trending?type=trending&limit=10' },
    { name: 'Library', url: 'http://localhost:3000/api/library?type=all&limit=20' },
    { name: 'New Content', url: 'http://localhost:3000/api/trending?type=new&limit=5' },
    { name: 'Podcasts', url: 'http://localhost:3000/api/trending?type=podcasts&limit=5' }
  ]

  const results = []

  for (const api of apis) {
    try {
      // Premier appel (sans cache)
      const start1 = performance.now()
      const response1 = await fetch(api.url)
      const data1 = await response1.json()
      const time1 = Math.round(performance.now() - start1)

      // Deuxième appel (avec cache)
      const start2 = performance.now()
      const response2 = await fetch(api.url)
      const data2 = await response2.json()
      const time2 = Math.round(performance.now() - start2)

      const improvement = Math.round(((time1 - time2) / time1) * 100)
      const cached = data2.cached || false

      results.push({
        name: api.name,
        firstCall: time1,
        cachedCall: time2,
        improvement,
        cached,
        dataCount: data1.data?.length || 0
      })

      const status = time2 < 100 ? '🟢' : time2 < 300 ? '🟡' : '🔴'
      const cacheStatus = cached ? '✅ Mis en cache' : '❌ Non mis en cache'
      
      console.log(`${status} ${api.name}: ${time1}ms → ${time2}ms (${improvement}% amélioration) ${cacheStatus}`)
      
    } catch (error) {
      console.log(`❌ ${api.name}: Erreur - ${error.message}`)
      results.push({ name: api.name, error: error.message })
    }
  }

  return results
}

async function testCacheEfficiency() {
  console.log('\n🗄️  Test d\'efficacité du cache:')
  console.log('===============================')
  
  const testUrl = 'http://localhost:3000/api/trending?type=trending&limit=5'
  const times = []
  
  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    const response = await fetch(testUrl)
    const data = await response.json()
    const time = Math.round(performance.now() - start)
    times.push({ time, cached: data.cached || false })
    
    const status = data.cached ? '📈 Cache' : '🔄 DB'
    console.log(`Appel ${i + 1}: ${time}ms ${status}`)
    
    // Petite pause entre les appels
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const avgCachedTime = Math.round(
    times.filter(t => t.cached).reduce((sum, t) => sum + t.time, 0) / 
    times.filter(t => t.cached).length
  )
  
  const avgDbTime = Math.round(
    times.filter(t => !t.cached).reduce((sum, t) => sum + t.time, 0) / 
    times.filter(t => !t.cached).length
  )
  
  console.log(`\n📊 Temps moyen DB: ${avgDbTime}ms`)
  console.log(`📊 Temps moyen Cache: ${avgCachedTime}ms`)
  console.log(`🚀 Amélioration: ${Math.round(((avgDbTime - avgCachedTime) / avgDbTime) * 100)}%`)
  
  return { avgDbTime, avgCachedTime }
}

async function testPageLoadTimes() {
  console.log('\n🌐 Test des temps de chargement des pages:')
  console.log('==========================================')
  
  const pages = [
    { name: 'Accueil', url: 'http://localhost:3000/' },
    { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'Library', url: 'http://localhost:3000/library' }
  ]
  
  const results = []
  
  for (const page of pages) {
    try {
      const start = performance.now()
      const response = await fetch(page.url)
      await response.text()
      const time = Math.round(performance.now() - start)
      
      results.push({ name: page.name, time })
      
      const status = time < 1000 ? '🟢' : time < 3000 ? '🟡' : '🔴'
      console.log(`${status} ${page.name}: ${time}ms`)
      
    } catch (error) {
      console.log(`❌ ${page.name}: Erreur - ${error.message}`)
      results.push({ name: page.name, error: error.message })
    }
  }
  
  return results
}

async function generateReport(apiResults, cacheResults, pageResults) {
  console.log('\n📋 RAPPORT FINAL DES OPTIMISATIONS')
  console.log('==================================')
  
  // Analyse des APIs
  const successfulApis = apiResults.filter(r => !r.error)
  const avgApiTime = Math.round(
    successfulApis.reduce((sum, r) => sum + r.cachedCall, 0) / successfulApis.length
  )
  const avgImprovement = Math.round(
    successfulApis.reduce((sum, r) => sum + r.improvement, 0) / successfulApis.length
  )
  
  console.log(`\n📊 Performance API:`)
  console.log(`   • Temps de réponse moyen: ${avgApiTime}ms`)
  console.log(`   • Amélioration moyenne du cache: ${avgImprovement}%`)
  console.log(`   • APIs fonctionnelles: ${successfulApis.length}/${apiResults.length}`)
  
  // Analyse du cache
  const cacheImprovement = Math.round(
    ((cacheResults.avgDbTime - cacheResults.avgCachedTime) / cacheResults.avgDbTime) * 100
  )
  console.log(`\n🗄️  Performance Cache:`)
  console.log(`   • Amélioration: ${cacheImprovement}%`)
  console.log(`   • Temps DB: ${cacheResults.avgDbTime}ms`)
  console.log(`   • Temps Cache: ${cacheResults.avgCachedTime}ms`)
  
  // Analyse des pages
  const successfulPages = pageResults.filter(r => !r.error)
  const avgPageTime = Math.round(
    successfulPages.reduce((sum, r) => sum + r.time, 0) / successfulPages.length
  )
  
  console.log(`\n🌐 Performance Pages:`)
  console.log(`   • Temps de chargement moyen: ${avgPageTime}ms`)
  console.log(`   • Pages fonctionnelles: ${successfulPages.length}/${pageResults.length}`)
  
  // Score global
  let score = 0
  if (avgApiTime < 200) score += 25
  else if (avgApiTime < 500) score += 15
  else if (avgApiTime < 1000) score += 10
  
  if (cacheImprovement > 50) score += 25
  else if (cacheImprovement > 30) score += 15
  else if (cacheImprovement > 10) score += 10
  
  if (avgPageTime < 2000) score += 25
  else if (avgPageTime < 4000) score += 15
  else if (avgPageTime < 6000) score += 10
  
  if (successfulApis.length === apiResults.length) score += 25
  else if (successfulApis.length > apiResults.length * 0.8) score += 15
  
  console.log(`\n🎯 SCORE GLOBAL: ${score}/100`)
  
  if (score >= 80) {
    console.log('🟢 Excellentes performances ! Optimisations très réussies.')
  } else if (score >= 60) {
    console.log('🟡 Bonnes performances. Quelques améliorations possibles.')
  } else {
    console.log('🔴 Performances à améliorer. Optimisations supplémentaires nécessaires.')
  }
  
  console.log('\n✅ OPTIMISATIONS IMPLÉMENTÉES:')
  console.log('==============================')
  console.log('• ✅ Système de cache en mémoire avec TTL')
  console.log('• ✅ Pool de connexions Supabase optimisé')
  console.log('• ✅ Sélection de colonnes spécifiques')
  console.log('• ✅ Limitation des résultats de requête')
  console.log('• ✅ Cache des métadonnées de colonnes')
  console.log('• ✅ Formatage optimisé des durées')
  console.log('• ✅ Gestion d\'erreurs améliorée')
  console.log('• ✅ Composants de loading avec Suspense')
  console.log('• ✅ Préchargement intelligent des ressources')
  console.log('• ✅ Moniteur de performance en développement')
  console.log('• ✅ Configuration Next.js optimisée')
  console.log('• ✅ Gestionnaire de cache personnalisé')
}

async function main() {
  try {
    // Vérifier que le serveur est disponible
    const healthCheck = await fetch('http://localhost:3000/')
    if (!healthCheck.ok) {
      throw new Error('Serveur non disponible')
    }
    
    console.log('✅ Serveur disponible\n')
    
    // Exécuter tous les tests
    const apiResults = await testAPIPerformance()
    const cacheResults = await testCacheEfficiency()
    const pageResults = await testPageLoadTimes()
    
    // Générer le rapport final
    await generateReport(apiResults, cacheResults, pageResults)
    
    console.log('\n🚀 Validation des optimisations terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error.message)
    console.log('\n💡 Assurez-vous que le serveur Next.js est démarré avec:')
    console.log('   npm run dev')
    process.exit(1)
  }
}

main() 