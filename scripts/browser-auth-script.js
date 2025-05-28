
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
