// Données simulées pour les métriques de performance des contenus

export function getContentPerformanceData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    totalViews: 0,
    uniqueViews: 0,
    avgDuration: 0,
    viewsOverTime: [] as Array<{ date: string; totalViews: number; uniqueViews: number }>,
    durationByContentType: [] as Array<{ type: string; avgDuration: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        totalViews: 12543,
        uniqueViews: 8234,
        avgDuration: 15.3,
        viewsOverTime: [
          { date: "Lun", totalViews: 1543, uniqueViews: 1123 },
          { date: "Mar", totalViews: 1876, uniqueViews: 1234 },
          { date: "Mer", totalViews: 2134, uniqueViews: 1456 },
          { date: "Jeu", totalViews: 1987, uniqueViews: 1234 },
          { date: "Ven", totalViews: 1654, uniqueViews: 1098 },
          { date: "Sam", totalViews: 1432, uniqueViews: 987 },
          { date: "Dim", totalViews: 1917, uniqueViews: 1102 },
        ],
        durationByContentType: [
          { type: "Vidéo", avgDuration: 18.5 },
          { type: "Podcast", avgDuration: 22.3 },
          { type: "Document", avgDuration: 8.7 },
          { type: "Présentation", avgDuration: 12.4 },
        ],
      }
    case "30d":
      return {
        totalViews: 45678,
        uniqueViews: 32456,
        avgDuration: 16.8,
        viewsOverTime: [
          { date: "Sem 1", totalViews: 9876, uniqueViews: 7234 },
          { date: "Sem 2", totalViews: 11234, uniqueViews: 8456 },
          { date: "Sem 3", totalViews: 12456, uniqueViews: 8987 },
          { date: "Sem 4", totalViews: 12112, uniqueViews: 7779 },
        ],
        durationByContentType: [
          { type: "Vidéo", avgDuration: 19.2 },
          { type: "Podcast", avgDuration: 24.1 },
          { type: "Document", avgDuration: 9.3 },
          { type: "Présentation", avgDuration: 13.8 },
        ],
      }
    case "90d":
      return {
        totalViews: 134567,
        uniqueViews: 89234,
        avgDuration: 17.2,
        viewsOverTime: [
          { date: "Mois 1", totalViews: 38765, uniqueViews: 26543 },
          { date: "Mois 2", totalViews: 45678, uniqueViews: 31234 },
          { date: "Mois 3", totalViews: 50124, uniqueViews: 31457 },
        ],
        durationByContentType: [
          { type: "Vidéo", avgDuration: 20.1 },
          { type: "Podcast", avgDuration: 25.3 },
          { type: "Document", avgDuration: 9.8 },
          { type: "Présentation", avgDuration: 14.2 },
        ],
      }
    default:
      return baseData
  }
}

export function getContentCompletionData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    avgCompletionRate: 0,
    completionByContent: [] as Array<{ title: string; completionRate: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        avgCompletionRate: 72.5,
        completionByContent: [
          { title: "Leadership Digital", completionRate: 85 },
          { title: "Gestion du Temps", completionRate: 78 },
          { title: "Communication Efficace", completionRate: 72 },
          { title: "Innovation Stratégique", completionRate: 68 },
          { title: "Management Agile", completionRate: 65 },
        ],
      }
    case "30d":
      return {
        avgCompletionRate: 74.8,
        completionByContent: [
          { title: "Leadership Digital", completionRate: 87 },
          { title: "Gestion du Temps", completionRate: 82 },
          { title: "Communication Efficace", completionRate: 75 },
          { title: "Innovation Stratégique", completionRate: 71 },
          { title: "Management Agile", completionRate: 69 },
        ],
      }
    case "90d":
      return {
        avgCompletionRate: 76.2,
        completionByContent: [
          { title: "Leadership Digital", completionRate: 89 },
          { title: "Gestion du Temps", completionRate: 84 },
          { title: "Communication Efficace", completionRate: 78 },
          { title: "Innovation Stratégique", completionRate: 73 },
          { title: "Management Agile", completionRate: 71 },
        ],
      }
    default:
      return baseData
  }
}

