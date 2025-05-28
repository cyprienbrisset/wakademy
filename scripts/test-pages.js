#!/usr/bin/env node

const http = require('http');

// IDs de test
const testIds = [
  '8d47620c-ca28-41e0-8003-69f8484b7151', // Vidéo TopCream (Dailymotion)
  'dd5e0d26-2b4c-42fb-be50-e5707345b852', // Podcast TopCream (MP3)
  '72e79f76-9a33-45fb-b4b2-876b9990224a'  // Contenu standard (document)
];

const testPage = (id) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/content/${id}`,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        id,
        status: res.statusCode,
        success: res.statusCode === 200
      });
    });

    req.on('error', (err) => {
      resolve({
        id,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        id,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
};

async function testAllPages() {
  console.log('🧪 Test de toutes les pages de contenu...\n');

  const results = await Promise.all(testIds.map(testPage));

  results.forEach((result, index) => {
    const types = ['Vidéo TopCream', 'Podcast TopCream', 'Document standard'];
    const emoji = result.success ? '✅' : '❌';
    
    console.log(`${emoji} ${types[index]} (${result.id})`);
    console.log(`   Status: ${result.status}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
    console.log('');
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`📊 Résultats: ${successCount}/${totalCount} pages fonctionnent correctement`);

  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  } else {
    console.log('⚠️  Certains tests ont échoué.');
    process.exit(1);
  }
}

testAllPages().catch(console.error); 