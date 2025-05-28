<div align="center">

![Wakademy Logo](./public/wakademy-logo.png)

# 🎓 Wakademy
### *La plateforme de contenus internes nouvelle génération*

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*Transformez votre partage de connaissances avec une expérience Netflix pour l'entreprise*

[🚀 Démo Live](#) • [📖 Documentation](#installation--configuration) • [🛠️ Installation](#installation--configuration) • [💬 Support](#support)

</div>

---

## 🌟 Présentation

**Wakademy** est une plateforme révolutionnaire de gestion de contenus internes, inspirée de l'expérience Netflix. Conçue spécifiquement pour les entreprises modernes, elle transforme la façon dont vos équipes partagent, découvrent et consomment les connaissances organisationnelles.

### 🎯 Vision
> *"Démocratiser l'accès aux connaissances d'entreprise avec une expérience utilisateur exceptionnelle"*

---

## ✨ Fonctionnalités Principales

<table>
<tr>
<td width="50%">

### 🔐 **Authentification & Sécurité**
- 🛡️ Authentification Supabase sécurisée
- 👥 Gestion des rôles (Admin, Modérateur, Utilisateur)
- 🔒 Contrôle d'accès granulaire
- 🍪 Synchronisation session/cookies

### 📚 **Gestion de Contenus**
- 🎥 Vidéos haute qualité
- 🎧 Podcasts et contenus audio
- 📄 Documents et présentations
- 🏷️ Système de tags intelligent
- 📂 Catégorisation avancée

</td>
<td width="50%">

### 🤖 **Intelligence Artificielle**
- 📝 Résumés automatiques
- 🎯 Transcription intelligente
- 🔍 Catégorisation automatique
- 🎨 Génération de miniatures
- 📊 Analyse de contenu

### 📈 **Engagement & Analytics**
- ⭐ Système de notation
- 💬 Commentaires et discussions
- 📊 Statistiques d'utilisation
- 🔔 Notifications intelligentes
- 🏆 Système de badges

</td>
</tr>
</table>

---

## 🏗️ Architecture Technique

<div align="center">

```mermaid
graph TB
    A[🌐 Frontend - Next.js 15] --> B[🔌 API Routes]
    B --> C[🗄️ PostgreSQL + Supabase]
    B --> D[🤖 Services IA]
    A --> E[🎨 UI - Radix + Tailwind]
    A --> F[⚡ Performance Cache]
    C --> G[📁 Stockage Fichiers]
    D --> H[📝 Transcription]
    D --> I[🎯 Résumés]
```

</div>

### 🛠️ Stack Technologique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5 |
| **UI/UX** | TailwindCSS, Radix UI, Framer Motion |
| **Backend** | Next.js API Routes, Supabase |
| **Base de Données** | PostgreSQL avec extensions avancées |
| **Authentification** | Supabase Auth |
| **Performance** | Cache intelligent, Pool de connexions |
| **Outils** | pnpm, ESLint, Prettier |

---

## 🚀 Installation & Configuration

### 📋 Prérequis

- **Node.js** 18+ 
- **pnpm** (gestionnaire de paquets recommandé)
- **PostgreSQL** 14+
- **Compte Supabase** (pour l'authentification)

### ⚡ Installation Rapide

```bash
# 1️⃣ Cloner le projet
git clone https://github.com/votre-org/wakademy.git
cd wakademy

# 2️⃣ Installer les dépendances
pnpm install

# 3️⃣ Configuration de l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# 4️⃣ Initialiser la base de données
pnpm run migrate

# 5️⃣ Ajouter des données de démonstration
pnpm run seed

# 6️⃣ Lancer en développement
pnpm dev
```

### 🔧 Configuration Avancée

<details>
<summary>📝 Variables d'environnement</summary>

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/wakademy

# Performance
CACHE_TTL=300000
MAX_CACHE_SIZE=1000
MAX_DB_CONNECTIONS=10

# IA (optionnel)
OPENAI_API_KEY=your_openai_key
AZURE_COGNITIVE_KEY=your_azure_key
```

</details>

<details>
<summary>🗄️ Configuration Base de Données</summary>

```bash
# Créer les tables
psql -d wakademy -f lib/setup/create-all-tables.sql

# Ajouter des données d'exemple
psql -d wakademy -f lib/setup/seed-sample-data.sql

# Ou utiliser les scripts npm
pnpm run create-tables
pnpm run seed-data
```

</details>

---

## 📁 Structure du Projet

```
wakademy/
├── 📱 app/                    # Pages et routes Next.js
│   ├── (dashboard)/          # Routes protégées
│   ├── api/                  # API endpoints
│   └── globals.css           # Styles globaux
├── 🧩 components/            # Composants React
│   ├── ui/                   # Composants UI de base
│   ├── dashboard/            # Composants dashboard
│   ├── auth/                 # Authentification
│   └── library/              # Bibliothèque de contenus
├── 🔧 lib/                   # Utilitaires et services
│   ├── setup/                # Scripts SQL
│   ├── supabase/             # Configuration Supabase
│   ├── performance/          # Optimisations
│   └── auth.ts               # Gestion authentification
├── 🎨 public/                # Assets statiques
├── 📜 scripts/               # Scripts d'automatisation
└── 🔧 Configuration files
```

---

## 🎮 Utilisation

### 👤 Première Connexion

1. **Accédez à** `http://localhost:3000`
2. **Cliquez sur** "Commencer" pour l'installation
3. **Créez** votre compte administrateur
4. **Explorez** le dashboard et uploadez vos premiers contenus

### 📊 Dashboard Principal

<div align="center">

| Section | Description |
|---------|-------------|
| 📈 **Analytics** | Statistiques d'utilisation et engagement |
| 📚 **Bibliothèque** | Parcourir tous les contenus |
| ⭐ **Tendances** | Contenus populaires et recommandés |
| 📤 **Upload** | Ajouter de nouveaux contenus |
| ⚙️ **Paramètres** | Configuration de la plateforme |

</div>

### 🔄 Workflow de Contenu

```mermaid
flowchart LR
    A[📤 Upload] --> B[🤖 Traitement IA]
    B --> C[🏷️ Catégorisation]
    C --> D[📝 Métadonnées]
    D --> E[✅ Publication]
    E --> F[📊 Analytics]
```

---

## ⚡ Optimisations de Performance

Wakademy intègre des optimisations avancées pour une expérience utilisateur exceptionnelle :

### 🚀 Fonctionnalités de Performance

- **🧠 Cache Intelligent** : Système de cache multi-niveaux avec TTL adaptatif
- **🔗 Pool de Connexions** : Gestion optimisée des connexions base de données
- **📦 Code Splitting** : Chargement progressif des composants
- **🖼️ Lazy Loading** : Images et contenus chargés à la demande
- **⚡ Préchargement** : Anticipation des besoins utilisateur

### 📊 Métriques Cibles

| Métrique | Objectif | Actuel |
|----------|----------|--------|
| **Temps de chargement** | < 2s | ~1.2s |
| **Réponse API** | < 200ms | ~150ms |
| **Score Lighthouse** | > 90 | 95+ |

---

## 🧪 Scripts Disponibles

```bash
# 🚀 Développement
pnpm dev              # Serveur de développement
pnpm build            # Build de production
pnpm start            # Serveur de production

# 🗄️ Base de données
pnpm migrate          # Exécuter les migrations
pnpm seed             # Ajouter des données de test
pnpm check-tables     # Vérifier les tables

# 👤 Administration
pnpm create-admin     # Créer un utilisateur admin
pnpm test-login       # Tester le flux de connexion

# 🧪 Tests et validation
pnpm test-tables      # Tester les tables
pnpm validate         # Validation complète du projet
```

---

## 🔧 Personnalisation

### 🎨 Thèmes et Interface

Wakademy supporte la personnalisation complète de l'interface :

- **🌙 Mode sombre/clair** automatique
- **🎨 Couleurs personnalisées** par organisation
- **📱 Interface responsive** adaptative
- **♿ Accessibilité** WCAG 2.1 AA

### 🔌 Extensions et Intégrations

<div align="center">

| Service | Status | Description |
|---------|--------|-------------|
| 🤖 **OpenAI** | ✅ | Résumés et transcriptions |
| 📊 **Analytics** | ✅ | Suivi d'engagement |
| 💬 **Slack** | 🔄 | Notifications |
| 📧 **Teams** | 🔄 | Intégration Microsoft |
| 📁 **SharePoint** | 📋 | Synchronisation documents |

</div>

---

## 📈 Roadmap

### 🎯 Version 2.0 (Q2 2024)
- [ ] 🔍 Recherche sémantique avancée
- [ ] 🎥 Streaming vidéo optimisé
- [ ] 📱 Application mobile native
- [ ] 🌐 Support multi-langues

### 🚀 Version 3.0 (Q4 2024)
- [ ] 🤖 IA générative intégrée
- [ ] 🔗 API publique complète
- [ ] ☁️ Déploiement cloud natif
- [ ] 📊 Analytics prédictifs

---

## 🤝 Contribution

Nous accueillons chaleureusement les contributions ! 

### 🛠️ Comment contribuer

1. **🍴 Fork** le projet
2. **🌿 Créez** votre branche (`git checkout -b feature/AmazingFeature`)
3. **💾 Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **📤 Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **🔄 Ouvrez** une Pull Request

### 📋 Guidelines

- ✅ Suivre les conventions de code existantes
- 🧪 Ajouter des tests pour les nouvelles fonctionnalités
- 📝 Documenter les changements importants
- 🔍 Vérifier que tous les tests passent

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🆘 Support

<div align="center">

### 💬 Besoin d'aide ?

[![Documentation](https://img.shields.io/badge/📖-Documentation-blue?style=for-the-badge)](docs/)
[![Issues](https://img.shields.io/badge/🐛-Issues-red?style=for-the-badge)](https://github.com/votre-org/wakademy/issues)
[![Discussions](https://img.shields.io/badge/💬-Discussions-green?style=for-the-badge)](https://github.com/votre-org/wakademy/discussions)

**Email** : support@wakademy.com  
**Discord** : [Rejoindre la communauté](https://discord.gg/wakademy)

</div>

---

## 🙏 Remerciements

Wakademy est rendu possible grâce à ces technologies exceptionnelles :

- **[Next.js](https://nextjs.org/)** - Framework React de nouvelle génération
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service open source
- **[Radix UI](https://www.radix-ui.com/)** - Composants UI accessibles
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Lucide](https://lucide.dev/)** - Icônes modernes et élégantes

---

<div align="center">

**⭐ Si Wakademy vous plaît, n'hésitez pas à lui donner une étoile !**

*Fait avec ❤️ par l'équipe Wakademy*

</div> 