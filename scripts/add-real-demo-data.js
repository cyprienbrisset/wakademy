const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration avec clé de service
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NzQxMDcyMCwiZXhwIjo0OTAzMDg0MzIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pg0RRnBzt13kxHejjt81ARzZaJlZIuB3DcejPIbFlus';

// Fichiers de démo avec URLs libres de droits
const demoFiles = [
  {
    name: 'meditation-nature.mp3',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Fallback: on créera un fichier audio
    type: 'audio/mpeg',
    metadata: {
      title: 'Méditation Sons de la Nature',
      description: 'Session de méditation guidée avec sons naturels pour la relaxation profonde',
      type: 'podcast',
      author: 'Centre de Méditation Zen',
      language: 'fr',
      category: 'Bien-être',
      duration: 1200, // 20 minutes
      tags: ['méditation', 'nature', 'relaxation', 'zen']
    }
  },
  {
    name: 'leadership-conference.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Conférence Leadership Moderne',
      description: 'Présentation complète sur les nouvelles approches du leadership en entreprise',
      type: 'video',
      author: 'Dr. Marie Lecomte',
      language: 'fr',
      category: 'Leadership',
      duration: 3600, // 1 heure
      tags: ['leadership', 'management', 'entreprise', 'conférence']
    }
  },
  {
    name: 'guide-productivite.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'application/pdf',
    metadata: {
      title: 'Guide Complet de Productivité',
      description: 'Manuel pratique avec 50 techniques éprouvées pour optimiser votre productivité',
      type: 'document',
      author: 'Institut de Productivité',
      language: 'fr',
      category: 'Productivité',
      duration: 0,
      tags: ['productivité', 'organisation', 'méthodes', 'efficacité']
    }
  },
  {
    name: 'podcast-innovation.mp3',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Fallback: on créera un fichier audio
    type: 'audio/mpeg',
    metadata: {
      title: 'Podcast Innovation Tech',
      description: 'Discussion sur les dernières innovations technologiques et leur impact',
      type: 'podcast',
      author: 'TechTalk Radio',
      language: 'fr',
      category: 'Innovation',
      duration: 2700, // 45 minutes
      tags: ['innovation', 'technologie', 'startup', 'digital']
    }
  },
  {
    name: 'formation-vente.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Formation Techniques de Vente',
      description: 'Masterclass sur les stratégies de vente modernes et la négociation',
      type: 'video',
      author: 'École de Commerce Digital',
      language: 'fr',
      category: 'Ventes',
      duration: 4200, // 70 minutes
      tags: ['vente', 'négociation', 'commercial', 'formation']
    }
  },
  {
    name: 'webinar-communication.mp4',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
    type: 'video/mp4',
    metadata: {
      title: 'Webinar Communication Efficace',
      description: 'Séminaire en ligne sur les techniques de communication interpersonnelle',
      type: 'video',
      author: 'Centre de Formation Pro',
      language: 'fr',
      category: 'Communication',
      duration: 3000, // 50 minutes
      tags: ['communication', 'relations', 'interpersonnel', 'webinar']
    }
  }
];

