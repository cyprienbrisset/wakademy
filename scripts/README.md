# Scripts Wakademy

Ce dossier contient des scripts utilitaires pour gérer les données de test et la maintenance de la plateforme Wakademy.

## 📁 Scripts disponibles

### 🧪 `add-test-data.js` - Ajout de données de test basiques

Ajoute des contenus de test avec différents types de fichiers pour valider les fonctionnalités d'upload et d'affichage.

**Usage :**
```bash
node scripts/add-test-data.js
```

**Contenu créé :**
- **Formation Leadership - Audio** (MP3, 1h) - Catégorie: Leadership
- **Méditation et Relaxation** (WAV, 30min) - Catégorie: Bien-être  
- **Techniques de Vente Avancées** (MP4, 45min) - Catégorie: Ventes
- **Guide de Productivité** (PDF) - Catégorie: Productivité
- **Webinar Innovation Digitale** (MP4, 70min) - Catégorie: Innovation
- **Podcast Communication Efficace** (MP3, 40min) - Catégorie: Communication

**Fonctionnalités testées :**
- ✅ Upload de fichiers MP3, WAV, MP4, PDF
- ✅ Stockage Supabase
- ✅ Génération d'URLs publiques et signées
- ✅ Insertion en base de données
- ✅ Différentes catégories et durées
- ✅ Vues aléatoires pour simulation

---

### 🎬 `add-real-demo-data.js` - Ajout de données de démo réalistes

Télécharge de vrais fichiers depuis internet et crée des contenus de démo réalistes avec de vrais fichiers dans le bucket.

**Usage :**
```bash
node scripts/add-real-demo-data.js
```

**Contenu créé :**
- **Méditation Sons de la Nature** (MP3 réel, 20min) - Catégorie: Bien-être
- **Conférence Leadership Moderne** (MP4, 60min) - Catégorie: Leadership  
- **Guide Complet de Productivité** (PDF réel) - Catégorie: Productivité
- **Podcast Innovation Tech** (MP3, 45min) - Catégorie: Innovation
- **Formation Techniques de Vente** (MP4, 70min) - Catégorie: Ventes
- **Webinar Communication Efficace** (MP4, 50min) - Catégorie: Communication

**Fonctionnalités :**
- 📥 Téléchargement de vrais fichiers libres de droits
- 🔄 Fallback vers fichiers générés si téléchargement échoue
- 📁 Stockage dans dossier `demos/` du bucket
- 🔗 URLs publiques et signées (7 jours)
- 📊 Vues aléatoires entre 500 et 5500

---

### ⭐ `add-premium-demo-data.js` - Ajout de contenus premium

Crée des contenus premium de haute qualité avec de vrais fichiers téléchargés et du contenu enrichi.

**Usage :**
```bash
node scripts/add-premium-demo-data.js
```

**Contenu premium créé :**
- **⭐ Relaxation Sons de l'Océan** (MP3 réel, 30min) - Catégorie: Bien-être
- **⭐ Masterclass Leadership Transformationnel** (MP4 réel, 75min) - Catégorie: Leadership
- **⭐ Manuel Avancé de Gestion du Temps** (PDF premium) - Catégorie: Productivité
- **⭐ Podcast Entrepreneuriat Digital** (MP3, 55min) - Catégorie: Entrepreneuriat
- **⭐ Formation Négociation Avancée** (MP4, 90min) - Catégorie: Négociation
- **⭐ Conférence Intelligence Émotionnelle** (MP4, 65min) - Catégorie: Développement Personnel
- **⭐ Guide Marketing Digital 2024** (PDF) - Catégorie: Marketing
- **⭐ Podcast Innovation et IA** (MP3, 45min) - Catégorie: Innovation

**Fonctionnalités premium :**
- ⭐ Marquage premium avec étoile dans le titre
- 📥 Téléchargement avec retry (3 tentatives)
- 📁 Stockage dans dossier `premium/` du bucket
- 🔐 URLs signées longue durée (90 jours)
- 📊 Vues premium entre 1000 et 11000
- 📝 Contenu enrichi avec transcripts, plans détaillés, certifications
- 🎯 Nouvelles catégories : Entrepreneuriat, Négociation, Marketing

