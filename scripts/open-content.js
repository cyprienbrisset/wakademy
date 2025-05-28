// Script pour ouvrir rapidement une page de contenu
const { exec } = require('child_process')

const contentId = process.argv[2] || '8d47620c-ca28-41e0-8003-69f8484b7151'
const url = `http://localhost:3000/content/${contentId}`

console.log(`🌐 Ouverture de: ${url}`)
console.log(`📝 ID du contenu: ${contentId}`)

// Ouvrir dans le navigateur par défaut
exec(`open "${url}"`, (error) => {
  if (error) {
    console.error('❌ Erreur lors de l\'ouverture:', error.message)
    console.log('💡 Copiez cette URL dans votre navigateur:')
    console.log(url)
  } else {
    console.log('✅ Page ouverte dans le navigateur')
  }
}) 