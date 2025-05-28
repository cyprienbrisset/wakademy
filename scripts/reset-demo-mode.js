const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

// Titres des contenus de démo à conserver
const DEMO_CONTENT_TITLES = [
  'Méditation Sons de la Nature',
  'Conférence Leadership Moderne',
  'Guide Complet de Productivité',
  'Podcast Innovation Tech',
  'Formation Techniques de Vente',
  'Webinar Communication Efficace'
];

async function resetDemoMode() {
  console.log('🎬 Reset du mode démo - Conservation des contenus de démo uniquement...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Récupérer tous les contenus
    console.log('\n📋 Récupération de tous les contenus...');
    const { data: allContents, error: fetchError } = await supabase
      .from('contents')
      .select('id, title, type');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des contenus:', fetchError);
      return;
    }

    console.log(`📊 ${allContents.length} contenus trouvés au total`);

    // 2. Identifier les contenus à supprimer (tout sauf les contenus de démo)
    const contentsToDelete = allContents.filter(content => 
      !DEMO_CONTENT_TITLES.includes(content.title.replace('⭐ ', ''))
    );

    const contentsToKeep = allContents.filter(content => 
      DEMO_CONTENT_TITLES.includes(content.title.replace('⭐ ', ''))
    );

    console.log(`🗑️ ${contentsToDelete.length} contenus à supprimer`);
    console.log(`✅ ${contentsToKeep.length} contenus de démo à conserver`);

    if (contentsToDelete.length === 0) {
      console.log('\n🎉 Aucun contenu à supprimer - Mode démo déjà actif !');
      console.log('\n📋 Contenus de démo présents:');
      contentsToKeep.forEach((content, index) => {
        console.log(`  ${index + 1}. ${content.title} (${content.type})`);
      });
      return;
    }

    // 3. Afficher les contenus qui vont être supprimés
    console.log('\n🗑️ Contenus qui vont être supprimés:');
    contentsToDelete.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.title} (${content.type})`);
    });

    // 4. Supprimer les tâches IA associées aux contenus à supprimer
    console.log('\n🤖 Suppression des tâches IA associées...');
    const contentIdsToDelete = contentsToDelete.map(c => c.id);
    
    if (contentIdsToDelete.length > 0) {
      const { error: aiTasksError } = await supabase
        .from('ai_tasks')
        .delete()
        .in('content_id', contentIdsToDelete);

      if (aiTasksError) {
        console.error('⚠️ Erreur lors de la suppression des tâches IA:', aiTasksError);
      } else {
        console.log('✅ Tâches IA supprimées');
      }
    }

    // 5. Supprimer les contenus de la base de données
    console.log('\n💾 Suppression des contenus de la base de données...');
    const { error: deleteError } = await supabase
      .from('contents')
      .delete()
      .in('id', contentIdsToDelete);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression des contenus:', deleteError);
      return;
    }

    console.log(`✅ ${contentsToDelete.length} contenus supprimés de la base de données`);

    // 6. Nettoyer le stockage Supabase (garder seulement le dossier demos/)
    console.log('\n🗂️ Nettoyage du stockage Supabase...');
    
    // Lister tous les fichiers du bucket
    const { data: files, error: listError } = await supabase.storage
      .from('content')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('⚠️ Erreur lors de la liste des fichiers:', listError);
    } else {
      // Supprimer les dossiers uploads/ et premium/
      const foldersToDelete = files.filter(file => 
        file.name === 'uploads' || file.name === 'premium'
      );

      for (const folder of foldersToDelete) {
        console.log(`🗑️ Suppression du dossier ${folder.name}/...`);
        
        // Lister les fichiers dans le dossier
        const { data: folderFiles, error: folderListError } = await supabase.storage
          .from('content')
          .list(folder.name, { limit: 1000 });

        if (!folderListError && folderFiles) {
          // Supprimer tous les fichiers du dossier
          const filesToDelete = folderFiles.map(file => `${folder.name}/${file.name}`);
          
          if (filesToDelete.length > 0) {
            const { error: deleteFilesError } = await supabase.storage
              .from('content')
              .remove(filesToDelete);

            if (deleteFilesError) {
              console.error(`⚠️ Erreur suppression fichiers ${folder.name}/:`, deleteFilesError);
            } else {
              console.log(`✅ ${filesToDelete.length} fichiers supprimés de ${folder.name}/`);
            }
          }
        }
      }

      console.log('✅ Nettoyage du stockage terminé');
    }

    // 7. Afficher le résumé final
    console.log('\n🎉 Reset du mode démo terminé !');
    console.log('\n📊 Résumé:');
    console.log(`  🗑️ ${contentsToDelete.length} contenus supprimés`);
    console.log(`  ✅ ${contentsToKeep.length} contenus de démo conservés`);
    console.log('  📁 Dossier demos/ conservé dans le stockage');
    console.log('  🗑️ Dossiers uploads/ et premium/ supprimés');

    console.log('\n📋 Contenus de démo disponibles:');
    contentsToKeep.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.title} (${content.type})`);
    });

    console.log('\n💡 Mode démo activé ! Seuls les contenus de démo réalistes sont disponibles.');
    console.log('💡 Pour ajouter plus de contenus de démo: node scripts/add-real-demo-data.js');
    console.log('💡 Pour ajouter du contenu premium: node scripts/add-premium-demo-data.js');

  } catch (error) {
    console.error('❌ Erreur lors du reset du mode démo:', error);
  }
}

// Exécuter le script
resetDemoMode(); 