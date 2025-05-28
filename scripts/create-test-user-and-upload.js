#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Script de création d\'utilisateur de test et upload');
console.log('=====================================\n');

// Créer un fichier de test
const testFileName = 'temp-test-interface.txt';
const testContent = `Test d'upload via interface utilisateur
Créé le: ${new Date().toISOString()}
Utilisateur: Test Interface
Description: Test de l'upload après authentification`;

fs.writeFileSync(testFileName, testContent);
console.log(`✅ Fichier de test créé: ${testFileName}`);

console.log('\n📋 Instructions pour résoudre le problème d\'upload:');
console.log('==================================================');

console.log('\n1. 🌐 Ouvrez votre navigateur et allez sur:');
console.log('   http://localhost:3000/upload');

console.log('\n2. 🔍 Vous devriez voir une alerte jaune avec:');
console.log('   "Mode développement - Vous n\'êtes pas connecté"');

console.log('\n3. 🖱️  Cliquez sur le bouton:');
console.log('   "Créer un utilisateur de test"');

console.log('\n4. 🔄 La page se rechargera automatiquement');

console.log('\n5. ✅ Après le rechargement:');
console.log('   - L\'alerte rouge "Authentification requise" disparaîtra');
console.log('   - Les boutons d\'upload seront activés');
console.log('   - Vous pourrez uploader des fichiers');

console.log('\n6. 📁 Testez l\'upload avec le fichier:');
console.log(`   ${path.resolve(testFileName)}`);

console.log('\n🔧 Alternative - Script pour console navigateur:');
console.log('===============================================');
console.log('Si vous préférez, ouvrez la console du navigateur (F12) et exécutez:');
console.log('');
console.log('// Créer un utilisateur de test');
console.log('const testUser = {');
console.log('  id: "test-user-" + Date.now(),');
console.log('  email: "test@example.com",');
console.log('  name: "Utilisateur Test",');
console.log('  isAuthenticated: true,');
console.log('  role: "admin"');
console.log('};');
console.log('localStorage.setItem("wakademy_admin", JSON.stringify(testUser));');
console.log('window.location.reload();');

console.log('\n🎯 Résultat attendu:');
console.log('===================');
console.log('- Boutons d\'upload activés');
console.log('- Upload fonctionnel');
console.log('- Redirection vers la page de contenu après upload');

console.log('\n💡 Pourquoi cela ne fonctionnait pas:');
console.log('====================================');
console.log('- L\'API d\'upload fonctionne parfaitement (✅ testé)');
console.log('- Le problème était l\'authentification côté interface');
console.log('- Les boutons étaient désactivés car isUserAuthenticated = false');
console.log('- Il fallait créer un utilisateur de test dans localStorage');

// Nettoyer le fichier de test
setTimeout(() => {
  try {
    fs.unlinkSync(testFileName);
    console.log(`\n🧹 Fichier de test supprimé: ${testFileName}`);
  } catch (error) {
    console.log(`\n⚠️  Impossible de supprimer ${testFileName}: ${error.message}`);
  }
}, 1000); 