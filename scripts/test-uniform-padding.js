const { execSync } = require('child_process');

console.log('🎨 Test du padding uniforme sur toutes les pages...\n');

const pages = [
  {
    name: 'Dashboard',
    url: 'http://localhost:3000/dashboard',
    description: 'Page principale du tableau de bord'
  },
  {
    name: 'Upload',
    url: 'http://localhost:3000/upload',
    description: 'Page d\'upload de contenu'
  },
  {
    name: 'Content (Podcast)',
    url: 'http://localhost:3000/content/73c7e91c-e967-4ad1-8298-0bfa3289486b',
    description: 'Page de contenu podcast'
  },
  {
    name: 'Content (Méditation)',
    url: 'http://localhost:3000/content/3b7e418c-0a95-41e4-b554-7fe531dbc662',
    description: 'Page de contenu méditation'
  }
];

const expectedPadding = 'container mx-auto px-4 sm:px-6 lg:px-8 py-8';
let passedTests = 0;
let totalTests = pages.length;

for (const page of pages) {
  try {
    console.log(`🧪 Test: ${page.name}`);
    console.log(`   ${page.description}`);
    
    const result = execSync(`curl -s "${page.url}"`, { encoding: 'utf8', timeout: 10000 });
    
    if (result.includes(expectedPadding)) {
      console.log(`✅ ${page.name} - PADDING UNIFORME DÉTECTÉ`);
      passedTests++;
    } else {
      console.log(`❌ ${page.name} - PADDING MANQUANT`);
      console.log(`   Attendu: ${expectedPadding}`);
      
      // Chercher d'autres patterns de padding
      const containerMatch = result.match(/container[^"]*mx-auto[^"]*/);
      if (containerMatch) {
        console.log(`   Trouvé: ${containerMatch[0]}`);
      } else {
        console.log(`   Aucun container détecté`);
      }
    }
  } catch (error) {
    console.log(`❌ ${page.name} - ERREUR: ${error.message}`);
  }
  
  console.log('');
}

console.log(`📊 Résultats: ${passedTests}/${totalTests} pages avec padding uniforme`);

if (passedTests === totalTests) {
  console.log('🎉 Padding uniforme appliqué avec succès !');
  console.log('✅ Toutes les pages utilisent le même container et padding');
  console.log('✅ Layout cohérent sur toute l\'application');
  console.log('✅ Expérience utilisateur uniforme');
} else {
  console.log('⚠️ Certaines pages n\'ont pas le padding uniforme.');
}

console.log('\n💡 Padding appliqué:');
console.log('   - container mx-auto : Centre le contenu avec une largeur maximale');
console.log('   - px-4 sm:px-6 lg:px-8 : Padding horizontal responsive');
console.log('   - py-8 : Padding vertical de 2rem (32px)');

console.log('\n🔧 Implémentation:');
console.log('   - Layout principal: app/(dashboard)/layout.tsx');
console.log('   - Appliqué automatiquement à toutes les pages du dashboard');
console.log('   - Suppression des containers redondants dans les pages individuelles'); 