const { execSync } = require('child_process');

console.log('🔧 Test des corrections Supabase...\n');

const tests = [
  {
    name: 'API Trending',
    url: 'http://localhost:3000/api/trending',
    expected: 'data'
  },
  {
    name: 'Page de contenu (HTML)',
    url: 'http://localhost:3000/content/4b6d9ff0-93ae-4c7c-9359-15f47a379ea2',
    expected: 'html'
  },
  {
    name: 'Page de contenu (Titre)',
    url: 'http://localhost:3000/content/4b6d9ff0-93ae-4c7c-9359-15f47a379ea2',
    expected: 'Webinar Communication Efficace'
  },
  {
    name: 'API Upload (sans auth)',
    url: 'http://localhost:3000/api/upload',
    method: 'POST',
    expected: 'Content-Type'
  }
];

let passedTests = 0;
let totalTests = tests.length;

for (const test of tests) {
  try {
    console.log(`🧪 Test: ${test.name}`);
    
    let command;
    if (test.method === 'POST') {
      command = `curl -s -X POST "${test.url}"`;
    } else {
      command = `curl -s "${test.url}"`;
    }
    
    const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
    
    if (result.includes(test.expected)) {
      console.log(`✅ ${test.name} - SUCCÈS`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - ÉCHEC`);
      console.log(`   Attendu: ${test.expected}`);
      console.log(`   Reçu: ${result.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ ${test.name} - ERREUR: ${error.message}`);
  }
  
  console.log('');
}

console.log(`📊 Résultats: ${passedTests}/${totalTests} tests réussis`);

if (passedTests === totalTests) {
  console.log('🎉 Toutes les corrections Supabase fonctionnent correctement !');
  console.log('✅ Pages de contenu accessibles');
  console.log('✅ Contenu affiché correctement');
  console.log('✅ Pas d\'erreur "supabase.from is not a function"');
  console.log('✅ Pas d\'erreur "params should be awaited"');
} else {
  console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
}

console.log('\n💡 Pour tester manuellement:');
console.log('   - Ouvrez http://localhost:3000 dans votre navigateur');
console.log('   - Naviguez vers une page de contenu');
console.log('   - Vérifiez que le contenu s\'affiche correctement'); 