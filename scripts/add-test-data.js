const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

async function addTestData() {
  console.log('🧪 Ajout de données de test avec différents types de fichiers...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Créer le dossier temporaire s'il n'existe pas
    const tempDir = path.join(__dirname, 'temp-test-files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Données de test pour différents types de fichiers
    const testFiles = [
      {
        name: 'formation-leadership.mp3',
        type: 'audio/mpeg',
        content: generateAudioContent(),
        metadata: {
          title: 'Formation Leadership - Audio',
          description: 'Formation complète sur les techniques de leadership moderne',
          type: 'podcast',
          author: 'Marie Dubois',
          language: 'fr',
          category: 'Leadership',
          duration: 3600, // 1 heure
          tags: ['leadership', 'management', 'formation']
        }
      },
      {
        name: 'meditation-relaxation.wav',
        type: 'audio/wav',
        content: generateAudioContent(),
        metadata: {
          title: 'Méditation et Relaxation',
          description: 'Session de méditation guidée pour la gestion du stress',
          type: 'podcast',
          author: 'Sophie Martin',
          language: 'fr',
          category: 'Bien-être',
          duration: 1800, // 30 minutes
          tags: ['méditation', 'relaxation', 'bien-être']
        }
      },
      {
        name: 'presentation-ventes.mp4',
        type: 'video/mp4',
        content: generateVideoContent(),
        metadata: {
          title: 'Techniques de Vente Avancées',
          description: 'Présentation vidéo sur les stratégies de vente modernes',
          type: 'video',
          author: 'Jean-Pierre Leclerc',
          language: 'fr',
          category: 'Ventes',
          duration: 2700, // 45 minutes
          tags: ['vente', 'négociation', 'commercial']
        }
      },
      {
        name: 'guide-productivite.pdf',
        type: 'application/pdf',
        content: generatePDFContent(),
        metadata: {
          title: 'Guide de Productivité',
          description: 'Manuel complet pour optimiser sa productivité au travail',
          type: 'document',
          author: 'Claire Rousseau',
          language: 'fr',
          category: 'Productivité',
          duration: 0,
          tags: ['productivité', 'organisation', 'efficacité']
        }
      },
      {
        name: 'webinar-innovation.mp4',
        type: 'video/mp4',
        content: generateVideoContent(),
        metadata: {
          title: 'Webinar Innovation Digitale',
          description: 'Conférence sur les dernières tendances en innovation digitale',
          type: 'video',
          author: 'Thomas Durand',
          language: 'fr',
          category: 'Innovation',
          duration: 4200, // 70 minutes
          tags: ['innovation', 'digital', 'technologie']
        }
      },
      {
        name: 'podcast-communication.mp3',
        type: 'audio/mpeg',
        content: generateAudioContent(),
        metadata: {
          title: 'Podcast Communication Efficace',
          description: 'Épisode sur les techniques de communication interpersonnelle',
          type: 'podcast',
          author: 'Isabelle Moreau',
          language: 'fr',
          category: 'Communication',
          duration: 2400, // 40 minutes
          tags: ['communication', 'relations', 'interpersonnel']
        }
      }
    ];

    console.log(`📁 Création de ${testFiles.length} fichiers de test...`);

    for (const testFile of testFiles) {
      console.log(`\n🔄 Traitement de ${testFile.name}...`);
      
      // Créer le fichier temporaire
      const filePath = path.join(tempDir, testFile.name);
      fs.writeFileSync(filePath, testFile.content);
      
      // Générer le chemin de stockage
      const timestamp = Date.now();
      const storageFileName = `${timestamp}-${testFile.name}`;
      const storagePath = `uploads/${new Date().toISOString().split('T')[0]}/${storageFileName}`;
      
      // Créer un Blob pour l'upload
      const fileBlob = new Blob([testFile.content], { type: testFile.type });
      
      // Upload vers Supabase Storage
      console.log(`📤 Upload de ${testFile.name} vers le stockage...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(storagePath, fileBlob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error(`❌ Erreur upload ${testFile.name}:`, uploadError);
        continue;
      }

      console.log(`✅ Upload réussi: ${testFile.name}`);

      // Générer les URLs
      const { data: publicUrlData } = supabase.storage
        .from('content')
        .getPublicUrl(storagePath);

      const { data: signedUrlData } = await supabase.storage
        .from('content')
        .createSignedUrl(storagePath, 3600 * 24 * 7); // 7 jours

      // Insérer dans la base de données
      console.log(`💾 Insertion en base de données...`);
      const { data: contentData, error: contentError } = await supabase
        .from('contents')
        .insert({
          title: testFile.metadata.title,
          description: testFile.metadata.description,
          type: testFile.metadata.type,
          author: testFile.metadata.author,
          duration: testFile.metadata.duration,
          category: testFile.metadata.category,
          thumbnail: null,
          views: Math.floor(Math.random() * 2000) + 100, // Vues aléatoires entre 100 et 2100
        })
        .select('id')
        .single();

      if (contentError) {
        console.error(`❌ Erreur insertion ${testFile.name}:`, contentError);
        continue;
      }

      console.log(`✅ Contenu créé avec l'ID: ${contentData.id}`);

      // Nettoyer le fichier temporaire
      fs.unlinkSync(filePath);
    }

    // Nettoyer le dossier temporaire
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n🎉 Ajout des données de test terminé !');
    console.log('\n📊 Résumé:');
    console.log(`  ✅ ${testFiles.length} fichiers de test créés`);
    console.log('  ✅ Types de fichiers: MP3, WAV, MP4, PDF');
    console.log('  ✅ Catégories: Leadership, Bien-être, Ventes, Productivité, Innovation, Communication');
    console.log('\n💡 Vous pouvez maintenant tester l\'interface avec ces différents types de contenus !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
  }
}

// Fonctions pour générer du contenu de test
function generateAudioContent() {
  return `# Contenu Audio de Test

Ce fichier simule un contenu audio pour les tests de Wakademy.

Métadonnées:
- Format: Audio
- Durée simulée: Variable selon le fichier
- Contenu: Formation professionnelle

Ce contenu est généré automatiquement pour les tests.
Timestamp: ${new Date().toISOString()}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.

Fin du contenu audio simulé.
`;
}

function generateVideoContent() {
  return `# Contenu Vidéo de Test

Ce fichier simule un contenu vidéo pour les tests de Wakademy.

Métadonnées:
- Format: Vidéo MP4
- Résolution simulée: 1920x1080
- Durée simulée: Variable selon le fichier
- Contenu: Formation professionnelle

Ce contenu est généré automatiquement pour les tests.
Timestamp: ${new Date().toISOString()}

Scénario de la vidéo:
1. Introduction (0-5 min)
2. Développement du sujet (5-35 min)
3. Exemples pratiques (35-50 min)
4. Questions/Réponses (50-60 min)
5. Conclusion (60-65 min)

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco.
Duis aute irure dolor in reprehenderit in voluptate velit esse.

Fin du contenu vidéo simulé.
`;
}

function generatePDFContent() {
  return `# Document PDF de Test

Ce fichier simule un document PDF pour les tests de Wakademy.

## Table des matières

1. Introduction
2. Méthodologie
3. Développement
4. Exemples pratiques
5. Conclusion
6. Ressources

## 1. Introduction

Ce document est généré automatiquement pour tester la fonctionnalité d'upload de documents PDF dans Wakademy.

Timestamp: ${new Date().toISOString()}

## 2. Méthodologie

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### 2.1 Approche

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### 2.2 Outils

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## 3. Développement

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.

## 4. Exemples pratiques

- Exemple 1: Application en entreprise
- Exemple 2: Cas d'usage spécifique
- Exemple 3: Retour d'expérience

## 5. Conclusion

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.

## 6. Ressources

- Ressource 1: Documentation officielle
- Ressource 2: Études de cas
- Ressource 3: Outils complémentaires

---

Fin du document PDF simulé.
Document généré automatiquement pour les tests Wakademy.
`;
}

// Exécuter le script
addTestData(); 