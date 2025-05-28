const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoiYW5vbiJ9.8Nt6mTt4FxWiz9nly6CpJLfl4Jumwgv5WImYWOr64cw';

async function testSupabase() {
  console.log('🧪 Test de connexion Supabase...');
  
  try {
    // Créer le client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Client Supabase créé');

    // Tester la connexion avec une requête simple
    console.log('\n📋 Test de la table contents...');
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur:', error);
    } else {
      console.log('✅ Connexion réussie !');
      console.log('📊 Données:', data);
    }

    // Tester les colonnes disponibles
    console.log('\n🔍 Test des colonnes...');
    const { data: columnsData, error: columnsError } = await supabase
      .from('contents')
      .select()
      .limit(1);

    if (columnsError) {
      console.error('❌ Erreur colonnes:', columnsError);
    } else {
      console.log('✅ Colonnes disponibles:', columnsData && columnsData.length > 0 ? Object.keys(columnsData[0]) : 'Aucune donnée');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

testSupabase(); 