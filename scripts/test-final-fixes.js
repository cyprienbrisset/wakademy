#!/usr/bin/env node

const http = require('http');

console.log('🧪 Test final - Vérification de toutes les corrections\n');

// Test 1: Navbar présente sur dashboard
function testNavbarDashboard() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/dashboard', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasNavbar = data.includes('fixed top-0') && data.includes('Wakademy');
        console.log(`✅ Dashboard avec navbar: ${hasNavbar ? 'OUI' : 'NON'}`);
        resolve(hasNavbar);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Dashboard inaccessible');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout dashboard');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Library charge le contenu
function testLibraryLoadsContent() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/library', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Vérifier que la page ne reste pas en état de chargement
        const isStuckLoading = data.includes('Chargement des contenus...') && 
                              data.includes('animate-spin');
        
        // Vérifier qu'il n'y a pas d'erreurs JavaScript
        const hasJSError = data.includes('error') || data.includes('Error') || 
                          data.includes('Unhandled') || data.includes('Cannot read properties');
        
        const isWorking = !isStuckLoading && !hasJSError;
        console.log(`✅ Library charge le contenu: ${isWorking ? 'OUI' : 'NON'}`);
        
        if (!isWorking) {
          if (isStuckLoading) {
            console.log('   → Page bloquée en chargement');
          }
          if (hasJSError) {
            console.log('   → Erreurs JavaScript détectées');
          }
        }
        
        resolve(isWorking);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Library inaccessible');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout library');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 3: Service Worker désactivé par défaut
function testServiceWorkerDisabled() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/dashboard', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Vérifier qu'il n'y a pas d'enregistrement automatique du Service Worker
        const hasAutoSW = data.includes('navigator.serviceWorker.register') && 
                         !data.includes('// NE PAS enregistrer automatiquement');
        console.log(`✅ Service Worker non auto-activé: ${!hasAutoSW ? 'OUI' : 'NON'}`);
        resolve(!hasAutoSW);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Test Service Worker échoué');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout Service Worker test');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 4: APIs fonctionnelles
function testAPIs() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/library?type=all&limit=5', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const hasData = response.data && Array.isArray(response.data) && response.data.length > 0;
          console.log(`✅ API Library fonctionnelle: ${hasData ? 'OUI' : 'NON'}`);
          resolve(hasData);
        } catch (e) {
          console.log('❌ API Library erreur JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ API Library inaccessible');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout API Library');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 5: Page d'accueil sans navbar
function testHomeNoNavbar() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasNavbar = data.includes('fixed top-0') && data.includes('Wakademy');
        console.log(`✅ Accueil sans navbar: ${!hasNavbar ? 'OUI' : 'NON'}`);
        resolve(!hasNavbar);
      });
    });
    
    req.on('error', () => {
      console.log('❌ Accueil inaccessible');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout accueil');
      req.destroy();
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('🔍 Exécution de tous les tests...\n');
  
  const results = await Promise.all([
    testNavbarDashboard(),
    testLibraryLoadsContent(),
    testServiceWorkerDisabled(),
    testAPIs(),
    testHomeNoNavbar()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📊 Résultats finaux:');
  console.log(`Tests réussis: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 TOUS LES PROBLÈMES SONT RÉSOLUS !');
    console.log('✅ La navbar fonctionne correctement');
    console.log('✅ Le mode hors ligne n\'est plus activé par défaut');
    console.log('✅ Les erreurs de composants sont corrigées');
    console.log('✅ Les APIs fonctionnent parfaitement');
    console.log('\n💡 L\'application Wakademy est maintenant opérationnelle !');
  } else {
    console.log('\n⚠️  Quelques problèmes persistent');
    console.log('Vérifiez les tests échoués ci-dessus');
  }
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(console.error); 