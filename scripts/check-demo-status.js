const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

// Titres des contenus de démo attendus
const EXPECTED_DEMO_TITLES = [
  'Méditation Sons de la Nature',
  'Conférence Leadership Moderne',
  'Guide Complet de Productivité',
  'Podcast Innovation Tech',
  'Formation Techniques de Vente',
  'Webinar Communication Efficace'
];

async function checkDemoStatus() {
  console.log('🔍 Vérification du statut du mode démo...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Récupérer tous les contenus
    const { data: allContents, error: fetchError } = await supabase
      .from('contents')
      .select('id, title, type, category, author, views')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des contenus:', fetchError);
      return;
    }

    console.log(`\n📊 ${allContents.length} contenus trouvés au total`);

    // Vérifier si on est en mode démo
    const demoContents = allContents.filter(content => 
      EXPECTED_DEMO_TITLES.includes(content.title.replace('⭐ ', ''))
    );

    const nonDemoContents = allContents.filter(content => 
      !EXPECTED_DEMO_TITLES.includes(content.title.replace('⭐ ', ''))
    );

    const premiumContents = allContents.filter(content => 
      content.title.startsWith('⭐')
    );

    // Analyser le statut
    let status = '';
    let statusIcon = '';
    
    if (allContents.length === 6 && demoContents.length === 6 && nonDemoContents.length === 0) {
      status = 'Mode Démo Pur';
      statusIcon = '🎬';
    } else if (demoContents.length === 6 && premiumContents.length > 0) {
      status = 'Mode Démo + Premium';
      statusIcon = '⭐';
    } else if (demoContents.length === 6 && nonDemoContents.length > 0) {
      status = 'Mode Démo + Contenus Mixtes';
      statusIcon = '🔀';
    } else if (allContents.length === 0) {
      status = 'Base Vide';
      statusIcon = '🗑️';
    } else {
      status = 'Mode Développement/Test';
      statusIcon = '🧪';
    }

    console.log(`\n${statusIcon} Statut: ${status}`);

    // Afficher les détails
    console.log('\n📋 Analyse détaillée:');
    console.log(`  ✅ Contenus de démo: ${demoContents.length}/6`);
    console.log(`  ⭐ Contenus premium: ${premiumContents.length}`);
    console.log(`  🧪 Autres contenus: ${nonDemoContents.length}`);

    // Vérifier les contenus de démo manquants
    const missingDemoTitles = EXPECTED_DEMO_TITLES.filter(title => 
      !allContents.some(content => content.title.replace('⭐ ', '') === title)
    );

    if (missingDemoTitles.length > 0) {
      console.log('\n⚠️ Contenus de démo manquants:');
      missingDemoTitles.forEach(title => {
        console.log(`  - ${title}`);
      });
    }

    // Afficher tous les contenus présents
    console.log('\n📄 Contenus présents:');
    allContents.forEach((content, index) => {
      const icon = content.title.startsWith('⭐') ? '⭐' : 
                   EXPECTED_DEMO_TITLES.includes(content.title) ? '🎬' : '🧪';
      console.log(`  ${index + 1}. ${icon} ${content.title}`);
      console.log(`     📂 ${content.category} | 👤 ${content.author} | 👁️ ${content.views} vues`);
    });

    // Recommandations
    console.log('\n💡 Recommandations:');
    if (status === 'Mode Démo Pur') {
      console.log('  ✅ Parfait pour les démonstrations clients');
      console.log('  ✅ Contenu professionnel et réaliste');
      console.log('  💎 Ajouter du premium: node scripts/add-premium-demo-data.js');
    } else if (status === 'Mode Démo + Premium') {
      console.log('  ✅ Excellent pour les présentations investisseurs');
      console.log('  ✅ Mix de contenu démo et premium');
    } else if (missingDemoTitles.length > 0) {
      console.log('  🔄 Restaurer les contenus de démo: node scripts/add-real-demo-data.js');
      console.log('  🎬 Ou reset complet: node scripts/reset-demo-mode.js');
    } else if (nonDemoContents.length > 0) {
      console.log('  🎬 Activer le mode démo pur: node scripts/reset-demo-mode.js');
      console.log('  🧹 Ou purger les tests: node scripts/purge-contents.js test-only');
    }

    // Vérifier le stockage
    console.log('\n🗂️ Vérification du stockage...');
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('content')
      .list('', { limit: 100 });

    if (!storageError && storageFiles) {
      const folders = storageFiles.filter(file => file.name.endsWith('/') || 
        ['uploads', 'demos', 'premium'].includes(file.name));
      
      console.log('📁 Dossiers présents:');
      folders.forEach(folder => {
        const icon = folder.name === 'demos' ? '🎬' : 
                     folder.name === 'premium' ? '⭐' : '🧪';
        console.log(`  ${icon} ${folder.name}/`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécuter le script
checkDemoStatus(); 