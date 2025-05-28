"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  getContentPerformanceData,
  getContentCompletionData,
  getContentBounceRateData,
  getContentSatisfactionData,
} from "@/lib/admin/mock-data"

interface ContentPerformanceProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function ContentPerformance({ timeFilter }: ContentPerformanceProps) {
  const performanceData = getContentPerformanceData(timeFilter)
  const completionData = getContentCompletionData(timeFilter)
  const bounceRateData = getContentBounceRateData(timeFilter)
  const satisfactionData = getContentSatisfactionData(timeFilter)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>🎥 Performance des contenus</CardTitle>
        <CardDescription>Métriques détaillées sur l'utilisation des contenus</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="views">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="views">Vues</TabsTrigger>
            <TabsTrigger value="duration">Durée</TabsTrigger>
            <TabsTrigger value="completion">Complétion</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-4">
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Vues totales</span>
                <span className="text-2xl font-bold">{performanceData.totalViews}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Vues uniques</span>
                <span className="text-2xl font-bold">{performanceData.uniqueViews}</span>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData.viewsOverTime}
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
                  <Line type="monotone" dataKey="totalViews" stroke="#0088FE" name="Vues totales" />
                  <Line type="monotone" dataKey="uniqueViews" stroke="#00C49F" name="Vues uniques" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="duration" className="space-y-4">
            <div className="pt-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Durée moyenne de visionnage</span>
              <span className="text-2xl font-bold">{performanceData.avgDuration} min</span>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData.durationByContentType}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgDuration" fill="#0088FE" name="Durée moyenne (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="completion" className="space-y-4">
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Taux de complétion moyen</span>
                <span className="text-2xl font-bold">{completionData.avgCompletionRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Taux de rebond</span>
                <span className="text-2xl font-bold">{bounceRateData.avgBounceRate}%</span>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionData.completionByContent}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill="#0088FE" name="Taux de complétion (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-4">
            <div className="pt-4 flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Score de satisfaction moyen</span>
              <span className="text-2xl font-bold">{satisfactionData.avgSatisfactionScore}/5</span>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData.ratingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} étoiles: ${(percent * 100).toFixed(0)}%`}
                  >
                    {satisfactionData.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
