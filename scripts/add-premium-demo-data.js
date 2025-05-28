const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

// Fichiers de démo premium avec URLs fiables
const premiumDemoFiles = [
  {
    name: 'relaxation-ocean.mp3',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    type: 'audio/mpeg',
    metadata: {
      title: 'Relaxation Sons de l\'Océan',
      description: 'Séance de relaxation profonde avec sons naturels de l\'océan pour réduire le stress',
      type: 'podcast',
      author: 'Institut de Relaxation Marine',
      language: 'fr',
      category: 'Bien-être',
      duration: 1800, // 30 minutes
      tags: ['relaxation', 'océan', 'stress', 'nature']
    }
  },
  {
    name: 'leadership-masterclass.mp4',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Masterclass Leadership Transformationnel',
      description: 'Formation avancée sur le leadership transformationnel et l\'inspiration d\'équipes',
      type: 'video',
      author: 'Prof. Alexandre Dubois',
      language: 'fr',
      category: 'Leadership',
      duration: 4500, // 75 minutes
      tags: ['leadership', 'transformation', 'équipe', 'inspiration']
    }
  },
  {
    name: 'manuel-gestion-temps.pdf',
    url: 'https://www.africau.edu/images/default/sample.pdf',
    type: 'application/pdf',
    metadata: {
      title: 'Manuel Avancé de Gestion du Temps',
      description: 'Guide complet avec 75 techniques avancées de gestion du temps et de productivité',
      type: 'document',
      author: 'Centre d\'Excellence en Productivité',
      language: 'fr',
      category: 'Productivité',
      duration: 0,
      tags: ['temps', 'gestion', 'productivité', 'organisation']
    }
  },
  {
    name: 'podcast-entrepreneuriat.mp3',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    type: 'audio/mpeg',
    metadata: {
      title: 'Podcast Entrepreneuriat Digital',
      description: 'Interview d\'entrepreneurs à succès sur leurs stratégies et échecs',
      type: 'podcast',
      author: 'Startup Stories',
      language: 'fr',
      category: 'Entrepreneuriat',
      duration: 3300, // 55 minutes
      tags: ['entrepreneuriat', 'startup', 'business', 'stratégie']
    }
  },
  {
    name: 'formation-negociation.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Formation Négociation Avancée',
      description: 'Techniques professionnelles de négociation pour les situations complexes',
      type: 'video',
      author: 'École Supérieure de Négociation',
      language: 'fr',
      category: 'Négociation',
      duration: 5400, // 90 minutes
      tags: ['négociation', 'persuasion', 'communication', 'stratégie']
    }
  },
  {
    name: 'conference-intelligence-emotionnelle.mp4',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Conférence Intelligence Émotionnelle',
      description: 'Développer son intelligence émotionnelle pour un leadership authentique',
      type: 'video',
      author: 'Dr. Émilie Rousseau',
      language: 'fr',
      category: 'Développement Personnel',
      duration: 3900, // 65 minutes
      tags: ['intelligence', 'émotionnel', 'leadership', 'authenticité']
    }
  },
  {
    name: 'guide-marketing-digital.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'application/pdf',
    metadata: {
      title: 'Guide Marketing Digital 2024',
      description: 'Stratégies complètes de marketing digital avec cas d\'études récents',
      type: 'document',
      author: 'Agence Marketing Pro',
      language: 'fr',
      category: 'Marketing',
      duration: 0,
      tags: ['marketing', 'digital', 'stratégie', 'réseaux sociaux']
    }
  },
  {
    name: 'podcast-innovation-ia.mp3',
    url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
    type: 'audio/mpeg',
    metadata: {
      title: 'Podcast Innovation et IA',
      description: 'Discussion sur l\'impact de l\'intelligence artificielle sur l\'innovation',
      type: 'podcast',
      author: 'AI Innovation Lab',
      language: 'fr',
      category: 'Innovation',
      duration: 2700, // 45 minutes
      tags: ['IA', 'intelligence artificielle', 'innovation', 'technologie']
    }
  }
];

