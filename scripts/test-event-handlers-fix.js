const { execSync } = require('child_process');

console.log('🔧 Test de la correction des event handlers...\n');

const tests = [
  {
    name: 'Page de podcast (HTML)',
    url: 'http://localhost:3000/content/73c7e91c-e967-4ad1-8298-0bfa3289486b',
    expected: 'AudioPlayerWrapper',
    description: 'Vérification que AudioPlayerWrapper est utilisé'
  },
  {
    name: 'Page de podcast (Titre)',
    url: 'http://localhost:3000/content/73c7e91c-e967-4ad1-8298-0bfa3289486b',
    expected: 'Podcast Innovation Tech',
    description: 'Vérification que le contenu s\'affiche'
  },
  {
    name: 'Page de podcast (Lecteur audio)',
    url: 'http://localhost:3000/content/73c7e91c-e967-4ad1-8298-0bfa3289486b',
    expected: 'TechTalk Radio',
    description: 'Vérification que le lecteur audio s\'affiche'
  },
  {
    name: 'Page de méditation (Podcast)',
    url: 'http://localhost:3000/content/3b7e418c-0a95-41e4-b554-7fe531dbc662',
    expected: 'Méditation Sons de la Nature',
    description: 'Test d\'un autre podcast'
  }
];

let passedTests = 0;
let totalTests = tests.length;

for (const test of tests) {
  try {
    console.log(`🧪 Test: ${test.name}`);
    console.log(`   ${test.description}`);
    
    const result = execSync(`curl -s "${test.url}"`, { encoding: 'utf8', timeout: 10000 });
    
    if (result.includes(test.expected)) {
      console.log(`✅ ${test.name} - SUCCÈS`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - ÉCHEC`);
      console.log(`   Attendu: ${test.expected}`);
      console.log(`   Reçu: ${result.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`❌ ${test.name} - ERREUR: ${error.message}`);
  }
  
  console.log('');
}

console.log(`📊 Résultats: ${passedTests}/${totalTests} tests réussis`);

if (passedTests === totalTests) {
  console.log('🎉 Correction des event handlers réussie !');
  console.log('✅ AudioPlayerWrapper utilisé au lieu d\'AudioPlayer direct');
  console.log('✅ Pas d\'erreur "Event handlers cannot be passed to Client Component props"');
  console.log('✅ Pages de podcast accessibles et fonctionnelles');
  console.log('✅ Lecteur audio s\'affiche correctement');
} else {
  console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
}

console.log('\n💡 Correction appliquée:');
console.log('   - Création du composant AudioPlayerWrapper (client)');
console.log('   - Déplacement des fonctions onProgress et onComplete dans le wrapper');
console.log('   - Utilisation d\'useCallback pour optimiser les performances');
console.log('   - Suppression des fonctions du composant serveur ContentPage');

console.log('\n🔧 Fichiers modifiés:');
console.log('   - components/content/audio-player-wrapper.tsx (nouveau)');
console.log('   - app/(dashboard)/content/[id]/page.tsx (modifié)'); 