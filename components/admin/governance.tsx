"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminLogsTable } from "./tables/admin-logs-table"
import {
  getPlaylistsData,
  getContentCreatorsData,
  getPendingPublicationsData,
  getSystemAlertsData,
} from "@/lib/admin/mock-data"
import { ListMusic, Users, Clock, AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface GovernanceProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function Governance({ timeFilter }: GovernanceProps) {
  const playlistsData = getPlaylistsData(timeFilter)
  const creatorsData = getContentCreatorsData(timeFilter)
  const pendingData = getPendingPublicationsData()
  const alertsData = getSystemAlertsData()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists créées</CardTitle>
            <ListMusic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlistsData.totalPlaylists}</div>
            <p className="text-xs text-muted-foreground mt-1">{playlistsData.sharedPlaylists} playlists partagées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creatorsData.activeCreators}</div>
            <p className="text-xs text-muted-foreground mt-1">{creatorsData.newContent} nouveaux contenus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publications en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Temps moyen d'approbation: 2.3 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes système</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {alertsData.filter((a) => a.severity === "high").length} alertes critiques
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="creators">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creators">Créateurs</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="logs">Logs admin</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            {creatorsData.topCreators.map((creator, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{creator.name}</p>
                        <p className="text-xs text-muted-foreground">{creator.department}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="secondary">{creator.contentCount} contenus</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Note moyenne: {creator.avgRating}/5</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span>Popularité: {creator.popularityScore}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${creator.popularityScore}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Vues totales</p>
                      <p className="font-medium">{creator.totalViews}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux de complétion</p>
                      <p className="font-medium">{creator.completionRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dernier contenu</p>
                      <p className="font-medium">{creator.lastContentDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            {pendingData.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.type} • {item.duration}
                      </p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">{item.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Soumis par <span className="font-medium">{item.author}</span> le {item.submittedDate}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
                      <Button size="sm" variant="default">
                        Approuver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="pt-4">
          <AdminLogsTable />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            {alertsData.map((alert, index) => (
              <Card
                key={index}
                className={`border-l-4 ${
                  alert.severity === "high"
                    ? "border-l-red-500"
                    : alert.severity === "medium"
                      ? "border-l-yellow-500"
                      : "border-l-blue-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {alert.severity === "high" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : alert.severity === "medium" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{alert.timestamp}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Détails
                      </Button>
                      <Button size="sm" variant="default">
                        Résoudre
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