// Fonction pour télécharger un fichier avec retry
async function downloadFileWithRetry(url, destination, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await downloadFile(url, destination);
      return true;
    } catch (error) {
      console.log(`  ⚠️ Tentative ${attempt}/${maxRetries} échouée: ${error.message}`);
      if (attempt === maxRetries) {
        return false;
      }
      // Attendre 1 seconde avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Fonction pour télécharger un fichier
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const file = fs.createWriteStream(destination);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Redirection
        file.close();
        fs.unlinkSync(destination);
        downloadFile(response.headers.location, destination).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(destination);
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
      }
      reject(err);
    });

    // Timeout après 30 secondes
    request.setTimeout(30000, () => {
      request.abort();
      file.close();
      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
      }
      reject(new Error('Timeout de téléchargement'));
    });
  });
}

// Fonction pour créer un fichier de démo premium
function createPremiumDemoFile(filePath, type, metadata) {
  let content = '';
  
  if (type.startsWith('audio/')) {
    content = generatePremiumAudioContent(metadata);
  } else if (type.startsWith('video/')) {
    content = generatePremiumVideoContent(metadata);
  } else if (type === 'application/pdf') {
    content = generatePremiumPDFContent(metadata);
  } else {
    content = generatePremiumGenericContent(metadata);
  }
  
  fs.writeFileSync(filePath, content);
}

function generatePremiumAudioContent(metadata) {
  return `# 🎧 ${metadata.title}

## Description
${metadata.description}

## Informations
- **Auteur**: ${metadata.author}
- **Durée**: ${Math.floor(metadata.duration / 60)} minutes
- **Catégorie**: ${metadata.category}
- **Langue**: ${metadata.language}
- **Tags**: ${metadata.tags.join(', ')}

## 📝 Transcript Premium

### Introduction (0:00 - 2:00)
Bonjour et bienvenue dans cette session premium "${metadata.title}".

Je suis ${metadata.author}, et aujourd'hui nous allons explorer en profondeur ${metadata.category.toLowerCase()}.

### Développement Principal (2:00 - ${Math.floor(metadata.duration * 0.8 / 60)}:00)

#### Points clés abordés:
${metadata.tags.map((tag, i) => `${i + 1}. **${tag.charAt(0).toUpperCase() + tag.slice(1)}**
   - Concepts fondamentaux
   - Applications pratiques
   - Études de cas
   - Exercices recommandés`).join('\n\n')}

### Cas d'études concrets (${Math.floor(metadata.duration * 0.8 / 60)}:00 - ${Math.floor(metadata.duration * 0.95 / 60)}:00)
- Exemple 1: Mise en pratique en entreprise
- Exemple 2: Résultats mesurables
- Exemple 3: Retour d'expérience client

### Conclusion et Actions (${Math.floor(metadata.duration * 0.95 / 60)}:00 - ${Math.floor(metadata.duration / 60)}:00)
- Résumé des points essentiels
- Plan d'action personnalisé
- Ressources complémentaires
- Prochaines étapes

---
**Contenu Premium Wakademy** | Généré le ${new Date().toISOString()}
© ${metadata.author} - Tous droits réservés
`;
}

