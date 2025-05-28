#!/usr/bin/env node

const http = require('http');

console.log('🔍 Test de visibilité de la navbar\n');

function testNavbarVisibility() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/dashboard', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Page dashboard chargée');
          
          // Vérifier la présence de la navbar dans le HTML
          const navbarTests = [
            {
              name: 'Header fixe',
              test: data.includes('fixed top-0') || data.includes('header'),
              description: 'Élément header avec position fixe'
            },
            {
              name: 'Logo Wakademy',
              test: data.includes('Wakademy') || data.includes('wakademy-logo'),
              description: 'Logo ou texte Wakademy présent'
            },
            {
              name: 'Navigation icons',
              test: data.includes('Home') || data.includes('Library') || data.includes('Settings'),
              description: 'Icônes de navigation présentes'
            },
            {
              name: 'Structure navbar',
              test: data.includes('flex h-16') || data.includes('items-center'),
              description: 'Structure CSS de la navbar'
            },
            {
              name: 'Z-index élevé',
              test: data.includes('z-50') || data.includes('z-index'),
              description: 'Z-index pour affichage au-dessus'
            }
          ];
          
          console.log('\n📋 Tests de visibilité de la navbar:');
          let passedTests = 0;
          
          navbarTests.forEach(test => {
            if (test.test) {
              console.log(`✅ ${test.name}: ${test.description}`);
              passedTests++;
            } else {
              console.log(`❌ ${test.name}: ${test.description}`);
            }
          });
          
          console.log(`\n🎯 Score navbar: ${passedTests}/${navbarTests.length} tests réussis`);
          
          // Vérifier l'absence d'animations problématiques
          const animationTests = [
            {
              name: 'Pas de Framer Motion',
              test: !data.includes('motion.') && !data.includes('AnimatePresence'),
              description: 'Animations Framer Motion supprimées'
            },
            {
              name: 'Pas de transform cachant',
              test: !data.includes('translateY(-100%)') && !data.includes('opacity: 0'),
              description: 'Pas de transformations cachant la navbar'
            }
          ];
          
          console.log('\n🎬 Tests d\'animations:');
          let passedAnimationTests = 0;
          
          animationTests.forEach(test => {
            if (test.test) {
              console.log(`✅ ${test.name}: ${test.description}`);
              passedAnimationTests++;
            } else {
              console.log(`❌ ${test.name}: ${test.description}`);
            }
          });
          
          const totalPassed = passedTests + passedAnimationTests;
          const totalTests = navbarTests.length + animationTests.length;
          
          console.log(`\n📊 Score total: ${totalPassed}/${totalTests} tests réussis`);
          
          if (totalPassed >= totalTests - 1) {
            console.log('🎉 La navbar devrait être visible !');
            console.log('\n💡 Conseils:');
            console.log('• Ouvrez http://localhost:3000/dashboard dans votre navigateur');
            console.log('• La navbar devrait apparaître en haut de la page');
            console.log('• Si elle n\'apparaît pas, vérifiez la console du navigateur');
            resolve(true);
          } else {
            console.log('⚠️  La navbar pourrait avoir des problèmes de visibilité');
            resolve(false);
          }
        } else {
          console.log(`❌ Erreur: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Erreur de connexion:', err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test de la page d'accueil pour vérifier que la navbar ne s'affiche pas
function testHomePageNoNavbar() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          // La navbar ne devrait PAS être présente sur la page d'accueil
          const hasNavbar = data.includes('fixed top-0') && data.includes('Wakademy');
          if (!hasNavbar) {
            console.log('✅ Page d\'accueil sans navbar (correct)');
            resolve(true);
          } else {
            console.log('⚠️  Navbar présente sur la page d\'accueil (inattendu)');
            resolve(false);
          }
        } else {
          console.log(`❌ Page d'accueil inaccessible: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Erreur page d\'accueil:', err.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout page d\'accueil');
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🧪 Test complet de la navbar\n');
  
  const dashboardResult = await testNavbarVisibility();
  const homeResult = await testHomePageNoNavbar();
  
  console.log('\n📋 Résumé final:');
  console.log(`Dashboard avec navbar: ${dashboardResult ? '✅' : '❌'}`);
  console.log(`Accueil sans navbar: ${homeResult ? '✅' : '❌'}`);
  
  if (dashboardResult && homeResult) {
    console.log('\n🎉 Configuration navbar parfaite !');
    console.log('La navbar s\'affiche uniquement sur les pages du dashboard.');
  } else {
    console.log('\n⚠️  Vérification manuelle recommandée dans le navigateur.');
  }
  
  process.exit(dashboardResult && homeResult ? 0 : 1);
}

runTests().catch(console.error); 