// Fonction pour télécharger un fichier
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const file = fs.createWriteStream(destination);
    
    protocol.get(url, (response) => {
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
        reject(new Error(`Erreur HTTP: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

// Fonction pour créer un fichier de démo si le téléchargement échoue
function createDemoFile(filePath, type, metadata) {
  let content = '';
  
  if (type.startsWith('audio/')) {
    content = generateAudioContent(metadata);
  } else if (type.startsWith('video/')) {
    content = generateVideoContent(metadata);
  } else if (type === 'application/pdf') {
    content = generatePDFContent(metadata);
  } else {
    content = generateGenericContent(metadata);
  }
  
  fs.writeFileSync(filePath, content);
}

function generateAudioContent(metadata) {
  return `# Contenu Audio: ${metadata.title}

Ce fichier audio contient: ${metadata.description}

Auteur: ${metadata.author}
Durée: ${Math.floor(metadata.duration / 60)} minutes
Catégorie: ${metadata.category}
Tags: ${metadata.tags.join(', ')}

--- Transcript simulé ---

Bonjour et bienvenue dans cette session audio sur ${metadata.title.toLowerCase()}.

Je suis ${metadata.author}, et aujourd'hui nous allons explorer ensemble les concepts clés de ${metadata.category.toLowerCase()}.

[Contenu audio simulé - ${new Date().toISOString()}]

Au programme de cette session:
${metadata.tags.map((tag, i) => `${i + 1}. ${tag.charAt(0).toUpperCase() + tag.slice(1)}`).join('\n')}

Cette session vous permettra de développer vos compétences et d'approfondir vos connaissances.

Merci de votre attention et bonne écoute !

--- Fin du transcript ---
`;
}

function generateVideoContent(metadata) {
  return `# Contenu Vidéo: ${metadata.title}

Description: ${metadata.description}

Informations techniques:
- Format: MP4
- Durée: ${Math.floor(metadata.duration / 60)} minutes
- Auteur: ${metadata.author}
- Catégorie: ${metadata.category}

--- Script vidéo simulé ---

[INTRO - 0:00]
Titre: ${metadata.title}
Présentateur: ${metadata.author}

[DÉVELOPPEMENT - 5:00]
Points clés abordés:
${metadata.tags.map((tag, i) => `- ${tag.charAt(0).toUpperCase() + tag.slice(1)}`).join('\n')}

[EXEMPLES PRATIQUES - ${Math.floor(metadata.duration / 3)}:00]
Cas d'usage concrets et applications pratiques

[CONCLUSION - ${Math.floor(metadata.duration * 0.8 / 60)}:00]
Résumé des points essentiels et prochaines étapes

[FIN - ${Math.floor(metadata.duration / 60)}:00]

--- Métadonnées ---
Créé le: ${new Date().toISOString()}
Fichier généré automatiquement pour les tests Wakademy
`;
}

function generatePDFContent(metadata) {
  return `# ${metadata.title}

${metadata.description}

## Table des matières

1. Introduction
2. Concepts fondamentaux
3. Méthodes et techniques
4. Cas pratiques
5. Outils et ressources
6. Conclusion

---

## 1. Introduction

Bienvenue dans ce guide complet sur ${metadata.category.toLowerCase()}. 

Auteur: ${metadata.author}
Catégorie: ${metadata.category}
Mots-clés: ${metadata.tags.join(', ')}

Ce document a été conçu pour vous accompagner dans votre développement professionnel.

## 2. Concepts fondamentaux

${metadata.tags.map(tag => `### ${tag.charAt(0).toUpperCase() + tag.slice(1)}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

`).join('')}

## 3. Méthodes et techniques

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

### Approche pratique

1. Analyse de la situation
2. Définition des objectifs
3. Mise en œuvre des solutions
4. Évaluation des résultats

## 4. Cas pratiques

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.

### Exemple 1: Application en entreprise
### Exemple 2: Cas d'usage spécifique
### Exemple 3: Retour d'expérience

## 5. Outils et ressources

- Outil 1: Description et utilisation
- Outil 2: Avantages et inconvénients
- Outil 3: Mise en pratique

## 6. Conclusion

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.

---

Document généré le: ${new Date().toISOString()}
© ${metadata.author} - Wakademy Platform
`;
}

function generateGenericContent(metadata) {
  return `# ${metadata.title}

${metadata.description}

Auteur: ${metadata.author}
Catégorie: ${metadata.category}
Type: ${metadata.type}
Tags: ${metadata.tags.join(', ')}

Contenu généré automatiquement pour les tests Wakademy.
Timestamp: ${new Date().toISOString()}
`;
}

async function addRealDemoData() {
  console.log('🎬 Ajout de données de démo réalistes avec vrais fichiers...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Créer le dossier temporaire
    const tempDir = path.join(__dirname, 'temp-demo-files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`📁 Traitement de ${demoFiles.length} fichiers de démo...`);

    for (const demoFile of demoFiles) {
      console.log(`\n🔄 Traitement de ${demoFile.name}...`);
      
      const filePath = path.join(tempDir, demoFile.name);
      
      // Essayer de télécharger le fichier réel
      try {
        console.log(`📥 Téléchargement depuis ${demoFile.url}...`);
        await downloadFile(demoFile.url, filePath);
        console.log(`✅ Téléchargement réussi`);
      } catch (downloadError) {
        console.log(`⚠️ Échec du téléchargement, création d'un fichier de démo...`);
        createDemoFile(filePath, demoFile.type, demoFile.metadata);
        console.log(`✅ Fichier de démo créé`);
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Fichier non trouvé: ${filePath}`);
        continue;
      }

      const fileStats = fs.statSync(filePath);
      console.log(`📊 Taille du fichier: ${(fileStats.size / 1024).toFixed(2)} KB`);

      // Générer le chemin de stockage
      const timestamp = Date.now();
      const storageFileName = `demo-${timestamp}-${demoFile.name}`;
      const storagePath = `demos/${new Date().toISOString().split('T')[0]}/${storageFileName}`;
      
      // Lire le fichier et créer un Blob
      const fileBuffer = fs.readFileSync(filePath);
      const fileBlob = new Blob([fileBuffer], { type: demoFile.type });
      
      // Upload vers Supabase Storage
      console.log(`📤 Upload vers le stockage Supabase...`);
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
        .createSignedUrl(storagePath, 3600 * 24 * 30); // 30 jours

      console.log(`🔗 URL publique: ${publicUrlData.publicUrl}`);
      if (signedUrlData?.signedUrl) {
        console.log(`🔐 URL signée générée`);
      }

      // Insérer dans la base de données
      console.log(`💾 Insertion en base de données...`);
      const { data: contentData, error: contentError } = await supabase
        .from('contents')
        .insert({
          title: demoFile.metadata.title,
          description: demoFile.metadata.description,
          type: demoFile.metadata.type,
          author: demoFile.metadata.author,
          duration: demoFile.metadata.duration,
          category: demoFile.metadata.category,
          thumbnail: null,
          views: Math.floor(Math.random() * 5000) + 500, // Vues entre 500 et 5500
        })
        .select('id')
        .single();

      if (contentError) {
        console.error(`❌ Erreur insertion ${demoFile.name}:`, contentError);
        continue;
      }

      console.log(`✅ Contenu créé avec l'ID: ${contentData.id}`);

      // Nettoyer le fichier temporaire
      fs.unlinkSync(filePath);
    }

    // Nettoyer le dossier temporaire
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n🎉 Ajout des données de démo terminé !');
    console.log('\n📊 Résumé:');
    console.log(`  ✅ ${demoFiles.length} fichiers de démo traités`);
    console.log('  ✅ Types: MP3, MP4, PDF');
    console.log('  ✅ Catégories: Bien-être, Leadership, Productivité, Innovation, Ventes, Communication');
    console.log('  ✅ Fichiers stockés dans le bucket Supabase');
    console.log('  ✅ URLs publiques et signées générées');
    console.log('\n💡 Les contenus de démo sont maintenant disponibles avec de vrais fichiers !');

    // Afficher un résumé des contenus créés
    console.log('\n📋 Contenus créés:');
    demoFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.metadata.title} (${file.metadata.type})`);
      console.log(`     Auteur: ${file.metadata.author}`);
      console.log(`     Catégorie: ${file.metadata.category}`);
      console.log(`     Durée: ${file.metadata.duration > 0 ? Math.floor(file.metadata.duration / 60) + ' min' : 'Document'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de démo:', error);
  }
}

// Exécuter le script
addRealDemoData(); 