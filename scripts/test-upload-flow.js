const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test du flow d\'upload complet...\n');

// Fonction pour créer un utilisateur de test
function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...');
  
  const testUser = {
    id: "test-user-" + Date.now(),
    email: "test@example.com",
    firstName: "Utilisateur",
    lastName: "Test",
    name: "Utilisateur Test",
    isAuthenticated: true,
    role: "admin",
  };

  console.log(`   ID: ${testUser.id}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Nom: ${testUser.name}`);
  console.log(`   Rôle: ${testUser.role}`);
  
  return testUser;
}

// Fonction pour tester l'API d'upload
async function testUploadAPI() {
  console.log('\n📤 Test de l\'API d\'upload...');
  
  try {
    // Créer un fichier de test temporaire
    const testContent = 'Ceci est un fichier de test pour l\'upload Wakademy';
    const testFilePath = path.join(__dirname, 'temp-test-file.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('   ✅ Fichier de test créé');
    
    // Créer les métadonnées
    const metadata = {
      title: "Test Upload Script",
      description: "Fichier de test uploadé via script automatisé",
      type: "document",
      author: "Script Test",
      language: "fr",
      category: "Test",
      tags: ["test", "script", "automation"]
    };
    
    const aiOptions = {
      generateSummary: true,
      createTranscription: false,
      enableAiCategorization: false,
      extractAudio: false,
      createThumbnail: false
    };
    
    const testUser = createTestUser();
    
    // Préparer la commande curl pour tester l'upload
    const curlCommand = `curl -X POST http://localhost:3000/api/upload \\
      -F "file=@${testFilePath}" \\
      -F "metadata=${JSON.stringify(metadata).replace(/"/g, '\\"')}" \\
      -F "aiOptions=${JSON.stringify(aiOptions).replace(/"/g, '\\"')}" \\
      -F "userData=${JSON.stringify(testUser).replace(/"/g, '\\"')}" \\
      -F "status=processing"`;
    
    console.log('   🚀 Envoi de la requête d\'upload...');
    
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
    
    console.log('   📥 Réponse reçue:');
    console.log('   ' + result.substring(0, 200) + (result.length > 200 ? '...' : ''));
    
    // Nettoyer le fichier temporaire
    fs.unlinkSync(testFilePath);
    console.log('   🧹 Fichier temporaire supprimé');
    
    // Analyser la réponse
    try {
      const response = JSON.parse(result);
      if (response.success) {
        console.log('   ✅ Upload réussi !');
        console.log(`   📄 ID du contenu: ${response.contentId}`);
        return response.contentId;
      } else {
        console.log('   ❌ Échec de l\'upload');
        console.log(`   🔍 Erreur: ${response.error}`);
        return null;
      }
    } catch (parseError) {
      console.log('   ⚠️ Réponse non-JSON reçue');
      if (result.includes('success')) {
        console.log('   ✅ Upload probablement réussi (réponse HTML)');
      } else {
        console.log('   ❌ Erreur probable');
      }
      return null;
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur lors du test: ${error.message}`);
    
    // Nettoyer en cas d'erreur
    const testFilePath = path.join(__dirname, 'temp-test-file.txt');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('   🧹 Fichier temporaire supprimé après erreur');
    }
    
    return null;
  }
}

// Fonction pour vérifier que le contenu apparaît dans l'API trending
async function verifyContentInTrending(contentId) {
  if (!contentId) return false;
  
  console.log('\n🔍 Vérification dans l\'API trending...');
  
  try {
    const result = execSync('curl -s "http://localhost:3000/api/trending"', { encoding: 'utf8', timeout: 10000 });
    
    if (result.includes(contentId)) {
      console.log('   ✅ Contenu trouvé dans l\'API trending');
      return true;
    } else {
      console.log('   ⚠️ Contenu pas encore visible dans trending (peut prendre quelques secondes)');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erreur lors de la vérification: ${error.message}`);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🎯 Objectif: Tester le flow complet d\'upload');
  console.log('📋 Étapes:');
  console.log('   1. Créer un utilisateur de test');
  console.log('   2. Tester l\'API d\'upload avec un fichier');
  console.log('   3. Vérifier que le contenu apparaît dans trending');
  console.log('');
  
  // Test de l'API d'upload
  const contentId = await testUploadAPI();
  
  // Vérification dans trending
  if (contentId) {
    await verifyContentInTrending(contentId);
  }
  
  console.log('\n📊 Résumé du test:');
  if (contentId) {
    console.log('✅ Upload fonctionnel');
    console.log('✅ API d\'upload opérationnelle');
    console.log('✅ Utilisateur de test créé avec succès');
    console.log('');
    console.log('💡 Pour utiliser l\'interface web:');
    console.log('   1. Allez sur http://localhost:3000/upload');
    console.log('   2. Cliquez sur "Créer un utilisateur de test"');
    console.log('   3. Sélectionnez un fichier et remplissez les métadonnées');
    console.log('   4. Cliquez sur "Enregistrer et lancer les traitements"');
  } else {
    console.log('❌ Problème détecté avec l\'upload');
    console.log('');
    console.log('🔧 Solutions possibles:');
    console.log('   1. Vérifier que le serveur Next.js fonctionne sur le port 3000');
    console.log('   2. Vérifier la configuration Supabase');
    console.log('   3. Vérifier que le bucket "content" existe');
    console.log('   4. Consulter les logs du serveur pour plus de détails');
  }
}

// Exécuter le test
main().catch(console.error); 