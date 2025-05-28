import { createClient } from "@/lib/supabase/server"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  department: string
  avatarUrl?: string
  createdAt: string
}

export interface UserProgress {
  courseId: string
  courseTitle: string
  progress: number
  modulesCompleted: number
  modulesTotal: number
  deadline?: string
  isRequired: boolean
}

export interface UserActivity {
  lastLogin: string
  lastContent: {
    id: string
    title: string
    type: string
    status: string
    progress: number
    timestamp: string
  }
  lastBadge?: {
    id: string
    title: string
    earnedAt: string
  }
}

export interface UserStats {
  totalTimeSpent: string // format: "12h 45min"
  contentViewedThisMonth: number
  quizCompleted: number
  quizSuccessRate: number
}

export interface UserBadge {
  id: string
  title: string
  description: string
  earnedAt: string
  icon: string
}

export interface NextBadge {
  id: string
  title: string
  description: string
  progress: number
  icon: string
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      email: data.email || '', // L'email peut ne pas être dans profiles
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      department: data.department,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_course_progress")
      .select(`
        *,
        courses:course_id(
          id,
          title,
          modules_count,
          is_required,
          deadline
        )
      `)
      .eq("user_id", userId)

    if (error) throw error
    if (!data || data.length === 0) return []

    return data.map((item: any) => ({
      courseId: item.course_id,
      courseTitle: item.courses.title,
      progress: item.progress,
      modulesCompleted: item.modules_completed,
      modulesTotal: item.courses.modules_count,
      deadline: item.courses.deadline,
      isRequired: item.courses.is_required,
    }))
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return []
  }
}

export async function getUserActivity(userId: string): Promise<UserActivity | null> {
  try {
    const supabase = await createClient()

    // Récupérer la dernière connexion
    const { data: loginData, error: loginError } = await supabase
      .from("user_logins")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (loginError && loginError.code !== "PGRST116") throw loginError

    // Récupérer le dernier contenu consulté
    const { data: contentData, error: contentError } = await supabase
      .from("user_history")
      .select(`
        *,
        content:content_id(
          id,
          title,
          type
        )
      `)
      .eq("user_id", userId)
      .order("last_watched_at", { ascending: false })
      .limit(1)
      .single()

    if (contentError && contentError.code !== "PGRST116") throw contentError

    // Récupérer le dernier badge obtenu
    const { data: badgeData, error: badgeError } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:badge_id(
          id,
          title
        )
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(1)
      .single()

    if (badgeError && badgeError.code !== "PGRST116") throw badgeError

    // Formater les données d'activité
    return {
      lastLogin: loginData ? formatDate(loginData.created_at) : "Jamais",
      lastContent: contentData
        ? {
            id: contentData.content.id,
            title: contentData.content.title,
            type: contentData.content.type,
            status: contentData.completed ? "completed" : "in-progress",
            progress: contentData.progress,
            timestamp: formatDate(contentData.last_watched_at),
          }
        : {
            id: "",
            title: "Aucun contenu consulté",
            type: "",
            status: "",
            progress: 0,
            timestamp: "",
          },
      lastBadge: badgeData
        ? {
            id: badgeData.badge.id,
            title: badgeData.badge.title,
            earnedAt: formatDate(badgeData.earned_at),
          }
        : undefined,
    }
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return null
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const supabase = await createClient()

    // Récupérer le temps total passé
    const { data: timeData, error: timeError } = await supabase
      .from("user_history")
      .select("watch_time")
      .eq("user_id", userId)

    if (timeError) throw timeError

    // Calculer le temps total en minutes
    const totalMinutes = timeData ? timeData.reduce((sum: any, item: any) => sum + (item.watch_time || 0), 0) : 0
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const totalTimeSpent = `${hours}h ${minutes}min`

    // Récupérer le nombre de contenus vus ce mois-ci
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: monthlyCount, error: monthlyError } = await supabase
      .from("user_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("last_watched_at", firstDayOfMonth.toISOString())

    if (monthlyError) throw monthlyError

    // Récupérer les statistiques de quiz
    const { data: quizData, error: quizError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)

    if (quizError) throw quizError

    const quizCompleted = quizData ? quizData.length : 0
    const passedQuizzes = quizData ? quizData.filter((q: any) => q.passed).length : 0
    const quizSuccessRate = quizCompleted > 0 ? Math.round((passedQuizzes / quizCompleted) * 100) : 0

    return {
      totalTimeSpent,
      contentViewedThisMonth: monthlyCount || 0,
      quizCompleted,
      quizSuccessRate,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return null
  }
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:badge_id(
          id,
          title,
          description,
          icon
        )
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return []

    return data.map((item: any) => ({
      id: item.badge.id,
      title: item.badge.title,
      description: item.badge.description,
      earnedAt: formatDate(item.earned_at),
      icon: item.badge.icon,
    }))
  } catch (error) {
    console.error("Error fetching user badges:", error)
    return []
  }
}

export async function getNextBadges(userId: string): Promise<NextBadge[]> {
  try {
    const supabase = await createClient()

    // Récupérer tous les badges disponibles
    const { data: allBadges, error: badgesError } = await supabase.from("badges").select("*")

    if (badgesError) throw badgesError
    if (!allBadges || allBadges.length === 0) return []

    // Récupérer les badges déjà obtenus par l'utilisateur
    const { data: userBadges, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)

    if (userBadgesError) throw userBadgesError

    const earnedBadgeIds = userBadges ? userBadges.map((ub: any) => ub.badge_id) : []

    // Filtrer les badges non obtenus et calculer le progrès
    const nextBadges = []
    for (const badge of allBadges) {
      if (!earnedBadgeIds.includes(badge.id)) {
        const progress = await calculateBadgeProgress(userId, badge)
        nextBadges.push({
          id: badge.id,
          title: badge.title,
          description: badge.description,
          progress,
          icon: badge.icon,
        })
      }
    }

    // Trier par progrès décroissant et retourner les 3 premiers
    return nextBadges.sort((a, b) => b.progress - a.progress).slice(0, 3)
  } catch (error) {
    console.error("Error fetching next badges:", error)
    return []
  }
}

// Fonction utilitaire pour calculer la progression d'un badge
async function calculateBadgeProgress(userId: string, badge: any): Promise<number> {
  try {
    const supabase = await createClient()

    // Logique de calcul de progression basée sur le type de badge
    switch (badge.criteria_type) {
      case "content_views":
        const { count: viewCount } = await supabase
          .from("user_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
        return Math.min(100, ((viewCount || 0) / badge.criteria_value) * 100)

      case "quiz_success":
        const { data: quizData } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", userId)
          .eq("passed", true)
        const successCount = quizData ? quizData.length : 0
        return Math.min(100, (successCount / badge.criteria_value) * 100)

      case "time_spent":
        const { data: timeData } = await supabase
          .from("user_history")
          .select("watch_time")
          .eq("user_id", userId)
        const totalTime = timeData ? timeData.reduce((sum: any, item: any) => sum + (item.watch_time || 0), 0) : 0
        return Math.min(100, (totalTime / badge.criteria_value) * 100)

      default:
        return Math.floor(Math.random() * 80) + 10 // Progression aléatoire entre 10% et 90%
    }
  } catch (error) {
    console.error("Error calculating badge progress:", error)
    return 0
  }
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    if (diffMs < 1000 * 60 * 60) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
    }
    return "Aujourd'hui"
  } else if (diffDays === 1) {
    return "Hier"
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7)
    return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`
  } else {
    const diffMonths = Math.floor(diffDays / 30)
    return `Il y a ${diffMonths} mois`
  }
}
