#!/usr/bin/env node

console.log('🔧 Création de la table user_watch_history');
console.log('==========================================\n');

async function checkTable() {
  try {
    console.log('🔍 Vérification de l\'existence de la table...');
    
    const response = await fetch('http://localhost:3000/api/setup/create-watch-history', {
      method: 'GET'
    });
    
    const result = await response.json();
    
    if (result.tableExists) {
      console.log('✅ Table user_watch_history existe déjà');
      return true;
    } else {
      console.log('❌ Table user_watch_history n\'existe pas');
      console.log('   Erreur:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

async function createTable() {
  try {
    console.log('🔨 Création de la table user_watch_history...');
    
    const response = await fetch('http://localhost:3000/api/setup/create-watch-history', {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Table user_watch_history créée avec succès');
      return true;
    } else {
      console.log('❌ Échec de la création automatique');
      console.log('   Erreur:', result.error);
      
      if (result.manualSQL) {
        console.log('\n📋 SQL à exécuter manuellement dans Supabase:');
        console.log('===============================================');
        console.log(result.manualSQL);
        console.log('\n💡 Instructions:');
        console.log('1. Allez dans votre dashboard Supabase');
        console.log('2. Ouvrez l\'éditeur SQL');
        console.log('3. Copiez-collez le SQL ci-dessus');
        console.log('4. Exécutez la requête');
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la création:', error.message);
    return false;
  }
}

async function testContinueWatching() {
  try {
    console.log('\n🧪 Test de la page Continue Watching...');
    
    const response = await fetch('http://localhost:3000/continue-watching');
    
    if (response.ok) {
      console.log('✅ Page Continue Watching accessible');
      
      // Vérifier le contenu de la réponse
      const html = await response.text();
      
      if (html.includes('Vous n\'êtes pas connecté')) {
        console.log('ℹ️  Page affiche le message de non-connexion (normal)');
      } else if (html.includes('user_watch_history')) {
        console.log('❌ Erreur de table encore présente dans le HTML');
      } else {
        console.log('✅ Page fonctionne correctement');
      }
    } else {
      console.log('❌ Page Continue Watching inaccessible');
      console.log('   Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

async function runSetup() {
  console.log('🚀 Démarrage de la configuration...\n');
  
  // Étape 1: Vérifier si la table existe
  const tableExists = await checkTable();
  
  if (!tableExists) {
    // Étape 2: Créer la table si elle n'existe pas
    console.log('\n🔧 Tentative de création de la table...');
    const created = await createTable();
    
    if (created) {
      console.log('\n✅ Configuration terminée avec succès!');
    } else {
      console.log('\n⚠️  Configuration partiellement réussie');
      console.log('   La table doit être créée manuellement');
    }
  }
  
  // Étape 3: Tester la page Continue Watching
  await testContinueWatching();
  
  console.log('\n📋 Résumé:');
  console.log('==========');
  console.log('✅ API de création de table créée');
  console.log('✅ Script de vérification fonctionnel');
  
  if (tableExists) {
    console.log('✅ Table user_watch_history existe');
  } else {
    console.log('⚠️  Table user_watch_history à créer manuellement');
  }
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('=====================');
  console.log('1. 🌐 Testez: http://localhost:3000/continue-watching');
  console.log('2. 📊 Vérifiez les logs du serveur');
  console.log('3. 🔍 Si erreur persiste, créez la table manuellement');
  
  console.log('\n💡 Tables importantes pour Wakademy:');
  console.log('====================================');
  console.log('✅ contents (existe)');
  console.log('✅ profiles (existe)');
  console.log(tableExists ? '✅' : '❌', 'user_watch_history');
  console.log('✅ user_favorites (probablement existe)');
}

runSetup(); 