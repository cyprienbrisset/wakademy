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

// Ajouter la fonction getMostEngagedUsersData à la fin du fichier

export function getMostEngagedUsersData(timeFilter: "7d" | "30d" | "90d") {
  const baseData = {
    totalEngagementHours: 0,
    avgEngagementPerUser: 0,
    mostEngagedUsers: [] as Array<{
      id: string
      name: string
      email: string
      role: string
      department: string
      contentViewed: number
      hoursSpent: number
      completionRate: number
      lastActive: string
    }>,
    userEngagementOverTime: [] as Array<{ date: string; engagementHours: number }>,
  }

  switch (timeFilter) {
    case "7d":
      return {
        totalEngagementHours: 1243,
        avgEngagementPerUser: 2.8,
        mostEngagedUsers: [
          {
            id: "u1",
            name: "Sophie Martin",
            email: "s.martin@example.com",
            role: "Responsable RH",
            department: "Ressources Humaines",
            contentViewed: 32,
            hoursSpent: 12.5,
            completionRate: 92,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u2",
            name: "Thomas Dubois",
            email: "t.dubois@example.com",
            role: "Chef de Projet",
            department: "Innovation",
            contentViewed: 28,
            hoursSpent: 10.2,
            completionRate: 87,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u3",
            name: "Émilie Bernard",
            email: "e.bernard@example.com",
            role: "Directrice Marketing",
            department: "Marketing",
            contentViewed: 25,
            hoursSpent: 9.7,
            completionRate: 85,
            lastActive: "Hier",
          },
          {
            id: "u4",
            name: "Lucas Petit",
            email: "l.petit@example.com",
            role: "Analyste",
            department: "Finance",
            contentViewed: 21,
            hoursSpent: 8.4,
            completionRate: 82,
            lastActive: "Hier",
          },
          {
            id: "u5",
            name: "Camille Leroy",
            email: "c.leroy@example.com",
            role: "Développeuse",
            department: "IT",
            contentViewed: 18,
            hoursSpent: 7.8,
            completionRate: 79,
            lastActive: "Il y a 2 jours",
          },
        ],
        userEngagementOverTime: [
          { date: "Lun", engagementHours: 143 },
          { date: "Mar", engagementHours: 187 },
          { date: "Mer", engagementHours: 213 },
          { date: "Jeu", engagementHours: 198 },
          { date: "Ven", engagementHours: 176 },
          { date: "Sam", engagementHours: 132 },
          { date: "Dim", engagementHours: 194 },
        ],
      }
    case "30d":
      return {
        totalEngagementHours: 5376,
        avgEngagementPerUser: 12.3,
        mostEngagedUsers: [
          {
            id: "u1",
            name: "Sophie Martin",
            email: "s.martin@example.com",
            role: "Responsable RH",
            department: "Ressources Humaines",
            contentViewed: 124,
            hoursSpent: 48.7,
            completionRate: 94,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u2",
            name: "Thomas Dubois",
            email: "t.dubois@example.com",
            role: "Chef de Projet",
            department: "Innovation",
            contentViewed: 112,
            hoursSpent: 43.2,
            completionRate: 89,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u3",
            name: "Émilie Bernard",
            email: "e.bernard@example.com",
            role: "Directrice Marketing",
            department: "Marketing",
            contentViewed: 98,
            hoursSpent: 38.5,
            completionRate: 87,
            lastActive: "Hier",
          },
          {
            id: "u4",
            name: "Lucas Petit",
            email: "l.petit@example.com",
            role: "Analyste",
            department: "Finance",
            contentViewed: 89,
            hoursSpent: 34.8,
            completionRate: 84,
            lastActive: "Hier",
          },
          {
            id: "u5",
            name: "Camille Leroy",
            email: "c.leroy@example.com",
            role: "Développeuse",
            department: "IT",
            contentViewed: 76,
            hoursSpent: 31.2,
            completionRate: 82,
            lastActive: "Aujourd'hui",
          },
        ],
        userEngagementOverTime: [
          { date: "Sem 1", engagementHours: 1234 },
          { date: "Sem 2", engagementHours: 1456 },
          { date: "Sem 3", engagementHours: 1345 },
          { date: "Sem 4", engagementHours: 1341 },
        ],
      }
    case "90d":
      return {
        totalEngagementHours: 16543,
        avgEngagementPerUser: 37.8,
        mostEngagedUsers: [
          {
            id: "u1",
            name: "Sophie Martin",
            email: "s.martin@example.com",
            role: "Responsable RH",
            department: "Ressources Humaines",
            contentViewed: 376,
            hoursSpent: 142.3,
            completionRate: 95,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u2",
            name: "Thomas Dubois",
            email: "t.dubois@example.com",
            role: "Chef de Projet",
            department: "Innovation",
            contentViewed: 345,
            hoursSpent: 131.7,
            completionRate: 91,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u3",
            name: "Émilie Bernard",
            email: "e.bernard@example.com",
            role: "Directrice Marketing",
            department: "Marketing",
            contentViewed: 312,
            hoursSpent: 118.9,
            completionRate: 89,
            lastActive: "Hier",
          },
          {
            id: "u4",
            name: "Lucas Petit",
            email: "l.petit@example.com",
            role: "Analyste",
            department: "Finance",
            contentViewed: 287,
            hoursSpent: 106.4,
            completionRate: 86,
            lastActive: "Aujourd'hui",
          },
          {
            id: "u5",
            name: "Camille Leroy",
            email: "c.leroy@example.com",
            role: "Développeuse",
            department: "IT",
            contentViewed: 254,
            hoursSpent: 94.8,
            completionRate: 84,
            lastActive: "Hier",
          },
        ],
        userEngagementOverTime: [
          { date: "Mois 1", engagementHours: 5234 },
          { date: "Mois 2", engagementHours: 5678 },
          { date: "Mois 3", engagementHours: 5631 },
        ],
      }
    default:
      return baseData
  }
}
