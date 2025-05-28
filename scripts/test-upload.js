const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function testUpload() {
  console.log('🧪 Test d\'upload de fichier...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Créer un fichier de test simple
    const testContent = 'Ceci est un fichier de test pour Wakademy';
    const testFileName = 'test-upload.txt';
    const testFilePath = `test/${Date.now()}-${testFileName}`;

    console.log('📄 Création d\'un fichier de test...');
    
    // Convertir le contenu en Blob pour simuler un fichier
    const testFile = new Blob([testContent], { type: 'text/plain' });

    // Tester l'upload
    console.log('📤 Test d\'upload vers le bucket content...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('content')
      .upload(testFilePath, testFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Erreur d\'upload:', uploadError);
      return;
    }

    console.log('✅ Upload réussi !');
    console.log('📊 Données d\'upload:', uploadData);

    // Tester la génération d'URL publique
    console.log('🔗 Test de génération d\'URL publique...');
    const { data: publicUrlData } = supabase.storage
      .from('content')
      .getPublicUrl(testFilePath);

    console.log('✅ URL publique générée:', publicUrlData.publicUrl);

    // Tester la génération d'URL signée
    console.log('🔐 Test de génération d\'URL signée...');
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('content')
      .createSignedUrl(testFilePath, 3600);

    if (signedUrlError) {
      console.error('❌ Erreur URL signée:', signedUrlError);
    } else {
      console.log('✅ URL signée générée:', signedUrlData.signedUrl);
    }

    // Nettoyer le fichier de test
    console.log('🗑️ Nettoyage du fichier de test...');
    const { error: deleteError } = await supabase.storage
      .from('content')
      .remove([testFilePath]);

    if (deleteError) {
      console.warn('⚠️ Erreur lors du nettoyage:', deleteError);
    } else {
      console.log('✅ Fichier de test supprimé');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

testUpload(); 