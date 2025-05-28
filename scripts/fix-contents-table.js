const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function fixContentsTable() {
  console.log('🔧 Correction de la table contents...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Désactiver RLS temporairement
    console.log('🔓 Désactivation de RLS...');
    const disableRLSResult = await supabase.rpc('exec_sql', {
      sql_query: `ALTER TABLE public.contents DISABLE ROW LEVEL SECURITY;`
    });
    console.log('✅ RLS désactivé:', disableRLSResult);

    // Vider la table au cas où
    console.log('🗑️ Nettoyage de la table...');
    const truncateResult = await supabase.rpc('exec_sql', {
      sql_query: `TRUNCATE TABLE public.contents;`
    });
    console.log('✅ Table nettoyée:', truncateResult);

    // Insérer des données via SQL direct
    console.log('📊 Insertion de données via SQL...');
    const insertResult = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO public.contents (title, description, type, author, duration, category, thumbnail, views) VALUES
        ('Introduction au Leadership', 'Apprenez les bases du leadership moderne', 'video', 'Marie Dupont', 1800, 'Leadership', '/placeholder.svg?height=200&width=350&query=leadership', 1250),
        ('Stratégies de Communication', 'Techniques avancées de communication professionnelle', 'podcast', 'Jean Martin', 2400, 'Communication', '/placeholder.svg?height=200&width=350&query=communication', 980),
        ('Gestion du Temps', 'Optimisez votre productivité au quotidien', 'document', 'Sophie Leclerc', 1200, 'Productivité', '/placeholder.svg?height=200&width=350&query=time+management', 1560),
        ('Intelligence Émotionnelle', 'Développez votre intelligence émotionnelle', 'video', 'Pierre Dubois', 2100, 'Développement personnel', '/placeholder.svg?height=200&width=350&query=emotional+intelligence', 2100);
      `
    });
    console.log('✅ Données insérées via SQL:', insertResult);

    // Vérifier que les données sont bien là
    console.log('🔍 Vérification des données...');
    const { data: checkData, error: checkError } = await supabase
      .from('contents')
      .select('*')
      .limit(10);

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError);
    } else {
      console.log('✅ Données vérifiées:', checkData?.length, 'enregistrements trouvés');
      if (checkData && checkData.length > 0) {
        console.log('📋 Premier enregistrement:', checkData[0]);
      }
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

fixContentsTable(); 