export function getContentBounceRateData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    avgBounceRate: 0,
    bounceRateByContent: [] as Array<{ title: string; bounceRate: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        avgBounceRate: 18.5,
        bounceRateByContent: [
          { title: "Leadership Digital", bounceRate: 12 },
          { title: "Gestion du Temps", bounceRate: 15 },
          { title: "Communication Efficace", bounceRate: 18 },
          { title: "Innovation Stratégique", bounceRate: 22 },
          { title: "Management Agile", bounceRate: 25 },
        ],
      }
    case "30d":
      return {
        avgBounceRate: 16.2,
        bounceRateByContent: [
          { title: "Leadership Digital", bounceRate: 10 },
          { title: "Gestion du Temps", bounceRate: 13 },
          { title: "Communication Efficace", bounceRate: 16 },
          { title: "Innovation Stratégique", bounceRate: 19 },
          { title: "Management Agile", bounceRate: 23 },
        ],
      }
    case "90d":
      return {
        avgBounceRate: 15.8,
        bounceRateByContent: [
          { title: "Leadership Digital", bounceRate: 9 },
          { title: "Gestion du Temps", bounceRate: 12 },
          { title: "Communication Efficace", bounceRate: 15 },
          { title: "Innovation Stratégique", bounceRate: 18 },
          { title: "Management Agile", bounceRate: 21 },
        ],
      }
    default:
      return baseData
  }
}

export function getContentSatisfactionData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    avgSatisfactionScore: 0,
    ratingDistribution: [] as Array<{ name: string; count: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        avgSatisfactionScore: 4.2,
        ratingDistribution: [
          { name: "5", count: 245 },
          { name: "4", count: 189 },
          { name: "3", count: 87 },
          { name: "2", count: 34 },
          { name: "1", count: 12 },
        ],
      }
    case "30d":
      return {
        avgSatisfactionScore: 4.3,
        ratingDistribution: [
          { name: "5", count: 987 },
          { name: "4", count: 756 },
          { name: "3", count: 345 },
          { name: "2", count: 123 },
          { name: "1", count: 45 },
        ],
      }
    case "90d":
      return {
        avgSatisfactionScore: 4.4,
        ratingDistribution: [
          { name: "5", count: 3456 },
          { name: "4", count: 2678 },
          { name: "3", count: 1234 },
          { name: "2", count: 456 },
          { name: "1", count: 123 },
        ],
      }
    default:
      return baseData
  }
}

// Données supplémentaires pour le tableau de bord d'administration

export function getPlaylistsData(timeFilter: "7d" | "30d" | "90d") {
  return {
    totalPlaylists: 42,
    sharedPlaylists: 17,
  }
}

export function getContentCreatorsData(timeFilter: "7d" | "30d" | "90d") {
  return {
    activeCreators: 8,
    newContent: 5,
    topCreators: [
      {
        name: "Alice",
        department: "Marketing",
        contentCount: 12,
        avgRating: 4.5,
        popularityScore: 80,
        totalViews: 1234,
        completionRate: 85,
        lastContentDate: "2024-06-01",
      },
    ],
  }
}

export function getPendingPublicationsData() {
  return [
    {
      title: "Nouvelle vidéo de formation",
      type: "Vidéo",
      duration: "15 min",
      status: "en attente",
      description: "Introduction au leadership",
      author: "Bob",
      submittedDate: "2024-06-02",
    },
  ]
}

export function getSystemAlertsData() {
  return [
    {
      severity: "low",
      title: "Maintenance planifiée",
      message: "Une maintenance est prévue cette nuit",
      timestamp: "2024-06-05 22:00",
    },
  ]
}

export function getAdminLogsData() {
  return [
    {
      id: 1,
      timestamp: "2024-06-01 10:00",
      admin: "Alice",
      action: "upload",
      actionLabel: "Upload",
      description: "Ajout d'une nouvelle vidéo",
      ip: "192.168.0.1",
    },
  ]
}

export function getUserProgressData(timeFilter: "7d" | "30d" | "90d") {
  return {
    avgProgress: 65,
    avgContentViewed: 12,
    totalBadgesEarned: 34,
    progressByDepartment: [
      { department: "Marketing", avgProgress: 70, avgContentViewed: 15 },
      { department: "Ventes", avgProgress: 60, avgContentViewed: 10 },
      { department: "Ingénierie", avgProgress: 55, avgContentViewed: 8 },
    ],
  }
}

export function getMostEngagedUsersData(timeFilter: "7d" | "30d" | "90d") {
  return [
    {
      name: "Charlie",
      email: "charlie@example.com",
      department: "Marketing",
      contentViewed: 25,
      engagementScore: 90,
      progressPercentage: 80,
      badges: ["Expert", "Pionnier"],
    },
  ]
}

export function getUserActivityData(timeFilter: "7d" | "30d" | "90d") {
  return [
    { date: "2024-06-01", activeUsers: 50, contentViews: 200, completions: 40 },
    { date: "2024-06-02", activeUsers: 45, contentViews: 180, completions: 35 },
  ]
}