function generatePremiumVideoContent(metadata) {
  return `# 🎬 ${metadata.title}

## Synopsis
${metadata.description}

## Informations Techniques
- **Format**: MP4 HD
- **Durée**: ${Math.floor(metadata.duration / 60)} minutes
- **Réalisateur/Formateur**: ${metadata.author}
- **Catégorie**: ${metadata.category}
- **Langue**: ${metadata.language}

## 🎯 Objectifs Pédagogiques
${metadata.tags.map(tag => `- Maîtriser ${tag}`).join('\n')}

## 📋 Plan de Formation

### 🎬 SÉQUENCE 1: Introduction (0:00 - 5:00)
- Présentation du formateur
- Objectifs de la session
- Plan détaillé
- Prérequis et attentes

### 🎬 SÉQUENCE 2: Fondamentaux (5:00 - ${Math.floor(metadata.duration / 4)}:00)
${metadata.tags.slice(0, 2).map(tag => `- Module ${tag.charAt(0).toUpperCase() + tag.slice(1)}
  * Théorie et concepts
  * Démonstrations pratiques
  * Quiz interactifs`).join('\n')}

### 🎬 SÉQUENCE 3: Applications Avancées (${Math.floor(metadata.duration / 4)}:00 - ${Math.floor(metadata.duration * 0.7)}:00)
${metadata.tags.slice(2).map(tag => `- Atelier ${tag.charAt(0).toUpperCase() + tag.slice(1)}
  * Exercices guidés
  * Études de cas réels
  * Bonnes pratiques`).join('\n')}

### 🎬 SÉQUENCE 4: Mise en Pratique (${Math.floor(metadata.duration * 0.7)}:00 - ${Math.floor(metadata.duration * 0.9)}:00)
- Simulation d'environnement réel
- Résolution de problèmes complexes
- Feedback personnalisé
- Certification des acquis

### 🎬 SÉQUENCE 5: Conclusion (${Math.floor(metadata.duration * 0.9)}:00 - ${Math.floor(metadata.duration / 60)}:00)
- Synthèse des apprentissages
- Plan d'action personnalisé
- Ressources pour aller plus loin
- Évaluation de la formation

## 🏆 Certification
Cette formation donne droit à une certification "${metadata.category} - Niveau Avancé"

---
**Production Premium Wakademy** | Créé le ${new Date().toISOString()}
© ${metadata.author} - Formation Professionnelle Certifiante
`;
}

function generatePremiumPDFContent(metadata) {
  return `# 📚 ${metadata.title}

${metadata.description}

---

## 📋 Table des Matières Détaillée

### PARTIE I: FONDAMENTAUX
1. Introduction à ${metadata.category}
2. Concepts Clés et Définitions
3. Historique et Évolution
4. État de l'Art Actuel

### PARTIE II: MÉTHODOLOGIES
5. Approches Traditionnelles
6. Méthodes Innovantes
7. Frameworks Reconnus
8. Outils et Technologies

### PARTIE III: APPLICATIONS PRATIQUES
9. Cas d'Usage en Entreprise
10. Études de Cas Sectorielles
11. Retours d'Expérience
12. Bonnes Pratiques

### PARTIE IV: MISE EN ŒUVRE
13. Plan de Déploiement
14. Gestion du Changement
15. Mesure de Performance
16. Optimisation Continue

### PARTIE V: PERSPECTIVES
17. Tendances Futures
18. Innovations Émergentes
19. Défis et Opportunités
20. Conclusion et Recommandations

---

## 🎯 Chapitre 1: Introduction

Bienvenue dans ce guide premium sur **${metadata.category}**.

**Auteur**: ${metadata.author}
**Expertise**: ${metadata.tags.join(', ')}
**Public cible**: Professionnels, Managers, Consultants

### Objectifs de ce Manuel

${metadata.tags.map((tag, i) => `${i + 1}. **${tag.charAt(0).toUpperCase() + tag.slice(1)}**
   - Comprendre les enjeux
   - Maîtriser les techniques
   - Appliquer les méthodes
   - Mesurer les résultats`).join('\n\n')}

## 🔍 Chapitre 2: Concepts Fondamentaux

### Définitions Clés

${metadata.tags.map(tag => `**${tag.charAt(0).toUpperCase() + tag.slice(1)}**: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`).join('\n\n')}

### Principes Directeurs

1. **Excellence Opérationnelle**
   - Optimisation des processus
   - Amélioration continue
   - Mesure de performance

2. **Innovation Stratégique**
   - Anticipation des tendances
   - Développement de solutions
   - Transformation digitale

3. **Leadership Inspirant**
   - Vision partagée
   - Engagement des équipes
   - Culture de performance

## 📊 Chapitre 3: Méthodologies Avancées

### Framework ${metadata.category}

Cette approche structurée comprend:

- **Phase 1**: Diagnostic et Analyse
- **Phase 2**: Conception et Planification
- **Phase 3**: Implémentation et Déploiement
- **Phase 4**: Évaluation et Optimisation

### Outils Recommandés

${metadata.tags.map(tag => `- **Outil ${tag}**: Description et utilisation pratique`).join('\n')}

## 🏆 Chapitre 4: Cas d'Études

### Étude de Cas 1: Transformation Digitale
**Secteur**: Services Financiers
**Défi**: Modernisation des processus
**Solution**: Implémentation ${metadata.category}
**Résultats**: +40% d'efficacité, -25% de coûts

### Étude de Cas 2: Optimisation Performance
**Secteur**: Manufacturing
**Défi**: Amélioration productivité
**Solution**: Méthodologie ${metadata.category}
**Résultats**: +35% de productivité, +50% satisfaction client

## 🚀 Chapitre 5: Plan d'Action

### Étapes de Mise en Œuvre

1. **Évaluation Initiale** (Semaine 1-2)
2. **Conception Solution** (Semaine 3-4)
3. **Pilote Test** (Semaine 5-8)
4. **Déploiement Complet** (Semaine 9-16)
5. **Optimisation** (Semaine 17-20)

### Indicateurs de Succès

- KPI Opérationnels
- Métriques Qualité
- Satisfaction Utilisateurs
- ROI Financier

## 📈 Conclusion

Ce guide premium vous fournit tous les éléments pour réussir votre projet ${metadata.category}.

### Prochaines Étapes

1. Évaluer votre situation actuelle
2. Définir vos objectifs spécifiques
3. Choisir les méthodes adaptées
4. Planifier votre déploiement
5. Mesurer et optimiser

---

**© ${metadata.author} - ${new Date().getFullYear()}**
*Guide Premium Wakademy - Tous droits réservés*

Document généré le: ${new Date().toISOString()}
Version: 2.0 Premium
Pages: 150+ | Illustrations: 50+ | Cas d'études: 20+
`;
}

