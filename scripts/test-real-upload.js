const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRealUpload() {
  console.log('🧪 Test réel de l\'API d\'upload...');
  
  try {
    // 1. Créer un utilisateur de test
    console.log('👤 Création d\'un utilisateur de test...');
    const testUser = {
      id: "test-user-" + Date.now(),
      email: "test@wakademy.com",
      name: "Utilisateur Test",
      firstName: "Utilisateur",
      lastName: "Test",
      isAuthenticated: true,
      role: "admin",
    };
    console.log('✅ Utilisateur de test créé:', testUser.id);

    // 2. Créer un fichier de test
    console.log('📄 Création d\'un fichier de test...');
    const testContent = `# Test d'Upload Wakademy

Ce fichier teste l'upload réel dans Wakademy.

Date: ${new Date().toISOString()}
Utilisateur: ${testUser.name}

## Contenu de test

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Section 1
Ut enim ad minim veniam, quis nostrud exercitation.

### Section 2  
Duis aute irure dolor in reprehenderit in voluptate.

Fin du document de test.
`;

    const testFileName = `test-upload-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    
    // Écrire le fichier de test
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log('✅ Fichier créé:', testFileName);

    // 3. Préparer les métadonnées
    const metadata = {
      title: "Test d'Upload Réel",
      description: "Document de test pour valider l'API d'upload",
      type: "document",
      author: testUser.name,
      language: "fr",
      category: "Test",
      tags: ["test", "api", "upload"]
    };

    const aiOptions = {
      generateSummary: true,
      createTranscription: false,
      enableAiCategorization: false,
      extractAudio: false,
      createThumbnail: true,
    };

    // 4. Créer le FormData
    console.log('📤 Préparation de la requête...');
    const formData = new FormData();
    
    // Ajouter le fichier
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: testFileName,
      contentType: 'text/plain'
    });
    
    // Ajouter les métadonnées
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('aiOptions', JSON.stringify(aiOptions));
    formData.append('userData', JSON.stringify(testUser));
    formData.append('status', 'draft');

    // 5. Envoyer la requête à l'API
    console.log('🚀 Envoi de la requête à l\'API...');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
      }
    });

    console.log('📊 Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Réponse de l\'API:', result);

    // 6. Vérifier le résultat
    if (result.success) {
      console.log('🎉 Upload réussi !');
      console.log('📋 ID du contenu:', result.contentId);
      
      if (result.aiJobs && result.aiJobs.length > 0) {
        console.log('🤖 Tâches IA créées:', result.aiJobs.length);
      }
    } else {
      console.error('❌ Échec de l\'upload:', result.error);
    }

    // 7. Nettoyer le fichier de test
    console.log('🗑️ Nettoyage...');
    fs.unlinkSync(testFilePath);
    console.log('✅ Fichier de test supprimé');

    console.log('');
    console.log('🎉 Test de l\'API d\'upload terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    // Nettoyer en cas d'erreur
    const testFiles = fs.readdirSync(__dirname).filter(file => file.startsWith('test-upload-'));
    testFiles.forEach(file => {
      try {
        fs.unlinkSync(path.join(__dirname, file));
        console.log('🗑️ Fichier nettoyé:', file);
      } catch (e) {
        // Ignorer les erreurs de nettoyage
      }
    });
  }
}

testRealUpload(); 