// Fonction utilitaire pour générer des données aléatoires (pour les tests)
export function generateRandomData(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Fonction pour obtenir les données de performance globale
export function getGlobalPerformanceMetrics(timeFilter: "7d" | "30d" | "90d") {
  const multiplier = timeFilter === "7d" ? 1 : timeFilter === "30d" ? 4.3 : 13

  return {
    totalUsers: Math.floor(1234 * multiplier),
    activeUsers: Math.floor(876 * multiplier),
    totalContents: 156,
    totalViews: Math.floor(12543 * multiplier),
    avgSessionDuration: 23.5,
    conversionRate: 67.8,
  }
}

// Fonction pour obtenir les données de tendances
export function getTrendingContent(timeFilter: "7d" | "30d" | "90d") {
  return [
    {
      id: "1",
      title: "Leadership à l'ère du digital",
      views: generateRandomData(1000, 5000),
      trend: "+15%",
      category: "Leadership",
    },
    {
      id: "2",
      title: "Gestion efficace du temps",
      views: generateRandomData(800, 4000),
      trend: "+12%",
      category: "Productivité",
    },
    {
      id: "3",
      title: "Communication en équipe distribuée",
      views: generateRandomData(700, 3500),
      trend: "+8%",
      category: "Communication",
    },
    {
      id: "4",
      title: "Innovation et créativité",
      views: generateRandomData(600, 3000),
      trend: "+5%",
      category: "Innovation",
    },
    {
      id: "5",
      title: "Management agile",
      views: generateRandomData(500, 2500),
      trend: "+3%",
      category: "Management",
    },
  ]
}

// Fonction pour obtenir les données des contenus IA
export function getAIContentData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    autoCategorized: 0,
    autoCategorizedPercentage: 0,
    podcastsGenerated: 0,
    podcastsGeneratedPercentage: 0,
    contentWithSummary: 0,
    contentWithSummaryPercentage: 0,
    contentWithChapters: 0,
    contentWithChaptersPercentage: 0,
    podcastListeningRate: [] as Array<{ title: string; listeningRate: number }>,
    aiFeatureUsage: [] as Array<{ name: string; value: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        autoCategorized: 45,
        autoCategorizedPercentage: 85,
        podcastsGenerated: 23,
        podcastsGeneratedPercentage: 43,
        contentWithSummary: 38,
        contentWithSummaryPercentage: 72,
        contentWithChapters: 31,
        contentWithChaptersPercentage: 58,
        podcastListeningRate: [
          { title: "Leadership", listeningRate: 78 },
          { title: "Management", listeningRate: 72 },
          { title: "Innovation", listeningRate: 65 },
          { title: "Communication", listeningRate: 69 },
          { title: "Productivité", listeningRate: 74 },
        ],
        aiFeatureUsage: [
          { name: "Auto-catégorisation", value: 45 },
          { name: "Génération podcast", value: 23 },
          { name: "Résumé auto", value: 38 },
          { name: "Chapitrage", value: 31 },
        ],
      }
    case "30d":
      return {
        autoCategorized: 187,
        autoCategorizedPercentage: 88,
        podcastsGenerated: 98,
        podcastsGeneratedPercentage: 46,
        contentWithSummary: 156,
        contentWithSummaryPercentage: 74,
        contentWithChapters: 134,
        contentWithChaptersPercentage: 63,
        podcastListeningRate: [
          { title: "Leadership", listeningRate: 82 },
          { title: "Management", listeningRate: 75 },
          { title: "Innovation", listeningRate: 68 },
          { title: "Communication", listeningRate: 71 },
          { title: "Productivité", listeningRate: 77 },
        ],
        aiFeatureUsage: [
          { name: "Auto-catégorisation", value: 187 },
          { name: "Génération podcast", value: 98 },
          { name: "Résumé auto", value: 156 },
          { name: "Chapitrage", value: 134 },
        ],
      }
    case "90d":
      return {
        autoCategorized: 543,
        autoCategorizedPercentage: 91,
        podcastsGenerated: 287,
        podcastsGeneratedPercentage: 48,
        contentWithSummary: 467,
        contentWithSummaryPercentage: 78,
        contentWithChapters: 398,
        contentWithChaptersPercentage: 67,
        podcastListeningRate: [
          { title: "Leadership", listeningRate: 85 },
          { title: "Management", listeningRate: 78 },
          { title: "Innovation", listeningRate: 71 },
          { title: "Communication", listeningRate: 74 },
          { title: "Productivité", listeningRate: 80 },
        ],
        aiFeatureUsage: [
          { name: "Auto-catégorisation", value: 543 },
          { name: "Génération podcast", value: 287 },
          { name: "Résumé auto", value: 467 },
          { name: "Chapitrage", value: 398 },
        ],
      }
    default:
      return baseData
  }
}