---

### 🎬 `reset-demo-mode.js` - Reset du mode démo

Supprime tous les contenus sauf les contenus de démo réalistes pour avoir une plateforme en mode démo propre.

**Usage :**
```bash
node scripts/reset-demo-mode.js
```

**Fonctionnalités :**
- 🎯 **Conserve uniquement** les 6 contenus de démo réalistes
- 🗑️ Supprime tous les contenus de test et premium
- 🗂️ Nettoie le stockage (garde seulement `demos/`)
- 🤖 Supprime les tâches IA associées
- 📊 Affiche un résumé détaillé des actions

**Contenus de démo conservés :**
- Méditation Sons de la Nature
- Conférence Leadership Moderne  
- Guide Complet de Productivité
- Podcast Innovation Tech
- Formation Techniques de Vente
- Webinar Communication Efficace

**Idéal pour :**
- 🎪 Démonstrations clients
- 🧪 Tests avec données réalistes uniquement
- 🎬 Mode présentation propre
- 🔄 Reset rapide vers un état démo stable

---

### 🔄 `switch-mode.js` - Basculement rapide de mode

Permet de basculer rapidement entre différents modes prédéfinis de la plateforme.

**Usage :**
```bash
node scripts/switch-mode.js <mode>
```

**Modes disponibles :**

- 🎬 **demo** - Mode Démo Pur
  - Contenus de démo réalistes uniquement
  - Idéal pour démonstrations clients

- ⭐ **premium** - Mode Démo + Premium  
  - Contenus de démo + contenus premium
  - Parfait pour présentations investisseurs

- 🧪 **test** - Mode Test/Développement
  - Contenus de test pour développement
  - Idéal pour tests et développement

- 🎯 **full** - Mode Complet
  - Tous types de contenus (test + démo + premium)
  - Pour démonstrations complètes

- 🗑️ **empty** - Base Vide
  - Supprime tous les contenus
  - Pour repartir de zéro

**Exemples :**
```bash
# Basculer en mode démo pur
node scripts/switch-mode.js demo

# Basculer en mode démo + premium
node scripts/switch-mode.js premium

# Basculer en mode test
node scripts/switch-mode.js test

# Vider complètement la base
node scripts/switch-mode.js empty
```

**Fonctionnalités :**
- 🔍 Vérification de l'état actuel avant basculement
- 🚀 Exécution automatique des scripts nécessaires
- 📊 Vérification finale du statut après basculement
- ✅ Gestion d'erreurs et arrêt en cas d'échec
- 💡 Recommandations selon le mode choisi

---

### 🔍 `check-demo-status.js` - Vérification du statut démo

Vérifie l'état actuel de la plateforme et identifie le mode de fonctionnement (démo, test, production, etc.).

**Usage :**
```bash
node scripts/check-demo-status.js
```

**Fonctionnalités :**
- 🔍 Analyse automatique du contenu présent
- 📊 Détection du mode actuel (Démo Pur, Démo + Premium, Test, etc.)
- ✅ Vérification des contenus de démo attendus
- 📁 Contrôle de l'état du stockage Supabase
- 💡 Recommandations d'actions selon le contexte

**Modes détectés :**
- 🎬 **Mode Démo Pur** : 6 contenus de démo uniquement
- ⭐ **Mode Démo + Premium** : Démo + contenus premium
- 🔀 **Mode Démo + Mixte** : Démo + autres contenus
- 🧪 **Mode Développement/Test** : Contenus de test présents
- 🗑️ **Base Vide** : Aucun contenu

**Idéal pour :**
- 🔍 Diagnostic rapide de l'état de la plateforme
- 📋 Validation avant démonstration
- 🎯 Identification des contenus manquants
- 🗂️ Vérification de l'organisation du stockage

---

### 🗑️ `purge-contents.js` - Purge des contenus

Supprime les contenus de la base de données et du stockage Supabase.

**Usage :**

```bash
# Purger TOUS les contenus (⚠️ ATTENTION)
node scripts/purge-contents.js
node scripts/purge-contents.js all

# Purger seulement les contenus de test
node scripts/purge-contents.js test-only
```

**Modes disponibles :**

