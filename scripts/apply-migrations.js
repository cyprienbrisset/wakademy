const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

async function executeSql(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        sql_query: sql
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution SQL:', error.message);
    throw error;
  }
}

async function applyMigrations() {
  console.log('🚀 Application des migrations Supabase...');
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📁 ${migrationFiles.length} fichiers de migration trouvés`);

  for (const file of migrationFiles) {
    console.log(`\n📄 Application de ${file}...`);
    
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      await executeSql(sql);
      console.log(`✅ ${file} appliqué avec succès`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'application de ${file}:`, error.message);
      // Continuer avec les autres migrations
    }
  }

  console.log('\n🎉 Application des migrations terminée !');
}

// Exécuter le script
applyMigrations().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
}); 