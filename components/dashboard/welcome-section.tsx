"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, BookOpen, TrendingUp, Clock } from "lucide-react"

interface WelcomeSectionProps {
  userData: any
}

export function WelcomeSection({ userData }: WelcomeSectionProps) {
  if (!userData) return null

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonjour {userData.firstName} ! 👋</h1>
          <p className="text-muted-foreground mt-1">Prêt à continuer votre apprentissage ?</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Dernière connexion</p>
          <p className="font-medium">{userData.recentActivity?.lastLogin || "Aujourd'hui"}</p>
        </div>
      </div>

      {/* Cours en cours */}
      {userData.currentCourse && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Parcours en cours</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  {userData.currentCourse.title}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {userData.currentCourse.progress}% terminé
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={userData.currentCourse.progress} className="h-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <BookOpen className="h-4 w-4" />
                <span>Prochain : {userData.currentCourse.nextModule}</span>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Contenu tendance</p>
                <p className="text-sm text-muted-foreground">Découvrez les nouveautés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium">À voir plus tard</p>
                <p className="text-sm text-muted-foreground">Votre liste personnelle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Mes favoris</p>
                <p className="text-sm text-muted-foreground">Contenus sauvegardés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
