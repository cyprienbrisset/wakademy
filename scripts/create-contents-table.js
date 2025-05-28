const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function createContentsTable() {
  console.log('🚀 Création de la table contents...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Créer la table contents avec une structure simplifiée
    console.log('📄 Création de la table...');
    const createTableResult = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.contents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL DEFAULT 'video',
          author TEXT,
          duration INTEGER DEFAULT 0,
          category TEXT,
          thumbnail TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          views INTEGER DEFAULT 0
        );
      `
    });

    console.log('✅ Table créée:', createTableResult);

    // Insérer des données de test
    console.log('📊 Insertion de données de test...');
    const { data: insertData, error: insertError } = await supabase
      .from('contents')
      .insert([
        {
          title: 'Introduction au Leadership',
          description: 'Apprenez les bases du leadership moderne',
          type: 'video',
          author: 'Marie Dupont',
          duration: 1800,
          category: 'Leadership',
          thumbnail: '/placeholder.svg?height=200&width=350&query=leadership',
          views: 1250
        },
        {
          title: 'Stratégies de Communication',
          description: 'Techniques avancées de communication professionnelle',
          type: 'podcast',
          author: 'Jean Martin',
          duration: 2400,
          category: 'Communication',
          thumbnail: '/placeholder.svg?height=200&width=350&query=communication',
          views: 980
        },
        {
          title: 'Gestion du Temps',
          description: 'Optimisez votre productivité au quotidien',
          type: 'document',
          author: 'Sophie Leclerc',
          duration: 1200,
          category: 'Productivité',
          thumbnail: '/placeholder.svg?height=200&width=350&query=time+management',
          views: 1560
        },
        {
          title: 'Intelligence Émotionnelle',
          description: 'Développez votre intelligence émotionnelle',
          type: 'video',
          author: 'Pierre Dubois',
          duration: 2100,
          category: 'Développement personnel',
          thumbnail: '/placeholder.svg?height=200&width=350&query=emotional+intelligence',
          views: 2100
        }
      ]);

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
    } else {
      console.log('✅ Données insérées avec succès !');
      console.log('📊 Données:', insertData);
    }

    // Vérifier que les données sont bien là
    console.log('🔍 Vérification des données...');
    const { data: checkData, error: checkError } = await supabase
      .from('contents')
      .select('*')
      .limit(5);

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError);
    } else {
      console.log('✅ Données vérifiées:', checkData?.length, 'enregistrements trouvés');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

createContentsTable(); 