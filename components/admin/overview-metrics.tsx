"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TopContentTable } from "./tables/top-content-table"
import { getContentMetrics, getEngagementData } from "@/lib/admin/data-service"
import { FileText, Users, Clock, BarChart2, Loader2 } from "lucide-react"

interface OverviewMetricsProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function OverviewMetrics({ timeFilter }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [engagementData, setEngagementData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [metricsData, engagementStats] = await Promise.all([
          getContentMetrics(timeFilter),
          getEngagementData(timeFilter),
        ])

        setMetrics(metricsData)
        setEngagementData(engagementStats)
      } catch (error) {
        console.error("Error fetching overview metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Erreur lors du chargement des données</p>
      </div>
    )
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenus publiés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalContent}</div>
            <div className="flex items-center gap-4 mt-4">
              {metrics.contentByType.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Utilisateurs avec statut actif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen / session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgTimeSpent} min</div>
            <p className="text-xs text-muted-foreground mt-1">Par session de visionnage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Contenus terminés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribution des contenus</CardTitle>
            <CardDescription>Répartition par type de contenu</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.contentByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.contentByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Engagement par équipe</CardTitle>
            <CardDescription>Basé sur les visionnages, favoris et quiz</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visionnages" fill="#0088FE" />
                  <Bar dataKey="likes" fill="#00C49F" />
                  <Bar dataKey="quiz" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenus les plus consultés</CardTitle>
          <CardDescription>Top 5 des contenus avec le plus de vues</CardDescription>
        </CardHeader>
        <CardContent>
          <TopContentTable timeFilter={timeFilter} />
        </CardContent>
      </Card>
    </div>
  )
}