function generatePremiumGenericContent(metadata) {
  return `# ⭐ ${metadata.title} - Version Premium

${metadata.description}

## 📋 Informations
- **Auteur**: ${metadata.author}
- **Catégorie**: ${metadata.category}
- **Type**: ${metadata.type}
- **Langue**: ${metadata.language}
- **Tags**: ${metadata.tags.join(', ')}

## 🎯 Contenu Premium

Ce contenu premium a été spécialement conçu pour offrir une expérience d'apprentissage exceptionnelle.

### Caractéristiques Premium:
- ✅ Contenu expert validé
- ✅ Cas d'usage réels
- ✅ Outils pratiques inclus
- ✅ Support personnalisé
- ✅ Certification disponible

---
**Wakademy Premium** | ${new Date().toISOString()}
© ${metadata.author} - Contenu Exclusif
`;
}

async function addPremiumDemoData() {
  console.log('⭐ Ajout de données de démo PREMIUM avec fichiers réels...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Créer le dossier temporaire
    const tempDir = path.join(__dirname, 'temp-premium-files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`📁 Traitement de ${premiumDemoFiles.length} fichiers premium...`);

    let successCount = 0;
    let realFileCount = 0;

    for (const demoFile of premiumDemoFiles) {
      console.log(`\n⭐ Traitement PREMIUM: ${demoFile.name}...`);
      
      const filePath = path.join(tempDir, demoFile.name);
      
      // Essayer de télécharger le fichier réel avec retry
      const downloadSuccess = await downloadFileWithRetry(demoFile.url, filePath);
      
      if (downloadSuccess) {
        console.log(`✅ Téléchargement réel réussi`);
        realFileCount++;
      } else {
        console.log(`⚠️ Création d'un fichier premium de démo...`);
        createPremiumDemoFile(filePath, demoFile.type, demoFile.metadata);
        console.log(`✅ Fichier premium créé`);
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Fichier non trouvé: ${filePath}`);
        continue;
      }

      const fileStats = fs.statSync(filePath);
      console.log(`📊 Taille: ${(fileStats.size / 1024).toFixed(2)} KB`);

      // Générer le chemin de stockage premium
      const timestamp = Date.now();
      const storageFileName = `premium-${timestamp}-${demoFile.name}`;
      const storagePath = `premium/${new Date().toISOString().split('T')[0]}/${storageFileName}`;
      
      // Lire le fichier et créer un Blob
      const fileBuffer = fs.readFileSync(filePath);
      const fileBlob = new Blob([fileBuffer], { type: demoFile.type });
      
      // Upload vers Supabase Storage
      console.log(`📤 Upload PREMIUM vers Supabase...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(storagePath, fileBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error(`❌ Erreur upload ${demoFile.name}:`, uploadError);
        continue;
      }

      console.log(`✅ Upload réussi: ${storagePath}`);

      // Générer les URLs
      const { data: publicUrlData } = supabase.storage
        .from('content')
        .getPublicUrl(storagePath);

      const { data: signedUrlData } = await supabase.storage
        .from('content')
        .createSignedUrl(storagePath, 3600 * 24 * 90); // 90 jours pour premium

      console.log(`🔗 URL publique générée`);
      if (signedUrlData?.signedUrl) {
        console.log(`🔐 URL signée premium (90 jours)`);
      }

      // Insérer dans la base de données avec marqueur premium
      console.log(`💾 Insertion en base de données...`);
      const { data: contentData, error: contentError } = await supabase
        .from('contents')
        .insert({
          title: `⭐ ${demoFile.metadata.title}`, // Marqueur premium
          description: demoFile.metadata.description,
          type: demoFile.metadata.type,
          author: demoFile.metadata.author,
          duration: demoFile.metadata.duration,
          category: demoFile.metadata.category,
          thumbnail: null,
          views: Math.floor(Math.random() * 10000) + 1000, // Vues premium entre 1000 et 11000
        })
        .select('id')
        .single();

      if (contentError) {
        console.error(`❌ Erreur insertion ${demoFile.name}:`, contentError);
        continue;
      }

      console.log(`✅ Contenu PREMIUM créé avec l'ID: ${contentData.id}`);
      successCount++;

      // Nettoyer le fichier temporaire (vérifier qu'il existe)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Nettoyer le dossier temporaire
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log('\n🎉 Ajout des données PREMIUM terminé !');
    console.log('\n📊 Résumé Premium:');
    console.log(`  ✅ ${successCount}/${premiumDemoFiles.length} fichiers premium traités`);
    console.log(`  📥 ${realFileCount} vrais fichiers téléchargés`);
    console.log(`  📝 ${successCount - realFileCount} fichiers premium générés`);
    console.log('  ✅ Types: MP3, MP4, PDF');
    console.log('  ✅ Catégories: Bien-être, Leadership, Productivité, Entrepreneuriat, Négociation, etc.');
    console.log('  ✅ Stockage premium avec URLs longue durée (90 jours)');
    console.log('  ✅ Contenu marqué ⭐ PREMIUM');
    console.log('\n💎 Les contenus premium sont maintenant disponibles !');

    // Afficher un résumé des contenus premium créés
    console.log('\n📋 Contenus Premium Créés:');
    premiumDemoFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ⭐ ${file.metadata.title} (${file.metadata.type})`);
      console.log(`     👨‍🏫 ${file.metadata.author}`);
      console.log(`     📂 ${file.metadata.category}`);
      console.log(`     ⏱️ ${file.metadata.duration > 0 ? Math.floor(file.metadata.duration / 60) + ' min' : 'Document'}`);
      console.log(`     🏷️ ${file.metadata.tags.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données premium:', error);
  }
}

// Exécuter le script
addPremiumDemoData(); 