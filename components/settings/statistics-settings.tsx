"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Clock, TrendingUp, HardDrive } from "lucide-react"

export function StatisticsSettings() {
  const stats = {
    totalContent: 1247,
    totalUsers: 89,
    storageUsed: 15.7, // GB
    storageLimit: 50, // GB
    avgViewTime: 12.5, // minutes
    contentByType: {
      videos: 456,
      documents: 523,
      podcasts: 268,
    },
    topContent: [
      { title: "Leadership en temps de crise", views: 1234, type: "video" },
      { title: "Guide du management agile", views: 987, type: "document" },
      { title: "Stratégies de communication", views: 756, type: "podcast" },
      { title: "Innovation et créativité", views: 654, type: "video" },
      { title: "Gestion du stress", views: 543, type: "document" },
    ],
    monthlyActivity: [
      { month: "Jan", content: 45, users: 12 },
      { month: "Fév", content: 52, users: 18 },
      { month: "Mar", content: 38, users: 15 },
      { month: "Avr", content: 67, users: 22 },
      { month: "Mai", content: 71, users: 28 },
    ],
  }

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contenus</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+8% par rapport au mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgViewTime}min</div>
            <p className="text-xs text-muted-foreground">Temps de consultation moyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed}GB</div>
            <p className="text-xs text-muted-foreground">sur {stats.storageLimit}GB disponibles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par type de contenu</CardTitle>
          <CardDescription>Distribution des contenus par format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm">Vidéos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.contentByType.videos}</span>
                <Progress value={(stats.contentByType.videos / stats.totalContent) * 100} className="w-20 h-2" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.contentByType.documents}</span>
                <Progress value={(stats.contentByType.documents / stats.totalContent) * 100} className="w-20 h-2" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm">Podcasts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.contentByType.podcasts}</span>
                <Progress value={(stats.contentByType.podcasts / stats.totalContent) * 100} className="w-20 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenus les plus consultés</CardTitle>
          <CardDescription>Top 5 des contenus par nombre de vues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium text-sm">{content.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{content.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{content.views.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisation du stockage</CardTitle>
          <CardDescription>Espace disque utilisé et disponible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilisé</span>
              <span>
                {stats.storageUsed}GB / {stats.storageLimit}GB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-3" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {((stats.contentByType.videos / stats.totalContent) * stats.storageUsed).toFixed(1)}GB
              </div>
              <div className="text-xs text-muted-foreground">Vidéos</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {((stats.contentByType.documents / stats.totalContent) * stats.storageUsed).toFixed(1)}GB
              </div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {((stats.contentByType.podcasts / stats.totalContent) * stats.storageUsed).toFixed(1)}GB
              </div>
              <div className="text-xs text-muted-foreground">Podcasts</div>
            </div>
          </div>

          {storagePercentage > 80 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ⚠️ Attention : Vous utilisez {storagePercentage.toFixed(1)}% de votre espace de stockage.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activité mensuelle</CardTitle>
          <CardDescription>Évolution du contenu et des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyActivity.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium w-12">{month.month}</span>
                <div className="flex-1 mx-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Contenus: {month.content}</span>
                    <span>Utilisateurs: {month.users}</span>
                  </div>
                  <div className="flex gap-1">
                    <Progress value={(month.content / 80) * 100} className="flex-1 h-2" />
                    <Progress value={(month.users / 30) * 100} className="flex-1 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
