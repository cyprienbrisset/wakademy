"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
import { getAIContentData } from "@/lib/admin/mock-data"

interface AIContentMetricsProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function AIContentMetrics({ timeFilter }: AIContentMetricsProps) {
  const aiData = getAIContentData(timeFilter)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>🧠 Utilisation des contenus IA</CardTitle>
        <CardDescription>Métriques sur l'utilisation des fonctionnalités IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contenus auto-catégorisés</span>
              <span className="text-sm font-medium">{aiData.autoCategorized}</span>
            </div>
            <Progress value={aiData.autoCategorizedPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Podcasts générés</span>
              <span className="text-sm font-medium">{aiData.podcastsGenerated}</span>
            </div>
            <Progress value={aiData.podcastsGeneratedPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contenus avec résumé</span>
              <span className="text-sm font-medium">{aiData.contentWithSummary}</span>
            </div>
            <Progress value={aiData.contentWithSummaryPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contenus avec chapitrage</span>
              <span className="text-sm font-medium">{aiData.contentWithChapters}</span>
            </div>
            <Progress value={aiData.contentWithChaptersPercentage} className="h-2" />
          </div>
        </div>

        <div className="pt-4">
          <h4 className="text-sm font-medium mb-2">Taux d'écoute des podcasts IA</h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aiData.podcastListeningRate}
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
                <Bar dataKey="listeningRate" fill="#0088FE" name="Taux d'écoute (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-4">
          <h4 className="text-sm font-medium mb-2">Utilisation des fonctionnalités IA</h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiData.aiFeatureUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {aiData.aiFeatureUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
