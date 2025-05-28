#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Script d\'authentification automatique et test d\'upload');
console.log('========================================================\n');

// Créer un fichier de test
const testFileName = 'temp-auto-test.txt';
const testContent = `Test d'upload automatique après authentification
Créé le: ${new Date().toISOString()}
Utilisateur: Auto Test
Description: Test automatisé de l'upload avec authentification`;

fs.writeFileSync(testFileName, testContent);
console.log(`✅ Fichier de test créé: ${testFileName}`);

// Script pour authentifier automatiquement dans le navigateur
const authScript = `
// Script d'authentification automatique pour Wakademy
console.log('🔐 Authentification automatique en cours...');

// Créer un utilisateur de test
const testUser = {
  id: "test-user-" + Date.now(),
  email: "test@example.com", 
  name: "Utilisateur Test Auto",
  firstName: "Utilisateur",
  lastName: "Test",
  isAuthenticated: true,
  role: "admin"
};

// Sauvegarder dans localStorage
localStorage.setItem("wakademy_admin", JSON.stringify(testUser));

console.log('✅ Utilisateur de test créé:', testUser);
console.log('🔄 Rechargement de la page...');

// Recharger la page
window.location.reload();
`;

// Sauvegarder le script dans un fichier
fs.writeFileSync('scripts/browser-auth-script.js', authScript);

console.log('\n📋 Instructions automatisées:');
console.log('=============================');

console.log('\n1. 🌐 Allez sur: http://localhost:3000/upload');

console.log('\n2. 🔧 Ouvrez la console du navigateur (F12)');

console.log('\n3. 📋 Copiez et collez ce script:');
console.log('```javascript');
console.log(authScript.trim());
console.log('```');

console.log('\n4. ⏎ Appuyez sur Entrée pour exécuter');

console.log('\n5. ✅ La page se rechargera et vous serez authentifié');

console.log('\n6. 🎯 Testez l\'upload avec le fichier créé');

console.log('\n📁 Fichiers créés:');
console.log(`- Fichier de test: ${path.resolve(testFileName)}`);
console.log(`- Script d'auth: ${path.resolve('scripts/browser-auth-script.js')}`);

console.log('\n🎯 Résumé du problème et solution:');
console.log('=================================');
console.log('❌ PROBLÈME: Les boutons d\'upload sont désactivés');
console.log('🔍 CAUSE: Utilisateur non authentifié (isUserAuthenticated = false)');
console.log('✅ SOLUTION: Créer un utilisateur de test dans localStorage');
console.log('🚀 RÉSULTAT: Boutons activés et upload fonctionnel');

console.log('\n💡 Explication technique:');
console.log('========================');
console.log('- L\'API d\'upload fonctionne parfaitement (testé précédemment)');
console.log('- Le composant ContentUploadForm vérifie isAuthenticated()');
console.log('- Cette fonction lit localStorage["wakademy_admin"]');
console.log('- Sans utilisateur authentifié, les boutons sont disabled');
console.log('- Le script ci-dessus crée un utilisateur de test valide');

console.log('\n🔧 Alternative manuelle:');
console.log('=======================');
console.log('Sur la page /upload, cliquez sur le bouton jaune:');
console.log('"Créer un utilisateur de test"');

// Nettoyer après 10 secondes
setTimeout(() => {
  try {
    fs.unlinkSync(testFileName);
    console.log(`\n🧹 Fichier de test supprimé: ${testFileName}`);
  } catch (error) {
    console.log(`\n⚠️  Impossible de supprimer ${testFileName}`);
  }
}, 10000); 