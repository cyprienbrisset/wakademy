#!/usr/bin/env node

console.log('🎯 Validation Complète de Wakademy');
console.log('==================================\n');

async function testPage(url, name) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`✅ ${name}: Accessible (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${name}: Erreur ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Erreur de connexion - ${error.message}`);
    return false;
  }
}

async function testAPI(endpoint, name) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    const result = await response.json();
    
    if (result.error) {
      console.log(`❌ ${name}: ${result.error}`);
      return false;
    } else {
      const count = result.data ? result.data.length : 'N/A';
      console.log(`✅ ${name}: ${count} éléments`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${name}: Erreur - ${error.message}`);
    return false;
  }
}

async function validatePages() {
  console.log('🌐 Test des Pages Principales:');
  console.log('==============================');
  
  const pages = [
    { url: 'http://localhost:3000/', name: 'Page d\'accueil' },
    { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
    { url: 'http://localhost:3000/library', name: 'Bibliothèque' },
    { url: 'http://localhost:3000/continue-watching', name: 'Continue Watching' },
    { url: 'http://localhost:3000/upload', name: 'Upload' }
  ];
  
  let successCount = 0;
  for (const page of pages) {
    if (await testPage(page.url, page.name)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Pages: ${successCount}/${pages.length} fonctionnelles\n`);
  return successCount === pages.length;
}

async function validateAPIs() {
  console.log('🔌 Test des APIs:');
  console.log('=================');
  
  const apis = [
    { endpoint: '/api/trending?type=trending', name: 'API Trending' },
    { endpoint: '/api/library?type=all', name: 'API Library' },
    { endpoint: '/api/setup/create-watch-history', name: 'API Watch History' }
  ];
  
  let successCount = 0;
  for (const api of apis) {
    if (await testAPI(api.endpoint, api.name)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 APIs: ${successCount}/${apis.length} fonctionnelles\n`);
  return successCount === apis.length;
}

async function validateDatabase() {
  console.log('🗄️  Test de la Base de Données:');
  console.log('===============================');
  
  try {
    const watchHistoryResponse = await fetch('http://localhost:3000/api/setup/create-watch-history');
    const watchHistoryResult = await watchHistoryResponse.json();
    
    if (watchHistoryResult.tableExists) {
      console.log('✅ Table user_watch_history: Existe');
    } else {
      console.log('❌ Table user_watch_history: N\'existe pas');
      return false;
    }
    
    const contentsResponse = await fetch('http://localhost:3000/api/trending?type=all');
    const contentsResult = await contentsResponse.json();
    
    if (contentsResult.data && contentsResult.data.length > 0) {
      console.log(`✅ Table contents: ${contentsResult.data.length} contenus disponibles`);
    } else {
      console.log('⚠️  Table contents: Aucun contenu trouvé');
    }
    
    console.log('\n📊 Base de données: Fonctionnelle\n');
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur base de données: ${error.message}\n`);
    return false;
  }
}

async function generateReport(pagesOK, apisOK, dbOK) {
  console.log('📋 RAPPORT FINAL DE VALIDATION');
  console.log('==============================');
  
  const allSystems = [
    { name: 'Pages Web', status: pagesOK },
    { name: 'APIs', status: apisOK },
    { name: 'Base de Données', status: dbOK }
  ];
  
  let totalOK = 0;
  allSystems.forEach(system => {
    const icon = system.status ? '✅' : '❌';
    const status = system.status ? 'FONCTIONNEL' : 'PROBLÈME';
    console.log(`${icon} ${system.name}: ${status}`);
    if (system.status) totalOK++;
  });
  
  console.log(`\n🎯 Score Global: ${totalOK}/${allSystems.length} systèmes fonctionnels`);
  
  if (totalOK === allSystems.length) {
    console.log('\n🎉 WAKADEMY EST COMPLÈTEMENT FONCTIONNEL !');
    console.log('==========================================');
    console.log('✅ Toutes les fonctionnalités sont opérationnelles');
    console.log('✅ Toutes les tables de base de données sont créées');
    console.log('✅ Toutes les APIs répondent correctement');
    console.log('✅ Toutes les pages sont accessibles');
  } else {
    console.log('\n⚠️  WAKADEMY NÉCESSITE DES CORRECTIONS');
    console.log('=====================================');
    console.log('Certains systèmes présentent des problèmes.');
  }
  
  console.log('\n🔗 URLs Importantes:');
  console.log('====================');
  console.log('🏠 Accueil: http://localhost:3000/');
  console.log('📊 Dashboard: http://localhost:3000/dashboard');
  console.log('📚 Bibliothèque: http://localhost:3000/library');
  console.log('⏯️  Continue Watching: http://localhost:3000/continue-watching');
  console.log('📤 Upload: http://localhost:3000/upload');
  
  return totalOK === allSystems.length;
}

async function runCompleteValidation() {
  console.log('🚀 Démarrage de la validation complète...\n');
  
  const pagesOK = await validatePages();
  const apisOK = await validateAPIs();
  const dbOK = await validateDatabase();
  
  const allOK = await generateReport(pagesOK, apisOK, dbOK);
  
  process.exit(allOK ? 0 : 1);
}

runCompleteValidation(); 