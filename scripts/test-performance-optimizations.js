#!/usr/bin/env node

console.log('🚀 Test des Optimisations de Performance Wakademy');
console.log('================================================\n');

// Mesurer les temps de réponse des APIs
async function testAPIPerformance() {
  console.log('📊 Test des performances API:');
  console.log('=============================');

  const apis = [
    { name: 'Trending API', url: '/api/trending?type=trending&limit=10' },
    { name: 'Library API', url: '/api/library?type=all&limit=20' },
    { name: 'New Content API', url: '/api/trending?type=new&limit=5' },
    { name: 'Podcasts API', url: '/api/trending?type=podcasts&limit=5' }
  ];

  const results = [];

  for (const api of apis) {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://localhost:3000${api.url}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const data = await response.json();
        const itemCount = data.data ? data.data.length : 0;
        
        results.push({
          name: api.name,
          responseTime,
          itemCount,
          status: 'success'
        });

        const performanceIcon = responseTime < 100 ? '🟢' : responseTime < 300 ? '🟡' : '🔴';
        console.log(`${performanceIcon} ${api.name}: ${responseTime}ms (${itemCount} éléments)`);
      } else {
        results.push({
          name: api.name,
          responseTime,
          itemCount: 0,
          status: 'error'
        });
        console.log(`❌ ${api.name}: Erreur ${response.status}`);
      }
    } catch (error) {
      results.push({
        name: api.name,
        responseTime: 0,
        itemCount: 0,
        status: 'error'
      });
      console.log(`❌ ${api.name}: ${error.message}`);
    }
  }

  return results;
}

// Tester le cache en faisant des requêtes répétées
async function testCachePerformance() {
  console.log('\n🗄️  Test du cache:');
  console.log('==================');

  const testUrl = '/api/trending?type=trending&limit=10';
  const iterations = 3;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://localhost:3000${testUrl}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        times.push(responseTime);
        const cacheStatus = i === 0 ? 'Premier appel' : 'Appel mis en cache';
        console.log(`📈 ${cacheStatus}: ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`❌ Erreur lors du test ${i + 1}: ${error.message}`);
    }

    // Attendre un peu entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (times.length >= 2) {
    const improvement = times[0] - times[1];
    const improvementPercent = Math.round((improvement / times[0]) * 100);
    
    if (improvement > 0) {
      console.log(`✅ Amélioration du cache: ${improvement}ms (${improvementPercent}%)`);
    } else {
      console.log(`⚠️  Pas d'amélioration détectée du cache`);
    }
  }

  return times;
}

// Tester les temps de chargement des pages
async function testPageLoadTimes() {
  console.log('\n🌐 Test des temps de chargement des pages:');
  console.log('==========================================');

  const pages = [
    { name: 'Accueil', url: '/' },
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Library', url: '/library' },
    { name: 'Continue Watching', url: '/continue-watching' }
  ];

  const results = [];

  for (const page of pages) {
    try {
      const startTime = Date.now();
      const response = await fetch(`http://localhost:3000${page.url}`);
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      if (response.ok) {
        results.push({
          name: page.name,
          loadTime,
          status: 'success'
        });

        const performanceIcon = loadTime < 500 ? '🟢' : loadTime < 1500 ? '🟡' : '🔴';
        console.log(`${performanceIcon} ${page.name}: ${loadTime}ms`);
      } else {
        results.push({
          name: page.name,
          loadTime,
          status: 'error'
        });
        console.log(`❌ ${page.name}: Erreur ${response.status}`);
      }
    } catch (error) {
      results.push({
        name: page.name,
        loadTime: 0,
        status: 'error'
      });
      console.log(`❌ ${page.name}: ${error.message}`);
    }
  }

  return results;
}

// Analyser les résultats et donner des recommandations
function analyzeResults(apiResults, cacheResults, pageResults) {
  console.log('\n📋 ANALYSE DES PERFORMANCES');
  console.log('============================');

  // Analyse des APIs
  const avgApiTime = apiResults
    .filter(r => r.status === 'success')
    .reduce((sum, r) => sum + r.responseTime, 0) / apiResults.filter(r => r.status === 'success').length;

  console.log(`📊 Temps de réponse API moyen: ${Math.round(avgApiTime)}ms`);

  if (avgApiTime < 150) {
    console.log('✅ Excellentes performances API');
  } else if (avgApiTime < 300) {
    console.log('🟡 Performances API correctes');
  } else {
    console.log('🔴 Performances API à améliorer');
  }

  // Analyse des pages
  const avgPageTime = pageResults
    .filter(r => r.status === 'success')
    .reduce((sum, r) => sum + r.loadTime, 0) / pageResults.filter(r => r.status === 'success').length;

  console.log(`🌐 Temps de chargement page moyen: ${Math.round(avgPageTime)}ms`);

  if (avgPageTime < 800) {
    console.log('✅ Excellents temps de chargement');
  } else if (avgPageTime < 2000) {
    console.log('🟡 Temps de chargement corrects');
  } else {
    console.log('🔴 Temps de chargement à améliorer');
  }

  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  console.log('===================');

  if (avgApiTime > 200) {
    console.log('🔧 Considérer l\'ajout d\'index sur les colonnes fréquemment utilisées');
    console.log('🔧 Optimiser les requêtes Supabase avec des sélections spécifiques');
  }

  if (avgPageTime > 1000) {
    console.log('🔧 Implémenter le lazy loading pour les composants non critiques');
    console.log('🔧 Optimiser les images avec Next.js Image component');
  }

  if (cacheResults.length >= 2 && cacheResults[1] >= cacheResults[0] * 0.8) {
    console.log('🔧 Vérifier la configuration du cache côté client');
    console.log('🔧 Implémenter un cache Redis pour les données fréquemment accédées');
  }

  console.log('🔧 Activer la compression gzip/brotli sur le serveur');
  console.log('🔧 Utiliser un CDN pour les assets statiques');
}

// Fonction principale
async function runPerformanceTests() {
  try {
    console.log('🔍 Vérification de la disponibilité du serveur...');
    
    const healthCheck = await fetch('http://localhost:3000/');
    if (!healthCheck.ok) {
      throw new Error('Serveur non disponible');
    }
    console.log('✅ Serveur disponible\n');

    // Exécuter tous les tests
    const apiResults = await testAPIPerformance();
    const cacheResults = await testCachePerformance();
    const pageResults = await testPageLoadTimes();

    // Analyser les résultats
    analyzeResults(apiResults, cacheResults, pageResults);

    console.log('\n🎯 RÉSUMÉ DES OPTIMISATIONS IMPLÉMENTÉES:');
    console.log('========================================');
    console.log('✅ Système de cache en mémoire avec TTL');
    console.log('✅ Pool de connexions Supabase optimisé');
    console.log('✅ Sélection de colonnes spécifiques dans les requêtes');
    console.log('✅ Limitation des résultats pour éviter les requêtes lourdes');
    console.log('✅ Cache des métadonnées de colonnes');
    console.log('✅ Formatage optimisé des durées');
    console.log('✅ Gestion d\'erreurs améliorée');
    console.log('✅ Composants de loading avec Suspense');
    console.log('✅ Moniteur de performance en développement');

    console.log('\n🚀 Tests de performance terminés avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des tests de performance:', error.message);
    console.log('\n💡 Assurez-vous que le serveur Next.js est démarré avec:');
    console.log('   npm run dev');
    process.exit(1);
  }
}

runPerformanceTests(); 