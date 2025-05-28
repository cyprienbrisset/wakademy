const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function testSupabaseService() {
  console.log('🧪 Test de connexion Supabase avec clé de service...');
  
  try {
    // Créer le client avec la clé de service
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Client Supabase créé avec clé de service');

    // Lister toutes les tables disponibles via une requête SQL
    console.log('\n📋 Listing des tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });

    if (tablesError) {
      console.error('❌ Erreur listing tables:', tablesError);
    } else {
      console.log('✅ Tables disponibles:', JSON.stringify(tables, null, 2));
    }

    // Tester spécifiquement la table contents
    console.log('\n📋 Test de la table contents...');
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur contents:', error);
    } else {
      console.log('✅ Table contents accessible !');
      console.log('📊 Données:', data);
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

testSupabaseService(); 