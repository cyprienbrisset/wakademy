import { createClient } from "@/lib/supabase/server"

// Types pour les données admin
export interface ContentMetrics {
  totalContent: number
  contentByType: { name: string; value: number }[]
  activeUsers: number
  avgTimeSpent: number
  avgCompletionRate: number
}

export interface TopContent {
  id: string
  title: string
  type: string
  views: number
  avgDuration: number
  rating: number
}

export interface UserActivity {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: string
  contentViewed: number
  lastAccess: string
}

export async function getContentMetrics(timeFilter: "7d" | "30d" | "90d"): Promise<ContentMetrics> {
  try {
    const supabase = await createClient()

    // Récupérer les contenus par type
    const { data: contentData, error: contentError } = await supabase.from("contents").select("type")

    if (contentError) throw contentError

    const contentByType =
      contentData?.reduce(
        (acc: any, content: any) => {
          const existingType = acc.find((item: any) => item.name === content.type)
          if (existingType) {
            existingType.value++
          } else {
            acc.push({ name: content.type, value: 1 })
          }
          return acc
        },
        [] as { name: string; value: number }[],
      ) || []

    const totalContent = contentData?.length || 0

    // Récupérer le nombre d'utilisateurs actifs
    const { count: activeUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    if (usersError) throw usersError

    // Calculer le temps moyen passé (simulation basée sur les données réelles)
    const { data: watchData, error: watchError } = await supabase.from("user_history").select("watch_time")

    if (watchError) throw watchError

    const totalMinutes = watchData?.reduce((sum: any, item: any) => sum + (item.watch_time || 0), 0) || 0
    const avgTimeSpent = watchData?.length ? Math.round(totalMinutes / watchData.length) : 0

    // Calculer le taux de complétion moyen
    const { data: completionData, error: completionError } = await supabase
      .from("user_history")
      .select("completed, progress")

    if (completionError) throw completionError

    const completedCount = completionData?.filter((item: any) => item.completed).length || 0
    const avgCompletionRate = completionData?.length ? Math.round((completedCount / completionData.length) * 100) : 0

    return {
      totalContent,
      contentByType,
      activeUsers: activeUsers || 0,
      avgTimeSpent,
      avgCompletionRate,
    }
  } catch (error) {
    console.error("Error fetching content metrics:", error)
    return {
      totalContent: 0,
      contentByType: [],
      activeUsers: 0,
      avgTimeSpent: 0,
      avgCompletionRate: 0,
    }
  }
}

export async function getTopContent(timeFilter: "7d" | "30d" | "90d"): Promise<TopContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, type, views, duration")
      .order("views", { ascending: false })
      .limit(5)

    if (error) throw error

    return (
      data?.map((content: any) => ({
        id: content.id,
        title: content.title,
        type: content.type,
        views: content.views || 0,
        avgDuration: Math.round((content.duration || 0) / 60), // Convert to minutes
        rating: 4.5, // Default rating, could be calculated from ratings table
      })) || []
    )
  } catch (error) {
    console.error("Error fetching top content:", error)
    return []
  }
}

export async function getActiveUsers(timeFilter: "7d" | "30d" | "90d"): Promise<UserActivity[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, department, role, status, created_at")
      .eq("status", "active")
      .limit(20)

    if (error) throw error

    // Pour chaque utilisateur, récupérer le nombre de contenus vus et le dernier accès
    const usersWithActivity = await Promise.all(
      (data || []).map(async (user: any) => {
        // Compter les contenus vus
        const { count: contentViewed } = await supabase
          .from("user_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Récupérer le dernier accès
        const { data: lastLogin } = await supabase
          .from("user_logins")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email || '',
          department: user.department || "Non défini",
          role: user.role || "Utilisateur",
          status: user.status === "active" ? "Actif" : "Inactif",
          contentViewed: contentViewed || 0,
          lastAccess: lastLogin ? formatDate(lastLogin.created_at) : "Jamais",
        }
      }),
    )

    return usersWithActivity
  } catch (error) {
    console.error("Error fetching active users:", error)
    return []
  }
}

export async function getEngagementData(timeFilter: "7d" | "30d" | "90d") {
  try {
    const supabase = await createClient()

    // Récupérer les données d'engagement par département
    const { data: users, error: usersError } = await supabase.from("profiles").select("id, department")

    if (usersError) throw usersError

    const departmentStats = await Promise.all(
      ["Marketing", "Ventes", "Ingénierie", "RH", "Finance"].map(async (department) => {
        const deptUsers = users?.filter((u: any) => u.department === department) || []
        const userIds = deptUsers.map((u: any) => u.id)

        if (userIds.length === 0) {
          return { team: department, visionnages: 0, likes: 0, quiz: 0 }
        }

        // Compter les visionnages
        const { count: visionnages } = await supabase
          .from("user_history")
          .select("*", { count: "exact", head: true })
          .in("user_id", userIds)

        // Compter les likes (si table existe)
        const { count: likes } = await supabase
          .from("user_favorites")
          .select("*", { count: "exact", head: true })
          .in("user_id", userIds)

        // Compter les quiz (si table existe)
        const { count: quiz } = await supabase
          .from("quiz_results")
          .select("*", { count: "exact", head: true })
          .in("user_id", userIds)

        return {
          team: department,
          visionnages: visionnages || 0,
          likes: likes || 0,
          quiz: quiz || 0,
        }
      }),
    )

    return departmentStats
  } catch (error) {
    console.error("Error fetching engagement data:", error)
    return []
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
  } else {
    const diffWeeks = Math.floor(diffDays / 7)
    return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`
  }
}
