const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

// Modes disponibles
const MODES = {
  'demo': {
    name: 'Mode Démo Pur',
    icon: '🎬',
    description: 'Contenus de démo réalistes uniquement',
    scripts: ['reset-demo-mode.js']
  },
  'premium': {
    name: 'Mode Démo + Premium',
    icon: '⭐',
    description: 'Contenus de démo + contenus premium',
    scripts: ['reset-demo-mode.js', 'add-premium-demo-data.js']
  },
  'test': {
    name: 'Mode Test/Développement',
    icon: '🧪',
    description: 'Contenus de test pour développement',
    scripts: ['purge-contents.js all', 'add-test-data.js']
  },
  'full': {
    name: 'Mode Complet',
    icon: '🎯',
    description: 'Tous types de contenus (test + démo + premium)',
    scripts: ['purge-contents.js all', 'add-test-data.js', 'add-real-demo-data.js', 'add-premium-demo-data.js']
  },
  'empty': {
    name: 'Base Vide',
    icon: '🗑️',
    description: 'Supprime tous les contenus',
    scripts: ['purge-contents.js all']
  }
};

function showUsage() {
  console.log('🔄 Script de basculement de mode Wakademy\n');
  console.log('Usage: node scripts/switch-mode.js <mode>\n');
  console.log('Modes disponibles:');
  
  Object.entries(MODES).forEach(([key, mode]) => {
    console.log(`  ${mode.icon} ${key.padEnd(8)} - ${mode.name}`);
    console.log(`    ${mode.description}`);
    console.log('');
  });
  
  console.log('Exemples:');
  console.log('  node scripts/switch-mode.js demo     # Basculer en mode démo');
  console.log('  node scripts/switch-mode.js premium  # Basculer en mode démo + premium');
  console.log('  node scripts/switch-mode.js test     # Basculer en mode test');
  console.log('  node scripts/switch-mode.js empty    # Vider la base');
}

function executeScript(scriptCommand) {
  console.log(`\n🔄 Exécution: ${scriptCommand}`);
  try {
    const output = execSync(`node scripts/${scriptCommand}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Afficher seulement les lignes importantes (avec émojis)
    const lines = output.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('🎉') || 
      line.includes('✅') || 
      line.includes('📊') || 
      line.includes('💡') ||
      line.includes('⭐') ||
      line.includes('🎬') ||
      line.includes('❌')
    );
    
    if (importantLines.length > 0) {
      importantLines.forEach(line => console.log(line));
    } else {
      console.log('✅ Script exécuté avec succès');
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution de ${scriptCommand}:`, error.message);
    throw error;
  }
}

async function switchMode(targetMode) {
  if (!MODES[targetMode]) {
    console.error(`❌ Mode "${targetMode}" non reconnu.`);
    showUsage();
    return;
  }

  const mode = MODES[targetMode];
  
  console.log(`🔄 Basculement vers: ${mode.icon} ${mode.name}`);
  console.log(`📝 Description: ${mode.description}\n`);

  // Vérifier l'état actuel
  console.log('🔍 Vérification de l\'état actuel...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: currentContents, error } = await supabase
      .from('contents')
      .select('id, title')
      .limit(1);

    if (error) {
      console.error('⚠️ Erreur lors de la vérification:', error.message);
    } else {
      console.log(`📊 État actuel: ${currentContents.length > 0 ? 'Contenus présents' : 'Base vide'}`);
    }
  } catch (error) {
    console.log('⚠️ Impossible de vérifier l\'état actuel');
  }

  // Exécuter les scripts nécessaires
  console.log(`\n🚀 Exécution de ${mode.scripts.length} script(s)...`);
  
  for (let i = 0; i < mode.scripts.length; i++) {
    const script = mode.scripts[i];
    console.log(`\n📋 Étape ${i + 1}/${mode.scripts.length}: ${script}`);
    
    try {
      executeScript(script);
    } catch (error) {
      console.error(`❌ Échec à l'étape ${i + 1}, arrêt du processus.`);
      return;
    }
  }

  // Vérification finale
  console.log('\n🔍 Vérification finale du statut...');
  try {
    executeScript('check-demo-status.js');
  } catch (error) {
    console.log('⚠️ Impossible de vérifier le statut final');
  }

  console.log(`\n🎉 Basculement vers "${mode.name}" terminé !`);
  console.log(`💡 Votre plateforme est maintenant en ${mode.name.toLowerCase()}.`);
}

// Récupérer le mode depuis les arguments
const targetMode = process.argv[2];

if (!targetMode) {
  showUsage();
} else {
  switchMode(targetMode);
} 