#### Mode `all` (par défaut)
- ⚠️ **ATTENTION** : Supprime TOUS les contenus
- Supprime les enregistrements de la base de données
- Supprime les fichiers du stockage Supabase
- Supprime les tâches IA associées
- Nettoie complètement le bucket `content`

#### Mode `test-only` (recommandé)
- Supprime seulement les contenus de test identifiés par leurs titres
- Préserve les contenus de production et premium
- Plus sûr pour le développement

**Contenus de test détectés :**
- Tous les contenus avec "Test" dans le titre
- Formation Leadership - Audio
- Méditation et Relaxation
- Techniques de Vente Avancées
- Guide de Productivité
- Webinar Innovation Digitale
- Podcast Communication Efficace

---

### 🧪 `test-upload.js` - Test du stockage

Teste les fonctionnalités de base du stockage Supabase.

**Usage :**
```bash
node scripts/test-upload.js
```

**Tests effectués :**
- ✅ Upload d'un fichier de test
- ✅ Génération d'URL publique
- ✅ Génération d'URL signée
- ✅ Suppression du fichier
- ✅ Vérification de l'accès au bucket

---

### 📊 `test-upload-flow.js` - Simulation du flux d'upload

Simule le flux complet d'upload sans réellement créer de fichiers.

**Usage :**
```bash
node scripts/test-upload-flow.js
```

**Simulation :**
- 👤 Création d'un utilisateur de test
- 📄 Génération de contenu de test
- 📋 Préparation des métadonnées
- 🔄 Simulation de l'API d'upload
- 💾 Structure de données validée

---

### 🚀 `test-real-upload.js` - Test réel de l'API

Teste l'API d'upload avec un fichier réel via HTTP.

**Usage :**
```bash
node scripts/test-real-upload.js
```

**Prérequis :**
```bash
npm install form-data node-fetch
```

**Tests :**
- 📤 Requête HTTP POST vers `/api/upload`
- 📁 Upload d'un fichier réel
- 🔍 Validation de la réponse API
- 🧹 Nettoyage automatique

---

### 🧪 Scripts de test (4)
- `test-upload.js` - Test du stockage Supabase
- `test-upload-flow.js` - Simulation du flux d'upload
- `test-real-upload.js` - Test réel de l'API d'upload
- `test-supabase-fix.js` - Test des corrections Supabase

---

## 🔧 Configuration

Tous les scripts utilisent la configuration Supabase suivante :

```javascript
const SUPABASE_URL = 'http://supabasekong-ggcg8sgo4kwow8sk80004gkg.37.187.144.121.sslip.io';
const SUPABASE_SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...';
```

## 🚀 Workflow de développement recommandé

### 🔄 Basculement rapide (recommandé)

```bash
# Vérifier l'état actuel
node scripts/check-demo-status.js

# Basculer rapidement vers le mode souhaité
node scripts/switch-mode.js demo      # Mode démo pur
node scripts/switch-mode.js premium   # Mode démo + premium  
node scripts/switch-mode.js test      # Mode test/développement
node scripts/switch-mode.js full      # Mode complet
node scripts/switch-mode.js empty     # Base vide
```

### 📋 Workflow détaillé (étape par étape)

### 0. Vérification de l'état actuel
```bash
# Vérifier l'état actuel de la plateforme
node scripts/check-demo-status.js
```

### 1. Développement initial avec données basiques
```bash
# Ajouter des données de test simples
node scripts/add-test-data.js

# Tester l'interface avec différents types de contenus
# Développer les fonctionnalités...

# Purger les contenus de test
node scripts/purge-contents.js test-only
```

### 2. Tests avec données réalistes
```bash
# Ajouter des données de démo avec vrais fichiers
node scripts/add-real-demo-data.js

# Tester l'interface avec du contenu réaliste
# Valider les fonctionnalités avancées...
```

### 3. Mode démo pour présentation
```bash
# Reset vers mode démo propre (garde seulement les contenus de démo)
node scripts/reset-demo-mode.js

# Vérifier que le mode démo est actif
node scripts/check-demo-status.js

# Présenter la plateforme avec du contenu professionnel réaliste
# Démonstrations clients, tests utilisateurs...
```

