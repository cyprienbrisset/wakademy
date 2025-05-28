// Script à exécuter dans la console du navigateur pour créer un utilisateur de test
// Allez sur http://localhost:3000/upload et ouvrez la console (F12)
// Puis copiez-collez ce script et appuyez sur Entrée

console.log('🧪 Création d\'un utilisateur de test pour Wakademy...');

// Créer un utilisateur de test
const testUser = {
  id: "test-user-" + Date.now(),
  email: "test@wakademy.com",
  firstName: "Utilisateur",
  lastName: "Test",
  name: "Utilisateur Test",
  isAuthenticated: true,
  role: "admin",
};

// Sauvegarder dans localStorage
localStorage.setItem("wakademy_admin", JSON.stringify(testUser));

console.log('✅ Utilisateur de test créé:', testUser);
console.log('🔄 Rechargement de la page...');

// Recharger la page pour appliquer les changements
window.location.reload(); 