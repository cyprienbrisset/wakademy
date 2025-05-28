"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { ActiveUsersTable } from "./tables/active-users-table"
import { getUserProgressData, getMostEngagedUsersData, getUserActivityData } from "@/lib/admin/mock-data"
import { Search, Users, Award } from "lucide-react"

interface UserTrackingProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function UserTracking({ timeFilter }: UserTrackingProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const progressData = getUserProgressData(timeFilter)
  const engagedUsersData = getMostEngagedUsersData(timeFilter)
  const activityData = getUserActivityData(timeFilter)

  const departments = [
    { id: "all", name: "Tous les services" },
    { id: "marketing", name: "Marketing" },
    { id: "sales", name: "Ventes" },
    { id: "engineering", name: "Ingénierie" },
    { id: "hr", name: "Ressources Humaines" },
    { id: "finance", name: "Finance" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧑‍💼 Suivi des utilisateurs</CardTitle>
          <CardDescription>Suivi détaillé de l'activité et de la progression des utilisateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Button
                  key={dept.id}
                  variant={selectedDepartment === dept.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept.id)}
                >
                  {dept.name}
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Utilisateurs actifs</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="engaged">Plus engagés</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <ActiveUsersTable
                timeFilter={timeFilter}
                searchQuery={searchQuery}
                departmentFilter={selectedDepartment}
              />
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Progression moyenne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.avgProgress}%</div>
                    <p className="text-xs text-muted-foreground">Sur tous les parcours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Contenus vus en moyenne</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.avgContentViewed}</div>
                    <p className="text-xs text-muted-foreground">Par utilisateur</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Badges obtenus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData.totalBadgesEarned}</div>
                    <p className="text-xs text-muted-foreground">Total sur la plateforme</p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={progressData.progressByDepartment}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgProgress" fill="#0088FE" name="Progression moyenne (%)" />
                    <Bar dataKey="avgContentViewed" fill="#00C49F" name="Contenus vus en moyenne" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="engaged" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                {engagedUsersData.map((user, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant="secondary">{user.department}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{user.contentViewed} contenus vus</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span>Engagement: {user.engagementScore}%</span>
                          <span>Progression: {user.progressPercentage}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${user.engagementScore}%` }} />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {user.badges.map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="outline" className="text-xs">
                            <Award className="mr-1 h-3 w-3" /> {badge}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activité utilisateur</CardTitle>
          <CardDescription>Évolution de l'activité utilisateur sur la période</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" stroke="#0088FE" name="Utilisateurs actifs" />
                <Line type="monotone" dataKey="contentViews" stroke="#00C49F" name="Vues de contenu" />
                <Line type="monotone" dataKey="completions" stroke="#FFBB28" name="Contenus terminés" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
