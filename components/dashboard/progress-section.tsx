"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, BookOpen, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProgressData {
  currentStreak: number
  totalHours: number
  completedCourses: number
  certificates: number
  courses: Array<{
    id: string
    title: string
    progress: number
    totalModules: number
    completedModules: number
    estimatedTime: string
    category: string
  }>
  badges: Array<{
    id: string
    title: string
    description: string
    earned: boolean
    earnedAt?: string
    progress?: number
  }>
}

export function ProgressSection() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgressData() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Récupérer l'utilisateur actuel depuis localStorage
        const adminData = localStorage.getItem("wakademy_admin")
        if (!adminData) {
          setLoading(false)
          return
        }
        
        const user = JSON.parse(adminData)
        const userId = user.id

        // Récupérer l'historique utilisateur pour calculer les statistiques
        const { data: userHistory, error: historyError } = await supabase
          .from("user_history")
          .select(`
            progress,
            completed,
            last_watched_at,
            watch_time_seconds,
            contents (
              id,
              title,
              type,
              duration,
              categories (
                name
              )
            )
          `)
          .eq("user_id", userId)

        if (historyError) {
          // Erreur silencieuse - la table peut ne pas exister encore
        }

        // Récupérer les badges utilisateur
        const { data: userBadges, error: badgesError } = await supabase
          .from("user_badges")
          .select(`
            earned_at,
            badges (
              id,
              name,
              description,
              criteria
            )
          `)
          .eq("user_id", userId)

        if (badgesError) {
          // Erreur silencieuse - la table peut ne pas exister encore
        }

        // Calculer les statistiques
        const completedCount = userHistory?.filter(item => item.completed).length || 0
        const totalWatchTime = userHistory?.reduce((sum, item) => {
          const watchTime = typeof item.watch_time_seconds === 'number' ? item.watch_time_seconds : 0
          return sum + watchTime
        }, 0) || 0
        const totalHours = Math.round(totalWatchTime / 3600)

        // Calculer la série de jours consécutifs (simplifié)
        const currentStreak = calculateStreak(userHistory || [])

        // Grouper les contenus par cours/catégorie
        const courseProgress = groupContentsByCategory(userHistory || [])

        // Formater les badges
        const formattedBadges = formatBadges(userBadges || [], completedCount)

        setProgressData({
          currentStreak,
          totalHours,
          completedCourses: completedCount,
          certificates: userBadges?.length || 0,
          courses: courseProgress,
          badges: formattedBadges
        })

      } catch (error) {
        console.error("Erreur lors du chargement des données de progression:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [])

  const calculateStreak = (history: any[]): number => {
    if (!history.length) return 0
    
    // Simplification : retourner le nombre de jours uniques d'activité dans les 30 derniers jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentActivity = history.filter(item => 
      new Date(item.last_watched_at) > thirtyDaysAgo
    )
    
    const uniqueDays = new Set(
      recentActivity.map(item => 
        new Date(item.last_watched_at).toDateString()
      )
    )
    
    return uniqueDays.size
  }

  const groupContentsByCategory = (history: any[]): ProgressData['courses'] => {
    const categoryMap = new Map()
    
    history.forEach(item => {
      if (!item.contents) return
      
      const categoryName = (item.contents.categories as any)?.name || 'Non catégorisé'
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          contents: [],
          totalProgress: 0,
          completedCount: 0
        })
      }
      
      const category = categoryMap.get(categoryName)
      category.contents.push(item)
      category.totalProgress += item.progress || 0
      if (item.completed) category.completedCount++
    })
    
    return Array.from(categoryMap.entries()).map(([name, data], index) => ({
      id: `category-${index}`,
      title: `Parcours ${name}`,
      progress: data.contents.length > 0 ? Math.round(data.totalProgress / data.contents.length) : 0,
      totalModules: data.contents.length,
      completedModules: data.completedCount,
      estimatedTime: data.completedCount === data.contents.length ? "Terminé" : `${data.contents.length - data.completedCount} contenus restants`,
      category: name
    })).slice(0, 3) // Limiter à 3 cours
  }

  const formatBadges = (userBadges: any[], completedCount: number): ProgressData['badges'] => {
    const badges = userBadges.map(item => ({
      id: item.badges.id,
      title: item.badges.name,
      description: item.badges.description,
      earned: true,
      earnedAt: formatDate(item.earned_at)
    }))

    // Ajouter des badges potentiels basés sur les accomplissements
    const potentialBadges = []
    
    if (completedCount >= 5 && !badges.some(b => b.title.includes('Expert'))) {
      potentialBadges.push({
        id: 'expert-learner',
        title: 'Apprenant Expert',
        description: 'Complétez 5 contenus',
        earned: false,
        progress: Math.min(100, (completedCount / 5) * 100)
      })
    }
    
    if (completedCount >= 10 && !badges.some(b => b.title.includes('Maître'))) {
      potentialBadges.push({
        id: 'master-learner',
        title: 'Maître Apprenant',
        description: 'Complétez 10 contenus',
        earned: false,
        progress: Math.min(100, (completedCount / 10) * 100)
      })
    }

    return [...badges, ...potentialBadges].slice(0, 6) // Limiter à 6 badges
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`
    }
    const diffMonths = Math.floor(diffDays / 30)
    return `Il y a ${diffMonths} mois`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune donnée de progression disponible</p>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez à regarder du contenu pour voir vos statistiques
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressData.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Jours d'activité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressData.totalHours}h</p>
                <p className="text-sm text-muted-foreground">Temps d'apprentissage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressData.completedCourses}</p>
                <p className="text-sm text-muted-foreground">Contenus terminés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progressData.certificates}</p>
                <p className="text-sm text-muted-foreground">Badges obtenus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression des cours */}
      {progressData.courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes parcours en cours</CardTitle>
            <CardDescription>Suivez votre progression dans chaque catégorie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.completedModules}/{course.totalModules} contenus • {course.estimatedTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{course.category}</Badge>
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Badges et réalisations */}
      {progressData.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Badges et réalisations</CardTitle>
            <CardDescription>Vos accomplissements et objectifs à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border ${
                    badge.earned
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        badge.earned ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Trophy
                        className={`h-5 w-5 ${badge.earned ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{badge.title}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {badge.earned ? (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Obtenu {badge.earnedAt}</p>
                      ) : (
                        <div className="mt-2">
                          <Progress value={badge.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">Progression : {badge.progress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