### 4. Démonstration avec contenu premium
```bash
# Ajouter du contenu premium de qualité
node scripts/add-premium-demo-data.js

# Vérifier le nouveau statut (Mode Démo + Premium)
node scripts/check-demo-status.js

# Présenter la plateforme avec du contenu professionnel premium
# Démonstrations clients, investisseurs...
```

### 5. Tests d'upload
```bash
# Tester le stockage de base
node scripts/test-upload.js

# Tester l'API d'upload
node scripts/test-real-upload.js

# Simuler le flux complet
node scripts/test-upload-flow.js
```

### 6. Nettoyage complet (si nécessaire)
```bash
# ⚠️ ATTENTION : Supprime TOUT
node scripts/purge-contents.js all

# Vérifier que la base est vide
node scripts/check-demo-status.js
```

## 📊 Structure du bucket Supabase

```
content/
├── uploads/           # Fichiers uploadés via l'interface
│   └── 2025-05-25/   # Organisés par date
├── demos/             # Fichiers de démo réalistes
│   └── 2025-05-25/   
└── premium/           # Contenus premium
    └── 2025-05-25/   
```

## 🎯 Types de contenus disponibles

### Contenus de test (basiques)
- 📝 Fichiers générés automatiquement
- 🔄 Idéal pour tests de développement
- 🧹 Facile à purger

### Contenus de démo (réalistes)
- 📥 Vrais fichiers téléchargés quand possible
- 🎬 Contenu professionnel simulé
- 📊 Vues moyennes (500-5500)

### Contenus premium (haute qualité)
- ⭐ Marquage premium visible
- 📚 Contenu enrichi (transcripts, plans détaillés)
- 🔐 URLs longue durée (90 jours)
- 📈 Vues élevées (1000-11000)
- 🏆 Certifications incluses

## 📝 Notes importantes

- ⚠️ **Attention** : Le mode `all` de purge supprime TOUS les contenus
- 🔒 Les scripts utilisent la clé de service Supabase (accès admin)
- 🧹 Les fichiers temporaires sont automatiquement nettoyés
- 📊 Les vues sont générées aléatoirement pour les tests
- 🎯 Le mode `test-only` est recommandé pour le développement
- 📥 Les téléchargements incluent un système de retry automatique
- 🔄 Fallback vers génération de contenu si téléchargement échoue

## 🐛 Dépannage

### Erreur "bucket does not exist"
```bash
# Créer le bucket manuellement ou utiliser l'interface Supabase
```

### Erreur de permissions
```bash
# Vérifier la clé de service dans les variables d'environnement
# Vérifier les politiques RLS dans Supabase
```

### Erreur de connexion
```bash
# Vérifier que l'URL Supabase est accessible
# Vérifier la connectivité réseau
```

### Échec de téléchargement
```bash
# Les scripts incluent un fallback automatique
# Le contenu sera généré localement si le téléchargement échoue
```

---

*Scripts créés pour faciliter le développement et les tests de Wakademy* 🚀

## 📊 Résumé des scripts

**Total : 11 scripts disponibles**

### 🎬 Scripts de données (4)
- `add-test-data.js` - Données de test basiques
- `add-real-demo-data.js` - Données de démo réalistes  
- `add-premium-demo-data.js` - Contenus premium
- `reset-demo-mode.js` - Reset vers mode démo pur

### 🔧 Scripts utilitaires (3)
- `switch-mode.js` - Basculement rapide de mode
- `check-demo-status.js` - Vérification du statut
- `purge-contents.js` - Purge des contenus

### 🧪 Scripts de test (4)
- `test-upload.js` - Test du stockage Supabase
- `test-upload-flow.js` - Simulation du flux d'upload
- `test-real-upload.js` - Test réel de l'API d'upload
- `test-supabase-fix.js` - Test des corrections Supabase

**Statistiques actuelles :**
- 📊 6 contenus de démo disponibles (Mode Démo Pur actif)
- 🎬 6 types de fichiers : MP3, WAV, MP4, PDF
- 📂 10 catégories différentes
- 🔄 5 modes de basculement disponibles
- 🗂️ Structure organisée : uploads/, demos/, premium/ 