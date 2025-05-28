const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function purgeContents() {
  console.log('🗑️ Purge des contenus Wakademy...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Récupérer tous les contenus pour obtenir les chemins des fichiers
    console.log('📋 Récupération de la liste des contenus...');
    const { data: contents, error: fetchError } = await supabase
      .from('contents')
      .select('id, title, type, author, created_at');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des contenus:', fetchError);
      return;
    }

    if (!contents || contents.length === 0) {
      console.log('ℹ️ Aucun contenu à supprimer.');
      return;
    }

    console.log(`📊 ${contents.length} contenus trouvés:`);
    contents.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.title} (${content.type}) - ${content.author}`);
    });

    // 2. Demander confirmation (simulation)
    console.log('\n⚠️ ATTENTION: Cette opération va supprimer TOUS les contenus !');
    console.log('   - Suppression des enregistrements en base de données');
    console.log('   - Suppression des fichiers du stockage');
    console.log('   - Suppression des tâches IA associées');
    
    // En mode automatique pour les scripts, on continue
    console.log('\n🔄 Démarrage de la purge...');

    let deletedContents = 0;
    let deletedFiles = 0;
    let errors = 0;

    // 3. Supprimer chaque contenu
    for (const content of contents) {
      console.log(`\n🗑️ Suppression de "${content.title}"...`);
      
      try {
        // 3.1. Supprimer les tâches IA associées
        console.log('  🤖 Suppression des tâches IA...');
        const { error: aiJobsError } = await supabase
          .from('content_ai_jobs')
          .delete()
          .eq('content_id', content.id);

        if (aiJobsError) {
          console.warn(`  ⚠️ Erreur suppression tâches IA: ${aiJobsError.message}`);
        }

        // 3.2. Supprimer l'enregistrement de la base de données
        console.log('  💾 Suppression de l\'enregistrement...');
        const { error: deleteError } = await supabase
          .from('contents')
          .delete()
          .eq('id', content.id);

        if (deleteError) {
          console.error(`  ❌ Erreur suppression DB: ${deleteError.message}`);
          errors++;
          continue;
        }

        deletedContents++;
        console.log(`  ✅ Contenu supprimé de la base de données`);

      } catch (error) {
        console.error(`  ❌ Erreur lors de la suppression de "${content.title}":`, error);
        errors++;
      }
    }

    // 4. Nettoyer le stockage (supprimer tous les fichiers du bucket content)
    console.log('\n🗂️ Nettoyage du stockage...');
    try {
      // Lister tous les fichiers dans le bucket
      const { data: files, error: listError } = await supabase.storage
        .from('content')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.error('❌ Erreur lors de la liste des fichiers:', listError);
      } else if (files && files.length > 0) {
        console.log(`📁 ${files.length} fichiers trouvés dans le stockage`);
        
        // Supprimer tous les fichiers
        const filePaths = files.map(file => file.name);
        const { error: removeError } = await supabase.storage
          .from('content')
          .remove(filePaths);

        if (removeError) {
          console.error('❌ Erreur lors de la suppression des fichiers:', removeError);
        } else {
          deletedFiles = files.length;
          console.log(`✅ ${deletedFiles} fichiers supprimés du stockage`);
        }
      } else {
        console.log('ℹ️ Aucun fichier trouvé dans le stockage');
      }

      // Nettoyer aussi les dossiers uploads
      const { data: uploadFolders, error: uploadListError } = await supabase.storage
        .from('content')
        .list('uploads', {
          limit: 1000
        });

      if (!uploadListError && uploadFolders && uploadFolders.length > 0) {
        for (const folder of uploadFolders) {
          const { data: folderFiles, error: folderListError } = await supabase.storage
            .from('content')
            .list(`uploads/${folder.name}`, {
              limit: 1000
            });

          if (!folderListError && folderFiles && folderFiles.length > 0) {
            const folderFilePaths = folderFiles.map(file => `uploads/${folder.name}/${file.name}`);
            const { error: folderRemoveError } = await supabase.storage
              .from('content')
              .remove(folderFilePaths);

            if (!folderRemoveError) {
              deletedFiles += folderFiles.length;
              console.log(`✅ ${folderFiles.length} fichiers supprimés du dossier uploads/${folder.name}`);
            }
          }
        }
      }

    } catch (storageError) {
      console.error('❌ Erreur lors du nettoyage du stockage:', storageError);
    }

    // 5. Résumé final
    console.log('\n🎉 Purge terminée !');
    console.log('\n📊 Résumé:');
    console.log(`  ✅ Contenus supprimés: ${deletedContents}`);
    console.log(`  ✅ Fichiers supprimés: ${deletedFiles}`);
    if (errors > 0) {
      console.log(`  ⚠️ Erreurs rencontrées: ${errors}`);
    }
    console.log('\n💡 La base de données et le stockage ont été nettoyés.');
    console.log('   Vous pouvez maintenant ajouter de nouveaux contenus de test.');

  } catch (error) {
    console.error('❌ Erreur fatale lors de la purge:', error);
  }
}

// Fonction pour purger seulement les contenus de test (plus sélectif)
async function purgeTestContents() {
  console.log('🧪 Purge des contenus de test uniquement...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Identifier les contenus de test par leurs titres ou auteurs
    const testPatterns = [
      'Test',
      'Formation Leadership - Audio',
      'Méditation et Relaxation',
      'Techniques de Vente Avancées',
      'Guide de Productivité',
      'Webinar Innovation Digitale',
      'Podcast Communication Efficace'
    ];

    console.log('📋 Recherche des contenus de test...');
    
    let testContents = [];
    for (const pattern of testPatterns) {
      const { data: contents, error } = await supabase
        .from('contents')
        .select('id, title, type, author')
        .ilike('title', `%${pattern}%`);

      if (!error && contents) {
        testContents = [...testContents, ...contents];
      }
    }

    // Supprimer les doublons
    testContents = testContents.filter((content, index, self) => 
      index === self.findIndex(c => c.id === content.id)
    );

    if (testContents.length === 0) {
      console.log('ℹ️ Aucun contenu de test trouvé.');
      return;
    }

    console.log(`📊 ${testContents.length} contenus de test trouvés:`);
    testContents.forEach((content, index) => {
      console.log(`  ${index + 1}. ${content.title} (${content.type})`);
    });

    // Supprimer les contenus de test
    for (const content of testContents) {
      console.log(`🗑️ Suppression de "${content.title}"...`);
      
      // Supprimer les tâches IA
      await supabase.from('content_ai_jobs').delete().eq('content_id', content.id);
      
      // Supprimer le contenu
      const { error } = await supabase.from('contents').delete().eq('id', content.id);
      
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
      } else {
        console.log(`✅ Supprimé`);
      }
    }

    console.log('\n🎉 Purge des contenus de test terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la purge des contenus de test:', error);
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
const mode = args[0];

if (mode === 'test-only') {
  console.log('🧪 Mode: Purge des contenus de test uniquement');
  purgeTestContents();
} else if (mode === 'all' || mode === undefined) {
  console.log('🗑️ Mode: Purge complète de tous les contenus');
  purgeContents();
} else {
  console.log('❓ Usage:');
  console.log('  node scripts/purge-contents.js          # Purge tous les contenus');
  console.log('  node scripts/purge-contents.js all      # Purge tous les contenus');
  console.log('  node scripts/purge-contents.js test-only # Purge seulement les contenus de test');
} 